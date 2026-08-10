/* =============================================================================
   BonVoye — App Core Prototype · ui.js
   Main UI renderer — ties together data.js, engine.js, art.js.
   Hash-based routing + screen renderers + inspector + main render loop.
   ========================================================================== */

const E = window.Engine;
const G = E.geo;

/* ==========================================================================
   0. CHUỖI HIỂN THỊ — một bảng duy nhất, ĐÚNG DẤU tiếng Việt
   --------------------------------------------------------------------------
   `data.js` / `art.js` vốn đã đúng dấu; chỉ các chuỗi hardcode trong file này
   bị rụng dấu. Gom hết về đây để (a) không còn chỗ nào mất dấu, (b) thêm ngôn
   ngữ sau chỉ là thả thêm một bảng nữa — app vốn thiết kế đa ngữ (PHẦN 1).
   ======================================================================== */
const T = {
  // chung
  later: "Để sau",
  done: "Xong",
  content: "Nội dung",
  completed: "Đã hoàn thành",
  inProgress: "Đang dở",
  new: "Mới",
  del: "Xoá",
  notChosen: "chưa chọn",

  // 01 · Home
  lang: "Tiếng Việt",
  welcome: "Chào mừng bạn đến với",
  tagline: "Những câu chuyện ẩn trong từng con phố",
  city: "Thành phố",
  topic: "Chủ đề",
  topicsCount: "chủ đề",
  minutes: "phút",
  spots: "điểm",
  comingSoon: "Sắp có",
  start: "Bắt đầu khám phá",
  startDisabled: "Chọn thành phố và chủ đề để bắt đầu",

  // 02 · Bản đồ
  map: "Bản đồ",
  journey: "Hành trình",
  online: "Trực tuyến",
  offline: "Ngoại tuyến",
  profile: "Hồ sơ",
  viewArt: "Xem tranh",
  viewRealMap: "Xem map thật",
  backToRealGps: "Về GPS thật",
  recenter: "Về trung tâm",
  noSite: "Chưa có khu di tích nào",
  insideSite: function (name) { return "Bạn đang ở trong " + name; },
  siteDistance: function (name, km) { return name + " cách " + km + " km"; },
  distanceUnknown: function (name) { return name + " · chưa rõ khoảng cách"; },
  chooseNarrator: "Chọn người kể chuyện",
  listenTo: function (name) { return "Nghe " + name + " kể"; },

  // quyền vị trí
  permNotAsked: "Chưa xin quyền vị trí",
  permDenied: "Bạn đã từ chối quyền vị trí",
  permWhy: "Không đo được khoảng cách nên không NPC nào vào tầm.",
  permGrant: "Cấp quyền vị trí",
  permDeniedBanner: "Chưa có quyền vị trí — không phát hiện được khi bạn tới gần di tích",
  permNeeded: "Cần quyền vị trí để mở nội dung tại chỗ",
  walkCloser: function (name, m) {
    return 'Tới gần "' + name + '" hơn để mở — còn khoảng ' + m + " m";
  },

  // 03 · Hộp thoại quyền OS
  osPermTitle: 'Cho phép "BonVoye" sử dụng vị trí của bạn?',
  osPermBody:
    "BonVoye dùng vị trí để biết khi nào bạn tới gần một di tích — và kể câu chuyện phù hợp ngay tại chỗ.",
  osPermAlways: "Luôn cho phép",
  osPermWhileUsing: "Cho phép khi dùng app",
  osPermDeny: "Không cho phép",

  // 04 · Dev panel
  devPanel: "Dev Panel",
  devGps: "GPS mô phỏng",
  devNoise: "Nhiễu GPS",
  devDragMode: "Chế độ kéo",
  devSetFakeGps: "Đặt Fake GPS",
  devTeleport: "Dịch tới",
  devBoundary: "Biên",
  devConds: "4 điều kiện reset Fake GPS",
  devNoCond: "Chưa bật chế độ kéo — không có điều kiện nào đang chạy.",
  devForceReset: "Ép reset",
  devPending: "Đang nhịn reset:",
  devProxModel: "Proximity Model",
  devModelToday: "Hôm nay — NPC 20m",
  devModelAfterCms: "Sau CMS PHẦN 5 — POI 25/35m/3s",
  devPerms: "Quyền",
  devLocation: "Vị trí",
  devNotification: "Thông báo",
  devTimeScale: "Tốc độ thời gian",
  permShort: {
    not_asked: "Chưa hỏi",
    while_using: "Khi dùng app",
    always: "Luôn",
    denied: "Từ chối",
    granted: "Đã cấp",
  },

  // 06 · Story sheet
  listen: "Nghe",
  comic: "Tranh",
  playingScreenOff: "Đang phát khi màn hình tắt",
  turnScreenOn: "Bật màn hình",
  pocketIt: "Cất máy vào túi",
  music: "Nhạc",
  completeStory: "Hoàn thành câu chuyện này",

  // 07 · Hành trình
  sitesExplored: "Di tích đã khám phá",
  noSiteYet: "Chưa khám phá di tích nào. Ra phố thôi!",
  exploring: "Đang khám phá",
  series: "Series",
  secretsOpened: "Bí mật đã mở",
  noSecretYet: "Chưa mở bí mật nào. Hoàn thành các câu chuyện để mở khoá.",

  // 10 · Quyền generic
  permAccess: "Quyền truy cập",
  permAccessBody: "BonVoye cần các quyền sau để hoạt động tốt nhất. Chọn một để xem chi tiết.",

  // 11 · Màn khoá
  lockNotif1: "Bạn đang ở gần khu Cửa Ô Đông Hà. Mở app để khám phá.",
  lockNotif2: "2 câu chuyện đang chờ bạn ở phố Hàng Chiếu.",
  justNow: "vừa xong",
  watchedAreas: "Khu vực đang theo dõi",
  insideArea: "Trong khu",
  lockHint: "BonVoye · theo dõi vị trí trong nền",
  unlock: "Mở khoá",

  // 12 · Tải offline
  downloadTitle: "Tải gói Offline",
  storageUsed: "Dung lượng đã dùng",
  choosePkg: "Chọn gói",
  pkgFull: "Đầy đủ",
  pkgAudio: "Chỉ audio",
  pause: "Tạm dừng",
  resume: "Tiếp tục",

  // 13 · Mở khoá bí mật
  exploreNow: "Khám phá ngay",

  // 14 · Nội dung bị khoá
  lockedBody: "Nội dung này yêu cầu mua hoặc dùng suất POI miễn phí đầu tiên.",
  useFreeSlot: "Dùng suất miễn phí đầu tiên",
  freeSlotLeft: "Bạn còn 1 suất POI miễn phí. Chọn xong là hết.",
  freeSlotUsed: function (name) { return 'Bạn đã dùng suất miễn phí cho "' + name + '"'; },
  needPurchase: "Yêu cầu mua",

  // B2B2C Partner Code
  partnerCodeLabel: "Nhập mã đối tác:",
  partnerCodeInputPlaceholder: "Ví dụ: ABC2026",
  applyPartnerCode: "Áp dụng mã",
  partnerCodeSuccessTitle: "Kích hoạt thành công!",
  partnerCodeSuccessBody: function (partner, poi) {
    return 'Bạn đã nhận quyền truy cập "' + poi + '" do đối tác <b>' + partner + '</b> tài trợ.';
  },
  partnerCodeInvalid: "Mã không hợp lệ hoặc đã sử dụng",
  partnerCodeOffline: "Đang ngoại tuyến. Mã đã được lưu và sẽ kích hoạt khi có mạng.",

  // Inspector
  // Khoá tab giữ nguyên ASCII (code so sánh bằng khoá); chỉ nhãn hiển thị có dấu.
  inspTabLabels: { GPS: "GPS", "4 DK": "4 ĐK", Prox: "Prox", Tai: "Tải", Log: "Log", Hoi: "Hỏi" },
  iMode: "Chế độ",
  iMeasured: "Đo được (measured)",
  iTruth: "Thực (truth)",
  iAccuracy: "Sai số",
  iNoisy: "nhiễu",
  iGood: "tốt",
  iDragMode: "Drag mode",
  iActiveSite: "Active site",
  iInsideSite: "Inside site",
  iCondTitle: "4 Điều kiện reset Fake GPS",
  iNoDrag: "Chưa bật chế độ kéo.",
  iPending: "Đang nhịn:",
  iModel: "Model",
  iModelToday: "NPC 20m (hôm nay)",
  iModelAfterCms: "POI 25/35m/3s (sau CMS PHẦN 5)",
  iUsed: "Đã dùng",
  iQuestions: "Câu hỏi mở (PHẦN 12)",
  iAssumed: "Giả định:",
  iNoAssumption: "Chưa có giả định",

  // Rail groups
  groups: { main: "CHÍNH", dev: "DEV", interact: "TƯƠNG TÁC", background: "NỀN", offline: "OFFLINE" },
};

/* ==========================================================================
   1. AFFINE TRANSFORM — GPS to artwork coords (calibration points)
   ======================================================================== */
const _xformCache = {};

function solve3(a11, a12, a13, a21, a22, a23, a31, a32, a33, b1, b2, b3) {
  const A = [
    [a11, a12, a13, b1],
    [a21, a22, a23, b2],
    [a31, a32, a33, b3],
  ];
  for (let i = 0; i < 3; i++) {
    let max = Math.abs(A[i][i]), mr = i;
    for (let k = i + 1; k < 3; k++)
      if (Math.abs(A[k][i]) > max) { max = Math.abs(A[k][i]); mr = k; }
    [A[i], A[mr]] = [A[mr], A[i]];
    for (let k = i + 1; k < 3; k++) {
      const c = -A[k][i] / A[i][i];
      for (let j = i; j < 4; j++) A[k][j] += c * A[i][j];
    }
  }
  const x = new Array(3);
  for (let i = 2; i >= 0; i--) {
    x[i] = A[i][3] / A[i][i];
    for (let k = i - 1; k >= 0; k--) A[k][3] -= A[k][i] * x[i];
  }
  return x;
}

function computeAffine(site) {
  const pts = site.artwork.calibration;
  const n = pts.length;
  let sxx = 0, sxy = 0, sx = 0, syy = 0, sy = 0;
  let sax_x = 0, say_x = 0, sa_x = 0;
  let sax_y = 0, say_y = 0, sa_y = 0;
  for (const p of pts) {
    const loc = G.toLocal(p.gps, site.center);
    const lx = loc.x, ly = loc.y, ax = p.artwork.x, ay = p.artwork.y;
    sxx += lx * lx; sxy += lx * ly; sx += lx;
    syy += ly * ly; sy += ly;
    sax_x += lx * ax; say_x += ly * ax; sa_x += ax;
    sax_y += lx * ay; say_y += ly * ay; sa_y += ay;
  }
  const cx = solve3(sxx, sxy, sx, sxy, syy, sy, sx, sy, n, sax_x, say_x, sa_x);
  const cy = solve3(sxx, sxy, sx, sxy, syy, sy, sx, sy, n, sax_y, say_y, sa_y);
  return { a: cx[0], b: cx[1], c: cx[2], d: cy[0], e: cy[1], f: cy[2] };
}

