# Đề Xuất Kỹ Thuật & Lộ Trình Mindstorm: BonVoye — Final Pro Scope

**Ngày:** 2026-07-20  
**Khách hàng:** BonVoye  
**Soạn bởi:** HDWEBSOFT  
**Cơ sở phạm vi:** Final Pro Scope, dựa trên bản proposal đã gửi khách hàng ngày 2026-07-18  
**Biến thể:** Ứng dụng native Flutter + Zalo Mini App companion  
**Loại tài liệu:** Đề xuất kỹ thuật + Milestone / Lộ trình Mindstorm

<span style="color:#0070C0">**Chữ màu xanh thể hiện các cập nhật, phần làm rõ hoặc phần bổ sung so với bản proposal đã gửi khách hàng ngày 2026-07-18.**</span>

---

## 1. Tóm Tắt Tổng Quan

Tài liệu này là phiên bản đề xuất kỹ thuật và milestone triển khai cho **Final Pro Scope** của BonVoye. Tài liệu kế thừa bản proposal đã gửi khách hàng, giữ nguyên định hướng scope chính, đồng thời bổ sung phần milestone chi tiết hơn để hai bên có thể thống nhất kế hoạch triển khai trước khi bắt đầu dự án.

Final Pro Scope bao gồm:

- Ứng dụng native iOS và Android bằng Flutter.
- Hai chế độ Story: audio narration và đọc kiểu webtoon.
- <span style="color:#0070C0">CMS có Visual Map Editor để quản lý POI/NPC trên bản đồ minh họa; phần CMS sẽ được xây dựng tùy biến thay vì dùng Strapi.</span>
- GPS-confirmed NPC interaction, nhưng không auto-open hoặc auto-complete story.
- Hidden Threads với cơ chế hoàn thành series nhiều địa điểm.
- Trip Planner và Journey Generation phiên bản đơn giản.
- Then & Now historical timeline / History Layer.
- Zalo Mini App như một companion channel cho thị trường Việt Nam và partner campaign.
- Phân phối quyền truy cập nội dung qua đối tác B2B2C ở phase đầu.
- Tracking, UTM, partner/referrer attribution và báo cáo cơ bản.
- Store payment qua Apple IAP và Google Play Billing cho native app.

Các scope không nằm trong Final Pro Scope:

- China add-on đầy đủ.
- WeChat Mini Program.
- Max features như AR, AI guide, B2B portal đầy đủ, creator platform, BLE beacon, smart recommendation, gifting/referral nâng cao, kids mode.
- ZaloPay, thanh toán trực tiếp hoặc điều hướng/chuyển tiếp mua hàng trong Zalo Mini App.

---

## 2. Ghi Chú Quan Trọng Về Submission Lên App Store, Google Play Và Zalo Mini App

Một số năng lực trong dự án phụ thuộc vào platform và điều kiện nằm ngoài quyền kiểm soát trực tiếp của HDWEBSOFT. Các yếu tố này bao gồm review của App Store, Google Play và Zalo Mini App, duyệt quyền từ Zalo, thiết lập quyền riêng tư của iOS/Android, quyền do người dùng cấp, độ chính xác GPS của thiết bị, hành vi của map provider và giới hạn của dịch vụ bên thứ ba.

HDWEBSOFT sẽ thiết kế và triển khai các flow được hỗ trợ, xử lý integration cẩn thận, thực hiện testing và hỗ trợ quá trình submit ứng dụng lên **App Store, Google Play và Zalo Mini App**.

Nếu ứng dụng bị từ chối do lỗi triển khai, lỗi kỹ thuật, hoặc chưa đáp ứng yêu cầu kỹ thuật của platform tại thời điểm bàn giao, HDWEBSOFT sẽ thực hiện chỉnh sửa và resubmit trong phạm vi dự án đã thống nhất mà không tính thêm chi phí.

Trường hợp platform thay đổi chính sách, API hoặc yêu cầu mới sau thời điểm bàn giao, hoặc yêu cầu phát sinh ngoài phạm vi đặc tả đã thống nhất, hai bên sẽ thống nhất phạm vi công việc và chi phí bổ sung nếu có.

<span style="color:#C00000">**HDWEBSOFT không thể cam kết xử lý các trường hợp bị từ chối vì lý do phi kỹ thuật nằm ngoài phạm vi kiểm soát của đội phát triển, ví dụ: ứng dụng bị đánh giá là trùng lặp với sản phẩm khác, nội dung vi phạm bản quyền, nội dung bị xem là illegal copy, vấn đề pháp lý/nội dung/giấy phép, vấn đề tài khoản developer của khách hàng, hoặc quyết định policy/business review không liên quan đến lỗi kỹ thuật của ứng dụng.**</span>

---

## 3. Cơ Sở Phạm Vi

| Quy tắc | Quyết định Final Pro Scope |
|---|---|
| Base tier | Final Pro Scope |
| Native app | Bao gồm iOS và Android |
| Framework mobile | Flutter |
| Backend | NestJS |
| CMS | <span style="color:#0070C0">CMS tùy biến (NestJS + React)</span> |
| Database | PostgreSQL + PostGIS |
| Zalo Mini App | Bao gồm như companion channel |
| Payment trong native app | Apple IAP + Google Play Billing |
| Payment trong Zalo Mini App | <span style="color:#0070C0">Không xử lý thanh toán trong phạm vi Pro hiện tại.</span> |
| ZaloPay | <span style="color:#0070C0">Không nằm trong phạm vi Pro hiện tại; chỉ triển khai nếu được duyệt như add-on/change request.</span> |
| Điều hướng/chuyển tiếp mua hàng từ Zalo Mini App | <span style="color:#0070C0">Không nằm trong phạm vi Pro hiện tại; chỉ triển khai nếu được duyệt như add-on/change request.</span> |
| WeChat Mini App | Phạm vi tương lai |
| China add-on | Không nằm trong base; làm ở phase tương lai sau Pro |
| Advanced Route Optimization | Chuyển sang Phase 2 |
| Quiz | Chuyển sang Phase 2 |
| Country Completion | Chuyển sang Phase 2 |
| City Completion | Giữ nếu chi phí thấp nhờ dữ liệu progress hiện có |

---

## 4. Phương Pháp Kỹ Thuật

### 4.1 Tổng Quan Kiến Trúc

| Layer | Lựa chọn | Ghi chú |
|---|---|---|
| Native mobile | Flutter | Một codebase cho iOS và Android. Phù hợp với bản đồ minh họa, animation, audio và UI kiểu webtoon. |
| Zalo Mini App | Zalo Mini App frontend | Companion experience cho thị trường Việt Nam, partner campaign, QR/deep link và lightweight content browsing. |
| Backend | NestJS | API cho nội dung, entitlement, progress, partner access, tracking, reports. |
| CMS | <span style="color:#0070C0">CMS tùy biến trên NestJS + React</span> | <span style="color:#0070C0">Quản lý cây nội dung, Visual Map Editor, đa ngôn ngữ, History Layer, Then & Now và mã đối tác. CMS được xây dựng tùy biến thay vì dùng Strapi vì mô hình nội dung có 7 cấp (Country → City → Topic → POI → NPC → Story → Hidden Threads) và Visual Map Editor là công cụ đặc thù cho BonVoye, không phù hợp với giao diện CRUD chung của Strapi. Cách này giúp hệ thống dùng một stack thống nhất (NestJS + React), thay vì tách thành hai stack (NestJS + Strapi).</span> |
| Database | PostgreSQL + PostGIS | Nội dung, tọa độ, truy vấn không gian địa lý, progress, attribution, partner code records. |
| Bản đồ / Định vị (phạm vi Pro) | <span style="color:#0070C0">Mapbox</span> | <span style="color:#0070C0">Mapbox được dùng cho ứng dụng iOS/Android: hỗ trợ gói bản đồ dùng khi không có mạng, nguồn ảnh/raster tùy biến để phủ bản đồ minh họa, geofencing, đường đi (polyline) và marker. BonVoye có thể kiểm soát giao diện bản đồ, bao gồm việc ẩn hoặc thay thế các lớp ranh giới chính trị nếu cần.</span> |
| Bản đồ / Định vị (Trung Quốc tương lai) | <span style="color:#0070C0">Amap / Gaode</span> | <span style="color:#0070C0">Amap/Gaode dùng cho thị trường Trung Quốc đại lục trong giai đoạn tương lai: phù hợp yêu cầu ICP, dùng hệ tọa độ GCJ-02, có dữ liệu POI/đường đi nội địa và phù hợp hơn với yêu cầu pháp lý Trung Quốc. Việc chuyển đổi nhà cung cấp sẽ đi qua lớp trừu tượng bản đồ.</span> |
| Media | <span style="color:#0070C0">AWS S3 + CloudFront CDN</span> | <span style="color:#0070C0">Lưu trữ và phân phối audio narration, hình webtoon, nhạc nền, illustrations và các gói media tải offline. S3 + CloudFront là lựa chọn chính cho Pro scope vì backend/hạ tầng hiện đang theo AWS, dễ tích hợp signed URL/signed cookie, kiểm tra quyền truy cập nội dung và phân phối private content.</span> |
| Payments | <span style="color:#0070C0">Apple IAP + Google Play Billing</span> | <span style="color:#0070C0">Dùng cho ứng dụng iOS/Android. Zalo Mini App chỉ hiển thị nội dung đã mua và trạng thái quyền truy cập, không xử lý thanh toán. Apple/Google sẽ thu phí nền tảng trên giao dịch nội dung số; xem mục 4.11.</span> |
| Tracking | Product analytics + partner attribution | Branch.io cho deep-link/attribution và Firebase/GA4 cho product analytics trong giai đoạn hiện tại. Kiến trúc không phụ thuộc cứng vào một provider. |

### 4.2 Story Experience

Story Experience hỗ trợ hai chế độ:

1. **Chế độ audio-only** — lời dẫn bằng giọng, phát/tạm dừng, tốc độ phát, tiếp tục tiến trình, hỗ trợ audio nền trong native app.
2. **Chế độ webtoon** — khung truyện cuộn dọc, bong bóng thoại, đọc text và nhạc nền, không có lời dẫn giọng nói.

CMS lưu các asset và biến thể ngôn ngữ cần thiết cho cả hai chế độ.

### <span style="color:#0070C0">4.3 CMS tùy biến (NestJS + React)</span>

<span style="color:#0070C0">CMS sẽ được xây dựng tùy biến trên cùng nền tảng kỹ thuật NestJS + React, không dùng Strapi. Lý do:</span>

- <span style="color:#0070C0">Mô hình nội dung có 7 cấp (Country → City → Topic → POI → NPC → Story → Hidden Threads), cần giao diện dạng cây nội dung rõ ràng; giao diện CRUD dạng bảng của Strapi không phù hợp cho quy trình làm việc này.</span>
- <span style="color:#0070C0">Visual Map Editor là công cụ đặc thù của BonVoye, vẫn phải xây dựng tùy biến dù có dùng Strapi hay không.</span>
- <span style="color:#0070C0">Quyền truy cập của đối tác, báo cáo ghi nhận nguồn/đối tác, quy tắc mở khóa và cấu hình quyền truy cập nội dung là logic nghiệp vụ riêng của BonVoye; triển khai trong admin tùy biến sẽ phù hợp hơn so với viết nhiều phần tùy chỉnh bên trên Strapi.</span>
- <span style="color:#0070C0">Hệ thống dùng một nền tảng kỹ thuật thống nhất (NestJS + React), chung cơ chế xác thực, chung model dữ liệu, chung cách triển khai và dễ bàn giao cho team vận hành hơn.</span>
- <span style="color:#0070C0">Tránh rủi ro phụ thuộc vào phiên bản Strapi và quá trình nâng cấp giữa các phiên bản lớn.</span>
- <span style="color:#0070C0">Tính bảo trì dài hạn tốt hơn cho khách hàng.</span>

