# TECHNICAL DESIGN — BonVoye

**Ngày:** 2026-07-23
**Phiên bản:** Draft v0.2 (để team review).
**Cơ sở:** Final Pro Scope (proposal 2026-07-20) + biên bản thảo luận nội bộ (2026-07-21 → 22)
**Phạm vi tài liệu:** Đặc tả *cách làm* cho các thành phần kỹ thuật của Build M1 trở đi. Tập trung vào 5 điểm nóng: **Data Model, Offline, Sync, Progress/Track, Map & GPS**.

> Ký hiệu độ ưu tiên: 🔴 **P0** = điểm nóng, quyết định kiến trúc, phải chốt sớm · 🟡 **P1** = quan trọng · 🟢 **P2** = thông thường.

---

## 1. Nguyên tắc thiết kế xuyên suốt

Mọi quyết định trong tài liệu này tuân theo 6 nguyên tắc, rút ra từ buổi họp và proposal:

1. **Offline-first.** App phải dùng được khi mất mạng. Server là nơi *đồng bộ*, không phải nơi *phụ thuộc runtime*. Nguồn sự thật khi đang trải nghiệm là dữ liệu local đã tải.
2. **Đơn vị offline = POI** (đã chốt). Không chia nhỏ tiến độ tải bên trong 1 POI. Một POI tải về là trọn gói (map tile + media + content nodes).
3. **Tiến trình độc lập.** Sync UP (progress) và Sync DOWN (content update) là 2 luồng tách hẳn, không block nhau. Nguyên tắc anh Đạt chốt: "các tiến trình càng độc lập, ít phụ thuộc nhau càng tốt".
4. **Content versioning là bắt buộc từ ngày đầu.** Mọi content node mang `version`. Đây là nền của Sync DOWN và cơ chế "gợi ý cập nhật". Thêm sau sẽ rất đau.
5. **Completion là một chiều — "xong là xong"** (đã chốt, độ ưu tiên LOW). Content update mới KHÔNG reset trạng thái hoàn thành của user; chỉ tạo version mới và highlight phần thay đổi.
6. **Provider-agnostic ở các ranh giới rủi ro.** Map provider (Mapbox → Amap tương lai), Media CDN (S3 → R2 tương lai), Payment đều đi qua lớp trừu tượng. Tọa độ lưu độc lập provider.

---

## 2. Kiến trúc tổng thể

```text
┌─────────────────────────┐     ┌──────────────────────────┐
│   Flutter App (iOS/And)  │     │   Zalo Mini App (web)    │
│  - Story Player          │     │  - Content browse only   │
│  - Map + GPS + geofence  │     │  - Entitlement display   │
│  - Offline store (SQLite │     │  - QR/deeplink entry     │
│    + file system)        │     │  - NO offline/payment    │
│  - Sync engine (UP/DOWN) │     └────────────┬─────────────┘
└───────────┬──────────────┘                  │
            │  REST/HTTPS (JWT)                │
            ▼                                  ▼
┌───────────────────────────────────────────────────────────┐
│                    NestJS Backend (API)                     │
│  Content API · Entitlement API · Progress/Sync API          │
│  Partner/Attribution API · IAP receipt validation           │
│  Media signing (CloudFront signed URL/cookie)               │
└───────┬───────────────────┬──────────────────┬─────────────┘
        │                   │                  │
        ▼                   ▼                  ▼
┌───────────────┐   ┌───────────────┐   ┌──────────────────┐
│ PostgreSQL +  │   │  Redis cache  │   │ S3 + CloudFront  │
│ PostGIS       │   │ session/queue │   │ media + POI packs│
└───────────────┘   └───────────────┘   └──────────────────┘
        ▲
        │  (cùng DB, cùng auth, cùng model)
┌───────┴───────────────────┐
│   CMS custom (React SPA)  │
│  - Tree 7 cấp             │
│  - Visual Map Editor      │
│  - Media library          │
│  - Publish/version control│
└───────────────────────────┘
```

**Ghi chú ranh giới:**
- Backend + CMS **chung một NestJS codebase / model dữ liệu / auth** (proposal đã chốt lý do bỏ Strapi).
- Zalo Mini App chỉ đọc content + hiển thị entitlement; **không** offline, **không** payment, **không** background GPS.

---

## 3. 🔴 Core Data Model

### 3.1 Cây nội dung 7 cấp