function gpsToWorld(gps, site) {
  if (!_xformCache[site.id]) _xformCache[site.id] = computeAffine(site);
  const xf = _xformCache[site.id];
  const loc = G.toLocal(gps, site.center);
  return { x: xf.a * loc.x + xf.b * loc.y + xf.c,
           y: xf.d * loc.x + xf.e * loc.y + xf.f };
}

function inverseWorldToGps(wp, site) {
  if (!_xformCache[site.id]) _xformCache[site.id] = computeAffine(site);
  const xf = _xformCache[site.id];
  const det = xf.a * xf.e - xf.b * xf.d;
  const dx = wp.x - xf.c, dy = wp.y - xf.f;
  const lx = (xf.e * dx - xf.b * dy) / det;
  const ly = (-xf.d * dx + xf.a * dy) / det;
  return G.offset(site.center, lx, ly);
}

/* ==========================================================================
   2. ROUTER
   ======================================================================== */
const ROUTES = [
  { hash: "01-home",      num: "01", group: T.groups.main,
    label: "Home — Chọn thành phố & Topic",                sub: "PHẦN 1–2" },
  { hash: "02-map",       num: "02", group: T.groups.main,
    label: "Bản đồ — Lớp tranh + markers",                 sub: "PHẦN 6b" },
  { hash: "03-permission",num: "03", group: T.groups.main,
    label: "Xin quyền Vị trí (OS dialog)",                 sub: "PHẦN 9" },
  { hash: "04-dev",       num: "04", group: T.groups.dev,
    label: "Dev Panel — GPS mô phỏng & điều kiện reset",   sub: "PHẦN 4–5" },
  { hash: "05-chooser",   num: "05", group: T.groups.interact,
    label: "Chọn NPC (≥2 NPC trong tầm)",                  sub: "PHẦN 6" },
  { hash: "06-story",     num: "06", group: T.groups.interact,
    label: "Story Sheet — Audio + Webtoon",                sub: "PHẦN 7" },
  { hash: "07-journey",   num: "07", group: T.groups.main,
    label: "Hành trình — POI đã xong, Series, Bí mật",     sub: "PHẦN 8" },
  { hash: "08-drag",      num: "08", group: T.groups.dev,
    label: "Drag Mode — Kéo vị trí trên bản đồ",           sub: "PHẦN 4" },
  { hash: "10-permission",num: "10", group: T.groups.main,
    label: "Xin quyền Generic (4 case)",                   sub: "PHẦN 9" },
  { hash: "11-geofence",  num: "11", group: T.groups.background,
    label: "Màn khoá — Geofence background",               sub: "PHẦN 8" },
  { hash: "12-download",  num: "12", group: T.groups.offline,
    label: "Tải gói Offline — Resume + Verify",            sub: "PHẦN 9b" },
  { hash: "13-unlock",    num: "13", group: T.groups.interact,
    label: "Mở khoá Bí mật — Hidden Thread popup",         sub: "PHẦN 8" },
  { hash: "14-locked",    num: "14", group: T.groups.interact,
    label: "Nội dung bị khoá — Entitlement",               sub: "TD §10" },
  { hash: "15-partner-code-success", num: "15", group: T.groups.interact,
    label: "Mở khoá mã đối tác thành công",                 sub: "B2B2C" },
];

function routeFor(hash) {
  return ROUTES.find(function(r) { return r.hash === hash; }) || ROUTES[0];
}

window.addEventListener("hashchange", function() {
  var h = location.hash.replace("#", "") || "01-home";
  S.route = h;
  S.overlay = null;
  S.dragMode = false;
  E.userInteraction();
  E.notify();
});

/* ==========================================================================
   3. HELPERS — DOM creation
   ======================================================================== */
function icon(c) { return '<span style="font-size:17px;line-height:1">' + c + '</span>'; }

function statusBar(dark) {
  var cls = dark ? "statusbar on-dark" : "statusbar";
  var offlineChip = S.online ? "" : '<span class="sb-offline">NGOẠI TUYẾN</span>';
  var modeLabel = S.gps.mode === "faked" ? "&#9679; FAKE " : "";
  return '<div class="' + cls + '">' +
    '<span>' + modeLabel + E.fmtClock(S.simNow) + '</span>' +
    '<div class="sb-r">' + offlineChip + '<span>&#9889; ' + (S.permissions.location === "always" ? "GPS" : "—") + '</span></div>' +
  '</div>';
}

function screen(bodyHtml, sbDark) {
  var hb = (bodyHtml.indexOf("map") >= 0 || bodyHtml.indexOf("story-sheet") >= 0) ? " homebar light" : " homebar";
  var bannerHtml = "";
  if (S.banner && bodyHtml.indexOf("map") < 0) {
    var toneCls = S.banner.tone === 'danger' ? ' danger' : (S.banner.tone === 'warn' ? ' warn' : '');
    bannerHtml = '<div class="banner' + toneCls + '" style="z-index:85"><b>' + S.banner.text + '</b></div>';
  }
  return statusBar(sbDark) + bodyHtml + bannerHtml + '<div class="' + hb.trim() + '"></div>';
}

function formatTime(s) {
  if (s == null || s < 0) return "0:00";
  var m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return m + ":" + (sec < 10 ? "0" : "") + sec;
}

function resetOverlay() { S.overlay = null; E.userInteraction(); E.notify(); }
function resetMapCenter() { S.zoom = 1; S._panX = 0; S._panY = 0; E.notify(); }

function banner(text, tone, ms) {
  S.banner = { text: text, tone: tone || "info", until: S.simNow + (ms || 5000) };
}

/** Home → Map. Phải xin quyền vị trí TRƯỚC (PHẦN 9): engine chặn toàn bộ proximity
 *  sau `permissions.location`, nên vào thẳng bản đồ khi chưa hỏi thì geofence không
 *  chạy, không NPC nào vào tầm, và màn bản đồ chết câm. */
window.startExploring = function() {
  E.userInteraction();
  resetMapCenter();
  S.route = S.permissions.location === "not_asked" ? "03-permission" : "02-map";
  E.notify();
};

/** Dev panel: xoay vòng trạng thái một quyền. Phải là hàm GLOBAL — inline
 *  `onclick` chạy trong global scope, nên biến `var` cục bộ trong renderDev()
 *  không bao giờ nhìn thấy được (trước đây click là ReferenceError). */
var NEXT_PERM = { not_asked: "while_using", while_using: "always", always: "denied", denied: "not_asked", granted: "denied" };
window.cyclePermission = function(key) {
  E.userInteraction();
  S.permissions[key] = NEXT_PERM[S.permissions[key]] || "not_asked";
  E.notify();
};

/** Cấp quyền từ hộp thoại OS rồi quay về bản đồ. */
window.answerLocationPermission = function(value) {
  E.userInteraction();
  S.permissions.location = value;
  S.route = "02-map";
  resetMapCenter();
  if (value === "denied") banner(T.permDeniedBanner, "danger", 6000);
  E.notify();
};

function openStory(poiId, npcId) {
  var story = DB.storyOfNpc(npcId);
  S.overlay = { kind: "story", poiId: poiId, npcId: npcId, storyId: story.id };
  E.startStory(story.id);
  var blocks = E.blocksOf(story.id);
  var firstAudio = -1;
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].type === "audio" || blocks[i].type === "music") { firstAudio = i; break; }
  }
  E.playBlock(story.id, firstAudio >= 0 ? firstAudio : 0);
  S.route = "06-story";
  S.storyMode = "audio";
  E.userInteraction();
  E.notify();
}

function nextAudioBlock() {
  var storyId = S.audio.storyId;
  var blockIdx = S.audio.blockIdx;
  if (storyId == null) return;
  var blocks = E.blocksOf(storyId);
  for (var i = blockIdx + 1; i < blocks.length; i++) {
    if (blocks[i].type === "audio" || blocks[i].type === "music") {
      E.playBlock(storyId, i);
      E.userInteraction();
      return;
    }
  }
  S.audio.playing = false;
  E.userInteraction();
  E.notify();
}

function lastAudioBlock() {
  var storyId = S.audio.storyId;
  var blockIdx = S.audio.blockIdx;
  if (storyId == null) return;
  var blocks = E.blocksOf(storyId);
  for (var i = blockIdx - 1; i >= 0; i--) {
    if (blocks[i].type === "audio" || blocks[i].type === "music") {
      E.playBlock(storyId, i);
      E.userInteraction();
      return;
    }
  }
}

function prog(type, id) { return E.prog(type, id); }

/* ==========================================================================
   4. MAP COORDINATE HELPERS
   ======================================================================== */
var CANVAS_W = 371, CANVAS_H = 830;

function worldToCanvas(wx, wy, vbW, vbH) {
  var scale = Math.max(CANVAS_W / vbW, CANVAS_H / vbH);
  var ox = (CANVAS_W - vbW * scale) / 2;
  var oy = (CANVAS_H - vbH * scale) / 2;
  return { x: ox + wx * scale, y: oy + wy * scale, scale: scale };
}

function canvasToWorld(cx, cy, vbW, vbH) {
  var scale = Math.max(CANVAS_W / vbW, CANVAS_H / vbH);
  var ox = (CANVAS_W - vbW * scale) / 2;
  var oy = (CANVAS_H - vbH * scale) / 2;
  return { x: (cx - ox) / scale, y: (cy - oy) / scale };
}

function gpsToCanvas(gps, site) {
  var wp = gpsToWorld(gps, site);
  return worldToCanvas(wp.x, wp.y, site.artwork.viewBox.w, site.artwork.viewBox.h);
}

function poin(n) { return n.toFixed(1); }

/* ==========================================================================
   5. SCREEN RENDERERS
   ======================================================================== */

