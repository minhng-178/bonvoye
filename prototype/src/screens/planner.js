/* Trip Planner mock states. Planner state is intentionally separate from Engine FSM state. */
(function (root) {
  "use strict";
  var BV = root.BV_UI;
  var C = BV.components;
  var H = BV.html;
  var cfg = root.BV_CONFIG;
  var screens = root.BV_SCREENS = root.BV_SCREENS || {};
  function copy() { return cfg.copy.planner; }
  function pois() { return root.DB.POIS.slice(0, 3); }
  function page(title, subtitle, body, metadata) {
    var html = '<div class="bv-screen scroll"><div class="bv-screen-pad"><div class="bv-screen-head"><div class="grow"><p class="h2">' + H.esc(title) + '</p><p class="p bv-screen-subtitle">' + H.esc(subtitle || "") + '</p></div></div>' + body + '</div></div>';
    return BV.layout.frame(html, false, metadata);
  }
  function selectedBadge(index) {
    return '<span class="chip' + (index < 2 ? " on" : "") + '">' + (index < 2 ? "Đã chọn" : "Thêm") + '</span>';
  }
  function poiRow(poi, index) {
    return C.row({
      className: index < 2 ? "sel" : "",
      title: poi.name,
      detail: poi.subtitle,
      meta: "~15 phút · " + (index + 1) + " câu chuyện",
      leading: '<div class="ic" style="width:40px;height:40px;border-radius:12px;background:var(--paper-2);display:grid;place-items:center;font-size:18px">' + (index < 2 ? "✓" : "📍") + '</div>',
      trailing: selectedBadge(index),
      href: "#22b-trip-duration",
    });
  }
  function renderSelect() {
    var body = C.section("Chủ đề · 36 phố phường", '<div class="bv-result-list">' + pois().map(poiRow).join("") + '</div>') +
      '<div class="bv-dark-note" style="margin-top:16px">Chọn 2–4 điểm bạn muốn ghé. BonVoye sẽ ưu tiên những điểm gần nhau và giữ lại khoảng nghỉ để nghe chuyện.</div>' +
      '<a class="btn primary" style="margin-top:18px" href="#22b-trip-duration">' + H.esc(copy().continue) + ' · 2 điểm</a>';
    return page(copy().select, copy().subtitle, body, { screenId: "planner.select", route: "22-trip-select", scroll: true });
  }
  function renderDuration() {
    var durations = cfg.planner.durations || [];
    var modes = cfg.planner.travelModes || [];
    var body = C.section("Thời lượng", '<div class="bv-duration-grid">' + durations.map(function (duration, index) {
      return '<a class="bv-duration' + (index === 1 ? " on" : "") + '" href="#23-trip-generated"><b>' + H.esc(duration.label) + '</b><span>' + (index === 1 ? "phù hợp" : "") + '</span></a>';
    }).join("") + '</div>') +
      C.section("Cách đi", '<div class="bv-result-list">' + modes.map(function (mode, index) {
        return C.row({ title: mode.label, detail: mode.detail, selected: index === 0, trailing: '<span class="radio' + (index === 0 ? " on" : "") + '"></span>' });
      }).join("") + '</div>') +
      '<a class="btn primary" style="margin-top:8px" href="#23-trip-generated">' + H.esc(copy().continue) + '</a>';
    return page(copy().duration, "Hành trình sẽ tự điều chỉnh theo thời gian bạn chọn.", body, { screenId: "planner.duration", route: "22b-trip-duration", scroll: true });
  }
  function routeRows(editable) {
    return pois().map(function (poi, index) {
      return C.row({
        className: "bv-story-row",
        title: (index + 1) + ". " + poi.name,
        detail: poi.subtitle,
        meta: index === 0 ? "Bắt đầu · 15 phút" : (index === 1 ? "Tiếp theo · 20 phút đi bộ" : "Tuỳ chọn · 15 phút"),
        leading: '<div class="ic" style="width:32px;height:32px;border-radius:50%;background:var(--terracotta);color:#fff;display:grid;place-items:center;font-size:12px;font-weight:700">' + (index + 1) + '</div>',
        trailing: editable ? '<span class="bv-muted">☷</span>' : BV.icon("arrow"),
        href: editable ? "#23b-trip-edit" : "#19-poi-detail",
      });
    }).join("");
  }
  function fallbackRouteMap() {
    return '<div class="bv-route-map"><span class="bv-route-stop one">1</span><span class="bv-route-stop two">2</span><span class="bv-route-stop three">3</span></div>';
  }
  function routeMapPreview() {
    var selected = pois();
    var MU = root.MU;
    if (!MU || !MU.mapSurface || !root.DB || !selected.length) return fallbackRouteMap();

    var center = selected.reduce(function (sum, poi) {
      return { lat: sum.lat + poi.location.lat, lng: sum.lng + poi.location.lng };
    }, { lat: 0, lng: 0 });
    center.lat /= selected.length;
    center.lng /= selected.length;

    var route = selected.map(function (poi, index) {
      return { location: poi.location, routeNumber: index + 1 };
    });
    return '<div class="bv-route-map bv-route-map-real">' + MU.mapSurface({
      site: root.DB.site(selected[0].siteId),
      center: center,
      zoom: 16,
      viewport: { width: 331, height: 158 },
      route: route,
      showMe: false,
      showZones: false,
      labels: false,
      artOpacity: 0.3,
    }) + '</div>';
  }
  function renderGenerated() {
    var body = routeMapPreview() +
      '<div class="bv-stat-row"><span class="bv-detail-stat">' + BV.icon("clock") + ' 86 phút</span><span class="bv-detail-stat">' + BV.icon("pin") + ' 3 điểm</span><span class="chip ok">Vừa đủ</span></div>' +
      C.section("Thứ tự gợi ý", '<div class="bv-route-list">' + routeRows(false) + '</div>') +
      '<div class="bv-inline-actions"><a class="btn" href="#23b-trip-edit">' + H.esc(copy().edit) + '</a><a class="btn primary" href="#23c-trip-saved">' + H.esc(copy().save) + '</a></div>';
    return page(copy().generated, "90 phút · Đi bộ thong thả", body, { screenId: "planner.generated", route: "23-trip-generated", scroll: true });
  }
  function renderEdit() {
    var body = C.section("Kéo để sắp xếp", '<div class="bv-route-list">' + routeRows(true) + '</div>') +
      '<div class="bv-lock-callout" style="margin-top:16px">' + BV.icon("clock") + '<div><b>Còn 14 phút dự phòng</b><div class="tiny">Bạn có thể thêm một điểm ngắn gần Ô Quan Chưởng.</div></div></div>' +
      '<div class="bv-inline-actions" style="margin-top:18px"><a class="btn" href="#23-trip-generated">Huỷ thay đổi</a><a class="btn primary" href="#23c-trip-saved">Lưu thay đổi</a></div>';
    return page(copy().edit, "Thay đổi chỉ áp dụng cho hành trình này.", body, { screenId: "planner.edit", route: "23b-trip-edit", scroll: true });
  }
  function renderSaved() {
    var body = '<div style="text-align:center;padding:9px 0 18px"><div class="bv-success-mark">' + BV.icon("check") + '</div><p class="h2">' + H.esc(copy().saved) + '</p><p class="p" style="margin-top:6px">Hành trình “36 phố phường · 90 phút” đã nằm trong Hành trình của bạn.</p></div>' +
      C.card('<div class="kv"><span>Điểm dừng</span><b>3 điểm</b></div><div class="kv"><span>Thời lượng</span><b>86 phút</b></div><div class="kv"><span>Trạng thái</span><b class="good">Sẵn sàng</b></div>') +
      '<div class="bv-inline-actions" style="margin-top:18px"><a class="btn primary" href="#02-map">Mở trên bản đồ</a><a class="btn" href="#07-journey">Xem Hành trình</a></div>';
    return page(copy().saved, "Bạn có thể tải từng POI trước khi ra đường.", body, { screenId: "planner.saved", route: "23c-trip-saved", scroll: true });
  }
  screens.tripSelect = renderSelect;
  screens.tripDuration = renderDuration;
  screens.tripGenerated = renderGenerated;
  screens.tripEdit = renderEdit;
  screens.tripSaved = renderSaved;
  root.renderTripSelect = renderSelect;
  root.renderTripDuration = renderDuration;
  root.renderTripGenerated = renderGenerated;
  root.renderTripEdit = renderEdit;
  root.renderTripSaved = renderSaved;
})(window);