Cấu trúc: `Country → City → Topic → POI → NPC → Story → Hidden Threads`.

Quan hệ chính:
- `Country 1—N City 1—N Topic`
- `Topic N—N POI` (một POI có thể thuộc nhiều Topic / nhiều tuyến — theo Content Architecture §8).
- `POI 1—N NPC 1—N Story`
- `POI 1—N HiddenThread` (Hidden Threads gắn POI, có thể link tới NPC/Story/POI khác — dạng series).

### 3.2 Trường chung cho mọi content node (base fields)

Mọi bảng content (`topic, poi, npc, story, hidden_thread`) kế thừa các trường:

```sql
id            UUID PRIMARY KEY,
version       INT  NOT NULL DEFAULT 1,   -- tăng mỗi lần publish thay đổi nội dung
content_hash  TEXT NOT NULL,             -- hash của payload đã publish (so sánh nhanh khi sync DOWN)
status        TEXT NOT NULL,             -- draft | published | hidden | archived
published_at  TIMESTAMPTZ,
created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
```

> **Quy tắc versioning:** `version` chỉ tăng khi Admin **publish** một thay đổi ảnh hưởng nội dung end-user (không tăng khi sửa draft). `content_hash` cho phép app so sánh nhanh mà không tải full payload.

### 3.3 Schema chi tiết (PostgreSQL + PostGIS)

```sql
-- ===== Geo hierarchy =====
CREATE TABLE country (
  id UUID PRIMARY KEY, name JSONB NOT NULL,          -- i18n: {"vi":..,"en":..,"zh":..}
  -- base fields...
);

CREATE TABLE city (
  id UUID PRIMARY KEY, country_id UUID REFERENCES country(id),
  name JSONB NOT NULL,
  center GEOGRAPHY(POINT, 4326),                      -- WGS-84
  default_zoom_range INT4RANGE,                       -- vd [11,19] cho offline tiles
  -- base fields...
);

CREATE TABLE topic (
  id UUID PRIMARY KEY, city_id UUID REFERENCES city(id),
  name JSONB, route_type TEXT,                        -- scenic|history|legend|truecrime|culture
  -- base fields...
);

-- ===== POI =====
CREATE TABLE poi (
  id UUID PRIMARY KEY, city_id UUID REFERENCES city(id),
  title JSONB, summary JSONB,
  location GEOGRAPHY(POINT, 4326) NOT NULL,           -- tọa độ GPS thật (WGS-84)
  artwork_id UUID REFERENCES artwork(id),             -- bản đồ minh họa của POI
  artwork_position JSONB,                             -- {x,y} vị trí POI trên artwork (px hoặc %)
  interaction_radius_m INT NOT NULL DEFAULT 25,       -- "enter" radius, config, KHÔNG hard-code (20-30m)
  interaction_exit_radius_m INT NOT NULL DEFAULT 35,  -- "exit" radius > enter radius, chống nhấp nháy (§8.3)
  interaction_min_dwell_s INT NOT NULL DEFAULT 3,     -- phải đứng liên tục >= N giây mới confirm "near"
  entitlement_type TEXT NOT NULL,                     -- free|paid|route|city|subscription
  offline_full_bytes BIGINT, offline_audio_bytes BIGINT, -- ước lượng size 2 gói
  -- base fields...
);
CREATE INDEX idx_poi_location ON poi USING GIST (location);

CREATE TABLE topic_poi (                               -- N-N
  topic_id UUID, poi_id UUID, sort_order INT,
  PRIMARY KEY (topic_id, poi_id)
);

-- ===== NPC / Story =====
CREATE TABLE npc (
  id UUID PRIMARY KEY, poi_id UUID REFERENCES poi(id),
  name JSONB, avatar_asset_id UUID,
  location GEOGRAPHY(POINT, 4326),                     -- có thể lệch tâm POI
  artwork_position JSONB,
  -- base fields...
);

CREATE TABLE story (
  id UUID PRIMARY KEY, npc_id UUID REFERENCES npc(id),
  title JSONB,
  mode TEXT NOT NULL DEFAULT 'audio',                  -- audio | webtoon | both
  audio_asset_id UUID,                                 -- narration
  bgm_asset_id UUID,                                   -- nhạc nền
  -- base fields...
);

-- Webtoon pages (cho sync audio↔ảnh)
CREATE TABLE story_page (
  id UUID PRIMARY KEY, story_id UUID REFERENCES story(id),
  sort_order INT NOT NULL,
  image_asset_id UUID NOT NULL,
  duration_ms INT,                                     -- thời lượng hiển thị (slideshow)
  audio_start_ms INT,                                  -- mốc timestamp audio khớp trang này
  text_blocks JSONB                                    -- [{bubble text i18n, position}]
);

-- ===== Hidden Threads / Series =====
CREATE TABLE hidden_thread (
  id UUID PRIMARY KEY, poi_id UUID REFERENCES poi(id),
  title JSONB, series_id UUID,                         -- NULL nếu không thuộc series
  -- base fields...
);

CREATE TABLE series (
  id UUID PRIMARY KEY, city_id UUID, title JSONB,
  -- base fields...
);
CREATE TABLE series_item (                             -- các mắt xích của 1 series
  series_id UUID, ref_type TEXT, ref_id UUID,          -- ref_type: poi|npc|story|hidden_thread
  is_required BOOLEAN NOT NULL DEFAULT true,
  sort_order INT,
  PRIMARY KEY (series_id, ref_type, ref_id)
);

-- ===== Artwork / Media =====
CREATE TABLE artwork (
  id UUID PRIMARY KEY, city_id UUID,
  image_asset_id UUID, version INT DEFAULT 1,
  opacity_default NUMERIC DEFAULT 1.0,
  calibration JSONB                                    -- xem §8: mapping artwork ↔ GPS
);

CREATE TABLE media_asset (
  id UUID PRIMARY KEY, type TEXT,                      -- audio|image|video|gif
  s3_key TEXT NOT NULL, bytes BIGINT, checksum TEXT,
  rights_note TEXT, source_credit TEXT
);
```