/* --- 01 · HOME --------------------------------------------------------- */
function renderHome() {
  var city = DB.city(S.cityId);
  var topic = S.topicId ? DB.topic(S.topicId) : null;
  var ready = city && topic;
  var s = '<div class="home">';
  s += '<div class="home-top"><div></div>';
  s += '<button class="langbtn" onclick="E.userInteraction();">🌐 ' + T.lang + '</button>';
  s += '</div>';
  s += '<div class="home-hero">';
  s += '<p class="eyebrow">' + T.welcome + '</p>';
  s += '<p class="h1">BonVoye</p>';
  s += '<p class="p" style="margin-top:4px">' + T.tagline + '.</p>';
  s += '</div>';
  s += '<div class="home-art">' + Art.homeHero() + '</div>';

  // City picker
  s += '<div class="pad stack" style="margin-top:8px">';
  s += '<div class="picker-label"><span class="eyebrow">' + T.city + '</span></div>';
  for (var ci = 0; ci < DB.CITIES.length; ci++) {
    var c = DB.CITIES[ci];
    var sel = S.cityId === c.id;
    var dim = !c.available ? " dim" : "";
    var badge = !c.available ? '<span class="chip gated">' + T.comingSoon + '</span>' : '';
    s += '<button class="rowbtn' + (sel ? " sel" : "") + dim + '" onclick="E.userInteraction();S.cityId=' + "'" + c.id + "';S.topicId=null;E.notify()\">";
    s += '<div class="grow"><b>' + c.name + '</b><span>' + c.topicIds.length + ' ' + T.topicsCount + '</span></div>' + badge + '</button>';
  }

  // Topic picker — filtered by city
  if (city && city.topicIds.length) {
    s += '<div class="picker-label" style="margin-top:10px"><span class="eyebrow">' + T.topic + '</span></div>';
    for (var ti = 0; ti < city.topicIds.length; ti++) {
      var tid = city.topicIds[ti];
      var t = DB.topic(tid);
      if (!t) continue;
      var tsel = S.topicId === tid;
      s += '<button class="rowbtn' + (tsel ? " sel" : "") + '" onclick="E.userInteraction();S.topicId=' + "'" + tid + "';E.notify()\">";
      s += '<div class="grow"><b>' + t.name + '</b><span>' + t.tagline + '</span></div>';
      s += '<span class="tiny">~' + t.minutes + ' ' + T.minutes + ' &middot; ' + t.poiCount + ' ' + T.spots + '</span>';
      s += '</button>';
    }
  }
  s += '</div>';

  // Start button
  s += '<div class="pad" style="margin-top:18px;margin-bottom:12px">';
  if (ready) {
    s += '<button class="btn primary" onclick="startExploring()">' + T.start + '</button>';
  } else {
    s += '<button class="btn" disabled>' + T.startDisabled + '</button>';
  }
  s += '</div>';
  s += '</div>';
  return s;
}

/* --- 02 · MAP ---------------------------------------------------------- */
function renderMap(forceDrag) {
  if (forceDrag) S.dragMode = true;
  var siteId = S.activeSiteId;
  if (!siteId && S.topicId) {
    var sts = DB.sitesOfTopic(S.topicId);
    siteId = sts.length > 0 ? sts[0].id : DB.SITES[0].id;
  }
  if (!siteId) siteId = DB.SITES[0].id;
  var site = DB.site(siteId);
  if (!site) return '<div class="body" style="align-items:center;justify-content:center;display:flex"><p class="p">' + T.noSite + '</p></div>';

  var vb = site.artwork.viewBox;
  var sitePois = DB.poisOfSite(site.id);
  var pos = E.effectivePosition();
  var me = gpsToCanvas(pos, site);

  // Canvas transform
  var z = S.zoom || 1, ppx = S._panX || 0, ppy = S._panY || 0;
  var tf = "transform:translate(" + poin(ppx) + "px," + poin(ppy) + "px) scale(" + poin(z) + ")";

  if (S.artOpacity == null) S.artOpacity = site.artwork.opacity_default;
  var artOp = String(S.artOpacity);
  var dragCls = S.dragMode ? " dragging" : "";
  var mapCls = "map" + dragCls;

  // Limit zone (drag mode)
  var limitZone = "";
  if (S.gps.mode === "faked" && S.gps.realAnchor) {
    var anchor = gpsToCanvas(S.gps.realAnchor, site);
    var unitX = worldToCanvas(1, 0, vb.w, vb.h).x - worldToCanvas(0, 0, vb.w, vb.h).x;
    var limitPixel = S.gps.dragLimitM * unitX;
    var bad = (S.gps.dragLimitM === CONSTANTS.FAKE_DRAG_LIMIT_M) ? "" : " bad";
    limitZone = '<div class="zone limit' + bad + '" style="left:' + poin(anchor.x) + 'px;top:' + poin(anchor.y) + 'px;width:' + poin(limitPixel * 2) + 'px;height:' + poin(limitPixel * 2) + 'px"></div>';
  }

  // Interaction zones
  var zones = "";
  var unitX = worldToCanvas(1, 0, vb.w, vb.h).x - worldToCanvas(0, 0, vb.w, vb.h).x;
  for (var pi = 0; pi < sitePois.length; pi++) {
    var poi = sitePois[pi];
    var it = poi.interaction;
    var ap = poi.artwork_position;
    var apc = worldToCanvas(ap.x, ap.y, vb.w, vb.h);
    if (it.mode === "polygon") {
      var pts = "";
      for (var pj = 0; pj < it.polygon.length; pj++) {
        var w = gpsToWorld(it.polygon[pj], site);
        var c = worldToCanvas(w.x, w.y, vb.w, vb.h);
        pts += poin(c.x) + "," + poin(c.y) + " ";
      }
      zones += '<svg class="polyzone" style="position:absolute;inset:0;pointer-events:none"><polygon points="' + pts.trim() + '"/></svg>';
    } else {
      var rPx = it.enter_radius_m * unitX;
      zones += '<div class="zone enter" style="left:' + poin(apc.x) + 'px;top:' + poin(apc.y) + 'px;width:' + poin(rPx * 2) + 'px;height:' + poin(rPx * 2) + 'px"></div>';
      if (it.exit_radius_m !== it.enter_radius_m) {
        var exPx = it.exit_radius_m * unitX;
        zones += '<div class="zone exit" style="left:' + poin(apc.x) + 'px;top:' + poin(apc.y) + 'px;width:' + poin(exPx * 2) + 'px;height:' + poin(exPx * 2) + 'px"></div>';
      }
    }
  }

  // POI markers
  var poiMks = "";
  for (var pi2 = 0; pi2 < sitePois.length; pi2++) {
    var poi2 = sitePois[pi2];
    var ap2 = poi2.artwork_position;
    var c2 = worldToCanvas(ap2.x, ap2.y, vb.w, vb.h);
    var d = E.dl(poi2.id);
    var blocked = E.blockerFor(poi2);
    var inRange = S.inRangePoiIds.indexOf(poi2.id) >= 0;
    var stCls = "";
    if (d.status === "downloading" || d.status === "verifying") stCls = " st-loading";
    else if (d.status === "ready") stCls = " st-ready";
    else if (d.status === "not_downloaded") stCls = " st-none";
    var lockCls = (blocked && blocked.kind === "entitlement" && !blocked.ent.claimable) ? " locked" : "";
    var rangeCls = inRange ? " inrange" : "";
    poiMks += '<button class="mk mk-poi' + stCls + lockCls + rangeCls + '" style="left:' + poin(c2.x) + 'px;top:' + poin(c2.y) + 'px" onclick="event.stopPropagation();E.userInteraction();handlePoiClick(' + "'" + poi2.id + "'" + ')"><div class="pin"><em>📌</em></div>';
    if (d.status === "downloading" || d.status === "verifying") {
      var pct = d.totalMB > 0 ? d.mb / d.totalMB : 0;
      var circ = 2 * Math.PI * 18;
      poiMks += '<svg class="mk-ring" viewBox="0 0 42 42"><circle class="trk" cx="21" cy="21" r="18"/><circle class="val" cx="21" cy="21" r="18" stroke-dasharray="' + poin(circ * pct) + ' ' + poin(circ) + '"/></svg>';
    }
    if (d.status === "ready") poiMks += '<div style="position:absolute;top:-4px;right:-4px;width:14px;height:14px;border-radius:50%;background:var(--ok);color:#fff;font-size:10px;display:grid;place-items:center">✓</div>';
    poiMks += '</button>';
  }

  // NPC markers
  var npcMks = "";
  for (var ni = 0; ni < DB.NPCS.length; ni++) {
    var npc = DB.NPCS[ni];
    var found = false;
    for (var pj2 = 0; pj2 < sitePois.length; pj2++) {
      if (sitePois[pj2].id === npc.poiId) { found = true; break; }
    }
    if (!found) continue;
    var ap3 = npc.artwork_position;
    var c3 = worldToCanvas(ap3.x + (npc.artwork_scale - 1) * 2, ap3.y, vb.w, vb.h);
    var inRn = S.inRangeNpcIds.indexOf(npc.id) >= 0;
    var storyProg = prog("story", DB.storyOfNpc(npc.id).id);
    var done = storyProg.state === "completed";
    var sz = npc.artwork_scale || 1;
    npcMks += '<div class="mk mk-npc' + (inRn ? " interactable" : "") + (done ? " done" : "") + '" style="left:' + poin(c3.x) + 'px;top:' + poin(c3.y) + 'px;transform:translate(-50%,-100%) scale(' + poin(sz) + ')"><div class="fig">' + Art.npcFigure(npc.avatar) + (inRn ? '<div class="halo"></div>' : '') + (done ? '<div class="tick">✓</div>' : '') + '</div></div>';
  }

  // Labels
  var lbls = "";
  var siteLabels = DB.labelsOfSite(site.id);
  for (var li = 0; li < siteLabels.length; li++) {
    var lb = siteLabels[li];
    var cl = worldToCanvas(lb.pos.x, lb.pos.y, vb.w, vb.h);
    lbls += '<div class="lbl kind-' + lb.kind + ' a-' + lb.anchor + '" style="left:' + poin(cl.x) + 'px;top:' + poin(cl.y) + 'px">' + lb.text + '</div>';
  }

  // Hidden thread markers
  var threadMks = "";
  var siteThreads = DB.threadsOfSite(site.id);
  for (var hi = 0; hi < siteThreads.length; hi++) {
    var ht = siteThreads[hi];
    if (S.unlockedThreadIds.indexOf(ht.id) < 0) continue;
    var hc = worldToCanvas(ht.artwork_position.x, ht.artwork_position.y, vb.w, vb.h);
    threadMks += '<div class="mk mk-thread" style="left:' + poin(hc.x) + 'px;top:' + poin(hc.y) + 'px"><div class="pin">🔮</div></div>';
  }

  // User position pin
  var faked = S.gps.mode === "faked";
  var accPx = S.gps.accuracy_m * unitX;
  var meHtml = '<div class="me' + (faked ? " faked" : "") + '" style="left:' + poin(me.x) + 'px;top:' + poin(me.y) + 'px"><div class="acc" style="width:' + poin(accPx * 2) + 'px;height:' + poin(accPx * 2) + 'px"></div><div class="dot"></div></div>';

  // Drag candidate indicator
  if (S.dragMode && S.dragCandidate) {
    var dc = gpsToCanvas(S.dragCandidate, site);
    var allowed = S.dragCandidate.allowed;
    meHtml += '<div style="position:absolute;left:' + poin(dc.x) + 'px;top:' + poin(dc.y) + 'px;transform:translate(-50%,-50%);width:16px;height:16px;border-radius:50%;border:2.5px solid #fff;background:' + (allowed ? '#8e44ad' : 'var(--danger)') + ';box-shadow:0 2px 8px rgba(0,0,0,0.4);pointer-events:none"></div>';
  }

  // Site distance. Chưa có quyền thì engine không chạy geofence nên siteDistanceM là
  // undefined — nói "chưa rõ khoảng cách" chứ không hiện "— km" như thể đo được.
  var gpsGranted = S.permissions.location === "while_using" || S.permissions.location === "always";
  var distLabel;
  if (!gpsGranted) {
    distLabel = T.distanceUnknown(site.name);
  } else if (S.insideSite) {
    distLabel = T.insideSite(site.name);
  } else {
    var distKm = (S.siteDistanceM != null) ? (S.siteDistanceM / 1000).toFixed(1) : "—";
    distLabel = T.siteDistance(site.name, distKm);
  }

  // Nearby POI card
  var nearbyCard = "";
  var inRangePois = [];
  for (var rp = 0; rp < sitePois.length; rp++) {
    if (S.inRangePoiIds.indexOf(sitePois[rp].id) >= 0) inRangePois.push(sitePois[rp]);
  }
  if (inRangePois.length > 0) {
    var p = inRangePois[0];
    var npcsOfPoi = DB.npcsOfPoi(p.id);
    var inRangeNpcs = [];
    for (var rn = 0; rn < npcsOfPoi.length; rn++) {
      if (S.inRangeNpcIds.indexOf(npcsOfPoi[rn].id) >= 0) inRangeNpcs.push(npcsOfPoi[rn]);
    }
    nearbyCard = '<div class="hud-card" style="margin-top:6px"><b style="font-size:13px">' + p.name + '</b><div style="font-size:11px;color:var(--ink-45)">' + p.subtitle + '</div><div style="margin-top:6px;font-size:11px">' + inRangeNpcs.map(function(n) { return n.name; }).join(", ") + '</div>';
    if (inRangeNpcs.length >= 2) {
      nearbyCard += '<button class="btn sm primary" style="margin-top:6px" onclick="event.stopPropagation();E.userInteraction();S.overlay={kind:' + "'chooser',poiId:'" + p.id + "'};S.route='05-chooser';E.notify()\">" + T.chooseNarrator + "</button>";
    } else if (inRangeNpcs.length === 1) {
      nearbyCard += '<button class="btn sm primary" style="margin-top:6px" onclick="event.stopPropagation();E.userInteraction();openStory(' + "'" + p.id + "','" + inRangeNpcs[0].id + "')\">" + T.listenTo(inRangeNpcs[0].name) + "</button>";
    }
    nearbyCard += '</div>';
  }

  // Build map HTML
  var s = '<div class="body" style="position:relative">';
  s += '<div class="' + mapCls + '" id="mapEl">';
  s += '<div class="map-canvas" id="mapCanvas" style="' + tf + '">';
  s += '<div class="layer layer-art" style="opacity:' + artOp + '">' + Art.artIso(site) + '</div>';
  s += '<div class="layer layer-real">' + Art.artBase(site, function(gps) { return gpsToWorld(gps, site); }) + '</div>';
  s += limitZone;
  s += zones;
  s += lbls;
  s += poiMks;
  s += threadMks;
  s += npcMks;
  s += meHtml;
  s += '</div>';

  // HUD
  s += '<div class="hud">';
  s += '<div class="hud-tl">';
  s += '<button class="fab icon" onclick="E.userInteraction();S.route=' + "'01-home';E.notify()\" title=\"Home\">🏠</button>";
  var pct = Math.round(S.artOpacity * 100);
  s += '<div class="hud-opacity"><div class="op-row"><b>🗺 Tranh</b><span>' + pct + '%</span></div><input type="range" min="0" max="100" value="' + pct + '" oninput="event.stopPropagation();S.artOpacity=this.value/100;E.notify()"></div>';
  s += '<button class="fab dev" onclick="event.stopPropagation();E.userInteraction();S.route=' + "'04-dev';E.notify()\">🔧 Dev</button>";
  s += '</div>';

  s += '<div class="hud-bl">';
  s += '<div class="chip">' + distLabel + '</div>';
  if (S.banner) {
    s += '<div class="banner' + (S.banner.tone === 'danger' ? ' danger' : '') + '" style="position:relative;top:auto;left:auto;right:auto;margin-top:6px;max-width:280px"><b>' + S.banner.text + '</b></div>';
  }
  // Không có quyền thì engine không chạy proximity — nói rõ ra thay vì để bản đồ chết câm.
  if (!gpsGranted) {
    var permWhy = S.permissions.location === "denied" ? T.permDenied : T.permNotAsked;
    s += '<div class="hud-card" style="margin-top:6px;max-width:280px"><b style="font-size:13px">' + permWhy + '</b>';
    s += '<div style="font-size:11px;color:var(--ink-45);margin-top:2px">' + T.permWhy + '</div>';
    s += '<button class="btn sm primary" style="margin-top:6px" onclick="event.stopPropagation();E.userInteraction();S.route=' + "'03-permission';E.notify()\">" + T.permGrant + "</button>";
    s += '</div>';
  }
  s += nearbyCard;
  s += '</div>';

  s += '<div class="hud-tr">';
  var onlineLabel = S.online ? '🌐 ' + T.online : '📡 ' + T.offline;
  s += '<button class="fab ' + (S.online ? '' : 'on') + '" onclick="event.stopPropagation();E.userInteraction();E.setOnline(!S.online);E.notify()">' + onlineLabel + '</button>';
  s += '</div>';

  s += '<div class="hud-br">';
  if (S.gps.mode === "faked") {
    s += '<button class="fab" style="background:#3d3156;color:#f0e9ff;border-color:#56487a" onclick="event.stopPropagation();E.userInteraction();E.requestFakeReset(' + "'user','thủ công');E.notify()\">← " + T.backToRealGps + "</button>";
  }
  s += '<button class="fab icon" style="border-radius:50%;width:42px;height:42px;padding:0;justify-content:center" onclick="event.stopPropagation();E.userInteraction();resetMapCenter()" title="' + T.recenter + '">⊙</button>';
  s += '</div>';
  s += '</div>';

  // Tab bar
  var nNearby = S.inRangeNpcIds.length;
  s += '<div class="tabbar">';
  s += '<button onclick="E.userInteraction();S.route=' + "'02-map';E.notify()\" class=\"on\"><b>🗺</b>" + T.map + "</button>";
  s += '<button onclick="E.userInteraction();S.route=' + "'07-journey';E.notify()\"><b>📖</b>" + T.journey + "</button>";
  s += '<button onclick="E.userInteraction();S.route=' + "'12-download';E.notify()\"><b>⬇</b>" + T.offline + "</button>";
  s += '<button onclick="E.userInteraction();" style="position:relative"><b>👤</b>' + T.profile + (nNearby > 0 ? '<span class="badge">' + nNearby + '</span>' : '') + '</button>';
  s += '</div>';

  s += '</div></div>';

  if (S.banner) {
    s += '<div class="banner' + (S.banner.tone === 'danger' ? ' danger' : '') + '" style="z-index:85"><b>' + S.banner.text + '</b></div>';
  }

  return s;
}