CMS tùy biến bao gồm:

- Admin shell, đăng nhập, RBAC.
- Tree navigator cho 7 cấp mô hình nội dung.
- CRUD cho Country, City, Topic, POI, NPC, Story, Hidden Threads.
- Visual Map Editor (đặt POI/NPC trên map artwork).
- Giao diện thư viện media (tải lên, danh sách, tái sử dụng, alt text, trường quyền sử dụng).
- Quy trình đa ngôn ngữ (trạng thái dịch, ngôn ngữ fallback, báo cáo thiếu bản dịch).
- Nhật ký audit.
- Giao diện tạo partner access code hàng loạt + dashboard attribution.
- Then & Now / History Layer editor với trường quyền sử dụng media.
- Cấu hình quyền truy cập (POI đầu miễn phí, POI đơn lẻ, route, city, subscription).
- Trình chỉnh sửa unlock rule theo từng item (Free, Paid, GPS-unlocked, Story-completion, Series-completion).

Đây là công cụ admin nội bộ, không phải creator platform công khai.

### <span style="color:#0070C0">4.4 CMS Visual Map Editor</span>

<span style="color:#0070C0">Visual Map Editor là phần core của CMS, cho phép admin quản lý POI, NPC và các thành phần hiển thị trên map artwork mà không cần sửa code hoặc phát hành app mới.</span>

<span style="color:#0070C0">Trong scope:</span>

- <span style="color:#0070C0">Tạo Country, City, Topic, POI, NPC, Story, Hidden Threads.</span>
- <span style="color:#0070C0">Tải lên map artwork / illustrated map.</span>
- <span style="color:#0070C0">Đặt vị trí POI và NPC trực quan trên artwork bản đồ.</span>
- <span style="color:#0070C0">Di chuyển vị trí hiện có bằng kéo-thả hoặc nhập tọa độ.</span>
- <span style="color:#0070C0">Ẩn, lưu trữ, để nháp hoặc xuất bản item.</span>
- <span style="color:#0070C0">Lưu tọa độ, metadata dùng để chiếu vị trí lên artwork, và bán kính tương tác.</span>
- <span style="color:#0070C0">Quản lý điều kiện mở khóa cho nội dung được chọn.</span>
- <span style="color:#0070C0">Quản lý trạng thái dịch và ngôn ngữ fallback.</span>

<span style="color:#0070C0">Các thuộc tính admin có thể chỉnh trong Visual Map Editor gồm:</span>

| <span style="color:#0070C0">Nhóm thuộc tính</span> | <span style="color:#0070C0">Có thể chỉnh</span> |
|---|---|
| <span style="color:#0070C0">Vị trí</span> | <span style="color:#0070C0">Tọa độ GPS, vị trí trên artwork, anchor point, thứ tự layer/z-index.</span> |
| <span style="color:#0070C0">Artwork và calibration</span> | <span style="color:#0070C0">Phiên bản artwork, opacity của artwork overlay, điểm căn chỉnh/calibration giữa artwork và tọa độ thật.</span> |
| <span style="color:#0070C0">Hiển thị marker/NPC</span> | <span style="color:#0070C0">Icon/avatar, màu, opacity, kích thước, border/outline, trạng thái hover/active/locked/unlocked, bật/tắt hiển thị.</span> |
| <span style="color:#0070C0">Nhãn và text</span> | <span style="color:#0070C0">Label, title, subtitle, mô tả ngắn, CTA text, tooltip text, nội dung fallback theo ngôn ngữ.</span> |
| <span style="color:#0070C0">Popover / info card</span> | <span style="color:#0070C0">Tiêu đề popover, mô tả ngắn, thumbnail, badge, CTA, trạng thái locked/purchased/free, nội dung preview.</span> |
| <span style="color:#0070C0">Mở khóa và tương tác</span> | <span style="color:#0070C0">Free/paid/GPS-unlocked/story-completion/series-completion, bán kính tương tác, override thủ công bởi admin.</span> |
| <span style="color:#0070C0">Category và filter</span> | <span style="color:#0070C0">Loại điểm, tag, category, priority, trạng thái featured/recommended, điều kiện hiển thị theo topic/city.</span> |
| <span style="color:#0070C0">Route / polyline</span> | <span style="color:#0070C0">Màu đường đi, độ dày, opacity, thứ tự điểm trong route, trạng thái hiển thị route nếu dùng cho Trip Planner.</span> |
| <span style="color:#0070C0">Media gắn với điểm</span> | <span style="color:#0070C0">Ảnh thumbnail, ảnh minh họa, audio preview, webtoon preview, source credit và rights note.</span> |
| <span style="color:#0070C0">Then & Now / History Layer</span> | <span style="color:#0070C0">Ảnh before/after, năm/thời điểm, caption, source credit, trạng thái hiển thị trên timeline.</span> |
| <span style="color:#0070C0">Trạng thái xuất bản</span> | <span style="color:#0070C0">Nháp, đã xuất bản, ẩn, lưu trữ, lên lịch publish/unpublish nếu cần ở release đầu.</span> |
| <span style="color:#0070C0">Đa ngôn ngữ</span> | <span style="color:#0070C0">Trạng thái dịch, ngôn ngữ fallback, cảnh báo thiếu bản dịch cho label/title/popover.</span> |

<span style="color:#0070C0">Ghi chú: Visual Map Editor trong Pro scope là công cụ admin nội bộ để cấu hình điểm, nhãn, popover, style cơ bản và unlock behavior. Nó không phải công cụ thiết kế bản đồ chuyên nghiệp như Figma/Illustrator; các map artwork chính vẫn do designer cung cấp và upload vào CMS.</span>

### 4.5 GPS Và Tương Tác NPC

Final Pro Scope tuân theo rule tương tác đã được khách hàng xác nhận:

- Geofence xác nhận người dùng đang ở gần NPC.
- NPC chuyển sang trạng thái có thể tương tác, hoặc app có thể gửi thông báo phù hợp.
- Người dùng phải bấm NPC để bắt đầu Story.
- App không auto-open, auto-complete hoặc auto-unlock Story.
- Người dùng cuối không có manual unlock mặc định.
- CMS/Admin có thể override cho các trường hợp hỗ trợ ngoại lệ.

Bán kính tương tác NPC/Story dự kiến khá gần, với target theo feedback hiện tại khoảng **20–30 mét**. Bán kính cụ thể phải cấu hình được trong CMS/Admin, không hard-code. Đây là target thiết kế và cần được kiểm chứng thực địa, không phải cam kết tuyệt đối về độ chính xác GPS trong mọi điều kiện.

### 4.6 Hidden Threads Và Hoàn Thành Series

Hidden Threads hỗ trợ hoàn thành series nhiều địa điểm. Ví dụ, một nhân vật có thể xuất hiện ở hai nơi. Sau khi hoàn thành story đầu tiên, story liên quan thứ hai có thể hiển thị ở trạng thái khóa. Toàn bộ series chỉ hoàn thành sau khi người dùng đến và hoàn thành đủ các địa điểm bắt buộc.

CMS cần hỗ trợ:

- Tạo series.
- Liên kết series với nhiều POI, NPC, Story hoặc content node.
- Đánh dấu item bắt buộc hoặc optional.
- Theo dõi completion status.
- Hiển thị badge/progress sau khi hoàn thành.

### 4.7 Trip Planner Và Journey Generation Đơn Giản

Final Pro Scope giữ flow Trip Planner và Journey Generation ở mức đơn giản:

- Người dùng chọn POI.
- Người dùng đặt duration cơ bản.
- Hệ thống tạo journey gợi ý đơn giản.
- Người dùng có thể điều chỉnh thủ công.
- Người dùng có thể remove POI hoặc đổi thứ tự cơ bản.

Advanced route optimization, Quiz và Country Completion chuyển sang Phase 2. City Completion có thể giữ lại nếu tận dụng dữ liệu completion hiện có với effort thấp.

### 4.8 Then & Now Timeline / History Layer

Then & Now / History Layer áp dụng cho selected POIs và NPCs. Đây là tính năng content-driven. Khách hàng cung cấp historical text, images, dates, source credits, quyền sử dụng media và bản dịch.

Điều kiện mở khóa cho History Layer / Then & Now cần cấu hình được theo từng item đã chọn, gồm:

- Free.
- Paid.
- GPS-unlocked.
- Story-completion-unlocked.
- Series-completion-unlocked.

### <span style="color:#0070C0">4.9 Chiến lược nhà cung cấp bản đồ</span>

<span style="color:#0070C0">Nhà cung cấp bản đồ là một trong những quyết định kỹ thuật quan trọng nhất của BonVoye vì ảnh hưởng trực tiếp đến bản đồ dùng khi không có mạng, bản đồ minh họa tùy biến, geofencing, chi phí vận hành, yêu cầu pháp lý tại Việt Nam và khả năng mở rộng sang Trung Quốc trong tương lai.</span>

#### <span style="color:#0070C0">4.9.1 Phạm vi Pro — Mapbox</span>

Mapbox là nhà cung cấp bản đồ chính cho ứng dụng native iOS/Android trong phạm vi Pro.

Lý do chọn Mapbox:

- **Hỗ trợ bản đồ offline:** Mapbox hỗ trợ tải gói bản đồ offline, phù hợp với yêu cầu người dùng vẫn xem được nội dung tại POI khi mất sóng hoặc mạng yếu. Google Maps SDK không phù hợp cho yêu cầu này vì điều khoản sử dụng hạn chế việc lưu trữ tile bản đồ offline.
- **Hỗ trợ bản đồ minh họa tùy biến:** Mapbox hỗ trợ nguồn ảnh/raster để phủ bản đồ vẽ tay hoặc bản đồ minh họa lên lớp bản đồ kỹ thuật — đây là yêu cầu quan trọng của BonVoye.
- **Hỗ trợ geofencing, đường đi và marker:** phù hợp cho bán kính NPC 20–30m, hiển thị điểm POI/NPC và Trip Planner.
- **Kiểm soát map style tốt:** BonVoye có thể ẩn hoặc thay thế các lớp ranh giới chính trị nếu cần (xem 4.9.3).
- **Phù hợp cho Việt Nam và thị trường quốc tế:** hoạt động tốt cho phạm vi ngoài Trung Quốc.
- **Có SDK cho Flutter:** phù hợp với stack native app đã chọn.
- **Tín hiệu tham khảo tại thị trường Việt Nam:** Goong có tài liệu public hướng dẫn tích hợp Mapbox với Goong map base trên iOS, và Goong app đang live trên App Store. Đây là tín hiệu tích cực, nhưng BonVoye vẫn cần validation riêng vì mỗi app có scope, map style, nội dung và bối cảnh review khác nhau.

#### <span style="color:#0070C0">4.9.2 Gói bổ sung Trung Quốc trong tương lai — Amap / Gaode</span>

Khi BonVoye triển khai cho người dùng tại Trung Quốc đại lục (phân phối cho người dùng Trung Quốc, hosting tại Trung Quốc, có ICP filing), Amap/Gaode là lựa chọn phù hợp hơn:

- Phù hợp hơn với yêu cầu pháp lý và hạ tầng tại Trung Quốc đại lục.
- Dùng hệ tọa độ GCJ-02, tránh sai lệch vị trí thường gặp khi dùng WGS-84 trực tiếp tại Trung Quốc.
- Có dữ liệu POI và routing nội địa Trung Quốc tốt hơn.
- Là lựa chọn phổ biến cho các ứng dụng quốc tế khi cần triển khai nghiêm túc tại Trung Quốc.

Mapbox không phù hợp cho production tại Trung Quốc đại lục vì:
- Tile bản đồ tải từ server ngoài Trung Quốc có thể chậm hoặc không ổn định.
- Không giải quyết đầy đủ yêu cầu ICP/local hosting.
- WGS-84 có thể gây sai lệch vị trí khoảng 50–500m tại Trung Quốc.
- Luật bản đồ Trung Quốc hạn chế việc dùng nhà cung cấp bản đồ nước ngoài cho sản phẩm phân phối tại Trung Quốc.

#### <span style="color:#0070C0">4.9.3 Tuân thủ yêu cầu thể hiện chủ quyền Việt Nam</span>

Luật Đo đạc và Bản đồ Việt Nam (2018) và Nghị định 27/2019 có yêu cầu nghiêm ngặt về việc thể hiện chủ quyền quốc gia trên bản đồ, bao gồm các vùng nhạy cảm như **Paracel Islands (Hoàng Sa)** và **Spratly Islands (Trường Sa)**. Phần này cần được khách hàng hoặc tư vấn pháp lý xác nhận trước khi submit public app.

Ranh giới mặc định của Mapbox dựa trên OpenStreetMap và có thể thể hiện các khu vực này ở trạng thái **disputed** hoặc không theo đúng cách thị trường Việt Nam yêu cầu. Nếu BonVoye hiển thị trực tiếp các lớp ranh giới chính trị mặc định của Mapbox trong app tại Việt Nam, có thể phát sinh rủi ro pháp lý hoặc rủi ro trong quá trình submission.

**Mapbox cho phép BonVoye kiểm soát map style ở mức cao:**

| Khả năng kiểm soát | Mapbox có hỗ trợ? |
|---|---|
| Ẩn toàn bộ lớp ranh giới chính trị | Có |
| Thay thế lớp ranh giới mặc định bằng GeoJSON tùy biến | Có |
| Dùng nhãn địa danh do CMS của BonVoye quản lý | Có |
| Ẩn/hiện một số đối tượng nhạy cảm như đảo, vùng biển | Có |
| Upload GeoJSON thể hiện ranh giới theo yêu cầu thị trường Việt Nam | Có |

Đây là lợi thế lớn của Mapbox so với Google Maps: Google kiểm soát ranh giới bản đồ và app không thể override linh hoạt như Mapbox.

**Cách tiếp cận đề xuất cho BonVoye:**

1. **Mặc định:** ẩn lớp ranh giới chính trị trong map style. Trải nghiệm chính dùng bản đồ minh họa và POI markers, không tập trung vào political geography.
2. **Nếu cần hiển thị ranh giới:** thay thế lớp ranh giới mặc định của Mapbox bằng GeoJSON tùy biến đã được khách hàng phê duyệt, thể hiện Hoàng Sa và Trường Sa theo yêu cầu thị trường Việt Nam.
3. **Danh sách quốc gia do CMS quản lý:** country list của BonVoye do khách hàng định nghĩa trong CMS, không phụ thuộc vào dữ liệu ranh giới mặc định của Mapbox.
4. **Khách hàng sở hữu dữ liệu ranh giới và wording liên quan đến chủ quyền.** HDWEBSOFT triển khai map style và cơ chế override theo dữ liệu/approval được cung cấp.

#### <span style="color:#0070C0">4.9.4 Lớp trừu tượng cho nhà cung cấp bản đồ</span>

Kiến trúc bản đồ sẽ giữ tính độc lập với nhà cung cấp thông qua một lớp trừu tượng:

```text
Phạm vi Pro:                  Mapbox (quốc tế + Việt Nam, offline, bản đồ minh họa tùy biến)
Gói Trung Quốc tương lai:     Amap/Gaode (phù hợp triển khai tại Trung Quốc đại lục)

Lớp trừu tượng bản đồ:
  - Có thể chuyển nhà cung cấp mà không phải thiết kế lại toàn bộ app.
  - CMS lưu tọa độ theo mô hình độc lập với provider.
  - Chuyển đổi GCJ-02 ↔ WGS-84 được xử lý trong lớp trừu tượng khi kích hoạt China add-on.
  - Mỗi provider có map style riêng: Mapbox style, Amap style.
```

#### <span style="color:#0070C0">4.9.5 Cổng phê duyệt nhà cung cấp bản đồ</span>

Quyết định nhà cung cấp bản đồ là một **cổng phê duyệt rõ ràng trong Phase 0** trước khi development bắt đầu (xem milestone M0.6). HDWEBSOFT sẽ đề xuất provider dựa trên các tiêu chí:

- Khả năng hỗ trợ offline map.
- Khả năng phủ bản đồ minh họa/vẽ tay lên bản đồ kỹ thuật.
- GPS, geofencing và bán kính NPC/Story 20–30m.
- Vẽ đường đi (polyline) và route cơ bản.
- Khả năng hoạt động tại Việt Nam và thị trường quốc tế.
- Khả năng chuyển đổi provider trong tương lai cho Trung Quốc.
- Mô hình chi phí vận hành.
- Yêu cầu thể hiện chủ quyền Việt Nam.
- Khả năng tương thích với Zalo Mini App.

Khách hàng phê duyệt nhà cung cấp bản đồ trước khi development bắt đầu.

#### <span style="color:#0070C0">4.9.6 Hạng mục để đảm bảo bản đồ phù hợp yêu cầu pháp lý Việt Nam</span>

Các hạng mục cụ thể trong scope để giảm rủi ro pháp lý liên quan đến bản đồ tại Việt Nam:

| # | Hạng mục | Phase | Ghi chú |
|---|---|---|---|
| ML1 | Rà soát style mặc định của Mapbox đối với các điểm nhạy cảm về chủ quyền Việt Nam (Hoàng Sa, Trường Sa, ranh giới đất liền) | Phase 0 | Xác định tất cả layer có ranh giới chính trị |
| ML2 | Tạo custom Mapbox style mặc định ẩn lớp ranh giới chính trị | Phase 1 | Trải nghiệm chính dùng bản đồ minh họa, không cần hiển thị ranh giới chính trị |
| ML3 | Chuẩn bị GeoJSON ranh giới phù hợp yêu cầu Việt Nam nếu cần hiển thị Hoàng Sa/Trường Sa | Phase 1 | Dữ liệu do khách hàng sở hữu/phê duyệt; HDWEBSOFT tích hợp kỹ thuật |
| ML4 | Triển khai cơ chế override lớp ranh giới trong map style | Phase 1 | GeoJSON tùy biến có thể thay thế layer ranh giới mặc định của Mapbox |
| ML5 | Triển khai lớp trừu tượng provider để có thể chuyển sang nhà cung cấp khác trong tương lai (ví dụ Amap/Gaode cho China add-on) | Phase 1 | Giữ kiến trúc độc lập với provider, hỗ trợ mở rộng sang thị trường mới mà không thiết kế lại toàn bộ app |
| ML6 | Rà soát nhãn địa danh, country list và city assignment trong CMS cho yêu cầu compliance tại Việt Nam | Phase 2 | Nội dung do khách hàng sở hữu; HDWEBSOFT xây dựng field/công cụ CMS để quản lý |
| ML7 | Review pháp lý/submission đối với cách render bản đồ trước khi submit App Store / Google Play | Phase 5 | HDWEBSOFT cung cấp screenshot/style evidence; khách hàng hoặc tư vấn pháp lý xác nhận trước khi submit |
| ML8 | Tài liệu hóa chính sách thể hiện chủ quyền trên bản đồ và trách nhiệm của các bên | Phase 5 | Tài liệu bàn giao |

Các hạng mục ML1–ML8 nằm trong scope hiện tại (không thêm giờ) vì việc tùy biến map style và lớp trừu tượng provider đã được tính trong Visual Map Editor và map integration. Nếu khách hàng cần tư vấn pháp lý bên ngoài, phần legal counsel review sẽ là chi phí/phạm vi riêng của khách hàng.

#### <span style="color:#0070C0">4.9.7 Ước tính chi phí Mapbox</span>

Mapbox tính phí chủ yếu theo MAU (Monthly Active Users — số người dùng hoạt động hằng tháng) đối với Maps SDK for Mobile. Các con số dưới đây chỉ là planning estimate tại thời điểm viết proposal; pricing chính thức cần được kiểm tra lại trực tiếp trên trang pricing của Mapbox trong Phase 0 / M0.6.

| Nhóm chi phí | Số MAU/tháng | Giả định planning |
|---|---:|---|
| Free tier | Theo giới hạn free tier do Mapbox công bố | Pilot/launch scale thường có thể nằm trong free tier nếu MAU thấp |
| Vượt free tier | Vượt giới hạn free tier do Mapbox công bố | Tính phí theo usage, theo tier; có thể có volume discount |

**Pilot / Launch scale (~5,000 MAU):** dự kiến nằm trong free tier → **giả định planning là $0/tháng**, nhưng cần xác nhận lại ở Phase 0.

**Growth scale (~50,000 MAU):** phụ thuộc vào pricing chính thức của account Mapbox và số MAU thực tế → **dự kiến chi phí vận hành thấp, nhưng phải revalidate**.

**Larger scale (~500,000 MAU):** cần review pricing thương mại với Mapbox và volume discount.

Các dịch vụ Mapbox bổ sung (nếu dùng ngoài hiển thị bản đồ cơ bản):

| Dịch vụ | Free tier | Vượt free tier |
|---|---:|---:|
| Geocoding (chuyển địa chỉ ↔ tọa độ) | 100,000 request/tháng | ~$5 / 1,000 request |
| Directions API (tính đường đi) | 100,000 request/tháng | ~$5 / 1,000 request |
| Search Box / POI search | 100,000 request/tháng | ~$5 / 1,000 request |
| Static Images (ảnh bản đồ tĩnh) | 50,000 request/tháng | ~$2 / 1,000 request |

**Ghi chú:** BonVoye chủ yếu dùng Maps SDK for Mobile (tính theo MAU). Nhu cầu Geocoding/Directions dự kiến thấp vì content browsing dùng dữ liệu từ CMS, không phụ thuộc nhiều vào Mapbox search. Offline tile packs thường nằm trong mô hình tính phí MAU, nhưng cần xác nhận lại với Mapbox tại thời điểm kickoff.

Client có thể cần chuẩn bị Mapbox account và billing setup trước production, tùy theo policy của Mapbox tại thời điểm kickoff.

#### <span style="color:#0070C0">4.9.8 Ước tính chi phí Amap / Gaode (gói Trung Quốc tương lai)</span>

Pricing của Amap/Gaode cho commercial use (theo thông tin public, effective từ 2025-05-20):

| Gói | Chi phí |
|---|---|
| Developer cá nhân đã xác thực | Free, nhưng quota giới hạn |
| Enterprise developer đã xác thực | Free, quota cao hơn |
| Enterprise có Technical Service License — Basic | ¥50,000 / năm (~$7,000 USD/năm) |
| Enterprise có Technical Service License — Advanced | ¥100,000 / năm (~$14,000 USD/năm) |

