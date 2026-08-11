/* =============================================================================
   BonVoye — Flow player
   -----------------------------------------------------------------------------
   Mục tiêu: QUAY VIDEO. Đi hết một luồng, theo đúng thứ tự, trên MỘT khung máy.

   Vì sao cần file thứ ba:
     · `index.html` chạy thật ⇒ muốn tới màn "2 NPC trong tầm" phải lần lượt qua
       quyền → geofence → proximity → entitlement → offline. Đúng để review logic,
       nhưng không quay được: lên hình toàn cảnh vật lộn với máy trạng thái.
     · `mockup.html` bày 50 trạng thái cạnh nhau. Đúng để ngắm thiết kế, nhưng nó
       là tờ contact sheet — không có thứ tự, không kể được app CHUYỂN như thế nào.

   File này lấy đúng các hàm render của `ui.js` và bề mặt bản đồ của `mockup.js`
   (qua `window.MU`), rồi xâu thành 10 luồng có thứ tự. Không màn nào được vẽ lại
   ở đây — mỗi bước chỉ là "gán trạng thái rồi gọi render*() có sẵn".
   ========================================================================== */

(function () {
"use strict";

var DEFAULT_MS = 3400;      // thời gian mỗi bước khi phát tự động
var FADE_MS = 240;          // khớp với @keyframes fl-fade trong flow.css

/* ── 1 · Khai báo luồng ───────────────────────────────────────────────────── */

var FLOWS = [];
var CUR = null;             // luồng đang soạn

function flow(id, title, sub) {
  CUR = { id: id, title: title, sub: sub, steps: [] };
  FLOWS.push(CUR);
}
function step(o) { CUR.steps.push(o); }

var CUAO = "s-cuao";
var VANMIEU = "s-vanmieu";

function site(id) { return DB.site(id); }
function poisOf(id) { return DB.poisOfSite(id); }

/** Mốc sạch + đã chọn Hà Nội & chủ đề phố cổ — điểm xuất phát của hầu hết bước. */
function base(topic) {
  MU.reset();
  S.topicId = topic || "t-phoco";
}

/** Đặt người dùng đứng trong khu, để các thẻ HUD nói đúng khoảng cách. */
function insideCuao() {
  S.activeSiteId = CUAO;
  S.insideSite = true;
  S.siteDistanceM = 0;
}

/** Mở story của NPC đầu tiên ở một POI, đã bắt đầu nghe. */
function openStoryAt(poiId, npcIdx) {
  var poi = DB.poi(poiId);
  var npc = DB.npcsOfPoi(poi.id)[npcIdx || 0];
  var story = DB.storyOfNpc(npc.id);
  S.inRangePoiIds = [poi.id];
  S.inRangeNpcIds = [npc.id];
  S.overlay = { kind: "story", poiId: poi.id, npcId: npc.id, storyId: story.id };
  E.startStory(story.id);
  return { poi: poi, npc: npc, story: story };
}

/** Nhảy tới khối nội dung đầu tiên đúng loại (audio / webtoon) trong story. */
function playFirstBlock(storyId, type) {
  var blocks = E.blocksOf(storyId);
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].type === type) { E.playBlock(storyId, i); return blocks[i]; }
  }
  E.playBlock(storyId, 0);
  return blocks[0];
}

/* ═══════════════════════════════════════════════════════════════════════════
   LUỒNG 1 — Mở đầu → nghe câu chuyện đầu tiên
   Đường đi hạnh phúc, đúng thứ tự app thật bắt người dùng đi.
   ═════════════════════════════════════════════════════════════════════════ */

flow("mo-dau", "Mở đầu → nghe chuyện đầu tiên", "Đường đi chính · 12 bước");

step({
  cap: "Mở app — Màn hình Splash chào mừng",
  say: "Mở BonVoye lần đầu. Màn hình Splash chào mừng với logo động dạng la bàn tre đậm chất cổ xưa và slogan giới thiệu.",
  ms: 3000,
  build: function () { base(); return screen(renderSplash(), false); },
});

step({
  cap: "Đăng nhập — Lưu trữ hành trình",
  say: "Màn hình đăng nhập bằng số điện thoại hoặc kết nối tài khoản Zalo/Google giúp lưu trữ tiến trình khám phá của người dùng.",
  ms: 3200,
  tap: { x: 196, y: 792 },
  build: function () { base(); return screen(renderLogin(), false); },
});

step({
  cap: "Mở app — chưa chọn gì",
  say: "Mở BonVoye lần đầu. Màn hình chào hỏi hai thứ: đi thành phố nào, và " +
       "muốn nghe chủ đề gì. Nút “Bắt đầu khám phá” cố tình để mờ — chưa chọn " +
       "đủ cả hai thì chưa đi đâu được.",
  ms: 3200,
  build: function () { base(); S.topicId = null; return screen(renderHome(), false); },
});

step({
  cap: "Chọn Hà Nội + 36 phố phường",
  say: "Chọn xong thành phố và chủ đề, nút chính sáng lên, kèm theo thời lượng " +
       "ước tính và số điểm dừng của chủ đề đó.",
  ms: 3400,
  tap: { x: 186, y: 745 },
  build: function () { base(); return screen(renderHome(), false); },
});

step({
  cap: "Xin quyền vị trí",
  say: "Đây là cửa ải bắt buộc, không bỏ qua được. Toàn bộ app dựa trên khoảng " +
       "cách — không có quyền vị trí thì không đo được, không NPC nào vào tầm, " +
       "và màn bản đồ sẽ nằm im.",
  ms: 4200,
  tap: { x: 186, y: 612 },
  build: function () {
    base();
    S.permissions.location = "not_asked";
    return screen(renderPermission(), false);
  },
});

step({
  cap: "Vào bản đồ — còn cách khu 600 m",
  say: "Vào bản đồ. Người dùng còn ở ngoài khu Cửa Ô Đông Hà, nên zoom đang xa " +
       "và các pin còn mờ vì chưa tải gói offline. Thẻ dưới trái báo khoảng cách " +
       "còn lại tới khu.",
  ms: 4000,
  build: function () {
    base();
    var st = site(CUAO);
    return screen(MU.mapScreen({
      site: st, center: { lat: 21.0405, lng: 105.8505 }, zoom: 15,
      me: { lat: 21.0405, lng: 105.8505 }, accuracy: 18,
      distLabel: T.siteDistance(st.name, "0.6"), labels: false,
    }), false);
  },
});