// Handle POI click from map
window.handlePoiClick = function(poiId) {
  var poi = DB.poi(poiId);
  if (!poi) return;
  var blocked = E.blockerFor(poi);
  if (blocked) {
    if (blocked.kind === "entitlement") {
      S.overlay = { kind: "locked", poiId: poiId };
      S.route = "14-locked";
    } else if (blocked.kind === "offline") {
      S.overlay = { kind: "download", poiId: poiId };
      S.route = "12-download";
    } else if (blocked.kind === "gps") {
      // Trước đây nhánh này rơi tọt qua cả hai if → tap POI ngoài tầm im lặng tuyệt đối.
      if (S.permissions.location === "not_asked" || S.permissions.location === "denied") {
        banner(T.permNeeded, "danger");
      } else {
        banner(T.walkCloser(poi.name, Math.round(E.distanceToPoi(E.effectivePosition(), poi))), "danger");
      }
    }
    E.notify();
    return;
  }
  var npcs = DB.npcsOfPoi(poiId).filter(function(n) { return S.inRangeNpcIds.indexOf(n.id) >= 0; });
  if (npcs.length >= 2) {
    S.overlay = { kind: "chooser", poiId: poiId };
    S.route = "05-chooser";
    E.notify();
  } else if (npcs.length === 1) {
    openStory(poiId, npcs[0].id);
  }
};

/* --- 03 · LOCATION PERMISSION ------------------------------------------ */
function renderPermission() {
  var s = '<div class="body" style="justify-content:center;align-items:center">';
  s += '<div class="scrim" style="z-index:75"></div>';
  s += '<div class="osdlg">';
  s += '<div class="osdlg-body"><h4>' + T.osPermTitle + '</h4><p>' + T.osPermBody + '</p><div class="osdlg-map">' + Art.osMapMini() + '</div></div>';
  s += '<div class="osdlg-acts">';
  // Ngữ nghĩa iOS: "Luôn cho phép" mới đủ cho geofence nền (màn 11); "khi dùng app"
  // chỉ chạy lúc app mở. Trước đây nhãn và giá trị bị lệch nhau.
  s += '<button class="strong" onclick="answerLocationPermission(' + "'always'" + ')">' + T.osPermAlways + '</button>';
  s += '<button onclick="answerLocationPermission(' + "'while_using'" + ')">' + T.osPermWhileUsing + '</button>';
  s += '<button onclick="answerLocationPermission(' + "'denied'" + ')">' + T.osPermDeny + '</button>';
  s += '</div></div></div>';
  return s;
}

