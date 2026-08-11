/* =============================================================================
   BonVoye — Mockup gallery
   -----------------------------------------------------------------------------
   Mục tiêu: XEM THIẾT KẾ, không chạy logic.

   Cách làm: mỗi khung là một trạng thái ĐỨNG YÊN. Ta gán thẳng vào `S` những gì
   muốn thấy rồi gọi đúng hàm render của `ui.js`. Không `E.start()`, không tick,
   không cổng xin quyền — nên những trạng thái vốn phải đi qua 5 lớp điều kiện
   (quyền → geofence → proximity → entitlement → offline) ở đây hiện ra tức thì.

   Riêng BỀ MẶT bản đồ được dựng lại tại file này bằng ảnh tile OpenStreetMap
   thật + phép chiếu Web Mercator chuẩn, thay cho phép affine artwork (vốn suy
   biến: xem `docs/07. Prototype Map Core Fixes.md` §2.2). Nhờ đó pin cắm theo
   GPS thật và vòng bán kính là mét thật.
   ========================================================================== */

/* Bọc trong IIFE: file này chỉ ĐỌC các hàm/biến toàn cục của app (T, screen,
 * renderHome…) và không được rò tên nào ra ngoài — `art.js` đã có `SCENES` của
 * riêng nó, `ui.js` có `T`, v.v. */
