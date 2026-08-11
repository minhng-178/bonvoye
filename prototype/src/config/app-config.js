/* BonVoye prototype configuration. Classic-script compatible; no build step. */
(function (root) {
  "use strict";

  root.BV_CONFIG = root.BV_CONFIG || {};
  root.BV_CONFIG.brand = {
    name: "BonVoye",
    locale: "vi",
    phoneViewport: { width: 393, height: 852 },
  };

  root.BV_CONFIG.features = {
    discovery: true,
    commerceMock: true,
    tripPlannerMock: true,
    realPayments: false,
    realSearch: false,
  };

  root.BV_CONFIG.purchasePlans = [
    {
      id: "poi",
      name: "Một điểm kể chuyện",
      scope: "poi",
      price: "29.000đ",
      detail: "Mở toàn bộ audio, tranh và nội dung của một địa điểm.",
      badge: "Linh hoạt",
    },
    {
      id: "route",
      name: "Gói tuyến phố",
      scope: "route",
      price: "79.000đ",
      detail: "Mở tất cả điểm trong một chủ đề, phù hợp cho một buổi đi bộ.",
      badge: "Phổ biến",
      recommended: true,
    },
    {
      id: "city",
      name: "Trọn thành phố",
      scope: "city",
      price: "149.000đ",
      detail: "Mở toàn bộ các tuyến BonVoye đang có trong thành phố.",
      badge: "Tiết kiệm",
    },
    {
      id: "membership",
      name: "Hội viên BonVoye",
      scope: "subscription",
      price: "59.000đ / tháng",
      detail: "Mở nội dung mới và các tuyến chọn lọc trong thời gian hội viên.",
    },
  ];

  root.BV_CONFIG.planner = {
    travelModes: [
      { id: "walk", label: "Đi bộ thong thả", detail: "Nhiều thời gian nghe và ngắm phố" },
      { id: "compact", label: "Gọn trong một buổi", detail: "Ưu tiên các điểm gần nhau" },
    ],
    durations: [
      { id: "short", label: "45 phút", minutes: 45 },
      { id: "medium", label: "90 phút", minutes: 90 },
      { id: "long", label: "2 giờ", minutes: 120 },
    ],
  };

  root.BV_CONFIG.copy = root.BV_CONFIG.copy || {};
  root.BV_CONFIG.copy.discovery = {
    title: "Tìm câu chuyện",
    subtitle: "Chọn một điểm đến, rồi để BonVoye dẫn bạn đi qua lớp ký ức của nơi đó.",
    searchPlaceholder: "Tìm di tích, người kể hoặc câu chuyện",
    recent: "Tìm gần đây",
    suggestions: "Gợi ý cho bạn",
    results: "Kết quả tìm kiếm",
    emptyTitle: "Chưa tìm thấy câu chuyện phù hợp",
    emptyDetail: "Thử một tên di tích khác hoặc chọn một chủ đề để bắt đầu.",
    detailAction: "Xem chi tiết",
    explore: "Bắt đầu khám phá",
    download: "Tải gói offline",
    locked: "Cần mở khóa nội dung",
    ready: "Đã sẵn sàng ngoại tuyến",
  };
  root.BV_CONFIG.copy.commerce = {
    title: "Mở thêm câu chuyện",
    subtitle: "Chọn cách phù hợp để tiếp tục hành trình của bạn.",
    freeFirst: "Bạn vẫn còn một suất POI miễn phí đầu tiên.",
    purchase: "Tiếp tục thanh toán",
    processing: "Đang xác nhận giao dịch",
    success: "Đã mở khóa thành công",
    failure: "Chưa thể hoàn tất giao dịch",
    retry: "Thử lại",
    restore: "Khôi phục giao dịch",
    restored: "Đã khôi phục nội dung của bạn",
    nothing: "Không tìm thấy giao dịch cần khôi phục",
  };
  root.BV_CONFIG.copy.planner = {
    title: "Lên lịch chuyến đi",
    subtitle: "Chọn vài điểm, BonVoye sẽ xếp thành một hành trình vừa đủ cho hôm nay.",
    select: "Chọn điểm đến",
    duration: "Bạn có bao nhiêu thời gian?",
    generated: "Hành trình gợi ý",
    edit: "Chỉnh hành trình",
    saved: "Đã lưu hành trình",
    continue: "Tiếp tục",
    save: "Lưu hành trình",
  };
})(window);