step({
  cap: "Đi bộ vào khu — 1 NPC vào tầm",
  say: "Người dùng đi tới phố Hàng Chiếu. Vừa bước vào vùng tương tác, vòng bán " +
       "kính hiện ra, NPC bước vào khung, và thẻ gần đây đẩy lên tên người kể " +
       "chuyện. Chỉ có một NPC nên nút đi thẳng vào chuyện luôn.",
  ms: 4600,
  build: function () {
    base(); insideCuao();
    var st = site(CUAO), poi = DB.poi("p-hangchieu");
    return screen(MU.mapScreen({
      site: st, center: poi.location, zoom: 18, me: poi.location, accuracy: 10,
      inRangePois: [poi.id], showZones: true, labels: true,
      distLabel: T.insideSite(st.name), nearby: poi.id,
    }), false);
  },
});

step({
  cap: "Nghe chuyện — đang phát audio",
  say: "Chạm vào là mở tấm chuyện. Trình phát chạy, bên dưới là bản ghi lời " +
       "thoại chạy theo, và danh sách các khối nội dung của câu chuyện.",
  ms: 4800,
  tap: { x: 186, y: 640 },
  build: function () {
    base(); insideCuao();
    var r = openStoryAt("p-hangchieu", 0);
    var b = playFirstBlock(r.story.id, "audio");
    S.audio.playing = true;
    S.audio.pos_s = Math.round((b.duration_s || 60) * 0.42);
    return screen(renderStory(), true);
  },
});

step({
  cap: "Nghe xong — “xong là xong”",
  say: "Nghe hết thì câu chuyện được đánh dấu hoàn thành, và app ghi lại phiên " +
       "bản nội dung tại thời điểm đó. Sau này đẩy bản nội dung mới lên, mục này " +
       "vẫn là đã xong — không bị reset về chưa nghe.",
  ms: 4400,
  build: function () {
    base(); insideCuao();
    var r = openStoryAt("p-hangchieu", 0);
    E.playBlock(r.story.id, 0);
    E.completeStory(r.story.id);
    return screen(renderStory(), true);
  },
});

step({
  cap: "Về bản đồ — NPC đã có dấu tick",
  say: "Đóng tấm chuyện, quay lại bản đồ. NPC vừa nghe xong giờ mang dấu tick, " +
       "nên đi tiếp trong phố là biết ngay chỗ nào đã ghé, chỗ nào chưa.",
  ms: 4000,
  build: function () {
    base(); insideCuao();
    var r = openStoryAt("p-hangchieu", 0);
    E.playBlock(r.story.id, 0);
    E.completeStory(r.story.id);
    S.overlay = null;
    var st = site(CUAO), poi = DB.poi("p-hangchieu");
    return screen(MU.mapScreen({
      site: st, center: poi.location, zoom: 18, me: poi.location, accuracy: 10,
      inRangePois: [poi.id], showZones: true, labels: true,
      distLabel: T.insideSite(st.name), nearby: poi.id,
    }), false);
  },
});

step({
  cap: "Hành trình đã ghi nhận",
  say: "Tab Hành trình là nơi mọi thứ đọng lại: di tích đã khám phá, cái đang dở, " +
       "phần trăm của từng Series, và các bí mật đã mở.",
  ms: 4200,
  tap: { x: 140, y: 800 },
  build: function () {
    base();
    var r = openStoryAt("p-hangchieu", 0);
    E.playBlock(r.story.id, 0);
    E.completeStory(r.story.id);
    S.overlay = null;
    return screen(renderJourney(), false);
  },
});

step({
  cap: "Xem Hồ sơ cá nhân",
  say: "Cuối cùng, tab Hồ sơ cá nhân hiển thị thông tin người dùng, các thống kê chi tiết như số di tích đã khám phá, quãng đường đi bộ và các tùy chọn cài đặt hệ thống.",
  ms: 4200,
  tap: { x: 343, y: 800 },
  build: function () {
    base();
    return screen(renderProfile(), false);
  },
});

/* ═══════════════════════════════════════════════════════════════════════════
   LUỒNG 2 — Nhiều người kể chuyện
   Một POI có ≥2 NPC thì luồng rẽ nhánh: phải chọn nghe ai.
   ═════════════════════════════════════════════════════════════════════════ */

flow("nhieu-npc", "Nhiều người kể chuyện", "Rẽ nhánh khi ≥2 NPC · 5 bước");

step({
  cap: "Ô Quan Chưởng — 2 NPC cùng vào tầm",
  say: "Ở Ô Quan Chưởng có hai người kể chuyện đứng cùng một chỗ. Khi cả hai vào " +
       "tầm, nút chính đổi chữ thành “Chọn người kể chuyện”, và huy hiệu trên tab " +
       "hiện số 2.",
  ms: 4400,
  build: function () {
    base(); insideCuao();
    var st = site(CUAO), poi = DB.poi("p-oquanchuong");
    return screen(MU.mapScreen({
      site: st, center: poi.location, zoom: 18, me: poi.location, accuracy: 9,
      inRangePois: [poi.id], showZones: true, labels: true,
      distLabel: T.insideSite(st.name), nearby: poi.id,
    }), false);
  },
});

step({
  cap: "Chọn nghe ai",
  say: "Hai NPC, hai câu chuyện khác hẳn nhau về cùng một cánh cổng. Cùng một " +
       "chỗ đứng nhưng nghe được hai phía — đây là điểm khác biệt của app so với " +
       "audio guide thường.",
  ms: 4600,
  tap: { x: 186, y: 656 },
  build: function () {
    base(); insideCuao();
    var st = site(CUAO), poi = DB.poi("p-oquanchuong");
    S.inRangePoiIds = [poi.id];
    S.inRangeNpcIds = DB.npcsOfPoi(poi.id).map(function (n) { return n.id; });
    S.overlay = { kind: "chooser", poiId: poi.id };
    var bg = MU.mapScreen({
      site: st, center: poi.location, zoom: 18, me: poi.location,
      inRangePois: [poi.id], distLabel: T.insideSite(st.name),
    });
    return screen(bg + renderChooser(), true);
  },
});

step({
  cap: "Đọc bằng tranh thay vì nghe",
  say: "Cùng một câu chuyện còn có bản webtoon. Ai đang ở chỗ ồn, hoặc không tiện " +
       "đeo tai nghe, thì chuyển sang đọc tranh — nội dung vẫn thế.",
  ms: 4400,
  tap: { x: 250, y: 190 },
  build: function () {
    base(); insideCuao();
    var r = openStoryAt("p-oquanchuong", 0);
    playFirstBlock(r.story.id, "webtoon");
    S.storyMode = "webtoon";
    return screen(renderStory(), true);
  },
});

step({
  cap: "Cất máy vào túi, vừa đi vừa nghe",
  say: "Đây là kiểu dùng thật ngoài phố: bấm “cất máy vào túi”, màn hình tắt, chỉ " +
       "những khối nội dung nghe được khi tắt màn mới chạy tiếp. Không ai vừa đi " +
       "bộ vừa nhìn màn hình suốt cả buổi.",
  ms: 4400,
  build: function () {
    base(); insideCuao();
    var r = openStoryAt("p-oquanchuong", 0);
    E.playBlock(r.story.id, 0);
    S.audio.playing = true;
    S.audio.screenOff = true;
    return screen(renderStory(), true);
  },
});