Đối với public commercial rollout tại Trung Quốc đại lục, proposal này giả định cần **Technical Service License** hoặc authorization tương đương từ Amap/Gaode. Gói Basic thường bao gồm:

- Chứng nhận/hỗ trợ compliance cho 1 app.
- Cập nhật định kỳ về luật/quy định liên quan đến mapping, privacy và data security.
- Cam kết availability API ≥ 99.95%.
- Quota cao hơn: 9,000,000 LBS requests/tháng, 90,000,000 map loads/tháng, 500,000 search requests/tháng.

**Chi phí khi vượt quota:**

| Dịch vụ | Chi phí vượt quota |
|---|---|
| Dịch vụ LBS cơ bản | ¥30 / 10,000 request (~$4.20 USD / 10K) |
| Map loads | ¥30 / 10,000 lượt tải bản đồ (~$4.20 USD / 10K) |
| Dịch vụ tìm kiếm | ¥30 / 10,000 request (~$4.20 USD / 10K) |

**Đối với BonVoye China launch:** Technical Service License Basic (~$7,000 USD/năm) có thể đủ cho pilot scale. Gói Advanced (~$14,000 USD/năm) phù hợp hơn nếu cần quy mô lớn hơn hoặc SLA cao hơn.

**Chi phí Amap/Gaode không nằm trong Pro scope.** Đây là chi phí vận hành của future China add-on và sẽ được estimate riêng khi China add-on được xác nhận.

#### <span style="color:#0070C0">4.9.9 Tóm tắt chi phí nhà cung cấp bản đồ</span>

| Provider | Khi nào dùng | Ghi chú chi phí planning |
|---|---|---|
| Mapbox (Pro scope) | Pilot ~5,000 MAU | Dự kiến $0/tháng nếu nằm trong free tier; phải kiểm tra lại trong Phase 0 |
| Mapbox (Pro scope) | Growth ~50,000 MAU | Dự kiến chi phí vận hành hằng tháng thấp; con số chính xác phụ thuộc pricing hiện hành của Mapbox |
| Mapbox (Pro scope) | Larger scale ~500,000 MAU | Cần review pricing thương mại và volume discount với Mapbox |
| Amap/Gaode (future China add-on) | Khi China add-on được kích hoạt | Giả định planning: gói Basic khoảng ¥50,000/năm (~$7,000 USD/năm), cần xác nhận lại với Amap/Gaode |

Chi phí map provider là **third-party operating cost**, tách biệt với development cost. Các chi phí này không nằm trong commercial amount của Pro scope.

#### <span style="color:#0070C0">4.9.10 Đề xuất bổ sung liên quan đến bản đồ</span>

HDWEBSOFT đề xuất bổ sung các cơ chế kiểm soát sau để giảm rủi ro pháp lý, kỹ thuật và chi phí:

| Đề xuất | Cách thực hiện | Lý do |
|---|---|---|
| Map Legal Acceptance Pack | Trước khi submit, HDWEBSOFT chuẩn bị screenshot, bằng chứng layer/style, cấu hình boundary layer và ghi chú cách xử lý chủ quyền. Khách hàng hoặc tư vấn pháp lý review và approve. | Biến phần review compliance về chủ quyền Việt Nam thành một bộ bằng chứng cụ thể, không chỉ là mô tả bằng lời. |
| Mặc định không hiển thị ranh giới chính trị | Ẩn political borders mặc định trong các màn hình chính của BonVoye. Trải nghiệm chính dùng bản đồ minh họa + POI markers. | Giảm rủi ro pháp lý và phù hợp nhất với app kể chuyện theo city/POI. |
| Fallback override ranh giới | Nếu cần hiển thị political borders, dùng GeoJSON đã được khách hàng phê duyệt theo yêu cầu Việt Nam. | Vẫn giữ được Mapbox nhưng đáp ứng yêu cầu thể hiện chủ quyền. |
| Field pilot cho offline map | Test một city thật / một khu vực POI thật với offline map, GPS, illustrated overlay và media download trước khi sản xuất nội dung quy mô lớn. | Kiểm chứng sớm promise khó nhất của sản phẩm: trải nghiệm ngoài thực địa khi mạng yếu/mất sóng. |
| Theo dõi chi phí map | Bật monitoring usage và cost alert cho Mapbox hằng tháng. | Tránh phát sinh chi phí vận hành bất ngờ khi MAU tăng. |
| Cổng quyết định China trong tương lai | Không kích hoạt Amap/Gaode cho đến khi China launch được duyệt như một add-on riêng. | Tránh đưa burden compliance/cost của Trung Quốc vào scope Pro hiện tại. |

Các đề xuất này không làm thay đổi commercial total của Pro. Chúng làm rõ cách kiểm soát và nghiệm thu phần map/provider đã nằm trong scope.

### <span style="color:#0070C0">4.10 Quyết định về lưu trữ media và CDN</span>

<span style="color:#0070C0">Đối với audio narration, hình webtoon, background music, illustrations và các gói media tải offline, phương án đề xuất cho Pro scope là **AWS S3 + CloudFront**.</span>

<span style="color:#0070C0">Lý do chọn AWS S3 + CloudFront:</span>

- <span style="color:#0070C0">Backend, database, deployment và phần ước tính chi phí hiện đang theo AWS, nên S3 + CloudFront giúp kiến trúc đơn giản và nhất quán hơn.</span>
- <span style="color:#0070C0">Dễ triển khai cơ chế phân phối media riêng tư cho nội dung đã mua thông qua signed URL/signed cookie, kết hợp với entitlement API của backend.</span>
- <span style="color:#0070C0">Phù hợp với offline download: app có thể tải media bundle đã được backend xác thực quyền truy cập, sau đó lưu cache local trên thiết bị.</span>
- <span style="color:#0070C0">Dễ vận hành, dễ ước tính chi phí và tránh phải phối hợp giữa nhiều nhà cung cấp cloud trong giai đoạn Pro.</span>

<span style="color:#0070C0">Cloudflare R2/CDN có thể là phương án đáng xem xét trong tương lai nếu BonVoye cần tối ưu chi phí băng thông, đã dùng Cloudflare DNS/CDN sẵn, hoặc cần chiến lược CDN đa nhà cung cấp. Tuy nhiên, với Pro scope hiện tại, Cloudflare không phải lựa chọn chính vì sẽ làm tăng độ phức tạp vận hành: storage/CDN ở Cloudflare, backend/database ở AWS, và có thể cần thêm Workers hoặc cơ chế ký URL riêng để kiểm soát quyền truy cập nội dung đã mua.</span>

<span style="color:#0070C0">Kết luận: dùng **AWS S3 + CloudFront** cho Pro scope. Cloudflare R2/CDN chỉ nên ghi nhận như phương án tối ưu sau này nếu chi phí băng thông/CDN tăng đáng kể hoặc khách hàng đã có sẵn tài khoản/hạ tầng Cloudflare.</span>

### <span style="color:#0070C0">4.11 Phí nền tảng khi bán nội dung số qua Apple IAP và Google Play Billing</span>

<span style="color:#0070C0">Vì BonVoye bán nội dung số trong ứng dụng iOS/Android, Apple và Google sẽ thu phí nền tảng trên các giao dịch qua Apple In-App Purchase và Google Play Billing. Các khoản này là phí của store/nền tảng, không phải chi phí phát triển của HDWEBSOFT.</span>

<span style="color:#0070C0">Bảng dưới đây là tham khảo tại thời điểm viết proposal. Tỷ lệ thực tế cần được xác nhận lại theo tài khoản của khách hàng, quốc gia/storefront, loại sản phẩm, chương trình ưu đãi mà khách hàng đủ điều kiện tham gia, thuế và chính sách hiện hành tại thời điểm launch.</span>

| <span style="color:#0070C0">Nền tảng</span> | <span style="color:#0070C0">Trường hợp phổ biến</span> | <span style="color:#0070C0">Phí nền tảng tham khảo</span> | <span style="color:#0070C0">Ghi chú</span> |
|---|---|---:|---|
| <span style="color:#0070C0">Apple App Store / Apple IAP</span> | <span style="color:#0070C0">Mức tiêu chuẩn cho nội dung số / in-app purchases</span> | <span style="color:#0070C0">30%</span> | <span style="color:#0070C0">Áp dụng nếu không thuộc chương trình giảm phí.</span> |
| <span style="color:#0070C0">Apple App Store Small Business Program</span> | <span style="color:#0070C0">Developer đủ điều kiện theo chương trình Small Business</span> | <span style="color:#0070C0">15%</span> | <span style="color:#0070C0">Thường áp dụng nếu doanh thu/proceeds năm trước không vượt ngưỡng Apple quy định (ngưỡng public hiện tại là $1M USD). Cần khách hàng đăng ký/đủ điều kiện.</span> |
| <span style="color:#0070C0">Apple auto-renewing subscription</span> | <span style="color:#0070C0">Subscription gia hạn sau năm đầu của cùng người đăng ký</span> | <span style="color:#0070C0">15%</span> | <span style="color:#0070C0">Điều kiện cụ thể phụ thuộc loại subscription và policy hiện hành của Apple.</span> |
| <span style="color:#0070C0">Google Play Billing</span> | <span style="color:#0070C0">Mức tiêu chuẩn cho nội dung số / in-app products</span> | <span style="color:#0070C0">Thường 15%–30%</span> | <span style="color:#0070C0">Google Play có nhiều tier/chương trình. Nhiều developer đủ điều kiện mức 15% hoặc thấp hơn cho một số nhóm doanh thu/sản phẩm, nhưng cần xác nhận theo account và quốc gia launch.</span> |
| <span style="color:#0070C0">Google Play subscriptions</span> | <span style="color:#0070C0">Subscription tự động gia hạn</span> | <span style="color:#0070C0">Thường khoảng 15% hoặc theo policy mới từng khu vực</span> | <span style="color:#0070C0">Google đang cập nhật fee model theo thị trường. Cần xác nhận lại trong Play Console trước launch.</span> |

<span style="color:#0070C0">Ví dụ tham khảo: nếu một POI/package bán giá $10 và phí nền tảng là 15%, phần store thu khoảng $1.50 trước các yếu tố thuế/điều chỉnh; nếu phí nền tảng là 30%, phần store thu khoảng $3.00. Do đó pricing cuối cùng nên tính đến phí nền tảng, thuế, tỷ giá, refund và chiến lược giá theo từng thị trường.</span>

<span style="color:#0070C0">Zalo Mini App trong phạm vi cơ bản không xử lý thanh toán nên không phát sinh platform fee thanh toán từ Zalo trong phạm vi hiện tại. Nếu sau này thêm ZaloPay hoặc điều hướng/chuyển tiếp mua hàng, fee/compliance của Zalo cần được estimate riêng.</span>

---

## 5. Zalo Mini App Scope Chi Tiết

### 5.1 Mục Đích Của Zalo Mini App

Zalo Mini App là một **companion channel**, không phải bản thay thế đầy đủ cho native iOS/Android app.

Zalo Mini App hữu ích cho:

- Chiến dịch partner tại Việt Nam.
- QR-based entry từ địa điểm thực tế.
- Lightweight content browsing.
- Đưa user từ Zalo vào hệ sinh thái BonVoye.
- Hiển thị nội dung user có quyền truy cập.
- Ghi nhận attribution/referrer/campaign từ Zalo link hoặc QR campaign.