### 3.4 Entitlement & Progress (bảng theo user)

```sql
CREATE TABLE app_user (
  id UUID PRIMARY KEY, auth_provider TEXT, external_id TEXT,
  created_at TIMESTAMPTZ
);

-- Quyền truy cập nội dung (kết quả của IAP hoặc partner code)
CREATE TABLE entitlement (
  id UUID PRIMARY KEY, user_id UUID REFERENCES app_user(id),
  scope_type TEXT NOT NULL,                            -- poi|route|city|subscription
  scope_id UUID,                                       -- id của poi/topic/city (NULL nếu subscription toàn cục)
  source TEXT NOT NULL,                                -- iap_apple|iap_google|partner_code|free
  granted_at TIMESTAMPTZ, expires_at TIMESTAMPTZ,      -- expires_at cho subscription
  receipt_ref TEXT
);
CREATE INDEX idx_entitlement_user ON entitlement(user_id);

-- Tiến trình khám phá (§7)
CREATE TABLE user_progress (
  user_id UUID, ref_type TEXT, ref_id UUID,            -- ref_type: poi|story|hidden_thread|series
  state TEXT NOT NULL,                                 -- locked|available|in_progress|completed
  progress_pct NUMERIC DEFAULT 0,                      -- vd % audio đã nghe
  completed_at TIMESTAMPTZ,
  content_version_at_completion INT,                   -- version tại thời điểm hoàn thành (cho "xong là xong")
  updated_at_local TIMESTAMPTZ NOT NULL,               -- clock của device (cho conflict UP)
  synced BOOLEAN DEFAULT false,
  PRIMARY KEY (user_id, ref_type, ref_id)
);
```

**Điểm mấu chốt:** `content_version_at_completion` ghi lại version content tại lúc user hoàn thành. Khi content được update lên version cao hơn (Sync DOWN), ta so sánh 2 số này để quyết định có highlight "có nội dung mới" hay không — **mà không đổi `state=completed`** (nguyên tắc "xong là xong").

---

## 4. 🔴 Content Versioning & Publishing

### 4.1 Vòng đời publish
```
draft ──(admin publish)──► published (version++ nếu payload đổi, content_hash tính lại)
published ──(admin edit + republish)──► version++
published ──(admin hide)──► hidden   (app ẩn nhưng dữ liệu offline cũ vẫn dùng được)
```

### 4.2 Snapshot cho offline
Khi Admin publish một POI, backend tạo/cập nhật một **POI package manifest** (§5.2). App chỉ tương tác với package đã publish, không bao giờ với draft.

