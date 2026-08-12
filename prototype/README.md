# BonVoye — Prototype App Core

Mở bằng browser, không build step.

```
open index.html     # bản CHẠY ĐƯỢC — app shell + máy trạng thái chạy thật
open mockup.html    # bản XEM THIẾT KẾ — 50 trạng thái tĩnh, cạnh nhau
open flow.html      # bản ĐỂ QUAY VIDEO — 10 luồng, một khung máy
# hoặc
python3 -m http.server 8765  →  http://localhost:8765
# muốn xem trên iPhone thật: mở Safari, vào IP-máy:8765
```

## Ba file, ba mục đích

| | `index.html` | `mockup.html` | `flow.html` |
|---|---|---|---|
| Dùng để | review **hành vi** (logic, máy trạng thái) | review **thiết kế** (nhìn UI) | **quay video** đi demo |
| Trạng thái | engine chạy thật, có tick | dữ liệu đứng yên, không tick | đứng yên, nhưng **có thứ tự** |
| Bố cục | 1 khung + rail + Inspector | 50 khung cạnh nhau | 1 khung, đi từng bước |
| Xem một màn | phải đi qua đủ điều kiện | hiện ngay | nằm đúng chỗ của nó trong luồng |
| Bản đồ | lớp tranh isometric | ảnh tile **OpenStreetMap thật** | dùng lại của `mockup.js` |

Cả `mockup.html` lẫn `flow.html` đều nạp `ui.js` với cờ `window.MOCKUP_MODE = true`
để dùng chung hàm render mà **không** cho app tự chạy. Muốn soi riêng một màn ở cỡ
thật: `mockup.html#solo=6` (số thứ tự khung, đếm từ 0).

Vì sao cần bản mockup: mọi màn trong `index.html` là **hàm của trạng thái engine** —
muốn thấy thẻ "2 NPC trong tầm" phải lần lượt qua quyền vị trí → geofence → proximity
→ entitlement → offline. Đúng cho việc review logic, nhưng ngược đời khi chỉ muốn ngắm
thiết kế. `mockup.html` gán thẳng trạng thái nên bỏ hết các cổng đó.

Vì sao cần thêm bản flow: `mockup.html` là tờ contact sheet — 50 trạng thái nằm cạnh
nhau, không có thứ tự, nên không kể được app **chuyển** như thế nào. Còn quay
`index.html` thì lên hình toàn cảnh vật lộn với máy trạng thái. `flow.html` xâu các
trạng thái ấy thành 10 luồng có thứ tự trên một khung máy duy nhất, chạy tự động được.

---

## Flutter handoff — nguồn để Agent sinh Widget

Prototype vẫn là HTML/CSS để review bằng mắt, nhưng phần contract dành cho Flutter nằm trong `spec/` và không phụ thuộc vào DOM:

| File | Dùng để |
|---|---|
| `spec/manifest.json` | entry point của Flutter handoff và danh sách nguồn runtime/visual reference |
| `spec/design-tokens.json` | viewport 393×852, màu semantic, typography, spacing, radius, elevation, layer và motion |
| `spec/components.json` | contract của Button, Card, Row, Sheet, MapSurface và các reusable Widget |
| `spec/screens.json` | screen ID, route, state seed, widget tree, action IDs và scroll behavior |
| `spec/actions.json` | payload, guard và side effect của callback; không port inline `S` mutation vào Flutter |
| `spec/flows.json` | 10 flow, route coverage và transition assertions |
| `spec/map-contract.json` | GPS/Web Mercator/artwork, layer order, geofence, proximity, fake GPS và offline |
| `spec/state-machines.json` | shape domain và các state machine cần chuyển thành controller/notifier/service |

Thứ tự đọc khi build Flutter:

```text
spec/design-tokens.json
→ spec/components.json
→ spec/screens.json + spec/actions.json
→ spec/state-machines.json + spec/map-contract.json
→ spec/flows.json
→ mockup.html#solo=<n> để đối chiếu screenshot
```