step({
  cap: "Hành trình — một POI xong, một POI đang dở",
  say: "Nghe hết cả hai NPC thì Ô Quan Chưởng mới lên mục “đã khám phá”. Hàng " +
       "Chiếu mới nghe một nửa nên nằm ở mục đang khám phá, kèm thanh phần trăm.",
  ms: 4400,
  build: function () {
    base();
    DB.npcsOfPoi("p-oquanchuong").forEach(function (n) {
      var st = DB.storyOfNpc(n.id);
      E.startStory(st.id); E.completeStory(st.id);
    });
    var n2 = DB.npcsOfPoi("p-hangchieu")[0];
    if (n2) E.startStory(DB.storyOfNpc(n2.id).id);
    return screen(renderJourney(), false);
  },
});

/* ═══════════════════════════════════════════════════════════════════════════
   LUỒNG 3 — Fake GPS (công cụ nội bộ khi test)
   Kéo vị trí để thử nội dung mà không phải ra phố. Có trần và có đường về.
   ═════════════════════════════════════════════════════════════════════════ */

flow("fake-gps", "Fake GPS — kéo vị trí khi test", "Công cụ nội bộ · 6 bước");

step({
  cap: "Bản đồ thật, có nút Dev",
  say: "Khi test nội dung thì không thể lần nào cũng ra tận Hàng Chiếu. Nút Dev ở " +
       "góc trên trái mở bảng mô phỏng — bảng này chỉ có trong bản nội bộ.",
  ms: 3800,
  tap: { x: 150, y: 78 },
  build: function () {
    base(); insideCuao();
    var st = site(CUAO), poi = DB.poi("p-oquanchuong");
    return screen(MU.mapScreen({
      site: st, center: poi.location, zoom: 17, me: { lat: 21.0372, lng: 105.8535 },
      accuracy: 12, showZones: true, labels: true, distLabel: T.insideSite(st.name),
    }), false);
  },
});

step({
  cap: "Dev panel — mô phỏng GPS",
  say: "Bảng Dev cho dịch vị trí tới bất kỳ điểm nào, bật nhiễu GPS, ép từng điều " +
       "kiện reset, và đổi giữa hai mô hình proximity: mô hình hôm nay và mô hình " +
       "sau khi CMS lên.",
  ms: 4800,
  build: function () {
    base(); insideCuao();
    var st = site(CUAO), poi = DB.poi("p-oquanchuong");
    S.gps.mode = "faked";
    S.gps.fake = { lat: poi.location.lat, lng: poi.location.lng };
    S.gps.realAnchor = { lat: 21.0372, lng: 105.8535 };
    S.gps.fakedAt = S.simNow - 240000;
    S.gps.fakeContextPoiId = poi.id;
    var bg = MU.mapScreen({
      site: st, center: poi.location, zoom: 18, me: poi.location,
      faked: true, distLabel: T.insideSite(st.name),
    });
    return screen(bg + renderDev(), true);
  },
});

step({
  cap: "Chế độ kéo — pin tím, trần 300 m",
  say: "Bật chế độ kéo thì pin chuyển tím: đây là vị trí giả, không phải GPS thật. " +
       "Vòng tím là trần — chỉ được kéo trong bán kính 300 m tính từ GPS thật, để " +
       "không ai dùng nó đi xuyên thành phố.",
  ms: 4800,
  build: function () {
    base(); insideCuao();
    var st = site(CUAO), poi = DB.poi("p-oquanchuong");
    var anchor = { lat: 21.0372, lng: 105.8535 };
    S.gps.mode = "faked";
    return screen(MU.mapScreen({
      site: st, center: anchor, zoom: 17, me: poi.location, accuracy: 8,
      faked: true, limitM: 300, limitAnchor: anchor,
      showZones: true, labels: true, distLabel: T.insideSite(st.name),
    }), false);
  },
});

step({
  cap: "Kéo vào vùng POI — nội dung mở ra",
  say: "Kéo pin vào trong vùng tương tác thì mọi thứ chạy đúng như đứng thật ở đó: " +
       "NPC vào tầm, thẻ gần đây hiện lên. Nhờ vậy test được nội dung mà không phải " +
       "ra hiện trường.",
  ms: 4400,
  build: function () {
    base(); insideCuao();
    var st = site(CUAO), poi = DB.poi("p-oquanchuong");
    S.gps.mode = "faked";
    return screen(MU.mapScreen({
      site: st, center: poi.location, zoom: 18, me: poi.location, accuracy: 8,
      faked: true, inRangePois: [poi.id], showZones: true, labels: true,
      distLabel: T.insideSite(st.name), nearby: poi.id,
    }), false);
  },
});

step({
  cap: "Vị trí giả tự hết hạn",
  say: "Có bốn điều kiện chạy song song để đưa app về GPS thật: hết mười lăm phút, " +
       "đã tới nơi thật, thoát màn POI, hoặc GPS tốt liên tục sáu mươi giây. " +
       "Ở đây điều kiện “đã tới nơi” nổ trước.",
  ms: 5000,
  build: function () {
    base(); insideCuao();
    var st = site(CUAO), poi = DB.poi("p-oquanchuong");
    S.gps.mode = "faked";
    return screen(MU.mapScreen({
      site: st, center: poi.location, zoom: 18, me: poi.location, accuracy: 8,
      faked: true, inRangePois: [poi.id], showZones: true, labels: true,
      distLabel: T.insideSite(st.name),
      banner: "Đã tới nơi thật — sẽ trả về GPS thật",
      bannerTone: "danger",
    }), false);
  },
});

step({
  cap: "Về GPS thật — banner nhẹ, không chặn",
  say: "Trả về GPS thật thì chỉ báo bằng một banner nhẹ, tự tắt sau sáu giây, không " +
       "chặn thao tác. Riêng khi đang phát audio thì app nhịn lại, đợi tới lần chạm " +
       "kế tiếp mới đổi — không cắt ngang câu chuyện đang nghe.",
  ms: 5000,
  build: function () {
    base(); insideCuao();
    var st = site(CUAO), poi = DB.poi("p-oquanchuong");
    return screen(MU.mapScreen({
      site: st, center: poi.location, zoom: 17, me: { lat: 21.0372, lng: 105.8535 },
      accuracy: 12, showZones: true, labels: true, distLabel: T.insideSite(st.name),
      banner: "Đã trả về GPS thật",
    }), false);
  },
});