### 4.3 API version check (nền của Sync DOWN)
```
GET /v1/sync/manifest?city_id=...&since_version_map={poi_id:version,...}
→ trả về list các node có version cao hơn client đang giữ + content_hash mới.
```

---

## 5. 🔴 Offline Architecture

### 5.1 Lưu trữ trên device
- **Metadata + progress + manifest:** SQLite (mirror rút gọn của schema server, chỉ phần đã tải).
- **Media (audio/ảnh/video) + map tiles:** file system, đường dẫn tham chiếu trong SQLite.
- **Map tiles:** Mapbox Offline Tile Pack API (mỗi POI/khu vực = 1 region định nghĩa bởi bbox + zoom range).

### 5.1b 🔴 Migration schema SQLite local (khác với content versioning §4)

`version`/`content_hash` (§3.2) và Sync DOWN (§6.2) giải quyết việc **nội dung** đổi. Có một
trục migration khác, độc lập: khi **chính app BonVoye** ra bản update và đổi cấu trúc bảng
SQLite trên máy user (vd thêm cột vào cache POI, đổi cấu trúc bảng outbox). Đây là rủi ro
riêng — không nhầm với content versioning.

**Công cụ:** dùng **`drift`**, không dùng `sqflite` thô. `drift_dev` cho phép export schema
mỗi version ra file JSON và generate integration test tự động chạy migration từ mọi version cũ
lên version hiện tại — bắt lỗi ở CI trước khi user gặp phải.

**Hai tier bảng, hai chính sách migration:**

| Tier | Bảng | Khi schema đổi (breaking change) |
|---|---|---|
| A — Cache (mirror nội dung server) | `poi`, `npc`, `story`, `story_page`, `artwork`, media manifest | An toàn để DROP + tạo lại — server là nguồn sự thật, app tự resync lại package đã tải |
| B — Local durable state | `user_progress`, `entitlement` (snapshot local), outbox queue (progress chưa sync) | KHÔNG bao giờ DROP; chỉ migration additive (ADD COLUMN có default, thêm bảng mới); bắt buộc test migrate bằng schema fixture thật của từng version đã release |

**Quy tắc:**
1. Local schema version (drift `schemaVersion` / SQLite `PRAGMA user_version`) là trục số
   **độc lập** với `version` trong content model (§3.2) — tránh nhầm "app schema version 4"
   với "POI content version 4".
2. Tier A chỉ wipe khi có mạng để resync ngay; nếu app vừa update xong mà user đang offline,
   giữ nguyên bảng cũ cho tới khi có mạng — tránh app mở lên rỗng ngay sau update lúc mất sóng.
3. Tier B: trước migration bị đánh giá rủi ro cao (đổi kiểu cột, rename), backup file DB cũ ra
   `progress_v{N}.bak.db` trước khi chạy migration, giữ lại vài bản release rồi mới xoá — lưới
   an toàn cho giai đoạn đầu khi migration path chưa được field-test nhiều.
4. File system không cần migration riêng — `media_asset.checksum` (§3.3) làm file trên đĩa
   content-addressed/bất biến; chỉ cột manifest trỏ tới file là cần migrate, không phải bản
   thân file.

### 5.2 POI Package (đơn vị tải)
Một "gói POI" là manifest + toàn bộ tài nguyên cần để trải nghiệm offline POI đó:

```json
{
  "poi_id": "uuid",
  "poi_version": 7,
  "content_hash": "sha256:...",
  "map_region": { "bbox": [...], "min_zoom": 11, "max_zoom": 19 },
  "content": { "npcs": [...], "stories": [...], "hidden_threads": [...] },
  "assets": {
    "full":  [ {"asset_id":"..","s3_key":"..","bytes":..,"checksum":".."}, ... ],
    "audio": [ ... ]                       // tập con của full
  },
  "size": { "full_bytes": 150000000, "audio_bytes": 20000000 }
}
```

### 5.3 Hai tuỳ chọn tải (đã chốt UX)
| Gói | Nội dung | Size tham khảo | Dùng khi |
|-----|----------|----------------|----------|
| **Full** | Audio + Webtoon/Video + tiles | ~150MB | Trải nghiệm hình ảnh tối đa |
| **Audio-only** | Audio + tiles + text | ~20MB | Vừa đi bộ vừa nghe, tiết kiệm pin/dung lượng |

Bổ sung (đề xuất của Nhật Trương): mỗi POI có field **"nội dung nổi bật"** (`featured`) để gợi ý user ưu tiên tải.

