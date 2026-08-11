/* Discovery surfaces: search, browse, and POI detail. */
(function (root) {
  "use strict";
  var BV = root.BV_UI;
  var C = BV.components;
  var H = BV.html;
  var cfg = root.BV_CONFIG;
  var screens = root.BV_SCREENS = root.BV_SCREENS || {};

  function copy() { return cfg.copy.discovery; }
  function poiById(id) { return (id && root.DB.poi(id)) || root.DB.POIS[0]; }
  function storyCount(poi) { return root.DB.npcsOfPoi(poi.id).length; }
  function poiState(poi) {
    var download = root.E.dl(poi.id);
    if (download.status === "ready") return "ready";
    var blocked = root.E.blockerFor(poi);
    if (blocked && blocked.kind === "entitlement" && !blocked.ent.claimable) return "locked";
    if (download.status === "downloading" || download.status === "verifying") return "loading";
    return "available";
  }
  function stateChip(poi) {
    var state = poiState(poi);
    if (state === "ready") return C.chip(copy().ready, "ok", BV.icon("check"));
    if (state === "locked") return C.chip(copy().locked, "gated", BV.icon("lock"));
    if (state === "loading") return C.chip("Đang tải", "warn", BV.icon("download"));
    return C.chip("Có thể khám phá", "ok");
  }
  function page(title, subtitle, body, tab) {
    var html = '<div class="bv-screen scroll"><div class="bv-screen-pad">' +
      '<div class="bv-screen-head"><div class="grow"><p class="h2">' + H.esc(title) + '</p>' +
      (subtitle ? '<p class="p bv-screen-subtitle">' + H.esc(subtitle) + '</p>' : "") + '</div></div>' + body + '</div>' +
      (tab ? BV.layout.tabbar(tab) : "") + '</div>';
    return BV.layout.frame(html, false);
  }
  function searchbar(value) {
    return '<div class="bv-searchbar">' + BV.icon("search") + '<input aria-label="' + H.esc(copy().searchPlaceholder) + '" placeholder="' + H.esc(copy().searchPlaceholder) + '" value="' + H.esc(value || "") + '"></div>';
  }
  function filterRow(selected) {
    var filters = ["Tất cả", "Di tích", "Người kể", "Câu chuyện"];
    return '<div class="bv-filter-row" aria-label="Bộ lọc">' + filters.map(function (filter, index) {
      return '<span class="chip' + ((selected || 0) === index ? " on" : "") + '">' + H.esc(filter) + '</span>';
    }).join("") + '</div>';
  }
  function resultRow(poi, meta) {
    var npcs = root.DB.npcsOfPoi(poi.id);
    return C.row({
      title: poi.name,
      detail: poi.subtitle,
      meta: meta || (storyCount(poi) + " người kể · " + (poi.pkg && poi.pkg.audioMB || 20) + " MB audio"),
      leading: '<div class="ic" style="width:42px;height:42px;border-radius:12px;background:var(--paper-2);display:grid;place-items:center;font-size:20px">📍</div>',
      trailing: '<span class="bv-result-trailing">' + BV.icon("arrow") + '</span>',
      href: "#19-poi-detail",
      onclick: "event.preventDefault();S.selectedPoiId='" + poi.id + "';S.route='19-poi-detail';E.notify()",
    });
  }
  function renderSearch() {
    var body = searchbar("") + '<div style="margin-top:18px">' +
      C.section(copy().recent, C.row({ title: "36 phố phường", detail: "Hà Nội · tìm lần cuối hôm qua", trailing: BV.icon("arrow"), href: "#18b-search-results" })) +
      C.section(copy().suggestions, '<div class="bv-result-list">' + root.DB.POIS.slice(0, 3).map(function (poi) { return resultRow(poi); }).join("") + '</div>') +
      '<div style="margin-top:18px">' + filterRow(0) + '</div></div>';
    return page(copy().title, copy().subtitle, body, "map");
  }
  function renderResults() {
    var pois = root.DB.POIS.slice(0, 4);
    var body = searchbar("phố cổ") + filterRow(0) +
      '<div class="bv-result-group"><span class="eyebrow">' + H.esc(copy().results) + '</span><div class="bv-result-list">' +
      pois.map(function (poi, index) { return resultRow(poi, index === 0 ? "Hà Nội · 15 phút đi bộ" : undefined); }).join("") + '</div></div>';
    return page(copy().title, "4 kết quả trong Hà Nội", body, "map");
  }
  function renderEmpty() {
    var body = searchbar("vườn ký ức") + filterRow(0) + C.empty({ icon: "🔎", title: copy().emptyTitle, detail: copy().emptyDetail }) +
      '<div class="bv-inline-actions"><a class="btn" href="#18-search">Xoá tìm kiếm</a><a class="btn primary" href="#01-home">Về Home</a></div>';
    return page(copy().title, "Không có kết quả cho “vườn ký ức”", body, "map");
  }
  function detailAction(poi, variant) {
    if (variant === "locked") return C.button({ label: "Mở khóa nội dung", variant: "primary", href: "#20-offers", icon: BV.icon("lock") });
    if (variant === "offline") return C.button({ label: copy().explore, variant: "primary", href: "#02-map", icon: BV.icon("arrow") });
    return C.button({ label: copy().download, variant: "primary", href: "#12-download", icon: BV.icon("download") });
  }
  function renderPoiDetail(variant) {
    var poi = poiById(root.S.selectedPoiId || "p-oquanchuong");
    var state = variant || poiState(poi);
    var npcs = root.DB.npcsOfPoi(poi.id);
    var detailState = state === "locked" ? '<div class="bv-lock-callout">' + BV.icon("lock") + '<div><b>' + H.esc(copy().locked) + '</b><div class="tiny">Nội dung này sẽ mở sau khi bạn chọn gói phù hợp.</div></div></div>' : state === "offline" ? '<div class="bv-dark-note">✓ Gói đã có trên máy. Bạn có thể mở câu chuyện ngay cả khi mất mạng.</div>' : '<div class="bv-dark-note">Tới gần địa điểm để nghe đúng câu chuyện của nơi này.</div>';
    var storyRows = npcs.map(function (npc) {
      var story = root.DB.storyOfNpc(npc.id);
      return C.row({
        className: "bv-story-row",
        title: npc.name,
        detail: story.title,
        meta: "Audio · " + (story.duration_s || 8) + " phút",
        leading: '<div class="ic">' + (root.Art && root.Art.npcFigure ? root.Art.npcFigure(npc.avatar) : "👤") + '</div>',
        trailing: BV.icon("arrow"),
        href: state === "locked" ? "#20-offers" : "#06-story",
      });
    }).join("");
    var body = '<div class="bv-poi-hero"><span class="eyebrow">KHU CỬA Ô ĐÔNG HÀ</span><p class="h2">' + H.esc(poi.name) + '</p><p style="margin-top:7px;font-size:11px;color:rgba(255,255,255,.78)">' + H.esc(poi.subtitle) + '</p></div>' +
      '<div class="bv-stat-row"><span class="bv-detail-stat">' + BV.icon("clock") + ' 15 phút</span><span class="bv-detail-stat">' + BV.icon("pin") + ' Hà Nội</span>' + stateChip(poi) + '</div>' +
      '<p class="p" style="margin-top:15px">Một điểm dừng nhỏ để nghe những người từng sống, làm việc và đi qua nơi này kể lại thành phố bằng giọng của họ.</p>' +
      '<div style="margin-top:18px">' + detailState + '</div>' +
      C.section("Người kể chuyện", '<div class="bv-result-list">' + storyRows + '</div>') +
      '<div class="bv-inline-actions" style="margin-top:16px">' + detailAction(poi, state) + '<a class="btn" href="#18-search">Quay lại</a></div>';
    return page(poi.name, "Chi tiết điểm dừng", body, "map");
  }

  screens.search = renderSearch;
  screens.searchResults = renderResults;
  screens.searchEmpty = renderEmpty;
  screens.poiDetail = function () { return renderPoiDetail("available"); };
  screens.poiDetailLocked = function () { return renderPoiDetail("locked"); };
  screens.poiDetailOffline = function () { return renderPoiDetail("offline"); };
  root.renderSearch = renderSearch;
  root.renderSearchResults = renderResults;
  root.renderSearchEmpty = renderEmpty;
  root.renderPoiDetail = screens.poiDetail;
  root.renderPoiDetailLocked = screens.poiDetailLocked;
  root.renderPoiDetailOffline = screens.poiDetailOffline;
})(window);