/* ═══════════════════════════════════════════════════════════════════════════
   LUỒNG 4 — Ngoại tuyến
   Phố cổ sóng chập chờn. Tải trước, và mất mạng vẫn dùng được.
   ═════════════════════════════════════════════════════════════════════════ */

flow("ngoai-tuyen", "Ngoại tuyến — tải gói trước", "Tải · resume · Focus Mode · 7 bước");

step({
  cap: "Pin còn mờ — chưa tải gói nào",
  say: "Trong phố cổ sóng rất chập chờn. Pin đang mờ nghĩa là POI đó chưa có gói " +
       "offline — tới nơi mà mất mạng thì không nghe được.",
  ms: 3800,
  build: function () {
    base(); insideCuao();
    var st = site(CUAO);
    return screen(MU.mapScreen({
      site: st, center: st.center, zoom: 16, me: st.center, accuracy: 14,
      labels: true, distLabel: T.insideSite(st.name),
    }), false);
  },
});

step({
  cap: "Mở tấm tải gói",
  say: "Mỗi điểm cho chọn hai cỡ gói: đầy đủ gồm cả tranh, hoặc chỉ audio cho nhẹ " +
       "máy. Trên cùng là dung lượng đã dùng trên thiết bị.",
  ms: 4200,
  tap: { x: 233, y: 800 },
  build: function () {
    base();
    S.overlay = { kind: "download" };
    return screen(renderDownload(), false);
  },
});

step({
  cap: "Đang tải — 42%",
  say: "Bấm tải thì gói chạy nền, vẫn xem bản đồ bình thường được.",
  ms: 3400,
  build: function () {
    base();
    var p = DB.poi("p-oquanchuong");
    S.downloads[p.id] = { status: "downloading", pkg: "full", mb: Math.round(p.pkg.fullMB * 0.42), totalMB: p.pkg.fullMB };
    S.overlay = { kind: "download" };
    return screen(renderDownload(), false);
  },
});

step({
  cap: "Tạm dừng giữa chừng",
  say: "Đang tải mà tàu điện chui hầm, hoặc người dùng chủ động dừng để tiết kiệm " +
       "4G — gói dừng lại ở đúng số MB đã tải.",
  ms: 3800,
  tap: { x: 120, y: 430 },
  build: function () {
    base();
    var p = DB.poi("p-oquanchuong");
    S.downloads[p.id] = { status: "paused", pkg: "full", mb: Math.round(p.pkg.fullMB * 0.42), totalMB: p.pkg.fullMB };
    S.overlay = { kind: "download" };
    return screen(renderDownload(), false);
  },
});

step({
  cap: "Tiếp tục — chạy tiếp từ chỗ dừng",
  say: "Đây là chỗ dễ làm sai nhất: bấm tiếp tục phải chạy tiếp từ số MB đã có, " +
       "không được quay về 0. Tải lại từ đầu trên mạng phố cổ là mất cả buổi.",
  ms: 4600,
  build: function () {
    base();
    var p = DB.poi("p-oquanchuong");
    S.downloads[p.id] = { status: "downloading", pkg: "full", mb: Math.round(p.pkg.fullMB * 0.78), totalMB: p.pkg.fullMB };
    S.overlay = { kind: "download" };
    return screen(renderDownload(), false);
  },
});

step({
  cap: "Kiểm tra xong — sẵn sàng",
  say: "Tải đủ thì còn một bước kiểm tra tệp trước khi đánh dấu sẵn sàng. Gói hỏng " +
       "mà vẫn báo xong thì người dùng chỉ phát hiện ra lúc đứng giữa phố, không có mạng.",
  ms: 4200,
  build: function () {
    base();
    var ps = poisOf(CUAO);
    S.downloads[ps[0].id] = { status: "ready", pkg: "full", mb: ps[0].pkg.fullMB, totalMB: ps[0].pkg.fullMB };
    S.downloads[ps[1].id] = { status: "verifying", pkg: "audio", mb: ps[1].pkg.audioMB, totalMB: ps[1].pkg.audioMB };
    S.overlay = { kind: "download" };
    return screen(renderDownload(), false);
  },
});

step({
  cap: "Mất mạng — Focus Mode",
  say: "Mất mạng thật thì app không báo lỗi rồi bỏ mặc. Nó chuyển sang Focus Mode: " +
       "chỉ những điểm đã tải xong còn sáng, các điểm khác xám lại. Người dùng nhìn " +
       "một cái là biết đi đâu thì vẫn nghe được.",
  ms: 5000,
  build: function () {
    base(); insideCuao();
    S.online = false;
    var st = site(CUAO), ps = poisOf(CUAO);
    S.downloads[ps[0].id] = { status: "ready", pkg: "full", mb: ps[0].pkg.fullMB, totalMB: ps[0].pkg.fullMB };
    return screen(MU.mapScreen({
      site: st, center: ps[0].location, zoom: 17, me: ps[0].location, accuracy: 14,
      showZones: true, labels: true, dimUndownloaded: true,
      distLabel: T.insideSite(st.name),
    }), false);
  },
});

/* ═══════════════════════════════════════════════════════════════════════════
   LUỒNG 5 — Khoá & mở khoá
   Hai lớp khác nhau: entitlement (trả tiền) và hidden thread (chơi mà mở ra).
   ═════════════════════════════════════════════════════════════════════════ */

flow("khoa", "Khoá & mở khoá", "Suất miễn phí · bí mật · 5 bước");

step({
  cap: "Nội dung bị khoá — còn suất miễn phí",
  say: "Một số điểm là nội dung trả phí. Người dùng mới được tặng đúng một suất " +
       "miễn phí, dùng ở đâu là tuỳ họ — nên màn này nói rõ dùng xong là hết.",
  ms: 4600,
  build: function () {
    base(); insideCuao();
    var st = site(CUAO), poi = DB.poi("p-oquanchuong");
    S.overlay = { kind: "locked", poiId: poi.id };
    var bg = MU.mapScreen({
      site: st, center: poi.location, zoom: 18, me: poi.location,
      distLabel: T.insideSite(st.name),
    });
    return screen(bg + renderLocked(), true);
  },
});

step({
  cap: "Đã tiêu suất ở điểm khác",
  say: "Nếu suất miễn phí đã tiêu ở điểm khác, màn này đổi giọng: nói thẳng đã dùng " +
       "cho điểm nào, và điểm này giờ cần mua. Không giấu, không dụ bấm nhầm.",
  ms: 4600,
  build: function () {
    base(); insideCuao();
    var st = site(CUAO), ps = poisOf(CUAO);
    S.freeFirstPoiId = ps[1].id;
    S.overlay = { kind: "locked", poiId: ps[0].id };
    var bg = MU.mapScreen({
      site: st, center: ps[0].location, zoom: 18, me: ps[0].location,
      distLabel: T.insideSite(st.name),
    });
    return screen(bg + renderLocked(), true);
  },
});