Các helper hiện tại phát thêm `data-bv-component`, `data-bv-variant`, `data-bv-state`, `data-bv-action`, `data-bv-testid` và `data-bv-screen`. Metadata này không đổi visual output, nhưng giúp Agent hoặc test harness nhận diện đúng Widget contract. `mockup.js` và `flow.js` cũng xuất stable scene/step IDs để không phải dựa vào index của gallery.

Kiểm tra handoff bằng Node:

```bash
node tools/validate-flutter-spec.js
```

Static fixture chỉ mô tả trạng thái để review; logic production vẫn phải lấy từ `data.js`/`engine.js` và chuyển sang action dispatcher + state layer của Flutter.

---

## Figma handoff — tạo file Figma editable

Repo có một Figma development plugin tại `../figma-plugin/`. Plugin không cố tạo file `.fig` trực tiếp — Figma quản lý định dạng native đó — mà tạo một document editable từ các contract hiện có:

```bash
node tools/validate-figma-import.js
```

Trong Figma desktop: **Plugins → Development → Import plugin from manifest...**, chọn `../figma-plugin/manifest.json`, rồi chạy plugin và chọn các file:

- `spec/design-tokens.json`
- `spec/components.json`
- `spec/screens.json`
- `spec/actions.json`
- `spec/flows.json`
- `spec/figma-import.json` (tuỳ chọn)

Plugin tạo tối đa ba page `BonVoye • Tokens`, `BonVoye • Components` và `BonVoye • Screens`. Actions và flow coverage nằm trong một metadata section ở cuối page `BonVoye • Screens`. Screen frame có kích thước 393×852 và giữ metadata `data-bv-*` dưới dạng plugin data `bv.*` để designer hoặc engineer truy ngược về route, component, action và state.

`spec/screens.json` mô tả contract và hành vi, không chứa toàn bộ DOM render của mỗi màn. Vì vậy screen không có visual source sẽ hiện dạng contract placeholder editable. Muốn giữ hình ảnh chi tiết hơn, chọn thêm HTML snapshot tĩnh có root `data-bv-screen`, SVG local đặt tên theo screen ID/route, và CSS local tương ứng. Plugin không tải tile OpenStreetMap, font ngoài hoặc ảnh remote.

Xem hướng dẫn đầy đủ tại `../figma-plugin/README.md`.

---

## `flow.html` — bản để quay video

```
open flow.html                    # mở ở luồng 1, bước 1
open flow.html#f=ngoai-tuyen&s=4  # nhảy thẳng tới đúng một bước
open 'flow.html#rec'              # mở sẵn ở chế độ ghi hình
```

| Luồng | id | Bước |
|---|---|---|
| Mở đầu → nghe chuyện đầu tiên | `mo-dau` | 12 |
| Nhiều người kể chuyện | `nhieu-npc` | 5 |
| Fake GPS — kéo vị trí khi test | `fake-gps` | 6 |
| Ngoại tuyến — tải gói trước | `ngoai-tuyen` | 7 |
| Khoá & mở khoá | `khoa` | 5 |
| Quyền & chạy nền | `quyen-nen` | 4 |
| Mã đối tác B2B2C | `partner-code` | 5 |
| Khám phá nội dung | `discovery` | 7 |
| Mua và khôi phục nội dung | `commerce` | 7 |
| Lên lịch một chuyến đi | `planner` | 5 |

Tổng cộng 10 luồng / 63 bước. Phím: `←` `→` lùi/tiến · `Space` phát luồng này ·
`Shift+Space` phát liên tục hết 10 luồng · `R` chế độ ghi hình · `C` phụ đề đè lên khung ·
`1`–`9` hoặc `0` để nhảy luồng 1–10 · `Home`/`End` đầu/cuối luồng. Bấm thẳng vào khung
máy cũng là sang bước kế.