(function () {
"use strict";

var W = 371, H = 830;           // đúng kích thước .screen trong app.css
var SB = 50;                    // .statusbar cao 50px
var MH = H - SB;                // bề mặt bản đồ nằm TRONG .body ⇒ cao 780, không phải 830
var CLOCK_MS = 581000;          // fmtClock → "09:41", cho đẹp thanh trạng thái

/* ── 1 · Web Mercator ─────────────────────────────────────────────────────── */

/** Toạ độ pixel toàn cầu (tile 256px) — chuẩn slippy map. */
function worldPx(lat, lng, z) {
  var n = 256 * Math.pow(2, z);
  var latRad = (lat * Math.PI) / 180;
  return {
    x: ((lng + 180) / 360) * n,
    y: ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n,
  };
}

/** Mét trên mỗi pixel tại vĩ độ này — dùng để vẽ bán kính vùng bằng mét thật. */
function mPerPx(lat, z) {
  return (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, z);
}

/** Điểm GPS → toạ độ pixel trong bề mặt bản đồ, với `center` ở giữa bề mặt. */
function toScreen(pt, center, z, viewport) {
  var width = viewport && viewport.width || W;
  var height = viewport && viewport.height || MH;
  var c = worldPx(center.lat, center.lng, z);
  var p = worldPx(pt.lat, pt.lng, z);
  return { x: p.x - c.x + width / 2, y: p.y - c.y + height / 2 };
}

/* ── 2 · Bề mặt bản đồ tĩnh ───────────────────────────────────────────────── */

/** Lưới tile phủ đủ khung. Mỗi tile là một <img> đặt tuyệt đối — không cần
 *  ghép ảnh, không cần thư viện bản đồ. */
function tileLayer(center, z, viewport) {
  var width = viewport && viewport.width || W;
  var height = viewport && viewport.height || MH;
  var c = worldPx(center.lat, center.lng, z);
  var left = c.x - width / 2, top = c.y - height / 2;
  var x0 = Math.floor(left / 256), x1 = Math.floor((left + width) / 256);
  var y0 = Math.floor(top / 256), y1 = Math.floor((top + height) / 256);
  var max = Math.pow(2, z);
  var s = '<div class="mm-tiles warm">';
  for (var tx = x0; tx <= x1; tx++) {
    for (var ty = y0; ty <= y1; ty++) {
      if (ty < 0 || ty >= max) continue;
      var wrapped = ((tx % max) + max) % max;
      var url = "https://tile.openstreetmap.org/" + z + "/" + wrapped + "/" + ty + ".png";
      s += '<img src="' + url + '" alt="" loading="lazy" style="left:' +
        (tx * 256 - left).toFixed(1) + "px;top:" + (ty * 256 - top).toFixed(1) + 'px">';
    }
  }
  return s + "</div>";
}

/**
 * cfg = {
 *   site, center, zoom,
 *   me            : {lat,lng}      vị trí người dùng (mặc định = center)
 *   faked         : bool           pin tím + vòng trần kéo
 *   accuracy      : mét
 *   inRangePois   : [poiId]        pin nổi bật + vẽ vùng vào/ra
 *   showZones     : bool
 *   dimUndownloaded: bool          Focus Mode khi mất mạng
 *   limitM        : số             vòng trần kéo (chế độ kéo)
 *   labels        : bool           nhãn phố/POI
 *   viewport      : {width,height} bề mặt compact (mặc định W × MH)
 *   route         : POI[]         tuyến gợi ý theo thứ tự
 *   showMe        : bool           hiện vị trí người dùng (mặc định true)
 * }
 */
function mapSurface(cfg) {
  var site = cfg.site;
  var center = cfg.center || site.center;
  var z = cfg.zoom || 17;
  var viewport = cfg.viewport || { width: W, height: MH };
  var width = viewport.width || W;
  var height = viewport.height || MH;
  var me = cfg.me || center;
  var mpp = mPerPx(center.lat, z);
  var inRange = cfg.inRangePois || [];
  var pois = DB.poisOfSite(site.id);
  var screenPoint = function (pt) { return toScreen(pt, center, z, viewport); };

  var s = '<div class="mm">';
  s += tileLayer(center, z, viewport);

  // Lớp tranh giúp flow vẫn có chiều sâu khi tile OSM chưa tải hoặc đang offline.
  // Marker và vùng tương tác vẫn nằm trên lớp này, dùng toạ độ GPS thật.
  if (window.FLOW_MODE && cfg.artwork !== false) {
    var artOpacity = cfg.artOpacity != null ? cfg.artOpacity :
      (typeof S.artOpacity === "number" ? Math.min(0.5, S.artOpacity) : 0.38);
    s += '<div class="mm-art" style="opacity:' + artOpacity.toFixed(2) + '">' +
      Art.artIso(site) + '</div>';
  }

  // geofence cấp KHU
  if (site.geofence.mode === "polygon") {
    var pts = site.geofence.polygon
      .map(function (p) { var q = screenPoint(p); return q.x.toFixed(0) + "," + q.y.toFixed(0); })
      .join(" ");
    s += '<svg class="mm-geofence" viewBox="0 0 ' + width + " " + height + '"><polygon points="' + pts + '"/></svg>';
  }

  // Tuyến gợi ý — chỉ là lớp xem nhanh, không giả vờ là chỉ đường turn-by-turn.
  if (cfg.route && cfg.route.length > 1) {
    var routePoints = cfg.route.map(function (poi, i) {
      var c = screenPoint(poi.location || poi);
      return { x: c.x, y: c.y, label: poi.routeNumber || (i + 1) };
    });
    var routeCoords = routePoints.map(function (p) {
      return p.x.toFixed(1) + ',' + p.y.toFixed(1);
    }).join(' ');
    s += '<svg class="mm-route" viewBox="0 0 ' + width + ' ' + height + '" aria-hidden="true">' +
      '<polyline class="mm-route-under" points="' + routeCoords + '"/>' +
      '<polyline class="mm-route-line" points="' + routeCoords + '"/>' +
      '</svg>';
    routePoints.forEach(function (p) {
      s += '<span class="mm-route-stop" style="left:' + p.x.toFixed(1) + 'px;top:' +
        p.y.toFixed(1) + 'px">' + p.label + '</span>';
    });
  }

  // vùng tương tác — bán kính MÉT THẬT chia cho mét/pixel ⇒ tròn đúng tỉ lệ
  if (cfg.showZones) {
    pois.forEach(function (poi) {
      var it = poi.interaction;
      if (it.mode === "polygon") return;
      var c = screenPoint(poi.location);
      var rEnter = it.enter_radius_m / mpp;
      s += '<div class="zone enter" style="left:' + c.x.toFixed(1) + "px;top:" + c.y.toFixed(1) +
        "px;width:" + (rEnter * 2).toFixed(1) + "px;height:" + (rEnter * 2).toFixed(1) + 'px"></div>';
      if (it.exit_radius_m && it.exit_radius_m !== it.enter_radius_m) {
        var rExit = it.exit_radius_m / mpp;
        s += '<div class="zone exit" style="left:' + c.x.toFixed(1) + "px;top:" + c.y.toFixed(1) +
          "px;width:" + (rExit * 2).toFixed(1) + "px;height:" + (rExit * 2).toFixed(1) + 'px"></div>';
      }
    });
  }

  // trần kéo Fake GPS (PHẦN 4) — cũng là mét thật
  if (cfg.limitM) {
    var lc = screenPoint(cfg.limitAnchor || me);
    var lr = cfg.limitM / mpp;
    s += '<div class="zone limit" style="left:' + lc.x.toFixed(1) + "px;top:" + lc.y.toFixed(1) +
      "px;width:" + (lr * 2).toFixed(1) + "px;height:" + (lr * 2).toFixed(1) + 'px"></div>';
  }

  // Nhãn tên POI. Tên phố thì KHÔNG tự vẽ — tile OSM đã có sẵn nhãn phố thật,
  // vẽ thêm chỉ đè lên nhau. (`poi_label` trong data chỉ có toạ độ tranh, không
  // có GPS, nên cũng không dùng lại được ở đây.)
  if (cfg.labels) {
    pois.forEach(function (poi) {
      var c = screenPoint(poi.location);
      if (c.x < 30 || c.x > width - 30 || c.y < 45 || c.y > height - 28) return;
      // a-top ⇒ nhãn nằm TRÊN điểm neo, tránh đè lên pin (pin cao 30px)
      s += '<div class="lbl kind-poi a-top" style="left:' + c.x.toFixed(1) +
        "px;top:" + (c.y - 34).toFixed(1) + 'px">' + poi.name + "</div>";
    });
  }

  // pin POI
  pois.forEach(function (poi) {
    var c = screenPoint(poi.location);
    if (c.x < -60 || c.x > width + 60 || c.y < -40 || c.y > height + 40) return;
    var d = E.dl(poi.id);
    var cls = "mk mk-poi";
    if (d.status === "ready") cls += " st-ready";
    else if (d.status === "downloading" || d.status === "verifying") cls += " st-loading";
    else cls += " st-none";
    if (inRange.indexOf(poi.id) >= 0) cls += " inrange";
    if (cfg.dimUndownloaded && d.status !== "ready") cls += " focusdim";
    s += '<div class="' + cls + '" style="left:' + c.x.toFixed(1) + "px;top:" + c.y.toFixed(1) +
      'px"><div class="pin"><em>' + SVG_ICONS.poiPin + '</em></div></div>';
  });

  // NPC — chỉ những POI đang trong tầm, đúng như app (PHẦN 6)
  pois.forEach(function (poi) {
    if (inRange.indexOf(poi.id) < 0) return;
    DB.npcsOfPoi(poi.id).forEach(function (npc, i) {
      var c = screenPoint(npc.location);
      // Xếp NPC sang PHẢI của pin. Toạ độ GPS của các NPC cùng một POI gần như
      // trùng nhau, nên nếu vẽ đúng chỗ thì chúng đè cả lên nhau lẫn lên pin.
      var off = 26 + i * 34;
      var done = E.prog("story", DB.storyOfNpc(npc.id).id).state === "completed";
      s += '<div class="mk mk-npc interactable' + (done ? " done" : "") + '" style="left:' +
        (c.x + off).toFixed(1) + "px;top:" + c.y.toFixed(1) +
        "px;transform:translate(-50%,-100%) scale(" + (npc.artwork_scale || 1).toFixed(2) + ')">' +
        '<div class="fig">' + Art.npcFigure(npc.avatar) +
        '<div class="halo"></div>' + (done ? '<div class="tick">✓</div>' : "") +
        "</div></div>";
    });
  });

  // vị trí người dùng + vòng sai số
  if (cfg.showMe !== false) {
    var mc = screenPoint(me);
    var accPx = ((cfg.accuracy || 12) / mpp) * 2;
    s += '<div class="me' + (cfg.faked ? " faked" : "") + '" style="left:' + mc.x.toFixed(1) +
      "px;top:" + mc.y.toFixed(1) + 'px"><div class="acc" style="width:' + accPx.toFixed(1) +
      "px;height:" + accPx.toFixed(1) + 'px"></div><div class="dot"></div></div>';
  }

  s += '<div class="mm-attr">© OpenStreetMap</div>';
  return s + "</div>";
}

/* ── 3 · Màn bản đồ (bề mặt + HUD + tab bar) ──────────────────────────────── */

function mapScreen(cfg) {
  var site = cfg.site;
  var s = '<div class="body" style="position:relative">';
  s += mapSurface(cfg);

  s += '<div class="hud">';

  s += '<div class="hud-tl">';
  s += '<button class="fab icon">🏠</button>';
  if (window.FLOW_MODE) {
    var artPct = typeof S.artOpacity === "number" ? Math.round(S.artOpacity * 100) : 38;
    s += '<div class="hud-opacity"><div class="op-row"><b>🗺 Tranh</b><span>' + artPct + '%</span></div>' +
      '<input type="range" min="0" max="100" value="' + artPct + '" aria-label="Độ mờ lớp tranh" ' +
      'oninput="event.stopPropagation();S.artOpacity=this.value/100;E.notify()"></div>';
  } else {
    s += '<button class="fab">🗺 ' + T.viewArt + "</button>";
  }
  s += '<button class="fab dev">🔧 Dev</button>';
  s += "</div>";

  s += '<div class="hud-tr">';
  s += '<button class="fab' + (S.online ? "" : " on") + '">' +
    (S.online ? "🌐 " + T.online : "📡 " + T.offline) + "</button>";
  s += "</div>";

  s += '<div class="hud-bl">';
  s += '<div class="chip">' + cfg.distLabel + "</div>";
  if (cfg.banner) {
    s += '<div class="banner' + (cfg.bannerTone === "danger" ? " danger" : "") +
      '" style="position:relative;top:auto;left:auto;right:auto;margin-top:6px;max-width:280px"><b>' +
      cfg.banner + "</b></div>";
  }
  if (cfg.permCard) {
    s += '<div class="hud-card" style="margin-top:6px;max-width:280px"><b style="font-size:13px">' +
      cfg.permCard + '</b><div style="font-size:11px;color:var(--ink-45);margin-top:2px">' +
      T.permWhy + '</div><button class="btn sm primary" style="margin-top:6px">' +
      T.permGrant + "</button></div>";
  }
  if (cfg.nearby) {
    var poi = DB.poi(cfg.nearby);
    var npcs = DB.npcsOfPoi(poi.id);
    s += '<div class="hud-card" style="margin-top:6px"><b style="font-size:13px">' + poi.name +
      '</b><div style="font-size:11px;color:var(--ink-45)">' + poi.subtitle +
      '</div><div style="margin-top:6px;font-size:11px">' +
      npcs.map(function (n) { return n.name; }).join(", ") + "</div>";
    s += '<button class="btn sm primary" style="margin-top:6px">' +
      (npcs.length >= 2 ? T.chooseNarrator : T.listenTo(npcs[0].name)) + "</button></div>";
  }
  s += "</div>";

  s += '<div class="hud-br">';
  if (cfg.faked) {
    s += '<button class="fab" style="background:#3d3156;color:#f0e9ff;border-color:#56487a">← ' +
      T.backToRealGps + "</button>";
  }
  s += '<button class="fab icon" style="border-radius:50%;width:42px;height:42px;padding:0;justify-content:center">⊙</button>';
  s += "</div>";

  s += "</div>"; // /hud

  var badge = cfg.nearby ? DB.npcsOfPoi(cfg.nearby).length : 0;
  s += renderTabbar('map', badge);

  return s + "</div>";
}

/* ── 4 · Trạng thái nền ───────────────────────────────────────────────────── */

/** Về mốc sạch rồi đặt các trường tối thiểu. Không tick, không notify ai. */
function reset(over) {
  E.reset();
  S.simNow = CLOCK_MS;
  S.cityId = "hn";
  S.permissions.location = "always";
  if (over) Object.keys(over).forEach(function (k) { S[k] = over[k]; });
}

function site(id) { return DB.site(id); }
function poisOf(id) { return DB.poisOfSite(id); }

/* ── 5 · Danh sách cảnh ───────────────────────────────────────────────────── */

var SCENES = [];
function scene(o) {
  o = o || {};
  o.screenId = o.screenId || "mockup." + String(o.num || "scene") + "." + SCENES.length;
  o.kind = o.kind || "staticFixture";
  o.screenshotId = o.screenshotId || "mockup-" + o.screenId.replace(/[^a-z0-9.-]/gi, "-");
  SCENES.push(o);
}

var CUAO = "s-cuao";
var VANMIEU = "s-vanmieu";

/* --- Khởi động ----------------------------------------------------------- */
scene({
  num: "00", group: "Khởi động", title: "Splash Screen — Màn hình chào mừng",
  note: "Màn hình splash ban đầu. Hiển thị logo động dạng la bàn tre và slogan.",
  build: function () {
    reset();
    return screen(renderSplash(), false);
  },
});

scene({
  num: "00b", group: "Khởi động", title: "Login Screen — Đăng nhập số điện thoại",
  note: "Form đăng nhập bằng số điện thoại + các tùy chọn đăng nhập bằng MXH (Zalo, Google, Apple) hoặc Trải nghiệm nhanh.",
  build: function () {
    reset();
    return screen(renderLogin(), false);
  },
});

scene({
  num: "01", group: "Khởi động", title: "Home — chưa chọn gì",
  note: "Nút bắt đầu bị vô hiệu tới khi chọn đủ thành phố + chủ đề.",
  build: function () {
    reset(); S.topicId = null;
    return screen(renderHome(), false);
  },
});

scene({
  num: "01", group: "Khởi động", title: "Home — đã chọn Hà Nội + chủ đề",
  note: "Trạng thái sẵn sàng: nút chính bật, hiện thời lượng và số điểm.",
  build: function () {
    reset(); S.topicId = "t-phoco";
    return screen(renderHome(), false);
  },
});

scene({
  num: "03", group: "Khởi động", title: "Xin quyền vị trí",
  note: "Hộp thoại OS. Đây là bước app THẬT phải đi qua trước khi vào bản đồ — thiếu nó thì proximity không bao giờ chạy.",
  build: function () {
    reset(); S.topicId = "t-phoco"; S.permissions.location = "not_asked";
    return screen(renderPermission(), false);
  },
});

scene({
  num: "10", group: "Khởi động", title: "Quyền — 4 trường hợp",
  note: "Vị trí, thông báo, làm mới trong nền, tự khởi động (OEM).",
  build: function () {
    reset();
    S.permissions = { location: "always", notification: "not_asked", background_refresh: "granted", oem_autostart: "denied" };
    return screen(renderGenericPermission(), false);
  },
});

/* --- Bản đồ -------------------------------------------------------------- */
scene({
  num: "02", group: "Bản đồ", dark: true, title: "Bản đồ — còn xa khu di tích",
  note: "Zoom xa, chưa vào geofence KHU. Pin mờ vì chưa tải gói offline.",
  build: function () {
    reset(); S.topicId = "t-phoco";
    var st = site(CUAO);
    return screen(mapScreen({
      site: st, center: { lat: 21.0405, lng: 105.8505 }, zoom: 15,
      me: { lat: 21.0405, lng: 105.8505 }, accuracy: 18,
      distLabel: T.siteDistance(st.name, "0.6"), labels: false,
    // bản đồ thật SÁNG ⇒ thanh trạng thái phải dùng chữ tối, không phải on-dark
    }), false);
  },
});

scene({
  num: "02", group: "Bản đồ", dark: true, title: "Bản đồ — đã vào khu, 1 NPC trong tầm",
  note: "Thẻ gần đây hiện tên NPC duy nhất → CTA đi thẳng vào chuyện.",
  build: function () {
    reset(); S.topicId = "t-phoco";
    var st = site(CUAO);
    var poi = poisOf(CUAO)[1]; // Phố Hàng Chiếu
    S.activeSiteId = CUAO; S.insideSite = true; S.siteDistanceM = 0;
    return screen(mapScreen({
      site: st, center: poi.location, zoom: 18, me: poi.location, accuracy: 10,
      inRangePois: [poi.id], showZones: true, labels: true,
      distLabel: T.insideSite(st.name),
      nearby: poi.id,
    // bản đồ thật SÁNG ⇒ thanh trạng thái phải dùng chữ tối, không phải on-dark
    }), false);
  },
});

scene({
  num: "02", group: "Bản đồ", dark: true, title: "Bản đồ — 2 NPC trong tầm",
  note: "Có ≥2 NPC thì CTA đổi thành “chọn người kể chuyện”, huy hiệu tab hiện số 2.",
  build: function () {
    reset(); S.topicId = "t-phoco";
    var st = site(CUAO);
    var poi = poisOf(CUAO)[0]; // Ô Quan Chưởng
    S.activeSiteId = CUAO; S.insideSite = true; S.siteDistanceM = 0;
    return screen(mapScreen({
      site: st, center: poi.location, zoom: 18, me: poi.location, accuracy: 9,
      inRangePois: [poi.id], showZones: true, labels: true,
      distLabel: T.insideSite(st.name), nearby: poi.id,
    // bản đồ thật SÁNG ⇒ thanh trạng thái phải dùng chữ tối, không phải on-dark
    }), false);
  },
});

scene({
  num: "02", group: "Bản đồ", dark: true, title: "Bản đồ — chưa có quyền vị trí",
  note: "Trước đây màn này chết câm. Giờ nói rõ lý do + cách cấp lại quyền.",
  build: function () {
    reset(); S.topicId = "t-phoco"; S.permissions.location = "denied";
    var st = site(CUAO);
    return screen(mapScreen({
      site: st, center: st.center, zoom: 17, me: st.center, accuracy: 40,
      distLabel: T.distanceUnknown(st.name),
      permCard: T.permDenied, labels: true,
    // bản đồ thật SÁNG ⇒ thanh trạng thái phải dùng chữ tối, không phải on-dark
    }), false);
  },
});

scene({
  num: "02", group: "Bản đồ", dark: true, title: "Bản đồ — mất mạng (Focus Mode)",
  note: "Chỉ POI đã tải xong còn sáng; các POI khác xám lại. Thanh trạng thái hiện NGOẠI TUYẾN.",
  build: function () {
    reset(); S.topicId = "t-phoco"; S.online = false;
    var st = site(CUAO);
    var ps = poisOf(CUAO);
    S.downloads[ps[0].id] = { status: "ready", pkg: "full", mb: ps[0].pkg.fullMB, totalMB: ps[0].pkg.fullMB };
    S.activeSiteId = CUAO; S.insideSite = true; S.siteDistanceM = 0;
    return screen(mapScreen({
      site: st, center: ps[0].location, zoom: 17, me: ps[0].location, accuracy: 14,
      showZones: true, labels: true, dimUndownloaded: true,
      distLabel: T.insideSite(st.name),
    // bản đồ thật SÁNG ⇒ thanh trạng thái phải dùng chữ tối, không phải on-dark
    }), false);
  },
});

scene({
  num: "08", group: "Bản đồ", dark: true, title: "Chế độ kéo — Fake GPS",
  note: "Pin tím = vị trí đã kéo. Vòng tím là trần 300 m đo từ GPS thật (PHẦN 4).",
  build: function () {
    reset(); S.topicId = "t-phoco";
    var st = site(CUAO);
    var ps = poisOf(CUAO);
    var anchor = { lat: 21.0372, lng: 105.8535 };
    S.gps.mode = "faked";
    S.activeSiteId = CUAO;
    return screen(mapScreen({
      site: st, center: anchor, zoom: 17, me: ps[0].location, accuracy: 8,
      faked: true, limitM: 300, limitAnchor: anchor,
      showZones: true, labels: true,
      distLabel: T.insideSite(st.name),
    // bản đồ thật SÁNG ⇒ thanh trạng thái phải dùng chữ tối, không phải on-dark
    }), false);
  },
});

scene({
  num: "02", group: "Bản đồ", dark: true, title: "Văn Miếu — vùng vẽ tay (polygon)",
  note: "Khu dùng geofence polygon thay vì bán kính; các POI bên trong là Khuê Văn Các, Bia Tiến sĩ, Giếng Thiên Quang.",
  build: function () {
    reset(); S.topicId = "t-biada";
    var st = site(VANMIEU);
    S.activeSiteId = VANMIEU; S.insideSite = true; S.siteDistanceM = 0;
    return screen(mapScreen({
      site: st, center: st.center, zoom: 17, me: poisOf(VANMIEU)[0].location, accuracy: 11,
      showZones: true, labels: true,
      distLabel: T.insideSite(st.name),
    // bản đồ thật SÁNG ⇒ thanh trạng thái phải dùng chữ tối, không phải on-dark
    }), false);
  },
});

scene({
  num: "02", group: "Bản đồ", dark: true, title: "Bản đồ — tuỳ chỉnh độ mờ lớp tranh",
  note: "Slider opacity cho phép chỉnh lớp tranh từ 0% (chỉ thấy map thật OSM) tới 100% (tranh đè hoàn toàn). Khi ở POI có thể kéo về 0 để xem vị trí thực trên bản đồ.",
  build: function () {
    reset(); S.topicId = "t-phoco";
    S.activeSiteId = CUAO; S.insideSite = true; S.siteDistanceM = 0;
    S._panX = 0; S._panY = 0; S.zoom = 1;
    S.artOpacity = 0.55;
    return screen(renderMap(), true);
  },
});

/* --- Tương tác ----------------------------------------------------------- */
scene({
  num: "05", group: "Tương tác", dark: true, title: "Chọn người kể chuyện",
  note: "Hai NPC ở Ô Quan Chưởng, mỗi người một câu chuyện riêng.",
  build: function () {
    reset(); S.topicId = "t-phoco";
    var st = site(CUAO), poi = poisOf(CUAO)[0];
    S.activeSiteId = CUAO; S.insideSite = true; S.siteDistanceM = 0;
    S.inRangeNpcIds = DB.npcsOfPoi(poi.id).map(function (n) { return n.id; });
    S.inRangePoiIds = [poi.id];
    S.overlay = { kind: "chooser", poiId: poi.id };
    var bg = mapScreen({
      site: st, center: poi.location, zoom: 18, me: poi.location,
      inRangePois: [poi.id], distLabel: T.insideSite(st.name),
    });
    return screen(bg + renderChooser(), true);
  },
});

scene({
  num: "06", group: "Tương tác", dark: true, title: "Story — đang phát audio",
  note: "Trình phát + bản ghi lời thoại + danh sách khối nội dung.",
  build: function () {
    reset(); S.topicId = "t-phoco";
    var poi = poisOf(CUAO)[0], npc = DB.npcsOfPoi(poi.id)[0];
    var story = DB.storyOfNpc(npc.id);
    S.activeSiteId = CUAO; S.insideSite = true;
    S.inRangePoiIds = [poi.id];
    S.inRangeNpcIds = [npc.id];
    S.overlay = { kind: "story", poiId: poi.id, npcId: npc.id, storyId: story.id };
    E.startStory(story.id);
    var blocks = E.blocksOf(story.id);
    var ai = 0;
    for (var i = 0; i < blocks.length; i++) if (blocks[i].type === "audio") { ai = i; break; }
    E.playBlock(story.id, ai);
    S.audio.playing = true;
    S.audio.pos_s = Math.round((blocks[ai].duration_s || 60) * 0.42);
    return screen(renderStory(), true);
  },
});

scene({
  num: "06", group: "Tương tác", dark: true, title: "Story — chế độ webtoon",
  note: "Cùng một chuyện, đọc bằng tranh thay vì nghe.",
  build: function () {
    reset(); S.topicId = "t-phoco";
    var poi = poisOf(CUAO)[0], npc = DB.npcsOfPoi(poi.id)[0];
    var story = DB.storyOfNpc(npc.id);
    S.overlay = { kind: "story", poiId: poi.id, npcId: npc.id, storyId: story.id };
    E.startStory(story.id);
    var blocks = E.blocksOf(story.id);
    var wi = -1;
    for (var i = 0; i < blocks.length; i++) if (blocks[i].type === "webtoon") { wi = i; break; }
    E.playBlock(story.id, wi >= 0 ? wi : 0);
    S.storyMode = "webtoon";
    return screen(renderStory(), true);
  },
});

scene({
  num: "06", group: "Tương tác", dark: true, title: "Story — cất máy vào túi",
  note: "Vừa đi vừa nghe: màn tắt, chỉ khối nào phát được khi tắt màn mới chạy.",
  build: function () {
    reset(); S.topicId = "t-phoco";
    var poi = poisOf(CUAO)[0], npc = DB.npcsOfPoi(poi.id)[0];
    var story = DB.storyOfNpc(npc.id);
    S.overlay = { kind: "story", poiId: poi.id, npcId: npc.id, storyId: story.id };
    E.startStory(story.id);
    E.playBlock(story.id, 0);
    S.audio.playing = true;
    S.audio.screenOff = true;
    return screen(renderStory(), true);
  },
});

scene({
  num: "06", group: "Tương tác", dark: true, title: "Story — đã hoàn thành",
  note: "“Xong là xong”: ghi lại version nội dung lúc hoàn thành, bản mới không reset.",
  build: function () {
    reset(); S.topicId = "t-phoco";
    var poi = poisOf(CUAO)[0], npc = DB.npcsOfPoi(poi.id)[0];
    var story = DB.storyOfNpc(npc.id);
    S.overlay = { kind: "story", poiId: poi.id, npcId: npc.id, storyId: story.id };
    E.startStory(story.id);
    E.playBlock(story.id, 0);
    E.completeStory(story.id);
    return screen(renderStory(), true);
  },
});

scene({
  num: "14", group: "Tương tác", dark: true, title: "Nội dung bị khoá — còn suất miễn phí",
  note: "Lớp entitlement: được dùng đúng một suất POI miễn phí đầu tiên.",
  build: function () {
    reset(); S.topicId = "t-phoco";
    var st = site(CUAO), poi = poisOf(CUAO)[0];
    S.overlay = { kind: "locked", poiId: poi.id };
    var bg = mapScreen({ site: st, center: poi.location, zoom: 18, me: poi.location, distLabel: T.insideSite(st.name) });
    return screen(bg + renderLocked(), true);
  },
});

scene({
  num: "14", group: "Tương tác", dark: true, title: "Nội dung bị khoá — đã dùng suất",
  note: "Đã tiêu suất miễn phí ở POI khác nên POI này yêu cầu mua.",
  build: function () {
    reset(); S.topicId = "t-phoco";
    var st = site(CUAO), ps = poisOf(CUAO);
    S.freeFirstPoiId = ps[1].id;
    S.overlay = { kind: "locked", poiId: ps[0].id };
    var bg = mapScreen({ site: st, center: ps[0].location, zoom: 18, me: ps[0].location, distLabel: T.insideSite(st.name) });
    return screen(bg + renderLocked(), true);
  },
});

scene({
  num: "14", group: "Tương tác", dark: true, title: "Nội dung bị khoá — Nhập mã đối tác",
  note: "Có thêm trường nhập Partner Code ở dưới để mở khóa nội dung (B2B2C).",
  build: function () {
    reset(); S.topicId = "t-phoco";
    var st = site(CUAO), poi = poisOf(CUAO)[0];
    S.overlay = { kind: "locked", poiId: poi.id };
    var bg = mapScreen({ site: st, center: poi.location, zoom: 18, me: poi.location, distLabel: T.insideSite(st.name) });
    return screen(bg + renderLocked(), true);
  },
});

scene({
  num: "15", group: "Tương tác", dark: true, title: "Mở khoá mã đối tác thành công",
  note: "Popup xuất hiện khi kích hoạt mã thành công, hiện rõ nhà tài trợ và ghi nhận attribution.",
  build: function () {
    reset(); S.topicId = "t-phoco";
    var st = site(CUAO), poi = poisOf(CUAO)[0];
    S.partnerUnlockedPoiIds = [poi.id];
    S.overlay = { kind: "partner_code_success", code: "ABC2026", partnerName: "Hotel ABC", poiName: poi.name };
    S.route = "15-partner-code-success";
    var bg = mapScreen({ site: st, center: poi.location, zoom: 18, me: poi.location, distLabel: T.insideSite(st.name) });
    return screen(bg + renderPartnerCodeSuccess(), true);
  },
});

scene({
  num: "13", group: "Tương tác", dark: true, title: "Mở khoá Bí mật",
  note: "Hidden Thread ẩn tới khi đủ điều kiện tiên quyết, rồi bật popup này.",
  build: function () {
    reset(); S.topicId = "t-phoco";
    var st = site(CUAO), poi = poisOf(CUAO)[0];
    var thread = DB.HIDDEN_THREADS[0];
    S.overlay = { kind: "unlock", thread: thread };
    var bg = mapScreen({ site: st, center: poi.location, zoom: 18, me: poi.location, distLabel: T.insideSite(st.name) });
    return screen(bg + renderUnlock(), true);
  },
});

/* --- Tiến trình & hệ thống ----------------------------------------------- */
scene({
  num: "07", group: "Tiến trình", title: "Hành trình — chưa có gì",
  note: "Trạng thái rỗng của cả ba mục: di tích, series, bí mật.",
  build: function () { reset(); S.topicId = "t-phoco"; return screen(renderJourney(), false); },
});

scene({
  num: "07", group: "Tiến trình", title: "Hành trình — đã có tiến trình",
  note: "POI đã xong, POI đang dở, thanh % của Series, và bí mật đã mở.",
  build: function () {
    reset(); S.topicId = "t-phoco";
    var ps = poisOf(CUAO);
    // hoàn thành trọn POI đầu (mọi NPC con) để nó lên “đã khám phá”
    DB.npcsOfPoi(ps[0].id).forEach(function (n) {
      var st = DB.storyOfNpc(n.id);
      E.startStory(st.id); E.completeStory(st.id);
    });
    // POI thứ hai mới nghe một nửa
    var n2 = DB.npcsOfPoi(ps[1].id)[0];
    if (n2) { E.startStory(DB.storyOfNpc(n2.id).id); }
    return screen(renderJourney(), false);
  },
});

scene({
  num: "07b", group: "Tiến trình", title: "Hồ sơ — Tiến trình & Cấu hình",
  note: "Màn hình cá nhân hiển thị tiến độ di tích, quãng đường đi bộ và các tùy chọn cài đặt quyền lợi, đăng xuất.",
  build: function () {
    reset(); S.topicId = "t-phoco";
    return screen(renderProfile(), false);
  },
});

scene({
  num: "12", group: "Tiến trình", title: "Tải gói Offline — nhiều trạng thái",
  note: "Xong / đang tải / tạm dừng (resume tiếp từ số MB đã tải) / chưa tải.",
  build: function () {
    reset(); S.topicId = "t-phoco";
    var all = DB.POIS;
    if (all[0]) S.downloads[all[0].id] = { status: "ready", pkg: "full", mb: all[0].pkg.fullMB, totalMB: all[0].pkg.fullMB };
    if (all[1]) S.downloads[all[1].id] = { status: "downloading", pkg: "full", mb: Math.round(all[1].pkg.fullMB * 0.42), totalMB: all[1].pkg.fullMB };
    if (all[2]) S.downloads[all[2].id] = { status: "paused", pkg: "audio", mb: Math.round(all[2].pkg.audioMB * 0.66), totalMB: all[2].pkg.audioMB };
    var st = site(CUAO), poi = poisOf(CUAO)[0];
    var bg = mapScreen({ site: st, center: poi.location, zoom: 18, me: poi.location, distLabel: T.insideSite(st.name) });
    return screen(bg + renderDownload(), true);
  },
});

scene({
  num: "11", group: "Tiến trình", dark: true, title: "Màn khoá — geofence trong nền",
  note: "Thông báo đẩy khi vào vùng, kèm danh sách khu đang theo dõi.",
  build: function () {
    reset(); S.topicId = "t-phoco";
    S.activeSiteId = CUAO; S.siteDistanceM = 0; S.insideSite = true;
    return screen(renderGeofence(), true);
  },
});

scene({
  num: "04", group: "Tiến trình", dark: true, title: "Dev panel — mô phỏng GPS",
  note: "Chỉ dùng khi test: dịch vị trí, ép 4 điều kiện reset, đổi model proximity.",
  build: function () {
    reset(); S.topicId = "t-phoco";
    var st = site(CUAO), poi = poisOf(CUAO)[0];
    S.activeSiteId = CUAO; S.insideSite = true;
    S.gps.mode = "faked";
    S.gps.fake = { lat: poi.location.lat, lng: poi.location.lng };
    S.gps.realAnchor = { lat: 21.0372, lng: 105.8535 };
    S.gps.fakedAt = S.simNow - 240000;
    S.gps.fakeContextPoiId = poi.id;
    var bg = mapScreen({ site: st, center: poi.location, zoom: 18, me: poi.location, faked: true, distLabel: T.insideSite(st.name) });
    return screen(bg + renderDev(), true);
  },
});

scene({
  num: "16", group: "Tương tác", dark: true, title: "Chọn tầng — Floor Picker Bottom Sheet",
  note: "Hiện pop-up chọn tầng khi user đứng tại địa điểm có nhiều tầng (Hầm vs Lầu).",
  build: function () {
    reset(); S.topicId = "t-phoco";
    var st = site(CUAO);
    var poi = poisOf(CUAO)[0]; // Ô Quan Chưởng
    S.activeSiteId = CUAO; S.insideSite = true; S.siteDistanceM = 0;
    S.route = "16-floor-picker";
    return screen(mapScreen({
      site: st, center: poi.location, zoom: 18, me: poi.location, accuracy: 9,
      inRangePois: [poi.id], showZones: true, labels: true,
      distLabel: T.insideSite(st.name), nearby: poi.id
    }) + renderFloorPicker(), true);
  },
});

scene({
  num: "17", group: "Tương tác", dark: true, title: "Chuỗi nhiệm vụ NPC — Multi-POI Questline",
  note: "Màn hình theo dõi hành trình của 1 NPC xuất hiện tại nhiều địa điểm (POIs).",
  build: function () {
    reset(); S.topicId = "t-phoco";
    var st = site(CUAO);
    var poi = poisOf(CUAO)[0]; // Ô Quan Chưởng
    S.activeSiteId = CUAO; S.insideSite = true; S.siteDistanceM = 0;
    S.route = "17-npc-series";
    return screen(mapScreen({
      site: st, center: poi.location, zoom: 18, me: poi.location, accuracy: 9,
      inRangePois: [poi.id], showZones: true, labels: true,
      distLabel: T.insideSite(st.name), nearby: poi.id
    }) + renderNpcSeries(), true);
  },
});

/* ── 6 · Dựng trang ───────────────────────────────────────────────────────── */

/** `mockup.html#solo=3` → xem riêng một cảnh ở đúng cỡ 393×852 (không thu nhỏ),
 *  tiện khi cần soi chi tiết một màn. Bỏ hash đi là về lại lưới. */
function soloIndex() {
  var m = /(?:^|[#&])solo=(\d+)/.exec(location.hash);
  return m ? parseInt(m[1], 10) : null;
}

function buildAll(filter) {
  var grid = document.getElementById("gal-grid");
  var solo = soloIndex();
  document.querySelector(".gal").classList.toggle("solo", solo != null);
  grid.innerHTML = "";
  SCENES.forEach(function (sc, i) {
    if (solo != null && i !== solo) return;
    if (solo == null && filter && filter !== "Tất cả" && sc.group !== filter) return;
    var html;
    try {
      html = sc.build();
    } catch (err) {
      html = '<div class="body" style="padding:24px"><p class="p" style="color:#c0392b">' +
        "Lỗi dựng cảnh: " + (err && err.message ? err.message : String(err)) + "</p></div>";
      // eslint-disable-next-line no-console
      console.error("[mockup] scene " + sc.num + " " + sc.title, err);
    }
    var cell = document.createElement("div");
    cell.className = "gal-cell";
    cell.dataset.bvScreen = sc.screenId;
    cell.dataset.bvKind = sc.kind;
    cell.innerHTML =
      '<div class="gal-frame"><div class="device"><div class="island"></div>' +
      '<div class="screen" data-bv-screen="' + sc.screenId + '" data-bv-route="' + (sc.route || "") + '" data-bv-screen-kind="' + sc.kind + '" data-bv-screenshot="' + sc.screenshotId + '">' + html + "</div></div></div>" +
      '<div class="gal-cap" data-bv-caption-for="' + sc.screenId + '"><span class="num">' + sc.num + "</span><b>" + sc.title + "</b>" +
      "<p>" + sc.note + "</p></div>";
    grid.appendChild(cell);
  });
}

function buildFilters() {
  var groups = ["Tất cả"];
  SCENES.forEach(function (s) { if (groups.indexOf(s.group) < 0) groups.push(s.group); });
  var bar = document.getElementById("gal-filters");
  bar.innerHTML = "";
  groups.forEach(function (g, i) {
    var b = document.createElement("button");
    b.textContent = g + (g === "Tất cả" ? " (" + SCENES.length + ")" : "");
    if (i === 0) b.className = "on";
    b.onclick = function () {
      Array.prototype.forEach.call(bar.children, function (c) { c.className = ""; });
      b.className = "on";
      buildAll(g);
    };
    bar.appendChild(b);
  });
}

/* ── 7 · Xuất cho bản flow ────────────────────────────────────────────────── */

/* `flow.js` dựng lại đúng những màn này nhưng theo THỨ TỰ, trên một khung duy
 * nhất. Xuất hàm dựng ra đây để bản flow dùng chung bề mặt bản đồ — nhân bản mã
 * Web Mercator sang file khác là tự tay chẻ đôi đúng phần đã sửa ở
 * `docs/07. Prototype Map Core Fixes.md` §2.2. */
window.MU = {
  mapSurface: mapSurface,
  mapScreen: mapScreen,
  reset: reset,
  toScreen: toScreen,
  mPerPx: mPerPx,
  worldPx: worldPx,
  site: site,
  poisOf: poisOf,
  scenes: SCENES,
  W: W, H: H, MH: MH, CLOCK_MS: CLOCK_MS,
};

/* Optional extension point: new static scenes live outside this legacy harness. */
if (typeof window.BV_REGISTER_MOCKUP_SCENES === "function") {
  window.BV_REGISTER_MOCKUP_SCENES(scene);
}

/* Chỉ dựng lưới khi thật sự đang ở `mockup.html`. `flow.html` nạp cùng file này
 * chỉ để lấy `window.MU`, không có `#gal-grid` — không chặn thì buildAll() ném
 * lỗi trên null ngay lúc nạp. */
if (document.getElementById("gal-grid")) {
  buildFilters();
  buildAll(null);
}

})();