step({
  cap: "Mở khoá xong — vào nghe",
  say: "Dùng suất miễn phí xong thì tấm chuyện mở ra bình thường, không khác gì " +
       "nội dung không khoá.",
  ms: 3800,
  tap: { x: 186, y: 600 },
  build: function () {
    base(); insideCuao();
    var r = openStoryAt("p-oquanchuong", 0);
    var b = playFirstBlock(r.story.id, "audio");
    S.freeFirstPoiId = "p-oquanchuong";
    S.audio.playing = true;
    S.audio.pos_s = Math.round((b.duration_s || 60) * 0.2);
    return screen(renderStory(), true);
  },
});

step({
  cap: "Bí mật tự mở ra",
  say: "Lớp thứ hai không liên quan tiền. Hidden Thread ẩn hoàn toàn cho tới khi " +
       "người dùng nghe đủ những câu chuyện tiên quyết — rồi tự bật popup này. " +
       "Đây là phần thưởng cho người đi kỹ, không phải cho người trả nhiều.",
  ms: 5200,
  build: function () {
    base(); insideCuao();
    var st = site(CUAO), poi = DB.poi("p-oquanchuong");
    S.overlay = { kind: "unlock", thread: DB.HIDDEN_THREADS[0] };
    var bg = MU.mapScreen({
      site: st, center: poi.location, zoom: 18, me: poi.location,
      distLabel: T.insideSite(st.name),
    });
    return screen(bg + renderUnlock(), true);
  },
});

step({
  cap: "Hành trình — bí mật đã mở, Series chạy %",
  say: "Bí mật vừa mở nằm lại trong Hành trình. Series thì ngược lại: hiện sẵn từ " +
       "đầu kèm thanh phần trăm, để người dùng biết còn thiếu mấy điểm nữa là trọn bộ.",
  ms: 4600,
  build: function () {
    base();
    DB.npcsOfPoi("p-oquanchuong").forEach(function (n) {
      var st = DB.storyOfNpc(n.id);
      E.startStory(st.id); E.completeStory(st.id);
    });
    var th = DB.HIDDEN_THREADS[0];
    if (S.unlockedThreadIds.indexOf(th.id) < 0) S.unlockedThreadIds.push(th.id);
    return screen(renderJourney(), false);
  },
});

/* ═══════════════════════════════════════════════════════════════════════════
   LUỒNG 6 — Quyền & chạy nền
   Phần ít ai xem nhưng quyết định app có hoạt động ngoài đời hay không.
   ═════════════════════════════════════════════════════════════════════════ */

flow("quyen-nen", "Quyền & chạy nền", "Bốn loại quyền · geofence · 4 bước");

step({
  cap: "Bốn loại quyền app cần",
  say: "Không chỉ mỗi quyền vị trí. App còn cần thông báo, cần làm mới trong nền, " +
       "và trên một số máy Android còn phải xin tự khởi động — thiếu cái cuối thì " +
       "hệ thống giết tiến trình và geofence im luôn.",
  ms: 5000,
  build: function () {
    base();
    S.permissions = {
      location: "always", notification: "not_asked",
      background_refresh: "granted", oem_autostart: "denied",
    };
    return screen(renderGenericPermission(), false);
  },
});

step({
  cap: "Từ chối quyền vị trí thì sao",
  say: "Trước đây màn này chết câm — bản đồ hiện ra nhưng không bao giờ có gì xảy " +
       "ra. Giờ nó nói thẳng lý do và cho đường cấp lại quyền ngay tại chỗ.",
  ms: 4600,
  build: function () {
    base();
    S.permissions.location = "denied";
    var st = site(CUAO);
    return screen(MU.mapScreen({
      site: st, center: st.center, zoom: 17, me: st.center, accuracy: 40,
      labels: true, distLabel: T.distanceUnknown(st.name), permCard: T.permDenied,
    }), false);
  },
});

step({
  cap: "Màn khoá — geofence chạy nền",
  say: "Đây mới là cách app được dùng thật: điện thoại trong túi, người ta đi chơi " +
       "bình thường. Đi ngang khu có nội dung thì thông báo tự nổi lên màn khoá.",
  ms: 4800,
  build: function () {
    base(); insideCuao();
    return screen(renderGeofence(), true);
  },
});

step({
  cap: "Văn Miếu — vùng vẽ tay",
  say: "Không phải khu nào cũng tròn. Văn Miếu dùng vùng vẽ tay theo đúng tường " +
       "bao, nên đứng ngoài đường Nguyễn Thái Học sẽ không tính là đã vào khu, dù " +
       "đo theo đường chim bay thì rất gần.",
  ms: 5000,
  build: function () {
    base("t-biada");
    S.activeSiteId = VANMIEU; S.insideSite = true; S.siteDistanceM = 0;
    var st = site(VANMIEU);
    return screen(MU.mapScreen({
      site: st, center: poisOf(VANMIEU)[0].location, zoom: 17, me: poisOf(VANMIEU)[0].location,
      accuracy: 11, showZones: true, labels: true, distLabel: T.insideSite(st.name),
    }), false);
  },
});

/* ═══════════════════════════════════════════════════════════════════════════
   LUỒNG 7 — Mã đối tác (B2B2C)
   Nhập mã đối tác, quét QR / Deep Link, lưu hàng chờ offline & đồng bộ outbox.
   ═════════════════════════════════════════════════════════════════════════ */

flow("partner-code", "Mã đối tác (B2B2C)", "Nhập mã · quét QR · offline · 5 bước");

step({
  cap: "Quét mã QR / Kích hoạt Deep Link",
  say: "Người dùng quét mã QR tại địa điểm đối tác (ví dụ: lễ tân khách sạn) hoặc click " +
       "link B2B2C dạng deep link: https://bonvoye.app.link/abc123?partner_id=hotel_abc&partner_code=ABC2026. " +
       "Hệ điều hành nhận diện và mở thẳng app BonVoye kèm các tham số metadata.",
  ms: 5000,
  build: function () {
    base(); S.topicId = null;
    S.banner = {
      text: "Phát hiện liên kết đối tác: Hotel ABC (Mã: ABC2026) -> Đang khởi động...",
      tone: "info",
      until: S.simNow + 5000
    };
    return screen(renderHome(), false);
  },
});

