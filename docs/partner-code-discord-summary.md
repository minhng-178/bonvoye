# Partner Code

Ở phase đầu, **Partner Code dùng để mở khóa nội dung trả phí**. Người dùng nhập mã do đối tác cung cấp trong app Flutter; backend kiểm tra và cấp quyền truy cập tuyến, story hoặc POI.

## Vai trò của B2B2C

Partner Code là cơ chế triển khai mô hình **B2B2C**:

- **B2B:** Đối tác của BonVoye, ví dụ khách sạn, tour operator, điểm du lịch hoặc đơn vị tổ chức campaign, nhận và phân phối mã cho khách hàng của họ.
- **B2C:** Người dùng cuối nhận mã trực tiếp hoặc qua QR/deep link, sau đó nhập mã trong app để mở khóa nội dung.
- **BonVoye:** Quản lý nội dung và entitlement, xác thực mã, ghi nhận partner ownership/attribution và báo cáo activation.

Flow cơ bản:

```text
BonVoye tạo code → Partner phân phối code → User redeem code →
Backend xác thực → Cấp entitlement → Ghi nhận activation/attribution
```

Trong phase đầu, B2B2C chỉ tập trung vào phân phối quyền truy cập nội dung và báo cáo cơ bản. Full partner portal, tự động đối soát commission và revenue-share engine chưa nằm trong scope.

## QR Code và Branch.io

QR Code chỉ chứa link Branch, ví dụ:

```text
https://bonvoye.app.link/abc123
```

Khi quét QR:

Khi quét, trình duyệt gửi request đến server Branch. Branch ghi nhận click, metadata partner/campaign rồi chuyển hướng đến store.

Nếu app chưa cài, Branch có thể hỗ trợ **deferred deep link** để app nhận lại dữ liệu sau khi cài. Đây là attribution có thể sai lệch, không phải đối chiếu chính xác bằng IP hay “vân tay thiết bị”.

Branch không tự biết `Partner Code` chỉ vì link có thông tin `partner` hoặc `campaign`. Các metadata này chủ yếu dùng để tracking nguồn/campaign. Nếu muốn app nhận mã sau khi cài, mã phải được gắn vào Branch link hoặc được ánh xạ từ link, ví dụ:

```text
https://bonvoye.app.link/abc123?partner_id=hotel_abc&partner_code=ABC2026
```

App có thể nhận `partner_id` và `partner_code` qua deep link, sau đó gửi mã lên backend để xác thực. Branch chỉ truyền dữ liệu và ghi nhận nguồn; backend mới quyết định mã có hợp lệ, còn hạn, còn lượt đổi hay không và entitlement nào được cấp. Do attribution/deferred deep link có thể sai lệch, không dùng riêng dữ liệu Branch làm căn cứ duy nhất để cấp quyền.

Nếu **quét QR khi offline**:

- QR dẫn đến Branch/store: không gửi request, không ghi nhận click và không tải app được.
- QR quét trong app: vẫn hoạt động nếu chứa ID tĩnh và nội dung đã có sẵn trên máy.

## Tracking Event

Khi đổi mã thành công, app ghi nhận event:

```text
partner_code_redeemed
```

Event gồm `user_id`, `partner_id`, `code_id`, `timestamp` và được gửi về NestJS để báo cáo lượt kích hoạt và quyền đã cấp.

Nếu offline, app lưu event vào SQLite với trạng thái `pending`, rồi đồng bộ khi có mạng theo **outbox pattern**. Backend xử lý idempotency để event gửi lại không bị tính trùng.

## Kết luận

- Partner Code mở khóa entitlement; QR/deep link phân phối mã hoặc ghi nhận nguồn.
- Tracking event phục vụ báo cáo cơ bản và hỗ trợ offline.
- NestJS quyết định mã hợp lệ và quyền truy cập, không phải Branch.

Mã cần có hạn dùng, giới hạn lượt đổi và được backend xác thực.