Native app vẫn là kênh chính cho trải nghiệm đầy đủ, bao gồm payment, offline download, background audio và GPS/geofencing chính xác hơn.

### 5.2 Zalo Mini App Trong Scope

| Area | Included |
|---|---|
| App shell | Zalo Mini App structure, navigation, screens |
| Login | Zalo login và account linking nơi platform hỗ trợ |
| Content browsing | Country, City, Topic, POI, NPC, Story, Hidden Threads, History Layer, Then & Now |
| Map/List | Map/list browsing nơi Zalo platform hỗ trợ |
| Location | Manual location refresh và nearby POI discovery nơi platform hỗ trợ |
| Story | Story reading/listening với media behavior tương thích platform |
| Partner campaign | QR/deep link/UTM/referrer capture |
| Entitlement | <span style="color:#0070C0">Hiển thị nội dung đã mua và trạng thái quyền truy cập</span> |
| Tracking | Send events về backend cho analytics và partner/referrer reporting |
| Submission | Zalo platform testing và submission support |

### 5.3 Zalo Mini App Không Bao Gồm Mặc Định

| Area | Not included by default |
|---|---|
| Thanh toán | <span style="color:#0070C0">Không xử lý thanh toán trong Zalo Mini App</span> |
| ZaloPay | <span style="color:#0070C0">Không tích hợp ZaloPay</span> |
| Điều hướng/chuyển tiếp mua hàng | <span style="color:#0070C0">Không có điều hướng/chuyển tiếp mua hàng từ Zalo Mini App mặc định</span> |
| Full native parity | Không mirror toàn bộ tính năng native app |
| Offline | Không có offline download bundles |
| Background GPS | Không có background geofencing |
| High accuracy GPS | Không cam kết phát hiện NPC/Story ổn định ở 20–30m |
| Background audio | Không có lock-screen/background audio parity |
| Store replacement | Không thay thế kênh native payment |

### <span style="color:#0070C0">5.4 Thanh toán và quyền truy cập trong Zalo Mini App</span>

<span style="color:#0070C0">Zalo Mini App chỉ hiển thị thông tin **nội dung đã mua** và **quyền truy cập** của người dùng. Zalo Mini App không xử lý thanh toán, không tích hợp ZaloPay mặc định và không khởi tạo luồng điều hướng/chuyển tiếp mua hàng mặc định.</span>

<span style="color:#0070C0">Tất cả giao dịch mua nội dung số trong phạm vi cơ bản vẫn nằm trong ứng dụng iOS/Android thông qua **Apple IAP** và **Google Play Billing**.</span>

<span style="color:#0070C0">Nếu sau này BonVoye muốn bổ sung ZaloPay, luồng mua hàng trong Zalo Mini App hoặc điều hướng/chuyển tiếp mua hàng từ Zalo Mini App, phần đó cần được xác nhận riêng như một gói bổ sung hoặc yêu cầu thay đổi sau khi kiểm tra điều kiện nền tảng và compliance.</span>

### <span style="color:#0070C0">5.5 Xác thực Zalo, account linking và chi phí SMS/OTP</span>

<span style="color:#0070C0">Đối với Zalo Mini App, phương án ưu tiên là dùng **Zalo Login** và **account linking** trong phạm vi nền tảng Zalo hỗ trợ. Với cách này, BonVoye tận dụng phiên đăng nhập/Zalo account của người dùng trong Zalo Mini App và liên kết với tài khoản BonVoye/backend. Trường hợp này thường không cần BonVoye tự gửi SMS OTP cho bước đăng nhập trong Zalo Mini App.</span>

<span style="color:#0070C0">Tuy nhiên, SMS/OTP vẫn có thể phát sinh nếu BonVoye muốn thêm một lớp xác minh số điện thoại riêng ngoài Zalo, ví dụ:</span>

- <span style="color:#0070C0">Xác minh số điện thoại cho tài khoản BonVoye trong native app hoặc web/backend riêng.</span>
- <span style="color:#0070C0">Liên kết tài khoản khi user có Zalo account nhưng số điện thoại không được trả về hoặc không đủ tin cậy để dùng làm định danh chính.</span>
- <span style="color:#0070C0">Hỗ trợ người dùng không dùng Zalo, người dùng quốc tế, hoặc user đăng nhập bằng email/social nhưng vẫn cần verify phone.</span>
- <span style="color:#0070C0">Khôi phục tài khoản, chống gian lận, hoặc xác thực các thao tác nhạy cảm nếu BonVoye yêu cầu thêm.</span>

<span style="color:#0070C0">Nếu dùng SMS OTP, chi phí SMS là chi phí vận hành bên thứ ba và không nằm trong development cost. Chi phí này phụ thuộc vào SMS provider, quốc gia nhận tin, loại route (OTP/transactional), số lượng tin nhắn, tỷ lệ gửi lại OTP và rủi ro SMS pumping/fraud. SMS quốc tế thường đắt hơn SMS nội địa và có thể biến động mạnh theo quốc gia.</span>

| <span style="color:#0070C0">Trường hợp</span> | <span style="color:#0070C0">Khuyến nghị</span> | <span style="color:#0070C0">Ghi chú chi phí</span> |
|---|---|---|
| <span style="color:#0070C0">User mở Zalo Mini App trong Zalo</span> | <span style="color:#0070C0">Ưu tiên Zalo Login + account linking, không tự gửi SMS OTP nếu không cần.</span> | <span style="color:#0070C0">Không phát sinh SMS OTP từ BonVoye cho flow Zalo login cơ bản.</span> |
| <span style="color:#0070C0">Native app iOS/Android</span> | <span style="color:#0070C0">Ưu tiên Apple/Google/social/email login; chỉ dùng SMS OTP nếu phone verification là yêu cầu sản phẩm.</span> | <span style="color:#0070C0">Nếu bật SMS OTP, tính phí theo từng tin nhắn gửi đi.</span> |
| <span style="color:#0070C0">Người dùng Việt Nam</span> | <span style="color:#0070C0">Có thể dùng SMS nội địa nếu bắt buộc verify phone.</span> | <span style="color:#0070C0">Chi phí thấp hơn quốc tế nhưng vẫn phụ thuộc provider và volume.</span> |
| <span style="color:#0070C0">Người dùng quốc tế</span> | <span style="color:#0070C0">Cần bật international SMS route hoặc dùng phương án thay thế như email/magic link/social login nếu phù hợp.</span> | <span style="color:#0070C0">SMS quốc tế có thể cao hơn đáng kể; cần estimate riêng theo country mix.</span> |
| <span style="color:#0070C0">Chống gian lận/SMS pumping</span> | <span style="color:#0070C0">Cần rate limit, CAPTCHA/Turnstile nếu cần, giới hạn resend, chặn country không phục vụ và monitoring bất thường.</span> | <span style="color:#0070C0">Giúp tránh chi phí SMS tăng bất ngờ do abuse.</span> |

<span style="color:#0070C0">Khuyến nghị cho Pro scope: không mặc định dùng SMS OTP cho Zalo Mini App. Chỉ thêm SMS OTP nếu BonVoye xác nhận rõ yêu cầu xác minh phone riêng, thị trường cần hỗ trợ, country list và chính sách account recovery. Nếu cần SMS quốc tế, nên chọn provider và estimate cost trong Phase 0 dựa trên các quốc gia mục tiêu.</span>

### 5.6 Zalo Mini App Map Và Location Boundaries

Zalo Mini App là deployment dạng web-based Mini App bên trong Zalo app container. Nó có thể hỗ trợ map display và các tính năng current-location cơ bản trong phạm vi platform cho phép. Các năng lực GPS/geofencing native đầy đủ vẫn thuộc phạm vi của ứng dụng native iOS/Android.

Với BonVoye, Zalo Mini App có thể hỗ trợ:

- Map/List browsing cho nội dung do BonVoye cung cấp.
- POI markers trên bản đồ.
- Nút thủ công “Update current location” hoặc “Find places near me”.
- Refresh vị trí hiện tại khi Mini App đang active, tùy thuộc quyền của Zalo và iOS/Android.
- Nearby POI discovery và sắp xếp theo khoảng cách ở mức tương đối.
- QR/deep-link để mở POI, Story hoặc partner campaign.

Các năng lực sau không thuộc phạm vi cam kết của Zalo Mini App:

- GPS tracking liên tục khi người dùng di chuyển.
- Background geofencing.
- Phát hiện walking tour ở mức native app.
- Phát hiện độ gần NPC/Story chính xác và ổn định ở mức 20–30m.
- Auto-unlock hoặc auto-completion khi người dùng vào bán kính NPC.

Giới hạn này vẫn áp dụng kể cả khi Mini App dùng Google Maps, Mapbox hoặc một map provider mạnh khác. Map provider có thể render bản đồ, marker, route và tính khoảng cách, nhưng không đảm bảo độ chính xác location thực tế trả về từ điện thoại, OS permission, Zalo runtime hoặc môi trường vật lý xung quanh.

### 5.7 Ghi Chú Riêng Về Độ Chính Xác GPS

**Độ chính xác GPS không phải là năng lực có thể được đảm bảo tuyệt đối bởi HDWEBSOFT, BonVoye, Zalo, Google Maps, Mapbox hoặc bất kỳ map provider nào.** Đây là kết quả phụ thuộc trực tiếp vào thiết bị, hệ điều hành, quyền location mà người dùng cấp, tín hiệu GPS/Wi-Fi/cellular, trạng thái pin, điều kiện môi trường và cách platform đang chạy ứng dụng tại thời điểm đó.

Các yếu tố thường ảnh hưởng đến độ chính xác location gồm:

- Thiết bị đời cũ hoặc GPS hardware yếu.
- Người dùng chỉ cấp approximate location thay vì precise location.
- iOS/Android giới hạn quyền location theo app hoặc theo phiên sử dụng.
- Người dùng tắt location, tắt precise location hoặc từ chối quyền location.
- Khu vực nhiều nhà cao tầng, phố hẹp, trong nhà, tầng hầm, cây dày hoặc thời tiết xấu.
- Điện thoại đang ở chế độ tiết kiệm pin hoặc giới hạn background activity.
- Zalo Mini App chỉ lấy được vị trí trong phạm vi API và runtime mà Zalo cho phép.

Vì vậy, con số 20–30m nên được xem là target thiết kế nội dung/NPC spacing và cần được kiểm chứng thực địa. Với những điểm cần xác nhận chính xác hơn, hệ thống nên có fallback như QR code tại địa điểm, CMS/Admin support override, hướng dẫn người dùng refresh vị trí, hoặc bán kính tương tác rộng hơn tùy bối cảnh thực tế.

---

## 6. Partner Access, Attribution Và Reporting

Final Pro Scope bổ sung phân phối quyền truy cập nội dung qua đối tác B2B2C ở phase đầu.

Trong scope:

- CMS tạo access code hàng loạt.
- Gán code cho partner/campaign.
- Đổi code để cấp quyền truy cập.
- Capture QR/deep link/UTM/referrer.
- Track activation event.
- Track purchase/entitlement event đã ghi nhận.
- Dashboard/report cơ bản cho campaign, partner, activation, conversion và revenue signals.

Không nằm trong phạm vi Pro hiện tại; chỉ triển khai nếu được duyệt như add-on/change request:

- Full partner portal.
- Automated commission settlement.
- Advanced revenue-share engine.
- White-label partner app.

---

## <span style="color:#0070C0">7. Lộ Trình Mindstorm & Kế Hoạch Milestone</span>

### 7.1 Chiến Lược Lộ Trình