step({
  cap: "Xác thực & Mở khoá thành công",
  say: "Ngay khi app khởi động, mã 'ABC2026' được trích xuất từ deep link và gửi lên backend để xác thực. " +
       "Backend kiểm tra, ghi nhận attribution cho đối tác (Hotel ABC), mở khoá di tích 'Ô Quan Chưởng' " +
       "và hiển thị popup chúc mừng.",
  ms: 5400,
  build: function () {
    base(); insideCuao();
    var st = site(CUAO), poi = DB.poi("p-oquanchuong");
    S.partnerUnlockedPoiIds = [poi.id];
    S.overlay = {
      kind: "partner_code_success",
      code: "ABC2026",
      partnerName: "Hotel ABC",
      poiName: poi.name
    };
    S.route = "15-partner-code-success";
    S.events = [];
    Engine.log("B2B2C", "Giả lập quét QR Code (Branch.io Deep Link)");
    Engine.log("BRANCH", "Đọc URL: https://bonvoye.app.link/abc123?partner_id=hotel_abc&partner_code=ABC2026");
    Engine.log("BRANCH", "Nhận metadata: partner_id=hotel_abc, partner_code=ABC2026");
    Engine.log("B2B2C", "Mã đối tác 'ABC2026' hợp lệ! Đối tác: Hotel ABC. Đã mở khoá 'Ô Quan Chưởng'.");
    Engine.log("EVENT", "Đã gửi event partner_code_redeemed lên NestJS.");
    var bg = MU.mapScreen({
      site: st, center: poi.location, zoom: 18, me: poi.location,
      distLabel: T.insideSite(st.name),
    });
    return screen(bg + renderPartnerCodeSuccess(), true);
  },
});

step({
  cap: "Khám phá câu chuyện đã mở khoá",
  say: "Sau khi nhấn 'Khám phá ngay', người dùng quay lại giao diện bản đồ. Lúc này di tích 'Ô Quan Chưởng' " +
       "đã được mở khoá hoàn toàn. Khi người dùng tới gần, các NPC sẽ hiện biểu tượng kể chuyện để bắt đầu lắng nghe.",
  ms: 5000,
  build: function () {
    base(); insideCuao();
    var st = site(CUAO), poi = DB.poi("p-oquanchuong");
    S.partnerUnlockedPoiIds = [poi.id];
    S.route = "02-map";
    S.overlay = null;
    S.inRangePoiIds = [poi.id];
    S.inRangeNpcIds = DB.npcsOfPoi(poi.id).map(function (n) { return n.id; });
    var bg = MU.mapScreen({
      site: st, center: poi.location, zoom: 18, me: poi.location,
      distLabel: T.insideSite(st.name), inRangePois: [poi.id], showZones: true, labels: true,
      nearby: poi.id
    });
    return screen(bg, true);
  },
});

step({
  cap: "Nhập mã thủ công (Dự phòng)",
  say: "Nếu không quét mã QR từ bên ngoài, người dùng vẫn có thể truy cập thủ công vào màn hình khóa " +
       "của di tích, sau đó tự tay gõ mã đối tác để xác thực và nhận entitlement tương tự.",
  ms: 5000,
  build: function () {
    base(); insideCuao();
    var st = site(CUAO), poi = DB.poi("p-oquanchuong");
    S.overlay = { kind: "locked", poiId: poi.id };
    var bg = MU.mapScreen({
      site: st, center: poi.location, zoom: 18, me: poi.location,
      distLabel: T.insideSite(st.name),
    });
    return screen(bg + renderLocked(), true);
  },
});

step({
  cap: "Quét mã offline & Đồng bộ outbox",
  say: "Nếu người dùng quét QR khi thiết bị không có mạng, app lưu sự kiện vào SQLite outbox dưới trạng thái 'pending'. " +
       "Khi online trở lại, app tự động đồng bộ gửi event lên NestJS (outbox pattern) và kích hoạt mở khoá trong nền.",
  ms: 5600,
  build: function () {
    base(); insideCuao();
    S.online = true;
    var st = site(CUAO), poi = DB.poi("p-oquanchuong");
    S.partnerUnlockedPoiIds = [poi.id];
    S.outbox = [{
      user_id: "user_test_123",
      partner_id: "hotel_abc",
      code_id: "ABC2026",
      timestamp: Date.now(),
      status: "synced"
    }];
    S.events = [];
    Engine.log("MẠNG", "Mất mạng -> Quét QR -> Lưu SQLite outbox (pending)");
    Engine.log("MẠNG", "Có mạng trở lại");
    Engine.log("SQLITE", "Đang đồng bộ outbox...");
    Engine.log("B2B2C", "Mã đối tác 'ABC2026' hợp lệ! Đã mở khoá 'Ô Quan Chưởng'.");
    Engine.log("EVENT", "Đã gửi event partner_code_redeemed lên NestJS.");
    S.banner = {
      text: "Đã đồng bộ mã đối tác và mở khoá nội dung!",
      tone: "success",
      until: S.simNow + 5000
    };
    var bg = MU.mapScreen({
      site: st, center: poi.location, zoom: 18, me: poi.location,
      distLabel: T.insideSite(st.name),
    });
    return screen(bg, false);
  },
});

/* ═══════════════════════════════════════════════════════════════════════════
   LUỒNG 8 — Khám phá nội dung
   Home → Search → Results → POI detail → unlock/download.
   ═════════════════════════════════════════════════════════════════════════ */

flow("discovery", "Khám phá nội dung", "Tìm kiếm · POI detail · 5 bước");

step({
  cap: "Tìm kiếm — Gợi ý cho bạn",
  say: "Thay vì chỉ chờ GPS, người dùng có thể chủ động duyệt nội dung theo thành phố, chủ đề hoặc tên di tích.",
  ms: 4200,
  build: function () { base(); S.selectedPoiId = "p-oquanchuong"; return renderSearch(); },
});
step({
  cap: "Kết quả tìm kiếm",
  say: "Kết quả dùng chung cây nội dung của app: điểm dừng, người kể và câu chuyện đều dẫn về cùng một POI detail.",
  ms: 4200,
  build: function () { base(); S.selectedPoiId = "p-oquanchuong"; return renderSearchResults(); },
});
step({
  cap: "POI detail — có thể khám phá",
  say: "POI detail gom tóm tắt, thời lượng, người kể và trạng thái tải vào một chỗ trước khi người dùng ra đường.",
  ms: 4600,
  build: function () { base(); return renderPoiDetail(); },
});
step({
  cap: "POI detail — nội dung bị khoá",
  say: "Nếu nội dung yêu cầu entitlement, người dùng vẫn xem được giá trị của điểm đến trước khi quyết định mở khoá.",
  ms: 4400,
  build: function () { base(); return renderPoiDetailLocked(); },
});
step({
  cap: "Mở gói hoặc tải offline",
  say: "Từ POI detail, người dùng đi thẳng sang mở khoá hoặc tải gói offline; hai hành động này không bị trộn vào màn bản đồ.",
  ms: 4200,
  build: function () { base(); return renderOffers(); },
});