**Cách quay:** bấm `R` (ẩn hết chữ quanh khung), kéo cửa sổ cao ≥ 1010px để khung
giữ đúng 393×852 **không bị thu nhỏ** — quay ở tỉ lệ lẻ là chữ bị nhoè. Rồi `Space`
cho chạy tự động, hoặc `←`/`→` tự bấm nếu muốn dừng lại nói kỹ từng màn. Cột phải có
sẵn **lời đọc** cho từng bước; nó tự ẩn khi vào chế độ ghi hình.

Mỗi bước chỉ là "gán trạng thái rồi gọi `render*()` có sẵn" — không màn nào được vẽ
lại trong `flow.js`. Bề mặt bản đồ lấy qua `window.MU` do `mockup.js` xuất ra, nên
Web Mercator và bán kính tính bằng mét thật chỉ có **một** bản trong repo.

---

## Bảng màn ↔ PHẦN tài liệu

| # | Màn | Nguồn | Route |
|---|---|---|---|
| 00 | Splash / Login | Design System §5 | `00-splash`, `00b-login` |
| 01 | Home — chọn city/topic | PHẦN 1–2 | `01-home` |
| 02 | Bản đồ (2 lớp SVG, pin, nhãn, NPC) | PHẦN 6b | `02-map` |
| 03 | Xin quyền vị trí (OS dialog) | PHẦN 9 | `03-permission` |
| 04 | Dev panel — mô phỏng GPS | PHẦN 4–5, 10 | `04-dev` |
| 05 | NPC chooser (≥2 NPC) | PHẦN 6 | `05-chooser` |
| 06 | Story sheet — audio/webtoon | PHẦN 7 | `06-story` |
| 07 | Hành Trình (đã xong, Series) | PHẦN 8 | `07-journey` |
| 07b | Hồ sơ cá nhân | WBS 2.2.2 | `07b-profile` |
| 08 | Kéo vị trí Fake GPS | PHẦN 4 | `08-drag` |
| 10 | Xin quyền generic (4 case) | PHẦN 9 | `10-permission` |
| 11 | Màn khoá / Geofence background | PHẦN 8–9 | `11-geofence` |
| 12 | Tải gói Offline (resume + verify) | PHẦN 9b | `12-download` |
| 13 | Popup mở khoá Hidden Thread | PHẦN 8 | `13-unlock` |
| 14 | Nội dung bị khoá (entitlement) | TD §10 (suy ra) | `14-locked` |
| 15 | Partner Code — mở khoá thành công | WBS 6.1–6.2 | `15-partner-code-success` |
| 16 | Floor Picker | PHẦN 6b | `16-floor-picker` |
| 17 | NPC Series / Questline | PHẦN 8 | `17-npc-series` |
| 18 | Search / browse / empty | WBS 4.1.2–4.1.3 | `18-search`, `18b-search-results`, `18c-search-empty` |
| 19 | POI detail (available / locked / offline) | WBS 4.2.1 | `19-poi-detail`, `19b-poi-detail-locked`, `19c-poi-detail-offline` |
| 20 | Offers / purchase states | WBS 5.2–5.3 | `20-offers`, `20b–20d` |
| 21 | Restore purchases | WBS 5.4 | `21-restore-purchases`, `21b–21c` |
| 22–23 | Trip Planner | WBS 5.1 | `22-trip-select` → `23c-trip-saved` |

---

## 3 máy trạng thái (chạy thật, không mock tĩnh)

1. **Proximity** — 2 model: "hôm nay" (NPC 20m, không hysteresis) và "sau CMS PHẦN 5" (POI 25/35m/3s, hysteresis). Chuyển bằng Dev panel hoặc Inspector tab Prox.
2. **Fake GPS** — 4 điều kiện song song: hết 15 phút, đã tới nơi, thoát màn POI, GPS tốt 60s. Audio đang phát thì nhịn reset → hoãn tới tương tác kế.
3. **Download** — `not_downloaded → downloading ⇄ paused → verifying → ready`. Resume tiếp từ MB đã tải (không về 0). Focus Mode: mất mạng chỉ highlight POI ready.