<span style="color:#0070C0">Kế hoạch đề xuất dưới đây giả định hai bên có thể khởi động dự án vào **Thứ Hai, 03/08/2026**.</span>

- <span style="color:#0070C0">**Phase 0:** khoảng 5 tuần, từ **03/08/2026 đến 04/09/2026**, cho UI/UX, Figma prototype và prototype giao diện chưa có backend.</span>
- <span style="color:#0070C0">**Giai đoạn build:** khoảng 14 tuần, từ **07/09/2026 đến 11/12/2026**, cho phát triển sản phẩm, QA, Zalo Mini App và ổn định sản phẩm.</span>
- <span style="color:#0070C0">Một số phần setup backend và lập kế hoạch kỹ thuật có thể chạy song song với cuối Phase 0 nếu hướng sản phẩm đã được xác nhận.</span>
- <span style="color:#0070C0">Ứng dụng iOS/Android, backend/CMS, QA và Zalo Mini App cần chạy song song để giữ mục tiêu khoảng 4 tháng.</span>

Lộ trình này là kế hoạch triển khai thực tế dựa trên phạm vi hiện tại. Ngày phát hành công khai vẫn cần xác nhận riêng vì còn phụ thuộc vào quá trình xét duyệt của App Store, Google Play, Zalo Mini App, mức độ sẵn sàng của nội dung và các mốc phê duyệt từ khách hàng. <span style="color:#0070C0">Với giả định khởi động dự án ngày 03/08/2026, mục tiêu hoàn tất build/ổn định nội bộ là khoảng **11/12/2026**; ngày phát hành công khai có thể sau mốc này nếu quá trình xét duyệt của App Store, Google Play hoặc Zalo Mini App kéo dài.</span>

### 7.2 Quy Mô Team Đề Xuất

| Vai trò | Mức phân bổ | Ghi chú |
|---|---:|---|
| PM | Bán thời gian ~20% | Giao tiếp với khách hàng, lập kế hoạch, theo dõi rủi ro, điều phối triển khai. |
| Tech Lead / Architect | Bán thời gian ~10–20% | Kiến trúc hệ thống, rà soát kỹ thuật, quyết định các phần GPS/bản đồ/thanh toán/nền tảng. |
| UI/UX Designer | Toàn thời gian trong Phase 0, bán thời gian sau đó | Figma, design system, prototype, điều chỉnh thiết kế cho Zalo Mini App. |
| Flutter Developers | 2–3 người toàn thời gian | Ứng dụng iOS/Android, story player, bản đồ, offline, thanh toán. |
| Backend/CMS Developers | 1–2 người toàn thời gian | NestJS + React CMS, API, entitlement, partner access, báo cáo. |
| Zalo Mini App Developer | 1 người toàn thời gian trong giai đoạn Zalo | Frontend Zalo Mini App, API/năng lực nền tảng Zalo, hỗ trợ submission Zalo. |
| QA Engineer | 1 người toàn thời gian, bắt đầu tham gia sớm | QA chức năng, QA thiết bị, field testing GPS, kiểm thử Zalo Mini App. |

### 7.3 Cơ Cấu Team Theo Giai Đoạn

| Giai đoạn | Cơ cấu team |
|---|---|
| Phase 0 — 03/08–04/09/2026 | PM, Tech Lead, UI/UX, 1 developer Flutter/prototype giao diện, backend tham gia bán thời gian để góp ý kỹ thuật. |
| Tuần build 1–2 — 07/09–18/09/2026 | PM, Tech Lead, 1–2 Backend/CMS, 1–2 Flutter. |
| Tuần build 3–8 — 21/09–30/10/2026 | 2–3 Flutter, 1–2 Backend/CMS, QA bắt đầu tham gia, UI/UX hỗ trợ khi cần. |
| Tuần build 7–10 — 19/10–13/11/2026 | Zalo Mini App Developer tham gia toàn thời gian, backend/API tiếp tục hỗ trợ. |
| Tuần build 11–14 — 16/11–11/12/2026 | QA toàn thời gian, Flutter/backend/Zalo sửa lỗi, PM/Tech Lead quản lý các cổng release. |

### 7.4 Phase 0 — Thiết Kế Sản Phẩm, UX Và Xác Nhận Prototype

**Thời lượng:** khoảng 5 tuần, <span style="color:#0070C0">03/08/2026–04/09/2026</span>  
**Mục tiêu:** xác nhận sản phẩm sẽ được build trước khi bước vào giai đoạn phát triển đầy đủ.

| Mốc | Thời gian | Kết quả đầu ra | Cổng phê duyệt |
|---|---:|---|---|
| M0.1 Thống nhất product flow | <span style="color:#0070C0">03/08–07/08/2026</span> | Xác nhận app flow, vai trò người dùng, module chính và ranh giới phạm vi của Zalo Mini App. | Khách hàng xác nhận hướng flow. |
| M0.2 UX wireframes | <span style="color:#0070C0">03/08–14/08/2026</span> | Wireframe cho các flow chính: onboarding, city, POI, Story, trip, payment, profile, Zalo. | Khách hàng review wireframe. |
| M0.3 Hi-fi UI + design system | <span style="color:#0070C0">10/08–28/08/2026</span> | Visual style, component, UI map/story và định hướng CMS admin. | Khách hàng phê duyệt hướng visual. |
| M0.4 Clickable Figma prototype | <span style="color:#0070C0">24/08–28/08/2026</span> | Prototype Figma có thể click theo luồng happy path chính. | Khách hàng sign-off prototype. |
| M0.5 Prototype giao diện chưa có backend | <span style="color:#0070C0">24/08–04/09/2026</span> | Prototype Flutter chạy được với mock data. | Cổng xác nhận sẵn sàng bước vào giai đoạn phát triển. |
| <span style="color:#0070C0">M0.6 Cổng phê duyệt nhà cung cấp bản đồ</span> | <span style="color:#0070C0">03/08–14/08/2026</span> | <span style="color:#0070C0">HDWEBSOFT đề xuất Mapbox (phạm vi Pro) và Amap/Gaode (Trung Quốc tương lai). Khách hàng phê duyệt nhà cung cấp và cách tiếp cận về chủ quyền trước khi giai đoạn phát triển bắt đầu.</span> | <span style="color:#0070C0">Khách hàng phê duyệt quyết định nhà cung cấp bản đồ.</span> |

**Làm rõ quan trọng:** Giai đoạn phát triển đầy đủ bắt đầu sau khi prototype được sign-off. Một số phần setup backend và planning kỹ thuật có thể bắt đầu sớm hơn nếu khách hàng đã phê duyệt hướng sản phẩm.

### 7.5 Phase 1 — Nền Tảng Kỹ Thuật, Kiến Trúc, CMS Và Core Data Model

**Thời gian:** Tuần build 1–2, <span style="color:#0070C0">07/09/2026–18/09/2026</span>  
**Mục tiêu:** tạo nền tảng kỹ thuật ban đầu.

| Nhóm việc | Kết quả đầu ra |
|---|---|
| Backend/API | Setup project NestJS, nền tảng xác thực, cấu trúc API. |
| Database | Schema PostgreSQL/PostGIS cho nội dung, tọa độ, tiến trình và quyền truy cập nội dung. |
| CMS | Setup CMS tùy biến (NestJS + React), khung cây nội dung ban đầu. |
| Visual Map Editor | Thiết kế kỹ thuật cho việc đặt POI/NPC trên bản đồ. |
| Tích hợp nhà cung cấp bản đồ | Tích hợp Mapbox SDK, cơ chế gói bản đồ offline, nguồn raster tùy biến cho artwork minh họa. |
| Tuân thủ chủ quyền trên bản đồ | ML1 audit style mặc định của Mapbox, ML2 style tùy biến ẩn ranh giới chính trị, ML3 GeoJSON phù hợp yêu cầu Việt Nam, ML4 cơ chế thay thế boundary, ML5 lớp trừu tượng nhà cung cấp để mở rộng sang thị trường mới. |
| Mobile | App shell Flutter, navigation, khung xác thực ban đầu. |
| Tracking | Mô hình UTM/referrer/partner attribution. |
| DevOps | Môi trường triển khai, CI/CD, logging, monitoring cơ bản. |

**Tiêu chí hoàn tất:**

- Kiến trúc core hoạt động được.
- CMS biểu diễn được các object nội dung chính.
- Ứng dụng iOS/Android kết nối được với backend.
- Có bản build nội bộ đầu tiên.

### 7.6 Phase 2 — Trải Nghiệm Core Trên Ứng Dụng iOS/Android

**Thời gian:** Tuần build 3–5, <span style="color:#0070C0">21/09/2026–09/10/2026</span>  
**Mục tiêu:** xây dựng trải nghiệm người dùng chính của BonVoye.

| Nhóm việc | Kết quả đầu ra |
|---|---|
| Bản đồ City | Bản đồ city, marker POI, duyệt nội dung dạng map/list, tìm kiếm nội dung BonVoye. |
| Bản đồ Story | Chi tiết POI, vị trí NPC, trạng thái NPC. |
| Tương tác GPS | Bán kính NPC/Story có thể cấu hình, flow tap-to-start. |
| Trải nghiệm Story | Chế độ audio, chế độ webtoon, tiếp tục tiến trình đang nghe/đang đọc. |
| Hidden Threads | Nội dung liên quan, trạng thái khóa/đã mở khóa, hoàn thành series. |
| CMS | Quản lý Country/City/Topic/POI/NPC/Story/Hidden Threads. |
| Audit chủ quyền trên bản đồ | ML6 audit nhãn địa danh, country list và city assignment trong CMS cho yêu cầu compliance tại Việt Nam. |

**Tiêu chí hoàn tất:**

- Người dùng có thể duyệt nội dung city/POI/story.
- Người dùng có thể tương tác với NPC từ ứng dụng iOS/Android.
- CMS có thể quản lý đủ nội dung để kiểm thử.
- Hành vi GPS sẵn sàng cho field testing.

### 7.7 Phase 3 — Monetization, Offline, Journey Và History Layer

**Thời gian:** Tuần build 6–8, <span style="color:#0070C0">12/10/2026–30/10/2026</span>  
**Mục tiêu:** hoàn thiện các tính năng thương mại và retention.

| Nhóm việc | Kết quả đầu ra |
|---|---|
| Trip Planner | Chọn POI, nhập thời lượng đơn giản, tạo journey đơn giản, cho phép chỉnh tay. |
| Thanh toán | Apple IAP, Google Play Billing, xác thực receipt. |
| Quyền truy cập nội dung | Free first POI, purchased POI, route package, city package, subscription/membership. |
| Khôi phục giao dịch mua | Khôi phục quyền truy cập khi cài lại app hoặc đổi thiết bị. |
| Offline | Tải nội dung đã mua và free first POI cho ứng dụng iOS/Android. |
| History Layer | Field Then & Now, archival media, unlock rules. |
| Tiến trình | Tiến trình POI/NPC/story, badge/achievement nếu được hỗ trợ. |
| Journal/share | Thẻ completed POI/journey, baseline cho personal travel journal. |

**Tiêu chí hoàn tất:**

- Luồng thanh toán native và quyền truy cập nội dung hoạt động trong sandbox.
- Nội dung offline hoạt động trên ứng dụng iOS/Android.
- History Layer có thể cấu hình từ CMS.
- Trip Planner hỗ trợ flow journey đơn giản đã thống nhất.