/* ═══════════════════════════════════════════════════════════════════════════
   LUỒNG 9 — Mua và khôi phục
   ═════════════════════════════════════════════════════════════════════════ */

flow("commerce", "Mua và khôi phục nội dung", "Offers · IAP mock · restore · 5 bước");
step({
  cap: "Chọn gói nội dung",
  say: "Các gói POI, tuyến, thành phố và hội viên được trình bày cùng một component option nhưng lấy dữ liệu từ config.",
  ms: 4200,
  build: function () { base(); return renderOffers(); },
});
step({
  cap: "Đang xác nhận giao dịch",
  say: "Prototype chỉ mô phỏng trạng thái chờ receipt validation; không giả vờ dựng lại màn system của Apple hoặc Google.",
  ms: 4200,
  build: function () { base(); return renderPurchaseProcessing(); },
});
step({
  cap: "Mua thành công",
  say: "Sau khi backend xác nhận, entitlement được cấp và người dùng có đường đi rõ ràng tới tải offline hoặc khám phá.",
  ms: 4200,
  build: function () { base(); return renderPurchaseSuccess(); },
});
step({
  cap: "Khôi phục giao dịch",
  say: "Khi đổi máy hoặc cài lại app, restore là một luồng riêng, không phải mua lại.",
  ms: 4200,
  build: function () { base(); return renderRestore(); },
});
step({
  cap: "Khôi phục thành công",
  say: "Quyền cũ quay lại mà không làm thay đổi progress đã lưu.",
  ms: 4200,
  build: function () { base(); return renderRestoreSuccess(); },
});

/* ═══════════════════════════════════════════════════════════════════════════
   LUỒNG 10 — Trip Planner
   ═════════════════════════════════════════════════════════════════════════ */

flow("planner", "Lên lịch một chuyến đi", "Chọn điểm · thời lượng · chỉnh tuyến · 5 bước");
step({
  cap: "Chọn các điểm muốn ghé",
  say: "Trip Planner khác với Hành trình: đây là lúc lập kế hoạch, chưa phải danh sách nội dung đã hoàn thành.",
  ms: 4200,
  build: function () { base(); return renderTripSelect(); },
});
step({
  cap: "Chọn thời lượng và cách đi",
  say: "Người dùng chọn một khoảng thời gian đơn giản và cách đi, không cần cấu hình route optimization phức tạp.",
  ms: 4200,
  build: function () { base(); return renderTripDuration(); },
});
step({
  cap: "Tuyến gợi ý",
  say: "BonVoye xếp thứ tự các POI, hiển thị tổng thời lượng và bản đồ tuyến để người dùng kiểm tra nhanh.",
  ms: 4200,
  build: function () { base(); return renderTripGenerated(); },
});
step({
  cap: "Chỉnh tuyến thủ công",
  say: "Người dùng có thể đổi thứ tự hoặc bỏ một điểm mà không cần tạo lại toàn bộ hành trình.",
  ms: 4200,
  build: function () { base(); return renderTripEdit(); },
});
step({
  cap: "Đã lưu hành trình",
  say: "Sau khi lưu, hành trình có thể mở trên bản đồ hoặc xem lại trong tab Hành trình.",
  ms: 4200,
  build: function () { base(); return renderTripSaved(); },
});

/* ── 2 · Trình chiếu ──────────────────────────────────────────────────────── */

var fi = 0;              // chỉ số luồng
var si = 0;              // chỉ số bước trong luồng
var playing = false;
var chain = false;       // phát liên tục qua hết các luồng
var timer = null;
var muted = false;       // đang khoá cập nhật hash (tránh vòng lặp hashchange)

function curFlow() { return FLOWS[fi]; }
function curStep() { return curFlow().steps[si]; }
function totalSteps() { return curFlow().steps.length; }

var el = {};
["flows", "screen", "device", "bar", "count", "cap", "say", "list",
 "title", "prev", "next", "play", "all", "rec", "burn"].forEach(function (k) {
  el[k] = document.getElementById("fl-" + k);
});
var root = document.getElementById("fl");

/* --- vẽ một bước --------------------------------------------------------- */

function paint() {
  var st = curStep();
  var html;
  try {
    html = st.build();
  } catch (err) {
    html = '<div class="body" style="padding:24px"><p class="p" style="color:#c0392b">' +
      "Lỗi dựng bước: " + (err && err.message ? err.message : String(err)) + "</p></div>";
    // eslint-disable-next-line no-console
    console.error("[flow] " + curFlow().id + " · bước " + (si + 1) + " — " + st.cap, err);
  }
  el.screen.innerHTML = html;

  // gợn sóng chạm — con của `.device`, KHÔNG phải của `.screen`, nên nó nằm
  // ngoài phần app.css quản và vẫn thu nhỏ đúng cùng khung máy
  var old = el.device.querySelector(".fl-tap");
  if (old) old.remove();
  if (st.tap) {
    var tap = document.createElement("div");
    tap.className = "fl-tap";
    tap.style.left = (11 + st.tap.x) + "px";   // 11px = padding của .device
    tap.style.top = (11 + st.tap.y) + "px";
    el.device.appendChild(tap);
  }

  paintChrome();
  syncHash();
}

function paintChrome() {
  var f = curFlow(), st = curStep();

  el.title.innerHTML = "<b>" + f.title + "</b><span>" + f.sub + "</span>";
  el.count.textContent = (si + 1) + " / " + totalSteps();
  el.prev.disabled = fi === 0 && si === 0;
  el.next.disabled = fi === FLOWS.length - 1 && si === totalSteps() - 1;
  el.play.textContent = playing ? "❚❚ Dừng" : "▶ Phát";
  el.all.textContent = (playing && chain) ? "❚❚ Dừng" : "⏩ Phát tất cả";

  el.cap.innerHTML = '<span class="n">' + (si + 1) + "/" + totalSteps() + "</span><b>" +
    st.cap + "</b>";
  el.say.innerHTML = "<p>" + st.say + "</p>";
  el.burn.textContent = st.cap;

  el.bar.innerHTML = "";
  f.steps.forEach(function (_, i) {
    var b = document.createElement("span");
    b.className = i === si ? "on" : (i < si ? "done" : "");
    b.title = "Bước " + (i + 1);
    b.onclick = function () { stop(); si = i; paint(); };
    el.bar.appendChild(b);
  });

  el.list.innerHTML = "";
  f.steps.forEach(function (s2, i) {
    var b = document.createElement("button");
    b.className = i === si ? "on" : "";
    b.innerHTML = "<i>" + (i + 1) + "</i>" + s2.cap;
    b.onclick = function () { stop(); si = i; paint(); };
    el.list.appendChild(b);
  });

  Array.prototype.forEach.call(el.flows.children, function (c, i) {
    c.className = "fl-flow" + (i === fi ? " on" : "");
  });
}