### 5.4 Download Manager
- Queue có trạng thái per-POI: `queued → downloading → verifying → ready → failed`.
- **Resume:** tải theo từng asset; nếu rớt mạng, tiếp tục asset còn dở (HTTP Range hoặc tải lại asset chưa xong). Package chỉ chuyển `ready` khi **tất cả** asset verify checksum thành công → tránh cảnh "ảnh bị cắt nửa" (lo ngại trong họp).
- **Cleanup:** LRU theo `last_accessed` khi vượt ngưỡng dung lượng; POI đã completed có thể ưu tiên giữ hoặc cho user ghim.
- **Chế độ tập trung (offline):** khi mất mạng, UI chỉ highlight POI có package `ready`, ẩn/disable tính năng cần mạng.

---

## 6. 🔴 Sync Mechanism (2 chiều độc lập)

> Hai luồng chạy độc lập, không block nhau. Đây là phần team lo lắng nhất — đặc tả kỹ.

### 6.1 Chiều UP — Progress local → server (outbox pattern)
- Mọi thay đổi progress ghi vào bảng `user_progress` local với `synced=false` + `updated_at_local`.
- Một **outbox worker** đẩy các bản ghi `synced=false` lên server ngay khi có mạng (đã chốt: auto-push khi network trở lại).
- API:
  ```
  POST /v1/progress/batch
  body: [ {ref_type, ref_id, state, progress_pct, completed_at, updated_at_local, content_version_at_completion} ]
  → server merge theo rule "completion monotonic" (xem 6.3)
  ```
- Sau khi server ACK từng item → local set `synced=true`.
- **Idempotent:** dùng `(user_id, ref_type, ref_id)` làm khoá; gửi lại không gây hại.

### 6.2 Chiều DOWN — Content update server → local
- App định kỳ (hoặc khi mở app có mạng) gọi `GET /v1/sync/manifest` với version map hiện có.
- Server trả các node có `version` cao hơn.
- App **không tự tải đè**. Thay vào đó hiện **gợi ý** "Có bản cập nhật cho POI X" (đã chốt UX) → user bấm mới tải lại package.

### 6.3 Conflict resolution (đã chốt)
| Tình huống | Xử lý |
|-----------|-------|
| Hai device cùng update progress | **Completion monotonic**: một khi `completed`, không quay lại state thấp hơn. `progress_pct` lấy max. `completed_at` lấy sớm nhất. |
| Content update đè lên POI user đã completed | **"Xong là xong"** — giữ nguyên `state=completed`. So sánh `content_version_at_completion` < version mới → chỉ **highlight** phần mới, KHÔNG reset. (Độ ưu tiên LOW, chọn cách đơn giản nhất.) |

### 6.4 Sơ đồ luồng
```
[UP]   device progress ──outbox──▶ POST /progress/batch ──▶ merge(monotonic) ──▶ DB
[DOWN] open app + online ──▶ GET /sync/manifest ──▶ diff version ──▶ show "update available"
                                                                    └─(user tap)─▶ re-download package
```

---

## 7. 🔴 Progress & Tracking Model

### 7.1 State machine (per POI / Story / Hidden Thread)
```
locked ──(entitlement OK / free)──▶ available
available ──(user mở story)──▶ in_progress
in_progress ──(nghe/đọc xong)──▶ completed   [ghi content_version_at_completion]
```
- **GPS KHÔNG auto-complete** (rule đã chốt): geofence chỉ chuyển NPC sang "interactable" + có thể gửi notification. User phải tap để bắt đầu (proposal §4.5).

### 7.2 Series completion
- `series` completed khi **tất cả `series_item` có `is_required=true`** đã completed.
- Tính ở cả client (để hiển thị ngay offline) và verify lại ở server khi sync UP.
- Hiển thị badge/progress "4/10" như trong Content Architecture §7.

### 7.3 Event tracking (analytics — tách khỏi progress)
- Progress = state bền vững (để resume/entitlement).
- Analytics event (view, play, complete, download) = luồng riêng → Firebase/GA4 + backend, phục vụ partner attribution. Không nhầm 2 luồng.

---

## 8. 🔴 Map & GPS Calibration

### 8.1 Artwork overlay
- Mapbox làm base; artwork minh họa phủ lên bằng **raster/image source** (proposal §4.9.1).
- Toggle "Xem Map thực tế": giảm `opacity` lớp artwork để lộ base map (UX Minh Nguyễn đề xuất). `opacity_default` cấu hình trong CMS.