### 7.8 Phase 4 — Partner Access, Attribution, Reports Và Zalo Mini App

**Thời gian:** Tuần build 7–10, <span style="color:#0070C0">19/10/2026–13/11/2026</span>  
**Mục tiêu:** xây dựng kênh phân phối B2B2C và Zalo Mini App như kênh companion.

Phase này chạy overlap với Phase 3. <span style="color:#0070C0">Cụ thể, Phase 4 bắt đầu trong tuần 7 khi Phase 3 vẫn đang hoàn thiện payment/offline/history layer để Zalo Mini App và partner tracking có đủ API/backend support.</span>

| Nhóm việc | Kết quả đầu ra |
|---|---|
| Quyền truy cập đối tác | Tạo partner code, tracking activation, ghi nhận partner ownership. |
| Attribution | Ghi nhận UTM, QR/deep link, referrer/campaign. |
| Báo cáo | Báo cáo activation, usage, entitlement/purchase event. |
| Đối soát giai đoạn đầu | Báo cáo partner giai đoạn đầu, chưa phải full commission engine. |
| Zalo Mini App | Zalo shell, login/account linking, content browsing, map/list trong phạm vi Zalo hỗ trợ. |
| Hiển thị entitlement trên Zalo | Chỉ hiển thị nội dung đã mua và trạng thái entitlement. |
| Entry từ campaign Zalo | Mở POI/Story/campaign từ Zalo QR/deep link. |

**Tiêu chí hoàn tất:**

- Partner campaign có thể test end-to-end.
- Zalo Mini App có thể duyệt nội dung được hỗ trợ.
- Zalo Mini App hiển thị trạng thái nội dung đã mua/entitlement.
- Zalo Mini App không xử lý payment và không có purchase handoff.

### 7.9 Phase 5 — QA, Field Testing, Submission Lên Platform Và Stabilization

**Thời gian:** Tuần build 11–14, <span style="color:#0070C0">16/11/2026–11/12/2026</span>  
**Mục tiêu:** ổn định sản phẩm và chuẩn bị submission.

| Nhóm việc | Kết quả đầu ra |
|---|---|
| QA chức năng | QA core app, CMS, payment, entitlement, offline, partner flows. |
| QA thiết bị | Ma trận thiết bị iOS/Android. |
| Field testing GPS | Kiểm chứng mục tiêu 20–30m, fallback khi GPS yếu, kiểm tra QR/admin override. |
| Kiểm thử thanh toán | Sandbox Apple/Google, restore purchases, đồng bộ entitlement. |
| Kiểm thử Zalo | Hành vi Zalo platform, account linking, map/list, tương thích media. |
| Bảo mật/hardening cơ bản | Auth, kiểm tra permission, quyền admin, review secrets. |
| Hỗ trợ submission | Chuẩn bị package cho App Store, Google Play và Zalo Mini App. |
| Review pháp lý về chủ quyền bản đồ | ML7 review legal/submission tại Việt Nam đối với cách render bản đồ trước khi submit. |
| Map Legal Acceptance Pack | Screenshot, bằng chứng style-layer, cấu hình boundary-layer, ghi chú xử lý chủ quyền để khách hàng/legal phê duyệt. |
| Tài liệu chủ quyền bản đồ | ML8 tài liệu hóa chính sách thể hiện chủ quyền trên bản đồ và trách nhiệm của khách hàng. |
| Ổn định sản phẩm | Sửa lỗi, regression testing, closed testing build. |

**Tiêu chí hoàn tất:**

- Có bản build sẵn sàng cho closed testing/TestFlight.
- Có bản build sẵn sàng cho Google Play internal/closed testing.
- Có package Zalo Mini App sẵn sàng submit.
- Map Legal Acceptance Pack được khách hàng/legal review và phê duyệt trước khi submit public app.
- Các giới hạn nền tảng đã biết được tài liệu hóa.

### 7.10 Bảng Timeline Tóm Tắt

| Giai đoạn | Thời gian dự kiến | Kết quả chính |
|---|---:|---|
| Phase 0 | <span style="color:#0070C0">03/08–04/09/2026</span> | UX, Figma prototype, prototype giao diện chưa có backend. |
| Build M1 | <span style="color:#0070C0">07/09–18/09/2026</span> | Nền tảng kỹ thuật, CMS skeleton, data model, architecture. |
| Build M2 | <span style="color:#0070C0">21/09–09/10/2026</span> | Core experience trên app iOS/Android, map, story, GPS, Hidden Threads. |
| Build M3 | <span style="color:#0070C0">12/10–30/10/2026</span> | Payments, offline, Journey, History Layer. |
| Build M4 | <span style="color:#0070C0">19/10–13/11/2026</span> | Partner access, attribution, reports, Zalo Mini App. |
| Build M5 | <span style="color:#0070C0">16/11–11/12/2026</span> | QA, GPS field testing, platform submission, stabilization. |

---

## 8. Ước Tính Chi Phí Hạ Tầng Hằng Tháng

Chi phí cloud là chi phí vận hành, tách biệt với development cost. AWS estimate hiện tại dùng on-demand pricing tại **ap-southeast-1 (Singapore)** và chưa bao gồm thuế.

<span style="color:#0070C0">Ghi chú về môi trường: bảng dưới đây chủ yếu ước tính cho môi trường pilot/launch hoặc production-like. Trong quá trình phát triển, dự án vẫn nên có ít nhất môi trường development và staging/UAT riêng để đội dev, QA và khách hàng kiểm thử an toàn trước khi release. Development/staging có thể dùng cấu hình nhỏ hơn production để tiết kiệm chi phí, nhưng vẫn có thể phát sinh thêm chi phí AWS nếu chạy liên tục 24/7.</span>

### 8.1 Quy Mô Pilot / Launch

Cho vài city và tối đa khoảng 5,000 monthly active users:

| Dịch vụ | Mục đích | Chi phí hằng tháng |
|---|---|---:|
| ECS Fargate | Container NestJS API + React CMS | $75 |
| RDS PostgreSQL + PostGIS | Database chính | $70 |
| Amazon S3 | Lưu trữ audio + illustration | $8 |
| CloudFront | Media CDN | $30 |
| Application Load Balancer | Routing + TLS | $22 |
| ElastiCache Redis | Cache/session | $15 |
| CloudWatch + logs | Monitoring | $10 |
| Secrets Manager, Route 53, other transfer | Supporting services | $20 |
| **Tổng** |  | **$250/tháng** |

### 8.2 Quy Mô Growth

Cho nhiều city hơn và khoảng 50,000 monthly active users:

| Dịch vụ | Mục đích | Chi phí hằng tháng |
|---|---|---:|
| ECS Fargate autoscale | API + CMS | $220 |
| RDS PostgreSQL + PostGIS | Database Multi-AZ lớn hơn | $300 |
| Amazon S3 | Lưu trữ media lớn hơn | $15 |
| CloudFront | Băng thông media cao hơn | $180 |
| Application Load Balancer | Routing + TLS | $35 |
| ElastiCache Redis | Cache với replication | $50 |
| CloudWatch + logs | Monitoring | $30 |
| Secrets Manager, Route 53, other transfer | Supporting services | $60 |
| **Tổng** |  | **$890/tháng** |

<span style="color:#0070C0">Lưu ý: hai bảng 9.1 và 9.2 là AWS infrastructure subtotal, chưa bao gồm chi phí vận hành bên thứ ba như Mapbox, SMS/OTP, Apple/Google platform fee, Sentry/observability paid plan, email/SMS, domain hoặc các dịch vụ notification/push nếu chọn provider trả phí.</span>

### <span style="color:#0070C0">9.3 Chi phí vận hành bên thứ ba cần xem xét</span>

<span style="color:#0070C0">Ngoài AWS infrastructure, BonVoye nên dự trù riêng các chi phí vận hành sau. Một số mục có thể bằng $0 ở pilot nếu nằm trong free tier, nhưng vẫn cần kiểm tra lại ở Phase 0 và khi scale tăng.</span>

| <span style="color:#0070C0">Hạng mục</span> | <span style="color:#0070C0">Áp dụng khi nào</span> | <span style="color:#0070C0">Ghi chú estimate</span> |
|---|---|---|
| <span style="color:#0070C0">Mapbox Maps SDK for Mobile</span> | <span style="color:#0070C0">Bản đồ trong native app iOS/Android, offline map, illustrated map overlay.</span> | <span style="color:#0070C0">Pilot ~5,000 MAU có thể nằm trong free tier; Growth ~50,000 MAU cần revalidate theo pricing/account Mapbox tại Phase 0. Không nằm trong AWS subtotal.</span> |
| <span style="color:#0070C0">Mapbox Geocoding / Directions / Search / Static Images</span> | <span style="color:#0070C0">Chỉ phát sinh nếu app dùng tìm kiếm địa chỉ, routing hoặc ảnh bản đồ tĩnh qua API Mapbox.</span> | <span style="color:#0070C0">Dự kiến thấp vì nội dung chính đến từ CMS, nhưng cần monitor request volume nếu bật các API này.</span> |
| <span style="color:#0070C0">Amap/Gaode cho Trung Quốc</span> | <span style="color:#0070C0">Chỉ khi China add-on được duyệt.</span> | <span style="color:#0070C0">Không nằm trong Pro scope. Planning hiện tại giả định license Basic khoảng ¥50,000/năm nếu cần commercial China rollout, cần xác nhận lại.</span> |
| <span style="color:#0070C0">SMS/OTP</span> | <span style="color:#0070C0">Chỉ nếu BonVoye bật phone verification riêng ngoài Zalo Login/account linking.</span> | <span style="color:#0070C0">Tính theo từng SMS. SMS quốc tế có thể cao hơn nhiều và cần country list + provider estimate riêng.</span> |
| <span style="color:#0070C0">Apple/Google platform fee</span> | <span style="color:#0070C0">Khi bán nội dung số qua Apple IAP / Google Play Billing.</span> | <span style="color:#0070C0">Không phải infrastructure cost nhưng ảnh hưởng net revenue; thường 15%–30% tùy account/program/policy.</span> |
| <span style="color:#0070C0">Observability / crash reporting</span> | <span style="color:#0070C0">Sentry, Firebase Crashlytics, Datadog hoặc tool tương tự nếu vượt free tier.</span> | <span style="color:#0070C0">Có thể bắt đầu bằng free tier, nhưng growth scale nên dự trù paid plan nếu cần retention log dài hơn, alert nâng cao hoặc nhiều seat.</span> |
| <span style="color:#0070C0">Push notification provider</span> | <span style="color:#0070C0">Nếu dùng FCM/APNs trực tiếp thường không có phí gửi, nhưng provider như OneSignal/Braze có thể tính phí.</span> | <span style="color:#0070C0">TBD theo provider nếu chọn dịch vụ trả phí.</span> |
| <span style="color:#0070C0">Transactional email</span> | <span style="color:#0070C0">Email verify, reset password, receipt/notification nếu dùng email.</span> | <span style="color:#0070C0">Có thể dùng SES/SendGrid/Mailgun; tính theo volume và deliverability requirement.</span> |
| <span style="color:#0070C0">Domain, DNS, SSL, legal/compliance review</span> | <span style="color:#0070C0">Domain registration, DNS managed service, review pháp lý/nội dung nếu cần.</span> | <span style="color:#0070C0">Một số phần nhỏ nhưng nên tách khỏi development cost.</span> |

### 8.4 Ghi Chú Hạ Tầng

