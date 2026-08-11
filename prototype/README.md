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

## `flow.html` — bản để quay video

```
open flow.html                    # mở ở luồng 1, bước 1
open flow.html#f=ngoai-tuyen&s=4  # nhảy thẳng tới đúng một bước
open 'flow.html#rec'              # mở sẵn ở chế độ ghi hình
```

| Luồng | id | Bước |
|---|---|---|
| Mở đầu → nghe chuyện đầu tiên | `mo-dau` | 9 |
| Nhiều người kể chuyện | `nhieu-npc` | 5 |
| Fake GPS — kéo vị trí khi test | `fake-gps` | 6 |
| Ngoại tuyến — tải gói trước | `ngoai-tuyen` | 7 |
| Khoá & mở khoá | `khoa` | 5 |
| Quyền & chạy nền | `quyen-nen` | 4 |
| Mã đối tác B2B2C | `partner-code` | 5 |
| Khám phá nội dung | `discovery` | 5 |
| Mua và khôi phục nội dung | `commerce` | 5 |
| Lên lịch một chuyến đi | `planner` | 5 |

Phím: `←` `→` lùi/tiến · `Space` phát luồng này · `Shift+Space` phát liên tục hết 6
luồng · `R` chế độ ghi hình · `C` phụ đề đè lên khung · `1`–`6` nhảy luồng ·
`Home`/`End` đầu/cuối luồng. Bấm thẳng vào khung máy cũng là sang bước kế.

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
| 01 | Home — chọn city/topic | PHẦN 1–2 | `#01-home` |
| 02 | Bản đồ (2 lớp SVG, pin, nhãn, NPC) | PHẦN 6b | `#02-map` |
| 03 | Xin quyền vị trí (OS dialog) | PHẦN 9 | `#03-permission` |
| 04 | Dev panel — mô phỏng GPS | PHẦN 4–5, 10 | `#04-dev` |
| 05 | NPC chooser (≥2 NPC) | PHẦN 6 | `#05-chooser` |
| 06 | Story sheet — audio/webtoon | PHẦN 7 | `#06-story` |
| 07 | Hành Trình (đã xong, Series) | PHẦN 8 | `#07-journey` |
| 08 | Kéo vị trí Fake GPS | PHẦN 4 | `#08-drag` |
| 10 | Xin quyền generic (4 case) | PHẦN 9 | `#10-permission` |
| 11 | Màn khoá / Geofence background | PHẦN 8 | `#11-geofence` |
| 12 | Tải gói Offline (resume + verify) | PHẦN 9b | `#12-download` |
| 13 | Popup mở khoá Hidden Thread | PHẦN 8 | `#13-unlock` |
| 14 | Nội dung bị khoá (entitlement) | TD §10 (suy ra) | `#14-locked` |
| 18 | Search / browse / empty | WBS 4.1.2–4.1.3 | `#18-search` |
| 19 | POI detail (available / locked / offline) | WBS 4.2.1 | `#19-poi-detail` |
| 20 | Offers / purchase states | WBS 5.2–5.3 | `#20-offers` |
| 21 | Restore purchases | WBS 5.4 | `#21-restore-purchases` |
| 22–23 | Trip Planner | WBS 5.1 | `#22-trip-select` |

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
flow.js      — 10 recording flows / 50+ steps

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

Chi tiết các lỗi đã sửa và phần còn hoãn: `docs/07. Prototype Map Core Fixes.md`.