/* --- 04 · DEV PANEL --------------------------------------------------- */
function renderDev() {
  var s = '<div class="scrim" onclick="event.stopPropagation()"></div>';
  s += '<div class="sheet dev tall"><div class="sheet-grip"></div>';
  s += '<div class="sheet-head"><div style="display:flex;justify-content:space-between;align-items:center"><b class="h3">🔧 ' + T.devPanel + '</b><button class="sheet-x" onclick="event.stopPropagation();E.userInteraction();S.route=' + "'02-map';S.overlay=null;E.notify()\">✕</button></div></div>";
  s += '<div class="sheet-body">';

  // GPS simulation
  s += '<div class="devsec"><span class="eyebrow">' + T.devGps + '</span><div class="devgrid">';
  s += '<button class="devbtn' + (S.gps.noisy ? ' on' : '') + '" onclick="E.userInteraction();E.setNoisy(!S.gps.noisy);E.notify()">' + T.devNoise + '<small>±' + (S.gps.noisy ? CONSTANTS.GPS_ACCURACY_NOISY_M : CONSTANTS.GPS_ACCURACY_GOOD_M) + 'm</small></button>';
  s += '<button class="devbtn' + (S.dragMode ? ' on' : '') + '" onclick="E.userInteraction();S.dragMode=true;S.route=' + "'08-drag';E.notify()\">" + T.devDragMode + "<small>" + T.devSetFakeGps + "</small></button>";
  for (var pi = 0; pi < DB.POIS.length; pi++) {
    var p = DB.POIS[pi];
    s += '<button class="devbtn" onclick="E.userInteraction();E.teleport(DB.poi(' + "'" + p.id + "').location,'" + p.name + "');E.notify()\">" + T.devTeleport + "<small>" + p.name + "</small></button>";
    s += '<button class="devbtn" onclick="E.userInteraction();E.parkAtBoundary(' + "'" + p.id + "');E.notify()\">" + T.devBoundary + "<small>" + p.name + "</small></button>";
  }
  s += '</div></div>';

  // Fake GPS 4 conditions
  var conds = E.fakeConditions();
  s += '<div class="devsec"><span class="eyebrow">' + T.devConds + '</span>';
  if (conds) {
    for (var ci = 0; ci < conds.length; ci++) {
      var c = conds[ci];
      s += '<div class="cond' + (c.hit ? ' hit' : '') + '"><div class="cond-t"><i>#' + c.n + '</i> ' + c.title + '</div><div class="cond-v">' + c.value + '</div><div class="bar thin"><i style="width:' + poin(c.pct * 100) + '%"></i></div>' + (c.note ? '<div class="cond-n">' + c.note + '</div>' : '') + '<button class="devbtn hot" style="margin-top:5px;padding:5px 8px;font-size:10px" onclick="E.userInteraction();E.forceCondition(' + "'" + c.key + "');E.notify()\">" + T.devForceReset + "</button></div>";
    }
  } else {
    s += '<p class="tiny">' + T.devNoCond + '</p>';
  }
  if (S.gps.resetPending) {
    s += '<div class="pending">⏳ ' + T.devPending + ' ' + S.gps.resetPending.reason + ' (' + S.gps.resetPending.which + ')</div>';
  }
  s += '</div>';

  // Proximity model
  s += '<div class="devsec"><span class="eyebrow">' + T.devProxModel + '</span>';
  s += '<button class="devbtn' + (S.proximityModel === 'npc20' ? ' on' : '') + '" style="width:100%" onclick="E.userInteraction();E.setProximityModel(' + "'npc20');E.notify()\">" + T.devModelToday + "</button>";
  s += '<button class="devbtn' + (S.proximityModel === 'poi2535' ? ' on' : '') + '" style="width:100%;margin-top:6px" onclick="E.userInteraction();E.setProximityModel(' + "'poi2535');E.notify()\">" + T.devModelAfterCms + "</button>";
  s += '</div>';

  // Permissions
  var permLabels = T.permShort;
  s += '<div class="devsec"><span class="eyebrow">' + T.devPerms + '</span><div class="devgrid">';
  s += '<button class="devbtn" onclick="cyclePermission(' + "'location'" + ')">' + T.devLocation + '<small>' + permLabels[S.permissions.location] + '</small></button>';
  s += '<button class="devbtn" onclick="cyclePermission(' + "'notification'" + ')">' + T.devNotification + '<small>' + permLabels[S.permissions.notification] + '</small></button>';
  s += '</div></div>';

  // Entitlement
  s += '<div class="devsec"><span class="eyebrow">Entitlement</span>';
  var freePoiName = S.freeFirstPoiId ? DB.poi(S.freeFirstPoiId).name : '<em>' + T.notChosen + '</em>';
  s += '<p class="tiny">Free-first-POI: ' + freePoiName + '</p>';
  s += '</div>';

  // B2B2C & Partner Code
  s += '<div class="devsec"><span class="eyebrow">B2B2C & Partner Code</span><div class="devgrid">';
  s += '<button class="devbtn" style="grid-column: span 2" onclick="event.stopPropagation(); E.userInteraction(); E.simulateDeepLink(); E.notify()">Simulate QR Scan (Hotel ABC)</button>';
  s += '<button class="devbtn" style="grid-column: span 2" onclick="event.stopPropagation(); E.userInteraction(); S.partnerUnlockedPoiIds = []; S.freeFirstPoiId = null; S.outbox = []; log(\'DEV\', \'Reset B2B2C codes, outbox & free POI\'); E.notify()">Reset Codes & Outbox</button>';
  s += '</div></div>';

  // Time scale
  s += '<div class="devsec"><span class="eyebrow">' + T.devTimeScale + '</span><div class="devgrid">';
  [0.25, 1, 5, 30, 120].forEach(function(x) {
    s += '<button class="devbtn' + (S.timeScale === x ? ' on' : '') + '" onclick="E.userInteraction();E.setTimeScale(' + x + ');E.notify()">x' + x + '</button>';
  });
  s += '</div></div>';

  s += '</div></div>';
  return s;
}

/* --- 05 · NPC CHOOSER ------------------------------------------------- */
function renderChooser() {
  var ov = S.overlay || {};
  var poiId = ov.poiId;
  var poi = poiId ? DB.poi(poiId) : null;
  var npcIds;
  if (poi) {
    npcIds = DB.npcsOfPoi(poi.id).map(function(n) { return n.id; }).filter(function(id) { return S.inRangeNpcIds.indexOf(id) >= 0; });
  } else {
    npcIds = S.inRangeNpcIds;
  }

  var s = '<div class="scrim" onclick="event.stopPropagation();"></div>';
  s += '<div class="sheet"><div class="sheet-grip"></div>';
  s += '<div class="sheet-head"><b class="h3">' + (poi ? poi.name : T.chooseNarrator) + '</b></div>';
  s += '<div class="sheet-body">';
  for (var ni = 0; ni < npcIds.length; ni++) {
    var nid = npcIds[ni];
    var npc = DB.npc(nid);
    var st = DB.storyOfNpc(nid);
    var storyP = prog("story", st.id);
    var done = storyP.state === "completed";
    var inProg = storyP.state === "in_progress";
    s += '<button class="rowbtn" onclick="event.stopPropagation();E.userInteraction();openStory(' + "'" + npc.poiId + "','" + nid + "')\"><div class=\"ic\" style=\"width:44px;height:44px;border-radius:12px;background:var(--paper-2);overflow:hidden\">" + Art.npcFigure(npc.avatar) + "</div><div class=\"grow\"><b>" + npc.name + "</b><span>" + npc.role + "</span><span class=\"tiny\">" + st.title + (done ? " · ✓ " + T.completed : inProg ? " · " + T.inProgress : "") + "</span></div><span style=\"font-size:20px\">→</span></button>";
  }
  s += '<button class="btn ghost" style="margin-top:10px" onclick="event.stopPropagation();E.userInteraction();resetOverlay();S.route=' + "'02-map';E.notify()\">" + T.later + "</button>";
  s += '</div></div>';
  return s;
}

/* --- 06 · STORY SHEET ------------------------------------------------- */
function renderStory() {
  var ov = S.overlay || {};
  var storyId = ov.storyId || S.audio.storyId;
  if (!storyId) return renderMap();
  var st = DB.story(storyId);
  var npc = DB.npc(st.npcId);
  var poi = DB.poi(npc.poiId);
  var blocks = E.blocksOf(storyId);
  var a = S.audio;
  var curBlock = blocks[a.blockIdx];
  var isWebtoon = S.storyMode === "webtoon" && curBlock && curBlock.type === "webtoon";
  var dur = (curBlock && curBlock.duration_s) || 0;
  var pct = dur > 0 ? Math.min(100, (a.pos_s / dur) * 100) : 0;

  var s = '<div class="scrim" onclick="event.stopPropagation()"></div>';
  s += '<div class="sheet dark tall"><div class="sheet-grip"></div>';
  s += '<div class="sheet-head">';
  s += '<button class="sheet-x" onclick="event.stopPropagation();E.userInteraction();if(S.audio.playing)S.audio.playing=false;resetOverlay();S.route=' + "'02-map';E.notify()\">✕</button>";
  s += '<b class="h2">' + st.title + '</b>';
  s += '<div class="tiny" style="margin-top:2px">' + npc.name + ' · ' + poi.name + '</div>';
  s += '<div class="modetoggle" style="margin-top:8px">';
  var hasWebtoon = false;
  for (var bi = 0; bi < blocks.length; bi++) { if (blocks[bi].type === "webtoon") { hasWebtoon = true; break; } }
  s += '<button class="' + (S.storyMode === 'audio' ? ' on' : '') + '" onclick="E.userInteraction();S.storyMode=' + "'audio';E.notify()\">🎧 " + T.listen + "</button>";
  s += '<button class="' + (isWebtoon ? ' on' : '') + '" ' + (!hasWebtoon ? 'disabled' : '') + ' onclick="E.userInteraction();S.storyMode=' + "'webtoon';E.notify()\">📖 " + T.comic + "</button>";
  s += '</div></div>';
  s += '<div class="sheet-body">';

  if (S.audio.screenOff) {
    s += '<div class="screenoff" style="position:relative;border-radius:16px;margin-bottom:12px"><div class="eq"><i></i><i></i><i></i><i></i></div><p>' + T.playingScreenOff + '</p><button class="btn sm" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff" onclick="E.userInteraction();E.setScreenOff(false);E.notify()">' + T.turnScreenOn + '</button></div>';
  }

  if (isWebtoon && curBlock.pages) {
    s += '<div class="webtoon">';
    for (var pi = 0; pi < curBlock.pages.length; pi++) {
      var pg = curBlock.pages[pi];
      s += '<div class="wt-page">' + Art.webtoonScene(pg.bg);
      for (var bj = 0; bj < pg.bubbles.length; bj++) {
        var bb = pg.bubbles[bj];
        s += '<div class="wt-bubble side-' + bb.side + '" style="left:' + bb.x + '%;top:' + bb.y + '%;width:' + bb.w + '%">' + bb.text + '</div>';
      }
      s += '</div>';
      if (pg.caption) s += '<div class="wt-cap">' + pg.caption + '</div>';
    }
    s += '</div>';
  }

  // Audio player
  s += '<div class="player">';
  s += '<div class="disc' + (a.playing ? ' spin' : '') + '">' + (a.playing ? '🔊' : '⏸') + '</div>';
  s += '<div class="bar dark"><i style="width:' + poin(pct) + '%"></i></div>';
  s += '<div class="times"><span>' + formatTime(a.pos_s) + '</span><span>' + formatTime(dur) + '</span></div>';
  s += '<div class="ctrls">';
  s += '<button onclick="event.stopPropagation();E.userInteraction();lastAudioBlock()">⏮</button>';
  s += '<button class="play" onclick="event.stopPropagation();E.userInteraction();E.togglePlay();E.notify()">' + (a.playing ? '⏸' : '▶') + '</button>';
  s += '<button onclick="event.stopPropagation();E.userInteraction();nextAudioBlock()">⏭</button>';
  s += '</div>';
  s += '<div style="text-align:center;margin-top:10px"><button class="btn sm ghost" style="color:rgba(255,255,255,0.5)" onclick="event.stopPropagation();E.userInteraction();E.setScreenOff(true);E.notify()">📱 ' + T.pocketIt + '</button></div>';
  s += '</div>';

  // Transcript
  if (!isWebtoon && curBlock && curBlock.transcript) {
    s += '<div class="transcript">' + curBlock.transcript + '</div>';
  }

  // Block list
  s += '<div class="blocklist" style="margin-top:14px">';
  s += '<span class="eyebrow" style="color:rgba(255,255,255,0.4)">' + T.content + '</span>';
  for (var bi2 = 0; bi2 < blocks.length; bi2++) {
    var b = blocks[bi2];
    var active = bi2 === a.blockIdx;
    var canSkip = a.screenOff && !b.playable_screen_off;
    var typeLabel = b.type === 'audio' ? '🎧 ' + formatTime(b.duration_s) : b.type === 'music' ? '🎵 ' + T.music : b.type === 'webtoon' ? '📖 Webtoon' : '📄 Text';
    s += '<button class="blk' + (active ? ' on' : '') + (canSkip ? ' skipped' : '') + '" onclick="event.stopPropagation();E.userInteraction();E.playBlock(' + "'" + storyId + "'," + bi2 + ");E.notify()\"><span class=\"ord\">" + b.order + "</span><div class=\"grow\"><b>" + b.label + "</b><span>" + typeLabel + "</span></div>" + (b.playable_screen_off ? '<span class="so">📱</span>' : canSkip ? '<span class="so">—</span>' : '') + '</button>';
  }
  s += '</div>';

  // Complete button
  var storyProg = prog("story", storyId);
  var completed = storyProg.state === "completed";
  s += '<div class="sheet-foot" style="text-align:center">';
  if (!completed) {
    s += '<button class="btn primary" style="width:100%" onclick="event.stopPropagation();E.userInteraction();var nu=E.completeStory(' + "'" + storyId + "');if(nu.length>0){setTimeout(function(){S.route='13-unlock';S.overlay={kind:'unlock',thread:nu[0]};E.notify()},600)};E.notify()\">✓ " + T.completeStory + "</button>";
  } else {
    s += '<span class="chip ok">✓ ' + T.completed + ' · version ' + (storyProg.content_version_at_completion || '?') + '</span>';
  }
  s += '</div>';

  s += '</div></div>';
  return s;
}