---

## Giả định đã chọn (PHẦN 12)

| Câu | Nội dung | Giả định |
|---|---|---|
| 1 | Banner "đã trả về GPS thật" — nhẹ hay chặn? | Banner nhẹ, tự tắt sau 6s, không chặn thao tác |
| 4 | Fake GPS vs GPS thật — ai thắng? | Vị trí kéo thắng; GPS thật vào vùng POI → reset |
| 5 | Hidden Thread / Series hiện sao? | Hidden: ẩn + popup mở khoá; Series: hiện sẵn + thanh % |
| 7 | POI dài >300m — nới trần kéo? | Có: đường chéo vùng + 50m (Văn Miếu → ~419m) |
| 8 | NPC scale theo zoom hay giữ cỡ? | Giữ cỡ + dưới scale 0.75 gom cụm |

---

## Cách verify (theo plan)

1. Mở `index.html` trong Chrome, viewport 393×852
2. Check console — **không được có lỗi đỏ**
3. Happy path: Home → chọn HN + "36 phố phường" → Bắt đầu → Map
4. Dev panel: Ép từng điều kiện C1..C4, xem banner lý do
5. Hysteresis: Chọn model SAU CMS, đứng biên POI, GPS nhiễu → NPC không nhấp nháy
6. Download: Tải gói → pause → resume → verify → ready
7. Xong là xong: Complete 1 story → push bản mới → vẫn completed

---

## Cấu trúc file

```
index.html / mockup.html / flow.html — ba entry point, cùng load thứ tự classic-script

src/config/app-config.js — brand, feature flags, purchase plans, planner config
src/config/copy.vi.js   — cầu nối copy locale trong giai đoạn di chuyển
src/ui/html.js          — escape, attribute và fragment helpers
src/ui/icons.js         — icon registry dùng lại được
src/ui/components.js    — button, card, row, chip, sheet, progress, field...
src/ui/layout.js        — adapter cho screen/tabbar legacy
src/screens/            — discovery, commerce, Trip Planner renderers
src/scenes/next-scenes.js — static gallery scenes cho route 18–23
styles/tokens.css       — palette, semantic colors, type, spacing, radii, z-index
styles/base.css         — shared accessibility/base layer
styles/components.css   — reusable component styles
styles/screens.css      — new screen layout styles
styles/workbench.css    — workbench additions

app.css      — legacy-compatible shell/map/inspector/screen styles
mockup.js    — existing scene harness + OSM/Web Mercator; exports `window.MU`
flow.js      — 10 recording flows / 63 steps; exports stable flow/step IDs

spec/        — Flutter handoff contracts: tokens, components, screens, actions, flows, map, state machines
tools/       — no-build validation scripts (`node tools/validate-flutter-spec.js`)

data.js     — CONSTANTS + mock cây 8 cấp
engine.js    — 3 máy trạng thái + haversine + progress + audio
art.js       — SVG: lớp tranh isometric, map thật, NPC figure, webtoon
ui.js        — legacy router/renderers + compatibility adapters for new screens
```

### Thêm một màn mới

1. Đặt copy và dữ liệu demo dùng chung trong `src/config/app-config.js`.
2. Dùng `BV_UI.components` thay vì tạo lại card/button/sheet bằng inline HTML.
3. Tạo renderer dưới `src/screens/`, trả về `BV_UI.layout.frame(...)`.
4. Thêm route adapter trong `ui.js` và static scene trong `src/scenes/next-scenes.js`.
5. Chỉ thêm CSS mới vào `styles/components.css` hoặc `styles/screens.css`.
6. Thêm screen/action/component entry tương ứng trong `spec/` và chạy `node tools/validate-flutter-spec.js`.
7. Gắn `screenId`, `actionId`, `testId` và semantics trước khi thêm fixture mới để Flutter không phải suy luận từ class CSS.

Chi tiết các lỗi đã sửa và phần còn hoãn: `docs/07. Prototype Map Core Fixes.md`.
