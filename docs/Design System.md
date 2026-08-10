# BẢN ĐẶC TẢ HỆ THỐNG THIẾT KẾ (DESIGN SYSTEM SPECIFICATION) — BONVOYE MOBILE

Tài liệu này đặc tả hệ thống Design Tokens (Màu sắc, Typography, Spacing, Border, Elevations) và các Mobile Component của dự án BonVoye, được tối ưu hóa cho nền tảng di động và ánh xạ trực tiếp sang mã nguồn **Flutter (Material 3)**.

---

## 1. HỆ THỐNG MÀU SẮC (COLOR SYSTEM & SCHEME)

Bảng màu được chọn lọc để tạo cảm giác hữu cơ, mang tính lịch sử và câu chuyện của phố cổ (ngói đất nung, gỗ sơn son thếp vàng, ngọc bích, giấy bản).

### 1.1 Color Palette & Flutter Map

| Token Name | Web Hex | Flutter Color Value | Vai trò thiết kế |
|---|---|---|---|
| **Terracotta** (Primary) | `#b4472b` | `Color(0xFFB4472B)` | Màu chủ đạo: Điểm nhấn thương hiệu, các nút chính (CTA), Marker quan trọng. |
| **Terracotta Dark** | `#8f3620` | `Color(0xFF8F3620)` | Màu nhấn khi click (Pressed) hoặc các icon đặc biệt. |
| **Ochre** (Secondary) | `#c98a3c` | `Color(0xFFC98A3C)` | Màu phụ: Điểm nổi bật phụ, trạng thái mở khoá, danh mục chủ đề đặc sắc. |
| **Ochre Light** | `#ddab68` | `Color(0xFFDDAB68)` | Màu viền nổi bật, highlight các cụm thông tin. |
| **Jade** (Tertiary) | `#4f6f52` | `Color(0xFF4F6F52)` | Màu bổ sung: Biểu thị thiên nhiên, trạng thái an toàn, đã hoàn thành. |
| **Jade Light** | `#7a9b78` | `Color(0xFF7A9B78)` | Background của các chip trạng thái thành công hoặc thẻ hành trình. |
| **Cream** | `#f2e6ce` | `Color(0xFFF2E6CE)` | Màu nền thẻ (Card background), background của các thành phần nổi. |
| **Cream Dark** | `#e4d3b3` | `Color(0xFFE4D3B3)` | Màu đường viền (Border) của các thẻ, nút phụ. |
| **Paper** (Background Light) | `#faf5ea` | `Color(0xFFFAF5EA)` | Màu nền chính của ứng dụng (Scaffold background). |
| **Paper 2** | `#f2ead9` | `Color(0xFFF2EAD9)` | Màu nền của thanh tab, list item chìm. |
| **Ink** (OnBackground) | `#241c16` | `Color(0xFF241C16)` | Màu chữ chính (Headline/Body text), độ tương tác cao. |
| **Ink 70** | `#4d423a` | `Color(0xFF4D423A)` | Chữ phụ, mô tả ngắn, chú thích trung bình. |
| **Ink 45** | `#7c7168` | `Color(0xFF7C7168)` | Placeholder text, đường divider mờ. |
| **Night** (Background Dark) | `#16212b` | `Color(0xFF16212B)` | Nền chính chế độ ban đêm (Đọc chuyện, bản đồ đêm). |
| **Night 2** | `#1f2f3c` | `Color(0xFF1F2F3C)` | Nền thẻ (Card) ở chế độ đêm. |

### 1.2 Cấu hình ThemeData & ColorScheme trong Flutter

Để triển khai bảng màu này trong Flutter, khai báo `ThemeData` như sau:

```dart
final lightColorScheme = ColorScheme(
  brightness: Brightness.light,
  primary: Color(0xFFB4472B),
  onPrimary: Colors.white,
  primaryContainer: Color(0xFF8F3620),
  secondary: Color(0xFFC98A3C),
  onSecondary: Colors.white,
  tertiary: Color(0xFF4F6F52),
  onTertiary: Colors.white,
  surface: Color(0xFFFAF5EA),
  onSurface: Color(0xFF241C16),
  surfaceVariant: Color(0xFFF2E6CE),
  onSurfaceVariant: Color(0xFF4D423A),
  outline: Color(0xFFE4D3B3),
  error: Color(0xFFC0392B),
  onError: Colors.white,
);

final darkColorScheme = ColorScheme(
  brightness: Brightness.dark,
  primary: Color(0xFFB4472B),
  onPrimary: Colors.white,
  secondary: Color(0xFFC98A3C),
  onSecondary: Colors.white,
  surface: Color(0xFF16212B),
  onSurface: Color(0xFFFAF5EA),
  surfaceVariant: Color(0xFF1F2F3C),
  onSurfaceVariant: Color(0xFFCDD6DD),
  outline: Color(0xFF333D45),
  error: Color(0xFFC0392B),
  onError: Colors.white,
);
```

---

## 2. HỆ THỐNG TYPOGRAPHY (TYPOGRAPHY SYSTEM)

Sử dụng font chữ **Plus Jakarta Sans** (Sans-serif hiện đại, độ dễ đọc cao trên màn hình nhỏ) kết hợp với các tiêu đề phụ dạng Serif để mang lại chất thơ và hoài niệm của câu chuyện.

### 2.1 Định nghĩa TextTheme trong Flutter

```dart
final textTheme = TextTheme(
  // Tên tiêu đề lớn, màn hình Splash/Welcome
  displayLarge: GoogleFonts.plusJakartaSans(
    fontSize: 32,
    fontWeight: FontWeight.bold,
    letterSpacing: -1.0,
    color: Color(0xFF241C16),
  ),
  // Tiêu đề các mục lớn (H1)
  headlineLarge: GoogleFonts.plusJakartaSans(
    fontSize: 24,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
    color: Color(0xFF241C16),
  ),
  // Tên địa danh, NPC trên card (H2)
  titleLarge: GoogleFonts.plusJakartaSans(
    fontSize: 18,
    fontWeight: FontWeight.bold,
    color: Color(0xFF241C16),
  ),
  // Nội dung chuyện kể, nội dung chính
  bodyLarge: GoogleFonts.plusJakartaSans(
    fontSize: 15,
    fontWeight: FontWeight.normal,
    height: 1.5,
    color: Color(0xFF4D423A),
  ),
  // Chú thích, thông tin khoảng cách, thời gian
  labelMedium: GoogleFonts.plusJakartaSans(
    fontSize: 12,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.5,
    color: Color(0xFF7C7168),
  ),
);
```

---

## 3. THÔNG SỐ BỐ CỤC & HIỆU ỨNG (LAYOUT, CORNER & SHADOWS)

Đặc tả các quy chuẩn về bo góc, đổ bóng và lề trên điện thoại để đảm bảo tính đồng nhất giữa mockup và Flutter.

### 3.1 Góc bo (Corner Radius)

* **Nút bấm & TextField:** `12px` (`BorderRadius.circular(12)`)
* **Thẻ (Cards) / Bottom Sheets nhỏ:** `16px` (`BorderRadius.circular(16)`)
* **Bottom Sheets chính / Dialogs:** `24px` (`BorderRadius.circular(24)`)
* **Pills / Status Chips:** `100px` (Tròn hoàn toàn / `StadiumBorder`)

### 3.2 Đổ bóng (Elevations / Shadows)

```dart
// Bóng nhẹ cho các Card nổi trên bản đồ
const boxShadowLight = [
  BoxShadow(
    color: Color(0x0C241C16),
    blurRadius: 12,
    offset: Offset(0, 4),
  ),
  BoxShadow(
    color: Color(0x05241C16),
    blurRadius: 4,
    offset: Offset(0, 1),
  ),
];

// Bóng tối cho chế độ ban đêm
const boxShadowDark = [
  BoxShadow(
    color: Color(0x28000000),
    blurRadius: 16,
    offset: Offset(0, 8),
  ),
];
```

