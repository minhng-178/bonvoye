---

### 1. Kiến trúc Tổng thể & Lựa chọn Công nghệ (Tech Stack)
* **Khung ứng dụng (App):** Native Flutter cho iOS và Android (dùng chung codebase).
* **Kênh phụ trợ (Companion Channel):** **Zalo Mini App** phục vụ người dùng Việt Nam, quét mã QR tại thực địa và các chiến dịch đối tác (không hỗ trợ Offline, Payment hay Background GPS).
* **Backend & CMS:** Xây dựng **CMS tùy biến (NestJS + React)** dùng chung codebase/database với NestJS API, bỏ qua Strapi để xử lý mô hình cây nội dung nhiều cấp và công cụ Visual Map Editor đặc thù.
* **Database:** PostgreSQL + PostGIS xử lý dữ liệu không gian địa lý.
* **Bản đồ & Media CDN:** Mapbox SDK (hỗ trợ offline map, custom raster overlay) và AWS S3 + CloudFront CDN phân phối media.

---

### 2. Tiến hóa Cấu trúc Dữ liệu: Thêm cấp KHU (Site)
* **Quyết định chốt mới nhất :** Tách bạch khái niệm POI. **POI là một thành phần/điểm dừng chân cụ thể trong khu di tích** (ví dụ: Khuê Văn Các, Bia Tiến sĩ là các POI riêng nằm trong Văn Miếu).
* **Cây nội dung cập nhật (8 cấp / nâng từ 7 cấp):**
  $$\text{Country} \rightarrow \text{City} \rightarrow \text{Topic} \rightarrow \text{KHU (Site)} \rightarrow \text{POI} \rightarrow \text{NPC} \rightarrow \text{Story} \rightarrow \text{Hidden Threads}$$
* **Nâng bảng Artwork thành Site:** Tranh vẽ tay (Artwork) được gắn ở cấp KHU (`site`). Một bức tranh phủ chung cho nhiều POI thuộc khu đó (mối quan hệ $N \rightarrow 1$). Bảng `poi_label` bị loại bỏ vì chính POI thành phần đã mang đầy đủ nhãn, Audio và NPC.
* **Liên kết Topic:** Topic nối $N \rightarrow N$ với KHU (không nối trực tiếp với POI).

---