/* --- đi lại giữa các bước ------------------------------------------------ */

function go(d) {
  var ns = si + d;
  if (ns >= 0 && ns < totalSteps()) { si = ns; paint(); return true; }
  // tràn sang luồng kế/trước
  var nf = fi + d;
  if (nf < 0 || nf >= FLOWS.length) return false;
  fi = nf;
  si = d > 0 ? 0 : FLOWS[fi].steps.length - 1;
  paint();
  return true;
}

function atVeryEnd() {
  return si === totalSteps() - 1 && (!chain || fi === FLOWS.length - 1);
}

function tick() {
  clearTimeout(timer);
  if (!playing) return;
  timer = setTimeout(function () {
    if (atVeryEnd()) { if (root.classList.contains("rec")) setRec(false); stop(); return; }
    if (si < totalSteps() - 1) { si++; paint(); }
    else { fi++; si = 0; paint(); }
    tick();
  }, (curStep().ms || DEFAULT_MS));
}

function play(withChain) {
  chain = !!withChain;
  if (atVeryEnd()) { si = 0; if (chain) fi = 0; paint(); }
  playing = true;
  paintChrome();
  tick();
}

function stop() {
  playing = false;
  chain = false;
  clearTimeout(timer);
  paintChrome();
}

function toggle(withChain) { playing ? stop() : play(withChain); }

function goFlow(i) {
  stop();
  fi = i; si = 0;
  paint();
}

/* --- chế độ ghi hình ----------------------------------------------------- */

function setRec(on) {
  root.classList.toggle("rec", on);
  el.rec.textContent = on ? "● Đang ghi hình" : "● Ghi hình";
}
function toggleRec() { setRec(!root.classList.contains("rec")); }
function toggleBurn() { root.classList.toggle("burn"); }

/* --- deep link ----------------------------------------------------------- */

function syncHash() {
  muted = true;
  var h = "#f=" + curFlow().id + "&s=" + (si + 1);
  if (root.classList.contains("rec")) h += "&rec";
  if (location.hash !== h) location.replace(h);
  setTimeout(function () { muted = false; }, 0);
}

function readHash() {
  var h = location.hash || "";
  var mf = /[#&]f=([\w-]+)/.exec(h);
  var ms = /[#&]s=(\d+)/.exec(h);
  if (mf) {
    for (var i = 0; i < FLOWS.length; i++) if (FLOWS[i].id === mf[1]) { fi = i; break; }
  }
  si = 0;
  if (ms) {
    var n = parseInt(ms[1], 10) - 1;
    if (n >= 0 && n < totalSteps()) si = n;
  }
  if (/[#&]rec/.test(h) || /[?&]rec/.test(location.search)) setRec(true);
}

/* --- bàn phím ------------------------------------------------------------ */

document.addEventListener("keydown", function (e) {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  var k = e.key;
  if (k === "ArrowRight") { stop(); go(1); e.preventDefault(); }
  else if (k === "ArrowLeft") { stop(); go(-1); e.preventDefault(); }
  else if (k === " ") { toggle(e.shiftKey); e.preventDefault(); }
  else if (k === "r" || k === "R") { toggleRec(); }
  else if (k === "c" || k === "C") { toggleBurn(); }
  else if (k === "Home") { stop(); si = 0; paint(); }
  else if (k === "End") { stop(); si = totalSteps() - 1; paint(); }
  else if (k >= "1" && k <= "9") {
    var i = parseInt(k, 10) - 1;
    if (i < FLOWS.length) goFlow(i);
  }
});

/* Chạm vào khung = bước tiếp; tiện khi quay bằng chuột, khỏi với tay lên bàn phím.
 *
 * Bắt ở pha CAPTURE rồi chặn luôn: các màn do `ui.js` dựng có sẵn `onclick` inline
 * (đóng overlay, đổi `S.route`, gọi `E.notify()`…). Ở bản chạy thật thì đúng, nhưng
 * tại đây mỗi bước là một trạng thái dựng sẵn — để chúng chạy thì trạng thái bị sửa
 * giữa chừng và bước sau dựng ra sai. Chặn ở capture giúp click không bao giờ tới
 * được handler bên trong. */
el.device.addEventListener("click", function (e) {
  e.stopPropagation();
  e.preventDefault();
  stop();
  go(1);
}, true);

/* --- nút bấm ------------------------------------------------------------- */

el.prev.onclick = function () { stop(); go(-1); };
el.next.onclick = function () { stop(); go(1); };
el.play.onclick = function (e) { toggle(e.shiftKey); };
el.all.onclick = function () { (playing && chain) ? stop() : play(true); };
el.rec.onclick = toggleRec;

window.addEventListener("hashchange", function () {
  if (muted) return;
  stop();
  readHash();
  paint();
});

/* --- nạp trước ảnh tile --------------------------------------------------- */

/* Dựng thử toàn bộ bước một lần vào một nút ẩn: trình duyệt sẽ tải hết ảnh tile
 * OSM và giữ trong cache. Không có bước này thì lúc phát tự động sẽ quay được cả
 * cảnh bản đồ đang vẽ dở — nhìn như app lag, trong khi chỉ là ảnh chưa về.
 * Dựng xong phải vẽ lại bước hiện tại, vì mỗi build() có ghi đè trạng thái `S`. */
function preload() {
  var box = document.createElement("div");
  box.setAttribute("aria-hidden", "true");
  box.style.cssText = "position:fixed;left:-99999px;top:0;width:393px;height:852px;overflow:hidden;opacity:0;pointer-events:none";
  var buf = "";
  FLOWS.forEach(function (f) {
    f.steps.forEach(function (s2) {
      try { buf += '<div class="screen">' + s2.build() + "</div>"; } catch (err) { /* bước lỗi đã báo lúc vẽ thật */ }
    });
  });
  box.innerHTML = buf;
  document.body.appendChild(box);
  // giữ đủ lâu cho ảnh về cache rồi dọn, khỏi ôm ~36 màn DOM suốt phiên
  setTimeout(function () { box.remove(); }, 45000);
}

/* --- khởi động ----------------------------------------------------------- */

FLOWS.forEach(function (f, i) {
  var b = document.createElement("button");
  b.className = "fl-flow";
  b.innerHTML = "<i>" + (i + 1) + "</i><span><b>" + f.title + "</b><em>" + f.sub + "</em></span>";
  b.onclick = function () { goFlow(i); };
  el.flows.appendChild(b);
});

preload();
readHash();
paint();

// eslint-disable-next-line no-console
console.log("[flow] " + FLOWS.length + " luồng · " +
  FLOWS.reduce(function (n, f) { return n + f.steps.length; }, 0) + " bước");

})();