### 8.2 Calibration artwork ↔ GPS thật
Vì artwork vẽ tay không đúng tỉ lệ bản đồ, cần mapping. Lưu trong `artwork.calibration`:

```json
{
  "type": "affine",                 // hoặc "control_points"
  "control_points": [               // >=3 cặp điểm để tính phép biến đổi
    { "artwork": {"x":120,"y":340}, "gps": {"lat":21.028,"lng":105.850} },
    { "artwork": {"x":880,"y":210}, "gps": {"lat":21.031,"lng":105.854} },
    { "artwork": {"x":500,"y":900}, "gps": {"lat":21.025,"lng":105.852} }
  ]
}
```
- Admin đặt ≥3 control point trong Visual Map Editor → hệ tính ma trận affine để chiếu GPS thật ↔ toạ độ artwork.
- POI/NPC lưu **cả** `location` (GPS thật, dùng cho geofence) **và** `artwork_position` (dùng để render lên artwork). Không suy ra tự động — Admin căn chỉnh trực quan, giảm sai số.

### 8.3 Xử lý sai số GPS
- **Geofence radius cấu hình per-POI** (`interaction_radius_m`, mặc định 25m), không hard-code.
- **Fallback khi GPS yếu:** QR code tại địa điểm, cho user kéo-thả hiệu chỉnh vị trí, admin override, nới radius theo bối cảnh (khu nhà cao tầng/ngõ hẹp).
- **Snap-to-center** cho các POI dạng vùng (công trình lớn như Văn Miếu, Dinh Độc Lập): dùng tâm POI thay vì điểm GPS thô.
- Không cam kết độ chính xác tuyệt đối (proposal §5.7) — 20–30m là target thiết kế, phải field-test (Phase 5).

### 8.3b Chống nhấp nháy trạng thái NPC (hysteresis state machine)

Tín hiệu GPS dao động quanh biên bán kính có thể khiến NPC nhấp nháy liên tục giữa "có thể
tương tác" và "chưa tới nơi" nếu đổi trạng thái theo từng lần đo thô. Cần một state machine
2 ngưỡng thay vì so sánh khoảng cách đơn giản:

```
far ──(khoảng cách ≤ interaction_radius_m)──▶ entering
entering ──(duy trì ≤ interaction_radius_m liên tục ≥ interaction_min_dwell_s)──▶ near_confirmed
near_confirmed ──(khoảng cách > interaction_exit_radius_m)──▶ far
```

- `interaction_exit_radius_m` luôn lớn hơn `interaction_radius_m` (§3.3) — đây chính là
  hysteresis: bán kính "vào" khác bán kính "ra".
- NPC chỉ chuyển UI sang "có thể tương tác" (interactable) ở trạng thái `near_confirmed`,
  không phải `entering`.
- State machine này chạy **client-side**, tính từ content đã cache sẵn + vị trí đo gần nhất —
  không gọi backend theo từng lần đo GPS.

### 8.4 Provider abstraction & chủ quyền VN
- Interface `MapProvider` (initMap, addRasterOverlay, downloadRegion, geofence...) → impl Mapbox nay, Amap sau. Tọa độ chuẩn WGS-84; chuyển GCJ-02 ở lớp abstraction khi bật China add-on.
- **Chủ quyền:** mặc định ẩn political boundary layer của Mapbox; nếu cần hiển thị Hoàng Sa/Trường Sa thì override bằng GeoJSON do khách hàng cung cấp/phê duyệt (proposal §4.9.3, ML1–ML8). Custom layer này chính là giải pháp đã bàn trong họp.

---

## 9. 🟡 Story Experience (Audio + Webtoon)

### 9.1 Giai đoạn đầu (ưu tiên performance — đã chốt)
- Webtoon = **truyện tranh tĩnh cuộn dọc** + audio/nhạc nền **độc lập**. Không sync.