/* --- 07 · JOURNEY ----------------------------------------------------- */
function renderJourney() {
  var s = '<div class="body scroll">';
  s += '<div style="padding:16px 20px">';
  s += '<p class="h2">' + T.journey + '</p>';

  // Completed POIs
  s += '<div class="jsec"><span class="eyebrow">' + T.sitesExplored + '</span>';
  var completedPois = DB.POIS.filter(function(p) { return prog("poi", p.id).state === "completed"; });
  if (completedPois.length === 0) {
    s += '<div class="empty"><div>🗺</div><p>' + T.noSiteYet + '</p></div>';
  } else {
    for (var ci = 0; ci < completedPois.length; ci++) {
      var cp = completedPois[ci];
      s += '<button class="jrow" onclick="E.userInteraction()"><div class="ic">✓</div><div class="grow"><b>' + cp.name + '</b><span>' + cp.subtitle + '</span></div></button>';
    }
  }
  s += '</div>';

  // In-progress POIs
  var inProgPois = DB.POIS.filter(function(p) { return prog("poi", p.id).state === "in_progress"; });
  if (inProgPois.length > 0) {
    s += '<div class="jsec"><span class="eyebrow">' + T.exploring + '</span>';
    for (var ip = 0; ip < inProgPois.length; ip++) {
      var ipp = inProgPois[ip];
      var ppct = prog("poi", ipp.id).pct || 0;
      s += '<div class="jrow"><div class="ic">▶</div><div class="grow"><b>' + ipp.name + '</b><div class="bar thin" style="margin-top:4px"><i style="width:' + ppct + '%"></i></div></div></div>';
    }
    s += '</div>';
  }

  // Series
  s += '<div class="jsec"><span class="eyebrow">' + T.series + '</span>';
  for (var si = 0; si < DB.SERIES.length; si++) {
    var sr = DB.SERIES[si];
    var sp = E.seriesProgress(sr.id);
    s += '<div class="jrow series"><div class="ic">📚</div><div class="grow"><b>' + sr.name + '</b><span>' + sp.done + '/' + sp.total + '</span></div><div class="bar thin" style="width:60px"><i style="width:' + poin((sp.done / sp.total) * 100) + '%"></i></div></div>';
  }
  s += '</div>';

  // Hidden threads
  s += '<div class="jsec"><span class="eyebrow">' + T.secretsOpened + '</span>';
  if (S.unlockedThreadIds.length === 0) {
    s += '<div class="empty"><div>🔒</div><p>' + T.noSecretYet + '</p></div>';
  } else {
    for (var ui = 0; ui < S.unlockedThreadIds.length; ui++) {
      var tid = S.unlockedThreadIds[ui];
      var ht = DB.thread(tid);
      var htProg = prog("hidden_thread", tid);
      s += '<div class="jrow thread"><div class="ic">🔮</div><div class="grow"><b>' + ht.name + '</b><span>' + ht.blurb + '</span></div><span class="tiny">' + (htProg.state === "completed" ? "✓" : T.new) + '</span></div>';
    }
  }
  s += '</div>';

  s += '</div></div>';
  return s;
}

/* --- 08 · DRAG MODE --------------------------------------------------- */
function renderDrag() {
  if (!S.dragMode) { S.dragMode = true; }
  return renderMap(true);
}

/* --- 10 · GENERIC PERMISSION ------------------------------------------- */
function renderGenericPermission() {
  var s = '<div class="body" style="justify-content:center;align-items:center">';
  s += '<div class="scrim" style="z-index:75"></div>';
  s += '<div class="osdlg">';
  s += '<div class="osdlg-body"><h4>' + T.permAccess + '</h4><p>' + T.permAccessBody + '</p></div>';
  s += '<div class="osdlg-acts">';
  var entries = Object.entries(DB.PERMISSION_REQUESTS);
  for (var ei = 0; ei < entries.length; ei++) {
    var key = entries[ei][0];
    var req = entries[ei][1];
    var pState = S.permissions[key] || "not_asked";
    var ico = req.icon === "pin" ? "📍" : req.icon === "bell" ? "🔔" : req.icon === "refresh" ? "🔄" : "🛡";
    s += '<button class="strong" onclick="event.stopPropagation();cyclePermission(' + "'" + key + "'" + ')">' + ico + " " + req.permission_name + '<small style="display:block;font-size:10px;opacity:0.6">' + (T.permShort[pState] || pState) + '</small></button>';
  }
  s += '<button onclick="E.userInteraction();S.route=' + "'02-map';E.notify()\">" + T.done + "</button>";
  s += '</div></div></div>';
  return s;
}

