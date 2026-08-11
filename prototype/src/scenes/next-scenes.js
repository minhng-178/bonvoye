/* Static gallery scenes for the reusable discovery/commerce/planner layer. */
(function (root) {
  "use strict";
  root.BV_REGISTER_MOCKUP_SCENES = function (add) {
    function base() {
      root.MU.reset();
      root.S.topicId = "t-phoco";
      root.S.selectedPoiId = "p-oquanchuong";
    }
    function scene(num, group, title, note, build) {
      add({ num: num, group: group, title: title, note: note, build: build });
    }

    scene("18", "Khám phá", "Tìm kiếm — trạng thái ban đầu", "Tìm kiếm, lịch sử gần đây, bộ lọc và gợi ý điểm đến.", function () {
      base(); return root.renderSearch();
    });
    scene("18b", "Khám phá", "Tìm kiếm — có kết quả", "Kết quả được nhóm theo nội dung, dùng chung dữ liệu POI hiện tại.", function () {
      base(); return root.renderSearchResults();
    });
    scene("18c", "Khám phá", "Tìm kiếm — không có kết quả", "Trạng thái rỗng có đường lui rõ ràng thay vì một danh sách trống.", function () {
      base(); return root.renderSearchEmpty();
    });
    scene("19", "Khám phá", "Chi tiết POI — có thể khám phá", "Tóm tắt điểm dừng, người kể chuyện, thời lượng và CTA tải gói.", function () {
      base(); return root.renderPoiDetail();
    });
    scene("19b", "Khám phá", "Chi tiết POI — bị khoá", "Chi tiết vẫn hữu ích trước khi user quyết định mua hoặc dùng suất miễn phí.", function () {
      base(); return root.renderPoiDetailLocked();
    });
    scene("19c", "Khám phá", "Chi tiết POI — đã có offline", "Điểm đã tải sẵn có thể mở khi mất mạng.", function () {
      base(); return root.renderPoiDetailOffline();
    });

    scene("20", "Mua & Planner", "Mở khoá — chọn gói", "Các gói mua native được tách khỏi mã đối tác B2B2C.", function () {
      base(); return root.renderOffers();
    });
    scene("20b", "Mua & Planner", "Thanh toán — đang xác nhận", "Trạng thái chờ receipt validation, không giả lập system sheet.", function () {
      base(); return root.renderPurchaseProcessing();
    });
    scene("20c", "Mua & Planner", "Thanh toán — thành công", "Entitlement được cấp, sau đó user có thể tải gói hoặc khám phá.", function () {
      base(); return root.renderPurchaseSuccess();
    });
    scene("20d", "Mua & Planner", "Thanh toán — lỗi / huỷ", "Có retry và đổi gói, không để user mắc kẹt.", function () {
      base(); return root.renderPurchaseFailure();
    });
    scene("21", "Mua & Planner", "Khôi phục giao dịch — đang tìm", "Restore không tạo giao dịch mới.", function () {
      base(); return root.renderRestore();
    });
    scene("21b", "Mua & Planner", "Khôi phục giao dịch — thành công", "Các entitlement cũ quay lại trên thiết bị mới.", function () {
      base(); return root.renderRestoreSuccess();
    });
    scene("21c", "Mua & Planner", "Khôi phục giao dịch — không có gì", "Trạng thái không có giao dịch và đường lui về gói mua.", function () {
      base(); return root.renderRestoreEmpty();
    });

    scene("22", "Mua & Planner", "Trip Planner — chọn điểm", "Planner tách khỏi Hành trình lịch sử; user chọn POI trước.", function () {
      base(); return root.renderTripSelect();
    });
    scene("22b", "Mua & Planner", "Trip Planner — chọn thời lượng", "Chọn thời gian và cách đi để tạo tuyến đơn giản.", function () {
      base(); return root.renderTripDuration();
    });
    scene("23", "Mua & Planner", "Trip Planner — tuyến gợi ý", "Hiện thứ tự điểm, tổng thời lượng và bản đồ tuyến.", function () {
      base(); return root.renderTripGenerated();
    });
    scene("23b", "Mua & Planner", "Trip Planner — chỉnh tuyến", "Reorder/remove là bước chỉnh thủ công tối thiểu trong Phase 3.", function () {
      base(); return root.renderTripEdit();
    });
    scene("23c", "Mua & Planner", "Trip Planner — đã lưu", "Xác nhận hành trình và đường vào bản đồ/Hành trình.", function () {
      base(); return root.renderTripSaved();
    });
  };
})(window);