### 3.3 Layout Grid trên Mobile
* **Margin (Lề hai bên):** `16px` (mặc định) hoặc `24px` (cho các trang dạng đọc truyện rộng rãi).
* **Gutter (Khoảng cách giữa các cột):** `12px` hoặc `16px`.
* **Safe Area:** Tất cả các thành phần điều hướng nổi hoặc Bottom Sheet đều phải cách lề dưới tối thiểu `16px` (hoặc tránh vùng Home Indicator của iOS).

---

## 4. CÁC THÀNH PHẦN GIAO DIỆN CHUẨN MOBILE (MOBILE WIDGET COMPONENTS)

### 4.1 Primary Button (Nút hành động chính)
* **Chiều cao (Height):** `48px` đến `54px` để bấm dễ dàng bằng ngón tay cái.
* **Màu nền:** `ColorScheme.primary` (`#b4472b`).
* **Text:** `TextStyle.titleMedium` màu trắng, in đậm vừa.
* **Phản hồi xúc giác (InkWell):** Bo góc `12px`, có hiệu ứng gợn sóng khi nhấn.

### 4.2 Secondary / Outlined Button
* **Nền:** Trong suốt.
* **Viền:** `1px` solid `ColorScheme.outline` (`#e4d3b3`).
* **Text:** `ColorScheme.primary` hoặc `ColorScheme.onSurface`.

### 4.3 Text Form Input (Trường nhập thông tin)
* **Label:** Nằm phía trên input, cỡ chữ `12px`, in đậm vừa.
* **Input Box:** Cao `48px`, viền xám nhạt `#e4d3b3`, nền trắng hoặc Paper 2.
* **Focus State:** Viền chuyển sang màu Primary (`#b4472b`) kèm viền rộng `2px` để tăng độ tập trung.

---

## 5. MÔ TẢ HAI MÀN HÌNH MỚI CHO BẢN MOBILE MOCKUP

### 5.1 Splash Screen (`00-splash`)
Màn hình chào mừng khi người dùng mở ứng dụng.
* **Layout:** Centered logo với hiệu ứng thơ mộng.
* **Background:** Màu giấy ngả vàng ấm (`Paper - #faf5ea`).
* **Các thành phần:**
  * Logo hình chiếc lá tre cách điệu hoặc la bàn nghệ thuật bằng nét vẽ chỉ đỏ (`Terracotta`).
  * Tên ứng dụng "BonVoye" dạng Serif cao cấp, bay bổng.
  * Chữ phụ: "Những câu chuyện ẩn trong từng con phố."
  * Phía dưới cùng: Một dòng chữ nhỏ "Đang tải dữ liệu thành phố..." hoặc nút chuyển tiếp nhanh để review.

### 5.2 Login / Register Screen (`00b-login`)
Màn hình đăng nhập để lưu trữ hành trình cá nhân và đồng bộ gói offline.
* **Layout:** Form nhập tinh gọn, tập trung ở nửa dưới màn hình để dễ thao tác một tay.
* **Các thành phần:**
  * Tiêu đề: "Bắt đầu chuyến đi"
  * Subtitle: "Đăng nhập để lưu trữ những câu chuyện đã khám phá và tải bản đồ ngoại tuyến."
  * Input: Nhập số điện thoại kèm tiền tố quốc gia (định dạng chuẩn Mobile).
  * CTA Button: "Tiếp tục" (màu Terracotta nổi bật).
  * Divider: "Hoặc đăng nhập bằng" nét mảnh màu hạt mực.
  * Social Buttons: Hàng nút tròn tinh tế cho Google, Apple, Zalo.
  * Text Link: "Trải nghiệm không cần tài khoản" (Skip) dẫn thẳng tới Home.
