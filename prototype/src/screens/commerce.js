/* Commerce mock states. Visual only; no real IAP or backend calls. */
(function (root) {
  "use strict";
  var BV = root.BV_UI;
  var C = BV.components;
  var H = BV.html;
  var cfg = root.BV_CONFIG;
  var screens = root.BV_SCREENS = root.BV_SCREENS || {};
  function copy() { return cfg.copy.commerce; }
  function page(title, subtitle, body, metadata) {
    var html = '<div class="bv-screen scroll"><div class="bv-screen-pad"><div class="bv-screen-head"><div class="grow"><p class="h2">' + H.esc(title) + '</p><p class="p bv-screen-subtitle">' + H.esc(subtitle || "") + '</p></div></div>' + body + '</div></div>';
    return BV.layout.frame(html, false, metadata);
  }
  function offerCard(plan) {
    return C.card('<div style="display:flex;align-items:flex-start;gap:10px"><div class="grow"><div>' + (plan.badge ? C.chip(plan.badge, plan.recommended ? "on" : "") : "") + '</div><b class="h3" style="display:block;margin-top:3px">' + H.esc(plan.name) + '</b><p class="tiny" style="margin-top:5px">' + H.esc(plan.detail) + '</p></div>' + C.price({ amount: plan.price, caption: plan.scope }) + '</div>' + C.button({ label: copy().purchase, variant: plan.recommended ? "primary" : "", size: "sm", href: "#20b-purchase-processing" }), "bv-option" + (plan.recommended ? " recommended" : ""));
  }
  function renderOffers() {
    var plans = cfg.purchasePlans || [];
    var body = '<div class="bv-lock-callout">' + BV.icon("gift") + '<div><b>Suất POI miễn phí đầu tiên</b><div class="tiny">' + H.esc(copy().freeFirst) + '</div></div></div>' +
      '<div class="bv-result-list" style="margin-top:18px">' + plans.map(offerCard).join("") + '</div>' +
      '<div style="margin-top:16px;text-align:center"><a class="login-skip-link" href="#21-restore-purchases">' + H.esc(copy().restore) + '</a></div>';
    return page(copy().title, copy().subtitle, body, { screenId: "offers.initial", route: "20-offers", scroll: true });
  }
  function renderProcessing() {
    var body = '<div class="bv-processing"><div><div class="loader"></div><b>' + H.esc(copy().processing) + '</b><p class="tiny" style="margin-top:6px">Đang kiểm tra giao dịch trong App Store / Google Play.</p></div></div>' +
      C.card('<div class="kv"><span>Gói đã chọn</span><b>Gói tuyến phố</b></div><div class="kv"><span>Phương thức</span><b>Apple / Google</b></div><div class="kv"><span>Trạng thái</span><b class="hi">Đang xử lý</b></div>', "bv-dark-note") +
      '<div class="bv-inline-actions" style="margin-top:18px"><a class="btn primary" href="#20c-purchase-success">Mô phỏng thành công</a><a class="btn" href="#20d-purchase-failure">Mô phỏng lỗi</a></div>';
    return page(copy().processing, "Không rời ứng dụng trong khi giao dịch đang được xác nhận.", body, { screenId: "purchase.processing", route: "20b-purchase-processing" });
  }
  function renderSuccess() {
    var body = '<div style="text-align:center;padding:10px 0 18px"><div class="bv-success-mark">' + BV.icon("check") + '</div><p class="h2">' + H.esc(copy().success) + '</p><p class="p" style="margin-top:6px">Gói tuyến phố đã được thêm vào thư viện của bạn.</p></div>' +
      C.card('<div class="kv"><span>Quyền truy cập</span><b class="good">Đã mở khóa</b></div><div class="kv"><span>Nội dung</span><b>36 phố phường</b></div><div class="kv"><span>Tiếp theo</span><b>Tải gói offline</b></div>') +
      '<div class="bv-inline-actions" style="margin-top:18px"><a class="btn primary" href="#12-download">Tải gói offline</a><a class="btn" href="#19-poi-detail">Xem điểm đến</a></div>';
    return page(copy().success, "Bạn có thể bắt đầu nghe ngay khi tới địa điểm.", body, { screenId: "purchase.success", route: "20c-purchase-success" });
  }
  function renderFailure() {
    var body = '<div class="bv-lock-callout" style="border-color:#edbdb6;background:#fbe9e7;color:var(--danger)">' + BV.icon("lock") + '<div><b>' + H.esc(copy().failure) + '</b><div class="tiny">Giao dịch bị hủy hoặc kết nối tạm thời không ổn định. Bạn chưa bị tính phí.</div></div></div>' +
      '<div class="bv-inline-actions" style="margin-top:18px"><a class="btn primary" href="#20b-purchase-processing">' + H.esc(copy().retry) + '</a><a class="btn" href="#20-offers">Đổi gói</a></div>';
    return page(copy().failure, "Bạn có thể thử lại mà không mất lựa chọn hiện tại.", body, { screenId: "purchase.failure", route: "20d-purchase-failure" });
  }
  function renderRestore(variant) {
    var restored = variant === "restored";
    var body = restored ? '<div style="text-align:center;padding:10px 0 18px"><div class="bv-success-mark">' + BV.icon("check") + '</div><p class="h2">' + H.esc(copy().restored) + '</p><p class="p" style="margin-top:6px">Các gói đã mua được đồng bộ lại trên thiết bị này.</p></div>' + C.card('<div class="kv"><span>Gói tuyến phố</span><b class="good">Đã khôi phục</b></div><div class="kv"><span>Trọn thành phố</span><b class="good">Đã khôi phục</b></div>') : '<div class="bv-processing"><div><div class="loader"></div><b>Đang tìm giao dịch trước đây</b><p class="tiny" style="margin-top:6px">BonVoye không tạo giao dịch mới trong bước này.</p></div></div>';
    if (!restored) body += '<div class="bv-inline-actions" style="margin-top:18px"><a class="btn primary" href="#21b-restore-success">Mô phỏng đã khôi phục</a><a class="btn" href="#21c-restore-empty">Không có giao dịch</a></div>';
    else body += '<div class="bv-inline-actions" style="margin-top:18px"><a class="btn primary" href="#19-poi-detail">Tiếp tục khám phá</a><a class="btn" href="#20-offers">Xem gói khác</a></div>';
    return page(restored ? copy().restored : copy().restore, restored ? "Hoàn tất đồng bộ quyền truy cập." : "Khôi phục giao dịch không mua lại nội dung.", body, { screenId: restored ? "restore.success" : "restore.processing", route: restored ? "21b-restore-success" : "21-restore-purchases" });
  }
  function renderRestoreEmpty() {
    var body = C.empty({ icon: "🧾", title: copy().nothing, detail: "Nếu bạn đã mua bằng tài khoản khác, hãy đăng nhập đúng tài khoản App Store / Google Play." }) + '<div class="bv-inline-actions"><a class="btn" href="#20-offers">Xem các gói</a><a class="btn primary" href="#01-home">Về Home</a></div>';
    return page(copy().restore, "Không có quyền truy cập nào được tìm thấy trên thiết bị này.", body, { screenId: "restore.empty", route: "21c-restore-empty" });
  }
  screens.offers = renderOffers;
  screens.purchaseProcessing = renderProcessing;
  screens.purchaseSuccess = renderSuccess;
  screens.purchaseFailure = renderFailure;
  screens.restore = function () { return renderRestore("processing"); };
  screens.restoreSuccess = function () { return renderRestore("restored"); };
  screens.restoreEmpty = renderRestoreEmpty;
  root.renderOffers = renderOffers;
  root.renderPurchaseProcessing = renderProcessing;
  root.renderPurchaseSuccess = renderSuccess;
  root.renderPurchaseFailure = renderFailure;
  root.renderRestore = screens.restore;
  root.renderRestoreSuccess = screens.restoreSuccess;
  root.renderRestoreEmpty = renderRestoreEmpty;
})(window);