### 3. Trải nghiệm Offline & Cơ chế Đồng bộ (Sync & Track)
* **Nguyên tắc Offline-first:** Server là nơi đồng bộ, Local DB (SQLite) là nguồ`n sự thật khi đang trải nghiệm ngoài thực địa.
* **Đơn vị tải Offline = POI package:** Tải trọn gói ở cấp POI (bao gồm Map tiles, Audio, Media/Webtoon, Manifest), không chia nhỏ tiến độ bên trong POI.
* **2 Tùy chọn tải:** Gói **Audio-only (~20MB/POI)** cho trải nghiệm vừa đi bộ vừa nghe, tiết kiệm pin/4G; và Gói **Full Media (~150MB/POI)** bao gồm Webtoon/Video độ phân giải cao.
* **Chế độ tập trung (Focus Mode):** Khi mất mạng, UI di-able/ẩn các tính năng cần mạng và chỉ highlight các POI đã tải sẵn gói offline.
* **Đồng bộ 2 chiều độc lập:**
  * **Chiều UP (Client $\rightarrow$ Server):** Tiến trình lưu local trước, khi có mạng trở lại sẽ tự động push lên server qua Outbox pattern.
  * **Chiều DOWN (Server $\rightarrow$ Client):** So sánh version nội dung. Nếu server có bản mới, app chỉ hiện gợi ý cập nhật chứ không tự tải đè.
  * **Nguyên tắc "Xong là xong" (Monotonic Completion):** Bản cập nhật nội dung mới từ server **KHÔNG reset** trạng thái đã hoàn thành của người dùng; hệ thống chỉ highlight phần nội dung vừa bổ sung.

---

### 4. Xử lý Bản đồ, GPS & Cơ chế Kích hoạt 2 Tầng
* **Sai số GPS thực tế:** Bị giới hạn vật lý (sai số GPS thực địa $\ge 30\text{m}$, trong khi khoảng cách giữa các tòa nhà di tích chỉ $15\text{--}30\text{m}$).
* **GPS Fine-Tuning & Custom Map Overlay:**
  * **Bản đồ minh họa (Artwork Overlay):** Phủ lớp tranh vẽ tay (Isometric) lên bản đồ thực Mapbox.
  * **Căn chỉnh (Calibration):** Admin đặt $\ge 3$ điểm mốc trên Visual Map Editor để tính ma trận biến đổi Affine giữa tọa độ thực (WGS-84) và tọa độ tranh. Quy ước bắt buộc: **chấm mốc ở CHÂN công trình**.
  * **Toggle "Xem Map thực tế":** Cung cấp nút làm mờ opacity lớp tranh vẽ tay để lộ bản đồ thực bên dưới, tránh lạc đường.

---

### 5. Trải nghiệm Story: Audio & Webtoon
* **Giai đoạn MVP (P0):** Webtoon là **truyện tranh tĩnh cuộn dọc + Audio/nhạc nền chạy độc lập**, không xử lý đồng bộ thời gian phức tạp để ưu tiên hiệu năng và tốc độ làm game/app.
* **Giai đoạn tiếp theo (P1/P2):** Phát triển cơ chế **Audio-Driven Sync** (Audio đóng vai trò Master Clock) tự động chuyển trang Webtoon hoặc hiệu ứng bóng thoại theo timestamp audio.
* **Kịch bản cất máy vào túi:** Khi tắt màn hình, app tự bỏ qua các nội dung dạng đọc (Text/Webtoon) để tiếp tục phát luồng Audio kế tiếp nhờ thuộc tính `playable_screen_off`.

---

### 6. Đăng nhập, Khóa nội dung (Entitlement) & Zalo Mini App
* **Khóa 2 lớp:**
  1. **Lớp Quyền sở hữu (Entitlement):** Bao gồm POI đầu tiên miễn phí (Free-first-POI), POI lẻ, Gói Tuyến/Thành phố hoặc Partner Access Code.
  2. **Lớp Điều kiện trải nghiệm (Logic):** GPS-unlocked (đến gần mới cho bấm tương tác) và Series-completion (hoàn thành chuỗi mới mở Hidden Threads).
* **Luồng Đăng nhập Ẩn danh:** Cho phép trải nghiệm ngay bằng Device ID tạm thời, chỉ yêu cầu Login (Zalo ID / Social) để hợp nhất (merge) dữ liệu khi người dùng muốn lưu thư viện hoặc đổi máy.
* **Ranh giới Zalo Mini App:** Dùng Zalo Login + `getPhoneNumber` (xác thực qua nhà mạng, không tốn chi phí gửi OTP SMS). Mini App chỉ duyệt nội dung và xem trạng thái entitlement, **không xử lý thanh toán native hay background GPS**.

---

### 7. CMS Visual Map Editor (Canvas Editor)
* **Giao diện Canvas WYSIWYG:** Tương tự Photoshop/Figma thu nhỏ cho bản đồ.
* **Thao tác chính:**
  * Upload Artwork ở cấp KHU và thực hiện căn chỉnh 4 góc/điểm mốc.
  * Kéo-thả NPC, POI từ khay tài nguyên ra bản đồ; tùy chỉnh `artwork_scale`, `z-index` và `label_anchor`.
  * Vẽ lớp **Trigger Zone (Vùng kích hoạt)** đè lên tranh (hình tròn cho khu vực nhỏ, Polygon cho khu phức hợp).
  * Quản lý ẩn/hiện theo Lớp (Layer Control) và Chế độ xem trước (WYSIWYG Preview Mode).

---

### 8. Bảng Tổng hợp Các vấn đề Cần Chốt Ngay trước khi Triển khai (Build M1)

| # | Vấn đề / Điểm nóng | Trạng thái / Đề xuất chốt | Cấp độ ưu tiên |
|---|---|---|---|
| **1** | **Mô hình Cây Dữ liệu** | Chốt 8 cấp có cấp **KHU (Site)**. Bảng `artwork` thuộc cấp Site. Bỏ `poi_label`. | 🔴 **P0 (Bắt buộc)** |
| **2** | **Cơ chế kích hoạt GPS** | Áp dụng kích hoạt 2 tầng (Geofence cấp Khu + Queue/Nearby phát tuần tự cấp POI). | 🔴 **P0 (Bắt buộc)** |
| **3** | **Tải Offline** | Đơn vị tải trọn gói ở cấp POI. Phân làm 2 gói Full (~150MB) và Audio-only (~20MB). | 🔴 **P0 (Bắt buộc)** |
| **4** | **Quy tắc Cập nhật & Sync** | Giữ nguyên quy tắc Monotonic Progress ("Xong là xong"). Push progress chiều UP tự động khi có mạng. | 🔴 **P0 (Bắt buộc)** |
| **5** | **Nhà cung cấp Bản đồ** | Chọn **Mapbox** cho bản Pro (mặc định ẩn ranh giới chính trị; override bằng GeoJSON tuân thủ chủ quyền VN). | 🔴 **P0 (Bắt buộc)** |
| **6** | **Trải nghiệm Webtoon** | MVP làm Webtoon tĩnh + Audio độc lập. Auto-sync hoãn sang Phase 2. | 🟡 **P1 (Quan trọng)** |
| **7** | **Đa ngôn ngữ CMS** | Thêm bảng riêng quản lý **trạng thái bản dịch** (`vi`/`en`/`zh`) để tránh lọt bản dịch cũ lệch nội dung. | 🟡 **P1 (Quan trọng)** |