- Compute Savings Plans / RDS reserved instances có thể giảm chi phí compute và database khoảng 30%.
- <span style="color:#0070C0">Development/staging environment nên được tách khỏi production. Có thể dùng cấu hình nhỏ hơn, auto-stop ngoài giờ làm việc nếu phù hợp, hoặc dùng shared lower-tier resources để tiết kiệm. Nếu khách hàng yêu cầu development, staging/UAT và production chạy đầy đủ, song song 24/7, monthly infrastructure cost sẽ cao hơn bảng pilot/launch estimate.</span>
- <span style="color:#0070C0">Media estimate hiện giả định dùng AWS S3 + CloudFront. Cloudflare R2/CDN không nằm trong monthly estimate của Pro scope và chỉ nên review sau nếu chi phí băng thông, hạ tầng Cloudflare sẵn có hoặc chiến lược multi-CDN trở thành nhu cầu thực tế.</span>
- Hạ tầng delivery tối ưu cho Trung Quốc không nằm trong base scope. Nếu sau này xác nhận rollout Trung Quốc, có thể cần AWS China hoặc hosting/CDN tương thích Trung Quốc, ICP support, nhà cung cấp bản đồ phù hợp Trung Quốc và kế hoạch chi phí riêng.
- Chi phí bên thứ ba không nằm trong development cost, bao gồm Apple Developer account, Google Play account, <span style="color:#0070C0">phí nền tảng Apple/Google trên giao dịch nội dung số, phí SMS/OTP bao gồm SMS quốc tế nếu được bật</span>, các gói Sentry tùy chọn, dịch vụ push notification, phí nhà cung cấp bản đồ, phí Amap/Gaode tương lai, email/SMS và domain registration.

---

## 9. Trong Phạm Vi

1. Ứng dụng native iOS và Android bằng Flutter.
2. <span style="color:#0070C0">Mô hình nội dung CMS tùy biến (NestJS + React): Country → City → Topic → POI → NPC → Story → Hidden Threads.</span>
3. <span style="color:#0070C0">Visual Map Editor cho POI và NPC.</span>
4. <span style="color:#0070C0">Bản đồ minh họa có chiếu vị trí GPS lên artwork, dùng Mapbox với nguồn ảnh/raster tùy biến.</span>
5. <span style="color:#0070C0">Lớp trừu tượng nhà cung cấp bản đồ: Mapbox (phạm vi Pro), Amap/Gaode (Trung Quốc tương lai).</span>
6. <span style="color:#0070C0">Tuân thủ yêu cầu thể hiện chủ quyền Việt Nam: Mapbox style tùy biến mặc định ẩn ranh giới chính trị, kèm cơ chế thay thế bằng GeoJSON phù hợp yêu cầu Việt Nam nếu cần.</span>
7. Bán kính tương tác NPC và hành vi tap-to-start story thủ công.
8. Chế độ Story audio-only.
9. Chế độ Story webtoon với bong bóng thoại và nhạc nền.
10. Hidden Threads với cơ chế hoàn thành series nhiều địa điểm.
11. Trip Planner và Journey Generation phiên bản đơn giản.
12. Tiến trình, huy hiệu, City Completion nếu chi phí thấp, và personal travel journal baseline.
13. History Layer và Then & Now timeline.
14. Thanh toán trong native app: POI đầu tiên miễn phí do người dùng tự chọn, POI đơn lẻ, gói lộ trình, gói thành phố, khôi phục giao dịch mua và subscription/membership qua Apple IAP / Google Play Billing.
15. Offline download cho native app, bao gồm nội dung đã mua và POI đầu tiên miễn phí do người dùng tự chọn.
16. App tracking, UTM, partner/referrer attribution và purchase/entitlement attribution.
17. Phân phối quyền truy cập nội dung B2B2C qua đối tác.
18. Trải nghiệm companion Zalo Mini App.
19. Hỗ trợ đa ngôn ngữ cho Tiếng Việt, Tiếng Anh và Tiếng Trung.
20. QA, ổn định, nộp lên store và hỗ trợ nộp Zalo platform.

---

## 10. Ngoài Phạm Vi

1. China add-on: Amap/Gaode, chuyển đổi GCJ-02, hạ tầng Trung Quốc, ICP filing, kênh Android Trung Quốc và thanh toán Trung Quốc.
2. WeChat Mini App. WeChat Mini Program sẵn sàng cho Mainland China nên được xử lý như China add-on tương lai với China map/platform adaptation.
3. Các tính năng Max như AR, AI guide, portal B2B/white-label, creator tools, BLE beacons, smart recommendations, gifting/referral nâng cao và kids mode.
4. Partner portal đầy đủ, automated commission settlement hoặc advanced revenue-share engine.
5. ZaloPay, payment trong Zalo Mini App hoặc purchase handoff từ Zalo Mini App trừ khi được duyệt riêng như add-on/change request.
6. Advanced Route Optimization, Quiz và Country Completion.
7. Viết nội dung, dịch thuật, minh họa, ghi âm giọng nói, nghiên cứu lịch sử, cấp phép archival media và cấp phép nhạc.
8. Xử lý platform rejection vì lý do phi kỹ thuật nằm ngoài phạm vi kiểm soát của HDWEBSOFT, ví dụ app duplication, illegal copy, vấn đề bản quyền/nội dung/pháp lý hoặc vấn đề tài khoản developer của khách hàng.

---

## 11. Giả Định

1. Khách hàng cung cấp toàn bộ story text, narration audio, webtoon artwork, background music, nội dung lịch sử, source credits, quyền sử dụng media và bản dịch.
2. Zalo Mini App là kênh companion, không phải bản thay thế đầy đủ cho native app.
3. Zalo Mini App không xử lý payment và không khởi tạo purchase handoff mặc định; nó chỉ hiển thị purchased-content và entitlement information.
4. Báo cáo đối tác dùng activation và purchase/entitlement events đã ghi nhận.
5. City Completion chỉ giữ nếu tận dụng dữ liệu tiến trình hiện có.
6. China add-on chỉ bắt đầu sau khi Final Pro Scope hoàn thành và được duyệt riêng.
7. WeChat Mini App là phạm vi tương lai.
8. Timeline phụ thuộc vào tốc độ phản hồi, approval gate, content readiness, account access, platform review và kết quả field testing.
9. <span style="color:#0070C0">Các mốc ngày trong mục 7 giả định kickoff vào 03/08/2026. Nếu việc xác nhận, tài khoản, nội dung hoặc approval bị trễ, toàn bộ timeline sẽ dịch chuyển tương ứng.</span>
10. HDWEBSOFT hỗ trợ sửa lỗi kỹ thuật liên quan đến app submission trong scope đã thống nhất, nhưng không chịu trách nhiệm cho rejection vì lý do phi kỹ thuật ngoài quyền kiểm soát.
11. <span style="color:#0070C0">Nhà cung cấp bản đồ cho Pro scope là Mapbox và sẽ được khách hàng phê duyệt tại Map Provider Approval Gate (Phase 0, M0.6). Lớp trừu tượng provider cho phép mở rộng sang nhà cung cấp khác trong tương lai (ví dụ Amap/Gaode cho China add-on) mà không thiết kế lại toàn bộ app.</span>
12. <span style="color:#0070C0">Amap/Gaode là nhà cung cấp cho gói Trung Quốc trong tương lai, không nằm trong Pro scope. Chi phí Technical Service License của Amap/Gaode là chi phí vận hành trong tương lai và sẽ được ước tính riêng khi China add-on được xác nhận.</span>
13. <span style="color:#0070C0">Danh sách quốc gia và nhãn địa danh của BonVoye được khách hàng định nghĩa trong CMS, độc lập với ranh giới mặc định của Mapbox. Khách hàng sở hữu boundary GeoJSON và nội dung/wording liên quan đến chủ quyền.</span>
14. <span style="color:#0070C0">Các hạng mục tuân thủ chủ quyền trên bản đồ (ML1–ML8) nằm trong scope hiện tại, không thêm giờ. Việc tùy biến giao diện bản đồ và lớp trừu tượng provider đã được tính trong Visual Map Editor và phần tích hợp bản đồ.</span>
15. <span style="color:#0070C0">Chi phí Mapbox là chi phí vận hành bên thứ ba, tách biệt với development cost. Với pilot scale khoảng 5,000 MAU, chi phí dự kiến có thể nằm trong free tier nhưng phải kiểm tra lại trong Phase 0.</span>

---

## 12. Trách Nhiệm Của Khách Hàng

1. Xác nhận Final Pro Scope và các loại trừ.
2. Cung cấp Apple Developer, Google Play Console, Zalo developer/account access và yêu cầu platform liên quan.
3. Xác nhận partner-code rules, partner ownership, activation definition và report fields.
4. Cung cấp nội dung mẫu webtoon story và background music để validate prototype.
5. Cung cấp dữ liệu mẫu POI/NPC để test Visual Map Editor.
6. Xác nhận nội dung Then & Now nào xuất hiện trong release đầu tiên.
7. Xác nhận khối lượng nội dung launch cho closed testing.
8. Cung cấp giấy phép, quyền nội dung, quyền hình ảnh, quyền âm thanh và các approval pháp lý/nội dung cần thiết.
9. Review và approve các milestone đúng thời gian để tránh ảnh hưởng timeline.
10. <span style="color:#0070C0">Phê duyệt nhà cung cấp bản đồ tại Map Provider Approval Gate (Phase 0, M0.6): Mapbox cho Pro scope, Amap/Gaode cho Trung Quốc tương lai.</span>
11. <span style="color:#0070C0">Cung cấp GeoJSON ranh giới phù hợp yêu cầu Việt Nam (bao gồm Hoàng Sa, Trường Sa nếu cần hiển thị ranh giới chính trị). Dữ liệu ranh giới này thuộc trách nhiệm sở hữu/phê duyệt của khách hàng.</span>
12. <span style="color:#0070C0">Chịu trách nhiệm về câu chữ/nội dung liên quan đến chủ quyền, tên địa danh và việc gán city/country trong stories và labels.</span>
13. <span style="color:#0070C0">Cung cấp Mapbox account, API token và billing setup nếu Mapbox yêu cầu cho môi trường production.</span>
14. <span style="color:#0070C0">Review và phê duyệt Map Legal Acceptance Pack trước khi submit public app.</span>
15. <span style="color:#0070C0">Nếu BonVoye muốn dùng SMS/OTP, khách hàng cần xác nhận quốc gia hỗ trợ, SMS provider, ngân sách vận hành, chính sách resend/rate limit và việc có bật SMS quốc tế hay không.</span>

---

## 13. Bước Tiếp Theo

1. Hai bên rà soát Final Pro Scope và Lộ Trình Mindstorm.
2. Xác nhận milestone, quy mô team và các cổng phê duyệt.
3. Xác nhận Zalo Mini App là kênh companion chỉ hiển thị, không thanh toán và không purchase handoff trong base scope.
4. <span style="color:#0070C0">Xác nhận chiến lược nhà cung cấp bản đồ: Mapbox (Pro scope), Amap/Gaode (Trung Quốc tương lai).</span>
5. <span style="color:#0070C0">Xác nhận cách tiếp cận về chủ quyền Việt Nam: mặc định ẩn ranh giới chính trị, và chỉ override bằng GeoJSON tùy biến nếu cần hiển thị ranh giới.</span>
6. Xác nhận gói thương mại áp dụng: Final Pro Scope with Zalo hoặc gói khác.
7. Xác nhận các điều kiện kickoff và bắt đầu Phase 0.