/* --- 11 · GEOFENCE / LOCK SCREEN --------------------------------------- */
function renderGeofence() {
  var now = new Date();
  var h = now.getHours(), m = now.getMinutes();
  var timeStr = (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
  var dateStr = now.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" });

  var s = '<div class="lock">';
  s += '<div class="lock-clock"><div class="t">' + timeStr + '</div><div class="d">' + dateStr + '</div></div>';

  var notifs = [
    { title: "BonVoye", body: T.lockNotif1 },
    { title: "BonVoye", body: T.lockNotif2 },
  ];
  for (var ni = 0; ni < notifs.length; ni++) {
    var n = notifs[ni];
    s += '<div class="notif"><div class="ic">📍</div><div class="grow"><b>' + n.title + '</b><p>' + n.body + '</p><em>' + T.justNow + '</em></div></div>';
  }

  s += '<div style="margin-top:16px"><span style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;opacity:0.5">' + T.watchedAreas + '</span>';
  s += '<div class="regionlist" style="margin-top:8px">';
  var sites = S.topicId ? DB.sitesOfTopic(S.topicId) : DB.SITES;
  for (var si = 0; si < sites.length; si++) {
    var site = sites[si];
    var d = S.activeSiteId === site.id ? 0 : (S.siteDistanceM || 999);
    var within = d === 0;
    s += '<div class="region' + (within ? '' : ' out') + '"><span class="n">' + (within ? '●' : '○') + '</span><span class="grow">' + site.name + '</span><span class="d">' + (within ? T.insideArea : (d/1000).toFixed(1)+' km') + '</span></div>';
  }
  s += '</div></div>';

  s += '<div class="lock-hint">' + T.lockHint + '<button class="btn sm" style="margin-top:10px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff" onclick="E.userInteraction();S.lockScreen=false;S.route=' + "'02-map';E.notify()\">" + T.unlock + "</button></div>";
  s += '</div>';
  return s;
}

/* --- 12 · DOWNLOAD ---------------------------------------------------- */
function renderDownload() {
  var ov = S.overlay || {};
  var dPoiId = ov.poiId || S.activePoiId;

  var s = '<div class="scrim" onclick="event.stopPropagation()"></div>';
  s += '<div class="sheet"><div class="sheet-grip"></div>';
  s += '<div class="sheet-head"><button class="sheet-x" onclick="event.stopPropagation();E.userInteraction();S.route=' + "'02-map';S.overlay=null;E.notify()\">✕</button><b class=\"h3\">⬇ " + T.downloadTitle + "</b></div>";
  s += '<div class="sheet-body">';

  var used = Math.round(E.storageUsedMB());
  var total = CONSTANTS.DEVICE_STORAGE_MB;
  s += '<div class="gauge"><span>' + T.storageUsed + '</span><span>' + used + ' / ' + total + ' MB</span></div>';
  s += '<div class="bar"><i style="width:' + poin((used/total)*100) + '%"></i></div>';
  s += '<div style="margin-top:16px"><span class="eyebrow">' + T.choosePkg + '</span></div>';

  for (var pi = 0; pi < DB.POIS.length; pi++) {
    var p = DB.POIS[pi];
    var d = E.dl(p.id);
    var vDown = d.status === "downloading" || d.status === "verifying";
    var vReady = d.status === "ready";
    var vPaused = d.status === "paused";
    var vNone = d.status === "not_downloaded";
    var pct2 = d.totalMB > 0 ? Math.round(d.mb / d.totalMB * 100) : 0;

    s += '<div style="margin-top:10px;padding:12px;background:var(--paper-2);border:1px solid var(--line);border-radius:var(--r-m)">';
    s += '<div style="display:flex;justify-content:space-between;align-items:baseline"><b style="font-size:13px">' + p.name + '</b>';
    if (vReady) s += '<span class="chip ok">✓ Ready</span>';
    else if (vDown) s += '<span class="chip warn">↓ ' + pct2 + '%</span>';
    else if (vPaused) s += '<span class="chip">⏸ ' + pct2 + '%</span>';
    else s += '<span class="chip">—</span>';
    s += '</div>';

    if (vNone) {
      s += '<div class="btn-row" style="margin-top:8px">';
      s += '<button class="btn sm" onclick="E.userInteraction();E.startDownload(' + "'" + p.id + "','full');E.notify()\">📦 " + T.pkgFull + " (~" + p.pkg.fullMB + " MB)</button>";
      s += '<button class="btn sm" onclick="E.userInteraction();E.startDownload(' + "'" + p.id + "','audio');E.notify()\">🎧 " + T.pkgAudio + " (~" + p.pkg.audioMB + " MB)</button>";
      s += '</div>';
    } else if (vDown) {
      s += '<div class="bar thin" style="margin:6px 0"><i style="width:' + pct2 + '%"></i></div>';
      s += '<button class="btn sm danger" onclick="E.userInteraction();E.pauseDownload(' + "'" + p.id + "');E.notify()\">⏸ " + T.pause + "</button>";
    } else if (vPaused) {
      s += '<div class="bar thin" style="margin:6px 0"><i style="width:' + pct2 + '%"></i></div>';
      s += '<div class="btn-row">';
      s += '<button class="btn sm" onclick="E.userInteraction();E.resumeDownload(' + "'" + p.id + "');E.notify()\">▶ " + T.resume + "</button>";
      s += '<button class="btn sm danger" onclick="E.userInteraction();E.deleteDownload(' + "'" + p.id + "');E.notify()" + '">🗑 ' + T.del + '</button>';
      s += '</div>';
    } else if (vReady) {
      s += '<button class="btn sm danger" style="margin-top:4px" onclick="E.userInteraction();E.deleteDownload(' + "'" + p.id + "');E.notify()\">🗑 " + T.del + "</button>";
    }
    s += '</div>';
  }
  s += '</div></div>';
  return s;
}

/* --- 13 · UNLOCK HIDDEN THREAD ----------------------------------------- */
function renderUnlock() {
  var ov = S.overlay || {};
  var thread = ov.thread;
  if (!thread && S.unlockedThreadIds.length > 0) {
    thread = DB.thread(S.unlockedThreadIds[S.unlockedThreadIds.length - 1]);
  }
  if (!thread) return renderMap();

  var s = '<div class="scrim" style="z-index:78" onclick="event.stopPropagation()"></div>';
  s += '<div class="popup">';
  s += '<div class="lockfx">🔒 → 🔓</div>';
  s += '<p class="h2">' + thread.name + '</p>';
  s += '<p class="p" style="margin-top:8px">' + thread.blurb + '</p>';
  s += '<p class="tiny" style="margin-top:8px">~' + formatTime(thread.duration_s) + '</p>';
  s += '<button class="btn primary" style="margin-top:16px;width:100%" onclick="event.stopPropagation();E.userInteraction();resetOverlay();S.route=' + "'02-map';E.notify()\">" + T.exploreNow + "</button>";
  s += '<button class="btn ghost" style="margin-top:6px;color:rgba(255,255,255,0.5)" onclick="event.stopPropagation();E.userInteraction();resetOverlay();S.route=' + "'02-map';E.notify()\">" + T.later + "</button>";
  s += '</div>';
  return s;
}

/* --- 14 · LOCKED CONTENT ----------------------------------------------- */
function renderLocked() {
  var ov = S.overlay || {};
  var poiId = ov.poiId;
  if (!poiId) {
    for (var pi = 0; pi < DB.POIS.length; pi++) {
      if (DB.POIS[pi].entitlement === "locked") { poiId = DB.POIS[pi].id; break; }
    }
  }
  var poi = poiId ? DB.poi(poiId) : null;
  if (!poi) return renderMap();

  var ent = E.entitlementOf(poi);

  var s = '<div class="scrim" onclick="event.stopPropagation()"></div>';
  s += '<div class="sheet"><div class="sheet-grip"></div>';
  s += '<div class="sheet-head"><button class="sheet-x" onclick="event.stopPropagation();E.userInteraction();resetOverlay();S.route=' + "'02-map';E.notify()\">✕</button><b class=\"h3\">🔒 " + poi.name + "</b></div>";
  s += '<div class="sheet-body stack">';
  s += '<p class="p">' + poi.subtitle + '</p>';
  s += '<p class="tiny" style="margin-top:6px">' + T.lockedBody + '</p>';

  if (ent.claimable) {
    s += '<button class="btn primary" style="margin-top:12px" onclick="event.stopPropagation();E.userInteraction();E.claimFreeFirstPoi(' + "'" + poi.id + "');resetOverlay();S.route='02-map';E.notify()\">🎁 " + T.useFreeSlot + "</button>";
    s += '<p class="tiny" style="text-align:center;margin-top:4px">' + T.freeSlotLeft + '</p>';
  } else if (ent.source === "free_slot_used") {
    var usedName = S.freeFirstPoiId ? DB.poi(S.freeFirstPoiId).name : '?';
    s += '<div class="chip warn" style="margin-top:12px">' + T.freeSlotUsed(usedName) + '</div>';
  } else {
    s += '<div class="chip gated" style="margin-top:12px">' + T.needPurchase + '</div>';
  }

  // Partner Code B2B2C section
  s += '<div style="margin-top:16px; border-top:1px dashed rgba(255,255,255,0.15); padding-top:16px;">';
  s += '<p class="tiny" style="font-weight:bold; margin-bottom:6px; color:rgba(255,255,255,0.7);">' + T.partnerCodeLabel + '</p>';
  s += '<div style="display:flex; gap:8px;">';
  s += '<input type="text" id="partner-code-input" placeholder="' + T.partnerCodeInputPlaceholder + '" style="flex:1; background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.15); border-radius:6px; padding:8px 12px; color:#fff; font-size:13px; text-transform:uppercase;" onkeypress="if(event.key===\'Enter\'){event.stopPropagation();E.redeemPartnerCode(this.value);}">';
  s += '<button class="btn primary sm" style="margin-top:0; padding:0 12px;" onclick="event.stopPropagation(); E.redeemPartnerCode(document.getElementById(\'partner-code-input\').value)">' + T.applyPartnerCode + '</button>';
  s += '</div></div>';

  s += '</div></div>';
  return s;
}

/* --- 15 · PARTNER CODE SUCCESS ----------------------------------------- */
function renderPartnerCodeSuccess() {
  var ov = S.overlay || {};
  var partnerName = ov.partnerName || "Hotel ABC";
  var code = ov.code || "ABC2026";
  var poiName = ov.poiName || "Ô Quan Chưởng";

  var s = '<div class="scrim" style="z-index:78" onclick="event.stopPropagation()"></div>';
  s += '<div class="popup" style="background: linear-gradient(135deg, #2b1f4d 0%, #17102b 100%); border: 1px solid #7c5cff;">';
  s += '<div class="lockfx" style="font-size:36px; margin-bottom:12px;">🎉 🔓</div>';
  s += '<p class="h2" style="color:#d5caff">' + T.partnerCodeSuccessTitle + '</p>';
  s += '<p class="p" style="margin-top:8px; font-size:13px;">' + T.partnerCodeSuccessBody(partnerName, poiName) + '</p>';
  s += '<p class="tiny" style="margin-top:8px; color:rgba(255,255,255,0.5)">Mã đã dùng: <code style="background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px; font-family:monospace;">' + code + '</code></p>';
  s += '<button class="btn primary" style="margin-top:16px; width:100%; background:#7c5cff; border-color:#7c5cff;" onclick="event.stopPropagation(); E.userInteraction(); resetOverlay(); S.route=\'02-map\'; E.notify()">' + T.exploreNow + '</button>';
  s += '</div>';
  return s;
}

/* ==========================================================================
   6. INSPECTOR — 6 tab panels
   ======================================================================== */
var inspTab = "GPS";
var INSP_TABS = ["GPS", "4 DK", "Prox", "Tai", "Log", "Hoi"];

function renderInspector() {
  var tabsEl = document.getElementById("insp-tabs");
  tabsEl.innerHTML = "";
  for (var ti = 0; ti < INSP_TABS.length; ti++) {
    var t = INSP_TABS[ti];
    var isOn = inspTab === t;
    tabsEl.innerHTML += '<button class="' + (isOn ? 'on' : '') + '" onclick="inspTab=' + "'" + t + "';renderInspector()\">" + (T.inspTabLabels[t] || t) + "</button>";
  }

  var body = document.getElementById("insp-body");
  var pos = E.effectivePosition();

  if (inspTab === "GPS") {
    body.innerHTML = '<div class="insp-sec"><h5>GPS</h5>' +
      '<div class="kv"><span>' + T.iMode + '</span><b class="' + (S.gps.mode === 'faked' ? 'hi' : '') + '">' + (S.gps.mode === 'faked' ? 'FAKE' : 'REAL') + '</b></div>' +
      '<div class="kv"><span>' + T.iMeasured + '</span><b>' + pos.lat.toFixed(6) + ', ' + pos.lng.toFixed(6) + '</b></div>' +
      '<div class="kv"><span>' + T.iTruth + '</span><b>' + S.gps.truth.lat.toFixed(6) + ', ' + S.gps.truth.lng.toFixed(6) + '</b></div>' +
      '<div class="kv"><span>' + T.iAccuracy + '</span><b>±' + S.gps.accuracy_m + 'm ' + (S.gps.noisy ? '(' + T.iNoisy + ')' : '(' + T.iGood + ')') + '</b></div>' +
      '<div class="kv"><span>walkTarget</span><b>' + (S.gps.walkTarget ? S.gps.walkTarget.lat.toFixed(5) + ', ' + S.gps.walkTarget.lng.toFixed(5) : '—') + '</b></div>' +
      '<div class="kv"><span>' + T.iDragMode + '</span><b>' + (S.dragMode ? 'ON' : 'off') + '</b></div>' +
      '<div class="kv"><span>' + T.iActiveSite + '</span><b>' + (S.activeSiteId ? DB.site(S.activeSiteId).name : '—') + '</b></div>' +
      '<div class="kv"><span>' + T.iInsideSite + '</span><b>' + (S.insideSite ? 'YES' : 'no') + ' · ' + (S.siteDistanceM != null ? (S.siteDistanceM/1000).toFixed(2) + 'km' : '—') + '</b></div>' +
      '<div class="kv"><span>simNow</span><b>' + E.fmtClock(S.simNow) + ' (x' + S.timeScale + ')</b></div>' +
    '</div>';
  } else if (inspTab === "4 DK") {
    var conds = E.fakeConditions();
    var h = '<div class="insp-sec"><h5>' + T.iCondTitle + '</h5>';
    if (!conds) {
      h += '<p style="font-size:10.5px;color:var(--bench-fg-dim)">' + T.iNoDrag + '</p>';
    } else {
      for (var ci = 0; ci < conds.length; ci++) {
        var c = conds[ci];
        h += '<div class="cond' + (c.hit ? ' hit' : '') + '"><div class="cond-t"><i>#' + c.n + '</i> ' + c.title + '</div><div class="cond-v">' + c.value + '</div><div class="bar"><i style="width:' + poin(c.pct * 100) + '%"></i></div>' + (c.note ? '<div class="cond-n">' + c.note + '</div>' : '') + '</div>';
      }
      if (S.gps.resetPending) {
        h += '<div class="pending">⏳ ' + T.iPending + ' ' + S.gps.resetPending.reason + ' (' + S.gps.resetPending.which + ')</div>';
      }
    }
    h += '</div>';
    body.innerHTML = h;
  } else if (inspTab === "Prox") {
    var h2 = '<div class="insp-sec"><h5>Proximity FSM</h5>';
    h2 += '<div class="kv"><span>' + T.iModel + '</span><b>' + (S.proximityModel === 'npc20' ? T.iModelToday : T.iModelAfterCms) + '</b></div>';
    h2 += '<div class="fsm" style="margin-top:8px">';
    for (var pi2 = 0; pi2 < DB.POIS.length; pi2++) {
      var p2 = DB.POIS[pi2];
      var fsm = S.poiFsm[p2.id];
      var dd = fsm ? fsm.dist : null;
      var inR = S.inRangePoiIds.indexOf(p2.id) >= 0;
      var state = (fsm && fsm.state) || "far";
      h2 += '<div class="fsm-row"><span class="nm">' + p2.name + '</span><span class="d">' + (dd != null ? dd.toFixed(0) + 'm' : '—') + '</span><span class="st ' + state + '">' + state + '</span>' + (inR ? '<span class="st in_range">in_range</span>' : '') + '</div>';
    }
    h2 += '</div></div>';
    body.innerHTML = h2;
  } else if (inspTab === "Tai") {
    var h3 = '<div class="insp-sec"><h5>Downloads</h5>';
    var used3 = Math.round(E.storageUsedMB());
    h3 += '<div class="kv"><span>' + T.iUsed + '</span><b>' + used3 + ' / ' + CONSTANTS.DEVICE_STORAGE_MB + ' MB</b></div>';
    h3 += '<div class="bar thin" style="margin:6px 0"><i style="width:' + poin((used3/CONSTANTS.DEVICE_STORAGE_MB)*100) + '%"></i></div>';
    h3 += '<div class="kv"><span>Online</span><b>' + (S.online ? '✓' : '✗') + '</b></div>';
    for (var pi3 = 0; pi3 < DB.POIS.length; pi3++) {
      var p3 = DB.POIS[pi3];
      var d3 = E.dl(p3.id);
      h3 += '<div class="kv"><span>' + p3.name + '</span><b>' + d3.status + (d3.totalMB > 0 ? ' · ' + d3.mb.toFixed(0) + '/' + d3.totalMB + 'MB' : '') + '</b></div>';
    }
    h3 += '</div>';
    body.innerHTML = h3;
  } else if (inspTab === "Log") {
    var h4 = '<div class="insp-sec"><h5>Event Log</h5>';
    var tags = [];
    for (var ei = 0; ei < Math.min(100, S.events.length); ei++) {
      var tag = S.events[ei].tag;
      if (tags.indexOf(tag) < 0) tags.push(tag);
    }
    tags = tags.slice(0, 8);
    h4 += '<div class="legend" style="margin-bottom:6px">';
    for (var ti2 = 0; ti2 < tags.length; ti2++) h4 += '<span>' + tags[ti2] + '</span>';
    h4 += '</div>';
    for (var ei2 = 0; ei2 < Math.min(80, S.events.length); ei2++) {
      var e = S.events[ei2];
      h4 += '<div class="logline"><span class="t">' + E.fmtClock(e.t) + '</span><span class="g ' + e.tag + '">' + e.tag + '</span><span class="m">' + e.msg + '</span></div>';
    }
    h4 += '</div>';
    body.innerHTML = h4;
  } else if (inspTab === "Hoi") {
    var h5 = '<div class="insp-sec"><h5>' + T.iQuestions + '</h5>';
    for (var qi = 0; qi < DB.OPEN_QUESTIONS.length; qi++) {
      var q = DB.OPEN_QUESTIONS[qi];
      h5 += '<div class="q"><b>#' + q.n + '. ' + q.q + '</b>' + (q.assumed ? '<i>' + T.iAssumed + ' ' + q.assumed + '</i>' : '<i class="none">' + T.iNoAssumption + '</i>') + '</div>';
    }
    h5 += '</div>';
    body.innerHTML = h5;
  }
}

/* ==========================================================================
   7. MAP INTERACTION — pan/zoom + drag mode
   ======================================================================== */
var panStart = null, panStartPX = 0, panStartPY = 0;

function downHandler(e) {
  if (!e.target.closest(".map")) return;
  if (e.target.closest("button") || e.target.closest(".fab") || e.target.closest("a") || e.target.closest(".mk")) return;
  if (S.dragMode) return;
  panStart = { x: e.clientX, y: e.clientY };
  panStartPX = S._panX || 0;
  panStartPY = S._panY || 0;
  var mapEl = e.target.closest(".map");
  if (mapEl) mapEl.classList.add("dragging");
}

function moveHandler(e) {
  if (!panStart) return;
  S._panX = panStartPX + (e.clientX - panStart.x);
  S._panY = panStartPY + (e.clientY - panStart.y);
  E.notify();
}

function upHandler() {
  if (!panStart) return;
  S._panX = S._panX || 0;
  S._panY = S._panY || 0;
  panStart = null;
  E.userInteraction();
  var mapEl = document.querySelector(".map");
  if (mapEl) mapEl.classList.remove("dragging");
  E.notify();
}

function wheelHandler(e) {
  if (!e.target.closest(".map")) return;
  e.preventDefault();
  var delta = -e.deltaY * 0.002;
  S.zoom = Math.max(0.5, Math.min(3.5, (S.zoom || 1) + delta));
  E.notify();
}

function clickHandler(e) {
  if (!S.dragMode) return;
  var mapCanvas = e.target.closest(".map-canvas");
  if (!mapCanvas) return;
  if (e.target.closest("button") || e.target.closest("a") || e.target.closest(".mk")) return;
  e.preventDefault();
  e.stopPropagation();
  var rect = mapCanvas.getBoundingClientRect();
  var cx = e.clientX - rect.left;
  var cy = e.clientY - rect.top;
  var siteId = S.activeSiteId;
  if (!siteId && S.topicId) {
    var sts2 = DB.sitesOfTopic(S.topicId);
    siteId = sts2.length > 0 ? sts2[0].id : DB.SITES[0].id;
  }
  if (!siteId) siteId = DB.SITES[0].id;
  var site = DB.site(siteId);
  if (!site) return;
  var vb = site.artwork.viewBox;
  var world = canvasToWorld(cx, cy, vb.w, vb.h);
  var gps = inverseWorldToGps(world, site);
  var probe = E.probeDrag(gps);
  S.dragCandidate = { lat: gps.lat, lng: gps.lng, allowed: probe.allowed };
  var ok = E.setFakePosition(gps);
  if (ok) S.dragCandidate = null;
  E.notify();
}

function setupMapInteractions() {
  var sc = document.getElementById("screen");
  if (!sc) return;

  if (sc._mapHandlers) {
    sc.removeEventListener("pointerdown", sc._mapHandlers.down);
    sc.removeEventListener("pointermove", sc._mapHandlers.move);
    sc.removeEventListener("pointerup", sc._mapHandlers.up);
    sc.removeEventListener("pointerleave", sc._mapHandlers.up);
    sc.removeEventListener("wheel", sc._mapHandlers.wheel, false);
    sc.removeEventListener("click", sc._mapHandlers.click, true);
  }

  sc.addEventListener("pointerdown", downHandler);
  sc.addEventListener("pointermove", moveHandler);
  sc.addEventListener("pointerup", upHandler);
  sc.addEventListener("pointerleave", upHandler);
  sc.addEventListener("wheel", wheelHandler, { passive: false });
  sc.addEventListener("click", clickHandler, true);

  sc._mapHandlers = {
    down: downHandler,
    move: moveHandler,
    up: upHandler,
    wheel: wheelHandler,
    click: clickHandler,
  };
}

/* ==========================================================================
   8. RAIL — navigation sidebar
   ======================================================================== */
function renderRail() {
  var list = document.getElementById("rail-list");
  if (!list) return;
  var groups = {};
  for (var ri = 0; ri < ROUTES.length; ri++) {
    var r = ROUTES[ri];
    if (!groups[r.group]) groups[r.group] = [];
    groups[r.group].push(r);
  }
  var h = "";
  var groupKeys = Object.keys(groups);
  for (var gi = 0; gi < groupKeys.length; gi++) {
    var group = groupKeys[gi];
    var items = groups[group];
    h += '<div class="rail-group">' + group + '</div>';
    for (var ii = 0; ii < items.length; ii++) {
      var item = items[ii];
      var isOn = S.route === item.hash;
      h += '<a href="#' + item.hash + '" class="rail-item' + (isOn ? ' on' : '') + '"><i>' + item.num + '</i> ' + item.label + '<em>' + item.sub + '</em></a>';
    }
  }
  list.innerHTML = h;
}

/* ==========================================================================
   9. MAIN RENDER LOOP
   ======================================================================== */
function render() {
  var sc = document.getElementById("screen");
  var routeEntry = routeFor(S.route);
  var num = routeEntry.num;
  var hasOverlayMap = ["04","05","06","08","13","14","15"].indexOf(num) >= 0;

  var bodyHtml = "";
  if (hasOverlayMap) bodyHtml = renderMap();

  switch (num) {
    case "01": bodyHtml = renderHome(); break;
    case "02": bodyHtml = renderMap(); break;
    case "03": bodyHtml = renderPermission(); break;
    case "04": bodyHtml = renderMap() + renderDev(); break;
    case "05": bodyHtml = renderMap() + renderChooser(); break;
    case "06": bodyHtml = renderMap() + renderStory(); break;
    case "07": bodyHtml = renderJourney(); break;
    case "08": bodyHtml = renderMap(true) + (S.gps.mode === "faked" ? '' : ''); break;
    case "10": bodyHtml = renderGenericPermission(); break;
    case "11": bodyHtml = renderGeofence(); break;
    case "12": bodyHtml = renderDownload(); break;
    case "13": bodyHtml = renderMap() + renderUnlock(); break;
    case "14": bodyHtml = renderMap() + renderLocked(); break;
    case "15": bodyHtml = renderMap() + renderPartnerCodeSuccess(); break;
    default: bodyHtml = renderHome();
  }

  var isDark = ["02","04","05","06","08","11","13","14","15"].indexOf(num) >= 0;
  sc.innerHTML = screen(bodyHtml, isDark);

  setupMapInteractions();
  renderInspector();
  renderRail();
}

/* ==========================================================================
   10. INIT
   ======================================================================== */
/* `mockup.html` nạp lại chính file này để tái dùng các hàm render, nhưng KHÔNG
 * muốn app tự chạy: không subscribe, không đồng hồ tick. Nhờ vậy màn hình chỉ
 * là hàm của dữ liệu đứng yên — không có cổng chặn nào, không có gì để vỡ. */
if (!window.MOCKUP_MODE) {
  E.subscribe(render);
  var initHash = location.hash.replace("#", "") || "01-home";
  S.route = initHash;
  S._panX = 0;
  S._panY = 0;
  S.zoom = 1;
  render();
  E.start();
}