### 9.2 Auto-sync (phase sau — thiết kế sẵn schema)
- Mỗi `story_page` có `duration_ms` + `audio_start_ms` (§3.3), map 1:1 với audio (logic tham khảo Screenfluence).
- Khi user chuyển audio ↔ webtoon: tính trang khớp `audio_start_ms ≤ current_ms < next.audio_start_ms` → cuộn tới đúng trang. Ngược lại, slideshow tự chuyển trang theo `duration_ms`, tạo cảm giác "hoạt hình nhẹ".
- Webtoon động (nền động + textbox theo timing, kiểu *Tales of the Mirror*): là kịch bản phức tạp nhất, để **phase sau**; schema `text_blocks` + asset video/gif đã chừa chỗ.

### 9.3 Resume progress
- Lưu `progress_pct` (audio) + trang hiện tại trong `user_progress` để tiếp tục sau (offline được).

---

## 10. 🟡 Entitlement & IAP

- **Flow:** user mua qua Apple IAP / Google Play Billing → app gửi receipt → backend validate với Apple/Google → tạo `entitlement` → unlock content.
- **Restore purchases:** query lại receipt + entitlement theo user khi cài lại/đổi máy (proposal Phase 3).
- **Scope:** free-first-POI (user tự chọn), POI đơn lẻ, route (topic), city, subscription.
- **Offline check:** entitlement snapshot tải về local; khi offline vẫn mở được content đã có quyền. Server là nơi cấp quyền, local là nơi enforce lúc offline.
- Zalo Mini App: **chỉ hiển thị** entitlement, không bán.

---

## 11. 🟡 Media Delivery

- S3 lưu media + POI packs; CloudFront phân phối.
- **Private content:** CloudFront **signed URL/signed cookie**, cấp bởi backend sau khi check entitlement.
- Offline download: app xin signed URL → tải asset đã verify quyền → cache local.
- Cân nhắc tương lai: Cloudflare R2 nếu bandwidth tăng (ghi nhận, không làm bây giờ).

---

## 12. 🟡 Auth & Định danh xuyên nền tảng

- Native: Apple/Google/social/email login; SMS OTP chỉ bật nếu bắt buộc verify phone (chi phí riêng).
- Zalo Mini App: **Zalo Login + account linking là mặc định, không cần OTP** ở luồng cơ bản
  (đã chốt chính thức, `internal-technical-discussions-vi.md` §5.5). OTP chỉ là lớp phụ nếu
  sau này BonVoye muốn thêm xác minh số điện thoại riêng ngoài Zalo.
- Backend JWT; RBAC cho CMS.

**Vì sao cần nâng lên 🟡:** một user thật có thể có 2 identity khác nhau trong hệ thống
(`app_user` native và Zalo ID) - nếu không tách bảng liên kết riêng, entitlement/progress dễ
bị chia đôi giữa 2 "cửa vào" của cùng một người.

```sql
CREATE TABLE identity_link (
  id               UUID PRIMARY KEY,
  canonical_user_id UUID REFERENCES app_user(id),   -- user gốc, dùng cho entitlement/progress
  provider         TEXT NOT NULL,                    -- native | zalo
  provider_user_id TEXT NOT NULL,
  phone            TEXT,                             -- NULL nếu Zalo không trả về / không tin cậy
  verified_via     TEXT NOT NULL DEFAULT 'zalo_login',-- zalo_login | otp | unverified
  linked_at        TIMESTAMPTZ,
  UNIQUE (provider, provider_user_id)
);
```

- Mặc định `verified_via = 'zalo_login'`, không bật OTP.
- User dùng được app bình thường trên từng `provider` độc lập **trước khi** có bản ghi
  `identity_link` nối 2 bên — không chặn trải nghiệm vì thiếu liên kết (nguyên tắc offline-first
  áp dụng tương tự: identity linking là lớp cộng thêm, không phải điều kiện tiên quyết).

## 13. 🟢 CMS & Visual Map Editor
- Tree navigator 7 cấp; CRUD tất cả node; media library; đa ngôn ngữ (trạng thái dịch, fallback).
- Visual Map Editor: upload artwork, đặt/kéo-thả POI/NPC, đặt control point calibration (§8.2), config radius/opacity/unlock rule, publish/version (§4).
- Audit log.

## 14. 🟢 Partner / Attribution
- Tạo access code hàng loạt, gán partner/campaign, đổi code → cấp entitlement.
- Capture UTM/QR/deep link/referrer; track activation + purchase event; dashboard cơ bản.

**Nối "click ở Zalo" với "cài native app sau đó":** Zalo Mini App và native app là 2 app tách
biệt trên máy - không có deferred deep link thì hệ thống không tự biết 2 lượt mở app đó là
cùng 1 người, và báo cáo cho partner sẽ đếm thiếu conversion. Dùng **Branch.io** (đã chốt,
proposal §4.1) để nối lại:

```sql
CREATE TABLE attribution_click (
  id             UUID PRIMARY KEY,
  campaign_id    UUID, partner_id UUID,
  branch_link_id TEXT NOT NULL,     -- Branch.io deferred deep link id
  clicked_at     TIMESTAMPTZ
);

CREATE TABLE attribution_install (
  id               UUID PRIMARY KEY,
  installed_user_id UUID REFERENCES app_user(id),
  matched_click_id  UUID REFERENCES attribution_click(id), -- NULL nếu Branch.io không match được
  matched_at        TIMESTAMPTZ
);
```

Khi Branch.io match được `attribution_install.matched_click_id`, backend có thể tận dụng luôn
để gợi ý bước liên kết identity ở §12 cho user vừa cài native app (chỉ prefill UI, không tự
động link cứng) - giảm thao tác thủ công.

## 15. 🟢 Zalo Mini App — ranh giới
- CÓ: browse content, map/list, entitlement display, QR/deeplink entry, tracking.
- KHÔNG: offline, payment, background GPS, geofence chính xác 20–30m, background audio.

---

## 16. ❓ Câu hỏi / quyết định cần chốt trước khi code M1

| # | Vấn đề | Đề xuất mặc định | Cần ai chốt |
|---|--------|------------------|-------------|
| Q1 | Đơn vị tính size gói Full 150MB — có gồm video không? Video POI xử lý ra sao offline? | Giai đoạn đầu: video optional trong gói Full, nén/giới hạn độ phân giải | KH + Tech Lead |
| Q2 | Auto-sync webtoon↔audio: làm ngay hay phase sau? | **Phase sau** — schema chừa sẵn, MVP tĩnh (đã nghiêng theo họp) | PM + KH |
| Q3 | Calibration dùng affine (3 điểm) hay chỉ đặt thủ công từng POI? | Affine + cho phép override thủ công từng POI | Tech Lead |
| Q4 | Subscription: có ngay MVP hay sau? | Có scope nhưng ưu tiên sau POI/route/city | PM |
| Q5 | Ngưỡng dung lượng offline tối đa + policy cleanup | Cho user thấy dung lượng đã dùng + tự ghim POI | Design |
| Q6 | Progress lưu ẩn danh (chưa login) rồi merge khi login? | Có — dùng device id tạm, merge vào user khi đăng nhập | Tech Lead |

---

## 17. Rủi ro & giảm thiểu

| Rủi ro | Mức | Giảm thiểu |
|--------|-----|-----------|
| GPS không đủ chính xác cho geofence 20–30m thực địa | Cao | Field test sớm (Phase 5), fallback QR/manual/radius config |
| Gói Full 150MB nặng, tải lỗi giữa chừng | Cao | Verify checksum per-asset, chỉ `ready` khi đủ; resume; tách gói Audio 20MB |
| Sync progress đa thiết bị mâu thuẫn | Trung | Completion monotonic + idempotent batch |
| Content update phá vỡ trải nghiệm đã hoàn thành | Thấp | "Xong là xong" + highlight, không reset |
| Chi phí Mapbox/AWS vượt dự toán khi scale | Trung | Monitoring + cost alert (proposal §4.9.10) |
| Sai số artwork ↔ GPS gây lạc đường | Trung | Toggle "Xem Map thực tế" + calibration control points |
| Schema SQLite local đổi giữa các bản app, migration viết sai làm mất `user_progress`/`entitlement` local | Cao (giai đoạn đầu) | drift + test migration tự động qua mọi version cũ (§5.1b); tier hoá bảng cache vs durable state; backup trước migration rủi ro cao |

---

## 18. Ưu tiên triển khai (map vào Build M1)

1. **Data Model + versioning** (nền mọi thứ) → migration đầu tiên.
2. **Entitlement + Auth skeleton** (để test unlock).
3. **Offline POI package + Download Manager**.
4. **Sync UP/DOWN + Progress state machine**.
5. **Map integration + calibration + geofence**.
6. **Story player (tĩnh) → auto-sync để phase sau**.

> Tài liệu này là draft để team review. Các phần 🔴 P0 nên được chốt trong buổi review đầu tiên vì mọi thứ khác phụ thuộc vào chúng.
