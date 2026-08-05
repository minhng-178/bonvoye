## Cơ chế Thanh toán và Trải nghiệm Offline BonVoye

### 1. Behavior: Thanh toán, Lock và Unlock

#### **Trạng thái Lock & Unlock: Lúc nào thì được truy cập?**
Trạng thái truy cập nội dung được quản lý qua **2 lớp khóa độc lập**:

1. **Lớp Quyền sở hữu (Entitlement Layer):**
   * **Được truy cập ngay (Free):** Dành cho POI đầu tiên do người dùng tự chọn (*Free-first-POI*) và các POI/nội dung được cấu hình miễn phí.
   * **Phải mua mới có (Paid):** Dành cho các POI lẻ, gói Tuyến đường (Route/Topic), gói Thành phố (City) hoặc Gói thành viên (Subscription) nằm ngoài lượt miễn phí. Người dùng mua trực tiếp qua Apple IAP / Google Play Billing trên ứng dụng native, hoặc kích hoạt bằng mã đối tác (*Partner Access Code*).

2. **Lớp Điều kiện trải nghiệm (Logic Layer - GPS & Progress):**
   Dù đã có quyền sở hữu (Free hoặc Paid), một số nội dung vẫn ở trạng thái **Khóa logic** để phục vụ trải nghiệm kể chuyện:
   * **Khóa GPS (GPS-unlocked):** Người dùng phải di chuyển thực tế đến bán kính tương tác của POI/NPC (target 20–30m). Khi vào vùng, NPC chuyển sang trạng thái *interactable* (có thể tương tác), người dùng **bấm vào NPC** để bắt đầu nghe/đọc Story (GPS không tự động mở hay hoàn thành).
   * **Khóa Tiến trình / Chuỗi (Series/Story Completion):** Phải hoàn thành Story cốt lõi hoặc chuỗi các địa điểm bắt buộc thì các nội dung mở rộng như **Hidden Threads** (Tuyến truyện ẩn) mới được hé mở.

```text
┌─── CẤU TRÚC PHÂN QUYỀN & MỞ KHÓA (ENTITLEMENT & UNLOCK) ────────────────┐
│                                                                          │
│  1. QUYỀN SỞ HỮU (Entitlement Layer - Server / IAP / Access Code)        │
│     ├── FREE           : POI đầu tiên tự chọn + POI Free mặc định        │
│     └── PAID (Khóa 🔒) : POI lẻ / Route / City / Subscription            │
│            │                                                             │
│            ▼ [Thanh toán Apple IAP / Google Play / Nhập Access Code]     │
│          UNLOCKED 🔓 (Đã có Entitlement)                                 │
│                                                                          │
│  2. ĐIỀU KIỆN TRẢI NGHIỆM (Logic Layer - GPS & Progress)                 │
│     ├── 📍 Khóa GPS   : Phải đến thực địa (20-30m) ➔ Bấm NPC để bắt đầu   │
│     └── 🔗 Khóa Series: Hoàn thành Story trước ➔ Hé mở Hidden Thread     │
└──────────────────────────────────────────────────────────────────────────┘
```

---

### 2. Behavior: Trải nghiệm Offline & Quản lý Gói tải

#### **Có cần màn hình trạng thái Offline không?**
**Có.** Ứng dụng áp dụng **"Chế độ tập trung khi mất mạng" (Focus Mode)**:
* Khi mất kết nối Internet, giao diện ứng dụng sẽ **chỉ làm nổi bật các POI đã tải trọn gói (Ready)**.
* Các POI chưa tải hoặc các tính năng yêu cầu mạng (như thanh toán, mua gói mới) sẽ bị **làm mờ hoặc di-able**, giúp người dùng biết rõ nội dung nào sẵn sàng trải nghiệm ngoài thực địa mà không bị bật popup báo lỗi vô lý.
* Hệ thống có thêm màn hình/sheet **Quản lý bộ nhớ tải về (Download Manager)** hiển thị danh sách các gói POI, dung lượng đã dùng, trạng thái tải và cho phép ghim/xóa tài nguyên.

#### **Khi offline, chỉ cho phép xem danh sách những cái đã mua?**
Đúng vậy. Khi offline, ứng dụng kiểm tra *Entitlement Snapshot* được lưu trữ an toàn tại SQLite local. Người dùng chỉ có thể truy cập và trải nghiệm nội dung của những POI **vừa có quyền sở hữu (Free/Paid) VÀ đã thực hiện tải thành công gói POI (POI Package)** về máy trước đó.

#### **Người dùng có thể tải về offline những cái chưa mua không?**
**Không.**
* Đơn vị tải offline của BonVoye là **Trọn gói POI (POI Package)** gồm Map Tiles, Audio, Webtoon/Media assets và Manifest.
* Để tải các file media này từ CloudFront CDN, ứng dụng bắt buộc phải gửi yêu cầu xin *Signed URL / Signed Cookie* từ Backend.
* Backend sẽ **kiểm tra quyền truy cập (Entitlement Check)**. Nếu người dùng **chưa mua** (chưa có Entitlement), Backend sẽ từ chối cấp Signed URL, do đó ứng dụng **không thể tải ngầm hay lưu offline** các tài nguyên trả phí chưa được thanh toán.

```text
┌─── MÀN BẢN ĐỒ & QUẢN LÝ OFFLINE (Chế độ tập trung - Off-grid) ──────────┐
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ ⚡ MẤT MẠNG - ĐANG Ở CHẾ ĐỘ TẬP TRUNG OFFLINE                       │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│   📍 [POI 01: Dinh Độc Lập]    🟢 READY (Đã tải gói Full ~150MB)      │  │
│   📍 [POI 02: Nhà Thờ Đức Bà]  ⚪ OFF-GRID (Chưa tải gói offline)       │  │
│   📍 [POI 03: Chợ Bến Thành]   🔒 LOCKED   (Chưa mua / Cần kết nối)    │  │
│                                                                          │
│  ──────────────────────────────────────────────────────────────────────  │
│  LỰA CHỌN TẢI OFFLINE (Chỉ áp dụng cho POI đã MUA / FREE):               │
│   ┌───────────────────────────┐        ┌──────────────────────────────┐  │
│   │ 🎧 Gói Audio-only (~20MB) │   HOẶC │ 🎬 Gói Đầy đủ (~150MB)      │  │
│   │ (Tiết kiệm pin/dung lượng)│        │ (Audio + Webtoon/Video)      │  │
│   └───────────────────────────┘        └──────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

---