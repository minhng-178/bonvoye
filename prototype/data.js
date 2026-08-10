/* =============================================================================
   BonVoye — App Core Prototype · data.js
   Nội dung mock + hằng số. KHÔNG phải nội dung production.

   Cây 8 cấp theo `docs/final-summary.md` §2:
     Country → City → Topic → KHU (Site) → POI → NPC → Story → Hidden Thread
   Topic ↔ Site là N↔N. Artwork gắn ở cấp Site (final-summary §2).
   ========================================================================== */

/* -----------------------------------------------------------------------------
   HẰNG SỐ — nguồn duy nhất. Mọi giá trị lấy từ `docs/app-core-text-diagram.md`
   PHẦN 11. ĐỪNG đổi ở đây mà không cập nhật tài liệu (và ngược lại).
   -------------------------------------------------------------------------- */
const CONSTANTS = {
  // ── Proximity ───────────────────────────────────────────────────────────
  NPC_PROXIMITY_M: 20, // PHẦN 11 · Hiện tại — model "hôm nay", đo tới TỪNG NPC
  POI_ENTER_RADIUS_M: 25, // CMS PHẦN 12 · mặc định, cấu hình từng POI
  POI_EXIT_RADIUS_M: 35, // CMS PHẦN 12 · LUÔN > bán kính vào (hysteresis)
  POI_DWELL_S: 3, // CMS PHẦN 12 · phải liên tục mới tính
  POI_AREA_BUFFER_M: 15, // CMS PHẦN 12 · nới thêm khi POI dùng vẽ vùng

  // ── Fake GPS (PHẦN 4–5) ─────────────────────────────────────────────────
  FAKE_DRAG_LIMIT_M: 300, // PHẦN 11 · Đề xuất — chốt 27/7 · đo từ GPS THỰC
  FAKE_POLY_MARGIN_M: 50, // PHẦN 4 · biên độ cộng vào kích thước vùng đã vẽ
  FAKE_ARRIVED_M: 50, // PHẦN 11 · Đề xuất — chốt 27/7 · KHÁC 20m ở trên
  FAKE_EXPIRY_MS: 15 * 60 * 1000, // PHẦN 11 · 15 phút
  FAKE_GOOD_SIGNAL_BUFFER_MS: 60 * 1000, // PHẦN 11 · 60 giây

  // ── Offline (PHẦN 9b · Technical Design §5) ─────────────────────────────
  PKG_FULL_MB: 150, // PHẦN 11 · ~150 MB
  PKG_AUDIO_MB: 20, // PHẦN 11 · ~20 MB
  OFFLINE_ZOOM_RANGE: [11, 19], // PHẦN 11 · cấu hình theo city
  MAPBOX_TILEPACK_CAP: 750, // PHẦN 11 · RỦI RO — xem PHẦN 9b
  DEVICE_STORAGE_MB: 2048, // giả lập quota để demo đồng hồ dung lượng

  // ── Ngôn ngữ (PHẦN 1) ───────────────────────────────────────────────────
  LANGUAGES: ["vi", "en", "zh"],
  LANG_FALLBACK: "vi", // PHẦN 1 · thiếu bản dịch thì luôn về "vi"

  // ── Giả lập GPS ─────────────────────────────────────────────────────────
  GPS_ACCURACY_GOOD_M: 12, // ngưỡng coi tín hiệu là "tốt" (điều kiện 4)
  GPS_ACCURACY_NOISY_M: 45, // sai số thực địa ≥30m (final-summary §4)
  TICK_MS: 250, // nhịp vòng lặp mô phỏng
};

/* -----------------------------------------------------------------------------
   CẤP 1–2 — Country / City
   -------------------------------------------------------------------------- */
const COUNTRIES = [
  { id: "vn", name: "Việt Nam", cityIds: ["hn", "hue"] },
];

const CITIES = [
  {
    id: "hn",
    name: "Hà Nội",
    center: { lat: 21.0329, lng: 105.8441 },
    topicIds: ["t-phoco", "t-biada"],
    available: true,
  },
  {
    id: "hue",
    name: "Huế",
    center: { lat: 16.4637, lng: 107.5909 },
    topicIds: [],
    available: false, // demo trạng thái "sắp có"
  },
];

/* -----------------------------------------------------------------------------
   CẤP 3 — Topic. Nối N↔N với KHU (final-summary §2).
   `overlay_corners` = 4 góc cho Mapbox; `display_area` chỉ CMS dùng (PHẦN 6b).
   -------------------------------------------------------------------------- */
const TOPICS = [
  {
    id: "t-phoco",
    name: "36 phố phường",
    tagline: "Cửa ô, phố nghề và những người giữ nếp",
    siteIds: ["s-cuao", "s-bachma"],
    overlay_opacity: 0.35,
    poiCount: 4,
    minutes: 75,
  },
  {
    id: "t-biada",
    name: "Ngàn năm bia đá",
    tagline: "Đường học, bia tiến sĩ và giếng trời",
    siteIds: ["s-vanmieu", "s-bachma"], // s-bachma thuộc CẢ HAI topic → N↔N
    overlay_opacity: 0.35,
    poiCount: 4,
    minutes: 90,
  },
];

/* -----------------------------------------------------------------------------
   CẤP 4 — KHU (Site). Artwork gắn Ở ĐÂY, nhiều POI dùng chung một tranh
   (PHẦN 6b). `geofence` = tầng 1 của kích hoạt 2 tầng (final-summary §8 mục 2).

   artwork.calibration: ≥3 cặp điểm (Technical Design §8.2). CMS PHẦN 12 khuyên
   5–6 điểm vì 3 điểm thì không kiểm tra chéo được. Prototype KHÔNG dùng ma trận
   này lúc chạy — chỉ hiển thị để review; app đọc thẳng artwork_position đã lưu.
   -------------------------------------------------------------------------- */
const SITES = [
  {
    id: "s-cuao",
    name: "Khu Cửa Ô Đông Hà",
    center: { lat: 21.0364, lng: 105.8529 },
    geofence: { mode: "radius", radius_m: 320 }, // tầng 1 — thô, cấp KHU
    poiIds: ["p-oquanchuong", "p-hangchieu", "p-dongxuan"],
    artwork: {
      id: "aw-cuao",
      style: "phoco", // renderer chọn bộ hình
      viewBox: { w: 1000, h: 1340 },
      opacity_default: 1.0, // PHẦN 6b · đọc từ CMS, không hard-code
      // Admin chấm mốc ở CHÂN từng công trình đã nhận ra được trên tranh.
      calibration: [
        { artwork: { x: 836, y: 736 }, gps: { lat: 21.0362, lng: 105.8543 } },
        { artwork: { x: 622, y: 686 }, gps: { lat: 21.03612, lng: 105.85265 } },
        { artwork: { x: 146, y: 646 }, gps: { lat: 21.0367, lng: 105.8497 } },
        { artwork: { x: 470, y: 700 }, gps: { lat: 21.03608, lng: 105.85198 } },
        { artwork: { x: 884, y: 748 }, gps: { lat: 21.03616, lng: 105.85446 } },
      ],
    },
  },
  {
    id: "s-vanmieu",
    name: "Văn Miếu – Quốc Tử Giám",
    center: { lat: 21.02865, lng: 105.8356 },
    // ~350 × 120 m — ca "hình dài, tròn không khớp" ở CMS PHẦN 5.
    // Đây cũng là ca làm vỡ trần kéo 300m của PHẦN 4 (đường chéo ~369m).
    geofence: {
      mode: "polygon",
      area_buffer_m: CONSTANTS.POI_AREA_BUFFER_M,
      polygon: [
        { lat: 21.03014, lng: 105.83505 },
        { lat: 21.03014, lng: 105.83617 },
        { lat: 21.027, lng: 105.83617 },
        { lat: 21.027, lng: 105.83505 },
      ],
    },
    poiIds: ["p-khuevangac", "p-biatiensi", "p-thienquang"],
    artwork: {
      id: "aw-vanmieu",
      style: "vanmieu",
      viewBox: { w: 1000, h: 1340 },
      opacity_default: 0.92,
      // ⚠ Ba mốc trên trục thần đạo gần như THẲNG HÀNG (cùng lng ~105.8356) —
      // đúng ca "mốc dồn gần 1 đường" mà CMS PHẦN 4 cảnh báo (h/D < 10%). Phải
      // thêm 2 mốc ở góc tường bao mới giải được phép biến đổi theo trục Đông–Tây.
      calibration: [
        { artwork: { x: 500, y: 640 }, gps: { lat: 21.02855, lng: 105.8356 } },
        { artwork: { x: 500, y: 512 }, gps: { lat: 21.029, lng: 105.83558 } },
        { artwork: { x: 500, y: 780 }, gps: { lat: 21.0283, lng: 105.83562 } },
        { artwork: { x: 348, y: 200 }, gps: { lat: 21.03014, lng: 105.83505 } },
        { artwork: { x: 652, y: 1156 }, gps: { lat: 21.027, lng: 105.83617 } },
      ],
    },
  },
  {
    id: "s-bachma",
    name: "Đền Bạch Mã",
    center: { lat: 21.035, lng: 105.8515 },
    geofence: { mode: "radius", radius_m: 120 },
    poiIds: ["p-bachma"],
    artwork: {
      id: "aw-bachma",
      style: "den",
      viewBox: { w: 1000, h: 1340 },
      opacity_default: 1.0,
      calibration: [
        { artwork: { x: 500, y: 700 }, gps: { lat: 21.035, lng: 105.8515 } },
        { artwork: { x: 406, y: 570 }, gps: { lat: 21.0353, lng: 105.8512 } },
        { artwork: { x: 600, y: 778 }, gps: { lat: 21.0347, lng: 105.8518 } },
      ],
    },
  },
];

/* -----------------------------------------------------------------------------
   CẤP 5 — POI (thành phần/điểm dừng chân trong KHU — final-summary §2).

   interaction: hai chế độ theo CMS PHẦN 5 — tiêu chí là HÌNH DẠNG, không phải
   kích thước (tỉ lệ dài/rộng < 2 → bán kính, ngược lại → vẽ vùng).
   entitlement: free | free_first_choice | purchased | locked  (TD §10)
   -------------------------------------------------------------------------- */
const POIS = [
  {
    id: "p-oquanchuong",
    siteId: "s-cuao",
    name: "Ô Quan Chưởng",
    subtitle: "Cửa ô duy nhất còn lại của Thăng Long",
    location: { lat: 21.0362, lng: 105.8543 },
    // px trên tranh — CHÂN công trình (CMS PHẦN 13). Giá trị do "admin căn tay":
    // gần phép chiếu affine từ GPS nhưng LỆCH có chủ ý (tranh vẽ tay không đúng
    // tỉ lệ). App đọc thẳng giá trị này, KHÔNG suy từ GPS lúc chạy (PHẦN 6b).
    artwork_position: { x: 836, y: 736 }, // chiếu từ GPS ra (864,699)
    interaction: {
      mode: "radius",
      enter_radius_m: CONSTANTS.POI_ENTER_RADIUS_M,
      exit_radius_m: CONSTANTS.POI_EXIT_RADIUS_M,
      dwell_s: CONSTANTS.POI_DWELL_S,
    },
    npcIds: ["n-baket", "n-linhcanh"],
    entitlement: "free_first_choice", // free-first-POI · user tự chọn (TD §10)
    version: 7,
    pkg: { fullMB: 150, audioMB: 20 },
  },
  {
    id: "p-hangchieu",
    siteId: "s-cuao",
    name: "Phố Hàng Chiếu",
    subtitle: "Phố nghề chiếu cói, dài hơn 300 mét",
    location: { lat: 21.03612, lng: 105.85265 }, // tâm — vẫn giữ dù dùng vùng
    artwork_position: { x: 622, y: 686 }, // chiếu từ GPS ra (593,713)
    // Dài ~300m, rộng ~20m → tỉ lệ 15 ≫ 2 → phải vẽ vùng (CMS PHẦN 5)
    interaction: {
      mode: "polygon",
      area_buffer_m: CONSTANTS.POI_AREA_BUFFER_M,
      polygon: [
        { lat: 21.03621, lng: 105.85408 },
        { lat: 21.03621, lng: 105.85125 },
        { lat: 21.03603, lng: 105.85122 },
        { lat: 21.03603, lng: 105.85405 },
      ],
    },
    npcIds: ["n-batchieu", "n-thoren"],
    entitlement: "free_first_choice",
    version: 3,
    pkg: { fullMB: 132, audioMB: 18 },
  },
  {
    id: "p-dongxuan",
    siteId: "s-cuao",
    name: "Chợ Đồng Xuân",
    subtitle: "Cái chợ lớn nhất phố cổ",
    location: { lat: 21.0367, lng: 105.8497 },
    artwork_position: { x: 146, y: 646 }, // chiếu từ GPS ra (110,611)
    interaction: {
      mode: "radius",
      enter_radius_m: 40, // cấu hình riêng: chợ rộng, GPS trong nhà kém
      exit_radius_m: 55,
      dwell_s: 3,
    },
    npcIds: ["n-bahang"],
    entitlement: "locked",
    version: 2,
    pkg: { fullMB: 168, audioMB: 22 },
  },
  {
    id: "p-khuevangac",
    siteId: "s-vanmieu",
    name: "Khuê Văn Các",
    subtitle: "Gác sao Khuê — biểu tượng của Hà Nội",
    location: { lat: 21.02855, lng: 105.8356 },
    artwork_position: { x: 500, y: 640 }, // chiếu từ GPS ra (497,676)
    interaction: {
      mode: "radius",
      enter_radius_m: 25,
      exit_radius_m: 35,
      dwell_s: 3,
    },
    npcIds: ["n-nhosinh", "n-cuthu"],
    entitlement: "purchased",
    version: 5,
    pkg: { fullMB: 154, audioMB: 21 },
  },
  {
    id: "p-biatiensi",
    siteId: "s-vanmieu",
    name: "Bia Tiến sĩ",
    subtitle: "82 bia đá, 82 khoa thi",
    location: { lat: 21.029, lng: 105.83558 },
    artwork_position: { x: 500, y: 512 }, // chiếu từ GPS ra (492,539)
    interaction: {
      mode: "radius",
      enter_radius_m: 25,
      exit_radius_m: 35,
      dwell_s: 3,
    },
    npcIds: ["n-nguoichepbia"],
    entitlement: "purchased",
    version: 5,
    pkg: { fullMB: 147, audioMB: 19 },
  },
  {
    id: "p-thienquang",
    siteId: "s-vanmieu",
    name: "Giếng Thiên Quang",
    subtitle: "Giếng soi ánh sáng trời",
    location: { lat: 21.0283, lng: 105.83562 },
    artwork_position: { x: 500, y: 780 }, // chiếu từ GPS ra (503,752)
    interaction: {
      mode: "radius",
      enter_radius_m: 25,
      exit_radius_m: 35,
      dwell_s: 3,
    },
    npcIds: ["n-nguoiquetla"],
    entitlement: "purchased",
    version: 4,
    pkg: { fullMB: 139, audioMB: 18 },
  },
  {
    id: "p-bachma",
    siteId: "s-bachma",
    name: "Đền Bạch Mã",
    subtitle: "Đền trấn phía Đông kinh thành",
    location: { lat: 21.035, lng: 105.8515 },
    artwork_position: { x: 500, y: 700 }, // chiếu từ GPS ra (500,670)
    interaction: {
      mode: "radius",
      enter_radius_m: 25,
      exit_radius_m: 35,
      dwell_s: 3,
    },
    npcIds: ["n-ongtu"],
    entitlement: "locked",
    version: 1,
    pkg: { fullMB: 121, audioMB: 16 },
  },
];

/* -----------------------------------------------------------------------------
   CẤP 6 — NPC.
   · artwork_position = px TRÊN TRANH, chấm ở CHÂN (CMS PHẦN 13)
   · location        = GPS thật, dùng cho geofence — KHÔNG suy ra từ px
   · artwork_scale   = CMS PHẦN 13: khối nhà chênh 34–183px (hơn 5 lần) nên NPC
                       cạnh tháp phải to hơn NPC cạnh chuông lâu
   -------------------------------------------------------------------------- */
const NPCS = [
  {
    id: "n-baket",
    poiId: "p-oquanchuong",
    name: "Bà Kết",
    role: "Bán nước chè chân cổng",
    avatar: "tea",
    location: { lat: 21.03622, lng: 105.85428 },
    artwork_position: { x: 812, y: 744 },
    artwork_scale: 1.0,
    storyId: "st-baket",
  },
  {
    id: "n-linhcanh",
    poiId: "p-oquanchuong",
    name: "Lính canh cửa ô",
    role: "Giữ cổng năm 1882",
    avatar: "guard",
    location: { lat: 21.03619, lng: 105.85434 },
    artwork_position: { x: 866, y: 722 },
    artwork_scale: 1.4, // đứng cạnh vọng lâu cao → vẽ to hơn
    storyId: "st-linhcanh",
  },
  {
    id: "n-batchieu",
    poiId: "p-hangchieu",
    name: "Ông Bảy dệt chiếu",
    role: "Nghề chiếu cói ba đời",
    avatar: "weaver",
    location: { lat: 21.03614, lng: 105.85302 },
    artwork_position: { x: 648, y: 676 },
    artwork_scale: 0.9,
    storyId: "st-batchieu",
  },
  {
    id: "n-thoren",
    poiId: "p-hangchieu",
    name: "Chú thợ rèn",
    role: "Lò rèn cuối phố",
    avatar: "smith",
    location: { lat: 21.03608, lng: 105.85198 },
    artwork_position: { x: 470, y: 700 },
    artwork_scale: 0.75, // nhà thấp, xa → nhỏ hơn
    storyId: "st-thoren",
  },
  {
    id: "n-bahang",
    poiId: "p-dongxuan",
    name: "Bà hàng xén",
    role: "Sạp góc chợ",
    avatar: "vendor",
    location: { lat: 21.03668, lng: 105.84974 },
    artwork_position: { x: 128, y: 660 },
    artwork_scale: 1.0,
    storyId: "st-bahang",
  },
  {
    id: "n-nhosinh",
    poiId: "p-khuevangac",
    name: "Nho sinh Đặng",
    role: "Chờ yết bảng",
    avatar: "student",
    location: { lat: 21.02857, lng: 105.83556 },
    artwork_position: { x: 474, y: 648 },
    artwork_scale: 1.0,
    storyId: "st-nhosinh",
  },
  {
    id: "n-cuthu",
    poiId: "p-khuevangac",
    name: "Cụ thủ từ",
    role: "Trông gác sao Khuê",
    avatar: "elder",
    location: { lat: 21.02853, lng: 105.83564 },
    artwork_position: { x: 528, y: 656 },
    artwork_scale: 1.25,
    storyId: "st-cuthu",
  },
  {
    id: "n-nguoichepbia",
    poiId: "p-biatiensi",
    name: "Người chép bia",
    role: "Khắc tên khoa thi",
    avatar: "scribe",
    location: { lat: 21.02901, lng: 105.83556 },
    artwork_position: { x: 500, y: 520 },
    artwork_scale: 1.0,
    storyId: "st-chepbia",
  },
  {
    id: "n-nguoiquetla",
    poiId: "p-thienquang",
    name: "Người quét lá",
    role: "Giữ mặt giếng trong",
    avatar: "sweeper",
    location: { lat: 21.02831, lng: 105.83558 },
    artwork_position: { x: 496, y: 786 },
    artwork_scale: 0.85,
    storyId: "st-quetla",
  },
  {
    id: "n-ongtu",
    poiId: "p-bachma",
    name: "Ông từ đền",
    role: "Coi hương khói",
    avatar: "elder",
    location: { lat: 21.03502, lng: 105.85148 },
    artwork_position: { x: 486, y: 692 },
    artwork_scale: 1.0,
    storyId: "st-ongtu",
  },
];

/* -----------------------------------------------------------------------------
   Nhãn di tích trên tranh — CMS PHẦN 6.
   Có `artwork_position` RIÊNG và `anchor`, để nhãn không đè lên tranh vẽ tay
   (PHẦN 6b: "tranh là thứ khách hàng đầu tư nhiều nhất — che mất là mất giá
   trị chính").
   -------------------------------------------------------------------------- */
const POI_LABELS = [
  { siteId: "s-cuao", text: "Ô Quan Chưởng", pos: { x: 836, y: 762 }, anchor: "bottom", kind: "poi" },
  { siteId: "s-cuao", text: "Phố Hàng Chiếu", pos: { x: 580, y: 668 }, anchor: "left", kind: "poi" },
  { siteId: "s-cuao", text: "Chợ Đồng Xuân", pos: { x: 146, y: 578 }, anchor: "top", kind: "poi" },
  { siteId: "s-cuao", text: "Phố Thanh Hà", pos: { x: 640, y: 940 }, anchor: "right", kind: "street" },
  { siteId: "s-cuao", text: "Sông Hồng", pos: { x: 900, y: 1120 }, anchor: "right", kind: "water" },
  { siteId: "s-cuao", text: "Phố Đào Duy Từ", pos: { x: 300, y: 300 }, anchor: "right", kind: "street" },
  { siteId: "s-vanmieu", text: "Khuê Văn Các", pos: { x: 500, y: 664 }, anchor: "bottom", kind: "poi" },
  { siteId: "s-vanmieu", text: "Bia Tiến sĩ", pos: { x: 500, y: 452 }, anchor: "top", kind: "poi" },
  { siteId: "s-vanmieu", text: "Giếng Thiên Quang", pos: { x: 500, y: 812 }, anchor: "bottom", kind: "poi" },
  { siteId: "s-vanmieu", text: "Phố Quốc Tử Giám", pos: { x: 720, y: 1180 }, anchor: "right", kind: "street" },
  { siteId: "s-vanmieu", text: "Sân Thái Học", pos: { x: 300, y: 240 }, anchor: "right", kind: "street" },
  { siteId: "s-bachma", text: "Đền Bạch Mã", pos: { x: 500, y: 728 }, anchor: "bottom", kind: "poi" },
  { siteId: "s-bachma", text: "Phố Hàng Buồm", pos: { x: 700, y: 1080 }, anchor: "right", kind: "street" },
];

/* -----------------------------------------------------------------------------
   CẤP 7 — Story = danh sách content_block xếp theo `order` (CMS PHẦN 6).

   playable_screen_off (PHẦN 7 · CMS PHẦN 16 mục f):
     audio narration ✓ · nhạc nền ✓ · text ✗ · webtoon ✗ · video ✗
   App chỉ ĐỌC field này — khi user cất máy vào túi thì bỏ qua lớp không nghe
   được và phát tiếp lớp audio kế, thay vì dừng im lặng giữa chừng.
   -------------------------------------------------------------------------- */
const STORIES = [
  {
    id: "st-baket",
    npcId: "n-baket",
    title: "Chén chè dưới vòm cổng",
    duration_s: 214,
    blocks: [
      { order: 1, type: "music", label: "Nhạc nền — đàn nguyệt", duration_s: 214, playable_screen_off: true, loop: true },
      { order: 2, type: "audio", label: "Bà Kết mời chè", duration_s: 62, playable_screen_off: true,
        transcript: "Chú ngồi xuống đây đã. Cái vòm cổng này che mưa cho tôi ba mươi năm rồi, chú tính xem nó che cho bao nhiêu người trước tôi." },
      { order: 3, type: "text", label: "Ghi chú lịch sử", playable_screen_off: false,
        body: "Ô Quan Chưởng dựng năm 1749, sửa lớn năm 1817. Là cửa ô duy nhất trong 16 cửa ô của Thăng Long còn nguyên vòm và vọng lâu." },
      { order: 4, type: "webtoon", label: "Truyện tranh — Buổi chè sớm", playable_screen_off: false,
        pages: [
          { bg: "gate-dawn", caption: "Bốn giờ sáng, cổng còn tối.",
            bubbles: [ { text: "Nước vừa sôi đấy, ngồi xuống đi.", x: 24, y: 16, w: 44, side: "left" } ] },
          { bg: "teahouse-night", caption: "Người gánh hàng đi qua vòm cổng.",
            bubbles: [
              { text: "Hôm nay chè Thanh Minh thơm thật đấy.", x: 12, y: 12, w: 40, side: "left" },
              { text: "Đi thôi, đừng trễ canh ba.", x: 56, y: 24, w: 36, side: "right" },
            ] },
          { bg: "gate-dawn", caption: "Trời sáng dần trên vọng lâu.",
            bubbles: [ { text: "Cổng này đứng lâu hơn cả họ nhà tôi.", x: 30, y: 68, w: 46, side: "left" } ] },
        ] },
      { order: 5, type: "audio", label: "Bà Kết kể tiếp — về cái vọng lâu", duration_s: 88, playable_screen_off: true,
        transcript: "Trên kia có cái gác nhỏ. Ngày xưa lính đứng đấy, nhìn xuống thấy hết ai vào ai ra." },
    ],
  },
  {
    id: "st-linhcanh",
    npcId: "n-linhcanh",
    title: "Phiên gác cuối",
    duration_s: 176,
    blocks: [
      { order: 1, type: "audio", label: "Lính canh — đêm 1882", duration_s: 74, playable_screen_off: true,
        transcript: "Ta gác phiên này từ canh hai. Cửa ô đóng rồi, ai gọi cũng không mở — đấy là lệnh." },
      { order: 2, type: "webtoon", label: "Truyện tranh — Phiên gác cuối", playable_screen_off: false,
        pages: [
          { bg: "gate-night", caption: "Canh hai, cửa ô đã đóng.",
            bubbles: [ { text: "Ai? Đứng lại!", x: 20, y: 20, w: 30, side: "left" } ] },
          { bg: "gate-night", caption: "Ngoài cổng, tiếng gọi không dứt.",
            bubbles: [
              { text: "Mở cho tôi, nhà tôi ở trong kia!", x: 48, y: 14, w: 44, side: "right" },
              { text: "Lệnh là lệnh. Sáng mai hãy về.", x: 10, y: 62, w: 40, side: "left" },
            ] },
        ] },
      { order: 3, type: "text", label: "Ghi chú", playable_screen_off: false,
        body: "Bia đá gắn trên tường cổng năm 1881 ghi lệnh cấm lính canh sách nhiễu người qua lại — do Tổng đốc Hoàng Diệu cho dựng." },
      { order: 4, type: "audio", label: "Kết — sáng hôm sau", duration_s: 58, playable_screen_off: true,
        transcript: "Sáng ra, cửa mở. Người vào người ra như chưa từng có đêm nào." },
    ],
  },
  {
    id: "st-batchieu",
    npcId: "n-batchieu",
    title: "Sợi cói cuối cùng",
    duration_s: 152,
    blocks: [
      { order: 1, type: "audio", label: "Ông Bảy dệt chiếu", duration_s: 96, playable_screen_off: true,
        transcript: "Cả phố này trước dệt chiếu. Giờ còn nhà tôi với nhà bà Tám. Cói bây giờ phải mua từ Ninh Bình." },
      { order: 2, type: "text", label: "Ghi chú", playable_screen_off: false,
        body: "Hàng Chiếu dài khoảng 300m, nối từ Ô Quan Chưởng tới phố Đồng Xuân. Tên phố giữ nghề, dù nghề đã gần hết." },
      { order: 3, type: "audio", label: "Tiếng khung dệt", duration_s: 56, playable_screen_off: true,
        transcript: "(tiếng khung dệt, đều, chậm)" },
    ],
  },
  {
    id: "st-thoren",
    npcId: "n-thoren",
    title: "Lò rèn cuối phố",
    duration_s: 121,
    blocks: [
      { order: 1, type: "audio", label: "Chú thợ rèn", duration_s: 82, playable_screen_off: true,
        transcript: "Tôi rèn dao từ mười bốn tuổi. Bây giờ người ta mua dao Tàu, rẻ hơn. Nhưng dao tôi rèn thì mài được." },
      { order: 2, type: "text", label: "Ghi chú", playable_screen_off: false,
        body: "Cuối phố Hàng Chiếu giáp Thanh Hà từng là chỗ tập trung lò rèn phục vụ cửa ô." },
    ],
  },
  {
    id: "st-bahang",
    npcId: "n-bahang",
    title: "Sạp góc chợ",
    duration_s: 138,
    blocks: [
      { order: 1, type: "audio", label: "Bà hàng xén", duration_s: 90, playable_screen_off: true,
        transcript: "Chợ này cháy năm chín tư. Cháy xong người ta xây lại, nhưng cái mùi cũ thì không xây lại được." },
      { order: 2, type: "text", label: "Ghi chú", playable_screen_off: false,
        body: "Chợ Đồng Xuân xây năm 1889 trên nền ao hồ lấp. Vụ cháy 14/7/1994 thiêu rụi phần lớn khu chợ." },
    ],
  },
  {
    id: "st-nhosinh",
    npcId: "n-nhosinh",
    title: "Chờ yết bảng",
    duration_s: 168,
    blocks: [
      { order: 1, type: "music", label: "Nhạc nền — sáo", duration_s: 168, playable_screen_off: true, loop: true },
      { order: 2, type: "audio", label: "Nho sinh Đặng", duration_s: 84, playable_screen_off: true,
        transcript: "Ba khoa rồi tôi chưa đỗ. Cha tôi bảo thôi về làm ruộng. Nhưng đứng đây, dưới cái gác này, tôi lại muốn thi nữa." },
      { order: 3, type: "webtoon", label: "Truyện tranh — Bảng vàng", playable_screen_off: false,
        pages: [
          { bg: "courtyard-day", caption: "Sân Thái Học, ngày yết bảng.",
            bubbles: [ { text: "Có tên chưa? Có tên chưa?", x: 18, y: 18, w: 38, side: "left" } ] },
          { bg: "courtyard-day", caption: "Bảng dán lên, người chen kín.",
            bubbles: [
              { text: "Đặng… Đặng gì? Đọc to lên!", x: 50, y: 22, w: 40, side: "right" },
              { text: "Không có. Khoa sau.", x: 14, y: 66, w: 34, side: "left" },
            ] },
        ] },
      { order: 4, type: "text", label: "Ghi chú", playable_screen_off: false,
        body: "Khuê Văn Các dựng năm 1805 thời Gia Long. \"Khuê\" là ngôi sao chủ về văn chương." },
    ],
  },
  {
    id: "st-cuthu",
    npcId: "n-cuthu",
    title: "Người quét gác",
    duration_s: 112,
    blocks: [
      { order: 1, type: "audio", label: "Cụ thủ từ", duration_s: 74, playable_screen_off: true,
        transcript: "Tôi quét cái gác này bốn mươi năm. Sao Khuê thì tôi không thấy, nhưng bụi thì thấy hằng ngày." },
      { order: 2, type: "text", label: "Ghi chú", playable_screen_off: false,
        body: "Gác hai tầng tám mái, bốn cửa sổ tròn tượng trưng sao Khuê toả sáng." },
    ],
  },
  {
    id: "st-chepbia",
    npcId: "n-nguoichepbia",
    title: "Tám mươi hai cái tên",
    duration_s: 194,
    blocks: [
      { order: 1, type: "audio", label: "Người chép bia", duration_s: 102, playable_screen_off: true,
        transcript: "Mỗi bia một khoa. Khắc tên xong là hết việc của tôi, còn cái tên thì ở lại đây sáu trăm năm." },
      { order: 2, type: "webtoon", label: "Truyện tranh — Nét khắc", playable_screen_off: false,
        pages: [
          { bg: "stele-dusk", caption: "Vườn bia, cuối chiều.",
            bubbles: [ { text: "Chữ này khắc sâu hơn, để mưa không xoá.", x: 22, y: 20, w: 46, side: "left" } ] },
        ] },
      { order: 3, type: "text", label: "Ghi chú", playable_screen_off: false,
        body: "82 bia tiến sĩ ghi 1.304 người đỗ trong 82 khoa thi từ 1442 đến 1779. UNESCO ghi danh Di sản tư liệu năm 2010." },
      { order: 4, type: "audio", label: "Kết", duration_s: 48, playable_screen_off: true,
        transcript: "Chú đọc thử một cái tên xem. Đọc lên là người ta còn đấy." },
    ],
  },
  {
    id: "st-quetla",
    npcId: "n-nguoiquetla",
    title: "Mặt giếng phải trong",
    duration_s: 96,
    blocks: [
      { order: 1, type: "audio", label: "Người quét lá", duration_s: 68, playable_screen_off: true,
        transcript: "Giếng tên là Thiên Quang — ánh sáng trời. Lá rụng xuống là trời không soi được nữa, nên tôi phải vớt." },
      { order: 2, type: "text", label: "Ghi chú", playable_screen_off: false,
        body: "Giếng Thiên Quang hình vuông, nằm giữa trục thần đạo, trước Khuê Văn Các." },
    ],
  },
  {
    id: "st-ongtu",
    npcId: "n-ongtu",
    title: "Hương khói đền trấn",
    duration_s: 104,
    blocks: [
      { order: 1, type: "audio", label: "Ông từ đền", duration_s: 72, playable_screen_off: true,
        transcript: "Đền trấn phía Đông. Ba đền kia trấn ba phía. Bốn đền đứng bốn góc, giữ kinh thành ngàn năm." },
      { order: 2, type: "text", label: "Ghi chú", playable_screen_off: false,
        body: "Bạch Mã là một trong Thăng Long tứ trấn, thờ thần Long Đỗ, trấn phía Đông." },
    ],
  },
];

/* -----------------------------------------------------------------------------
   CẤP 8 — Hidden Thread & Series.

   PHẦN 8 tách hai hành vi dù CMS dùng chung một màn nhập liệu:
     hidden_thread · reveal="hidden" → ẩn khỏi map tới khi đủ điều kiện,
                                        mở khoá thì popup 🔒→🔓 (màn 13)
     series        · reveal="visible" → hiện sẵn + thanh tiến trình, tạo động lực
   -------------------------------------------------------------------------- */
const HIDDEN_THREADS = [
  {
    id: "ht-loithe",
    name: "Lời thề dưới cổng thành",
    reveal: "hidden", // PHẦN 8 · ẩn tạo bất ngờ
    // Ẩn trên map tới khi thoả; marker dùng LẠI cơ chế bán kính như POI thường
    location: { lat: 21.03616, lng: 105.85446 },
    artwork_position: { x: 884, y: 748 },
    siteId: "s-cuao",
    requires: { type: "stories_completed", ids: ["st-baket", "st-linhcanh"] },
    blurb: "Hai người kể cùng một đêm mà không ai nhắc tới người kia. Vì sao?",
    duration_s: 132,
  },
  {
    id: "ht-saokhue",
    name: "Ngôi sao không ai thấy",
    reveal: "hidden",
    location: { lat: 21.02858, lng: 105.83552 },
    artwork_position: { x: 462, y: 646 },
    siteId: "s-vanmieu",
    requires: { type: "stories_completed", ids: ["st-nhosinh", "st-cuthu"] },
    blurb: "Cụ thủ từ bảo chưa từng thấy sao Khuê. Nho sinh Đặng thì thấy mỗi đêm.",
    duration_s: 118,
  },
];

const SERIES = [
  {
    id: "sr-cuao",
    name: "Ba cửa ô còn lại",
    reveal: "visible", // PHẦN 8 · hiện sẵn tạo động lực hoàn thành
    blurb: "Đi hết ba điểm quanh cửa ô Đông Hà.",
    items: [
      { ref_type: "poi", ref_id: "p-oquanchuong", is_required: true, sort_order: 1 },
      { ref_type: "poi", ref_id: "p-hangchieu", is_required: true, sort_order: 2 },
      { ref_type: "poi", ref_id: "p-dongxuan", is_required: true, sort_order: 3 },
    ],
  },
  {
    id: "sr-vanmieu",
    name: "Trục thần đạo",
    reveal: "visible",
    blurb: "Giếng → Gác → Vườn bia, đi đúng thứ tự trục chính.",
    items: [
      { ref_type: "poi", ref_id: "p-thienquang", is_required: true, sort_order: 1 },
      { ref_type: "poi", ref_id: "p-khuevangac", is_required: true, sort_order: 2 },
      { ref_type: "poi", ref_id: "p-biatiensi", is_required: true, sort_order: 3 },
      { ref_type: "hidden_thread", ref_id: "ht-saokhue", is_required: false, sort_order: 4 },
    ],
  },
];

/* -----------------------------------------------------------------------------
   Màn 10 — xin quyền GENERIC (PHẦN 9).
   Tham số hoá theo feature_description / permission_name / settings_deeplink.
   MỘT component cho MỌI quyền — không viết riêng từng case.
   -------------------------------------------------------------------------- */
const PERMISSION_REQUESTS = {
  location_always: {
    feature_description: "nhận thông báo khi có NPC gần bạn dù màn hình tắt",
    permission_name: "Vị trí — Luôn cho phép",
    settings_deeplink: "app-settings:location",
    icon: "pin",
  },
  notification: {
    feature_description: "biết ngay khi bạn đi ngang một câu chuyện chưa mở",
    permission_name: "Thông báo",
    settings_deeplink: "app-settings:notifications",
    icon: "bell",
  },
  background_refresh: {
    feature_description: "tiếp tục theo dõi vị trí khi bạn cất máy vào túi",
    permission_name: "Làm mới ứng dụng trong nền",
    settings_deeplink: "app-settings:background",
    icon: "refresh",
  },
  oem_autostart: {
    // Android: từng hãng tự kill background (PHẦN 9 · dontkillmyapp.com)
    feature_description: "app không bị hệ thống tắt khi bạn khoá máy",
    permission_name: "Tự khởi động (Autostart)",
    settings_deeplink: "app-settings:oem-autostart",
    icon: "shield",
    oem_hint: {
      Xiaomi: "Security → Permissions → Autostart → bật BonVoye",
      Oppo: "Cài đặt → Pin → Ứng dụng khoá → thêm BonVoye (chỉ được 5 app)",
      Vivo: "iManager → Quản lý ứng dụng → Chạy nền cao → bật BonVoye",
    },
  },
};

/* -----------------------------------------------------------------------------
   PHẦN 12 — 11 câu hỏi còn ngỏ. Prototype phải chọn giả định cho vài câu;
   Inspector hiện danh sách này để review biết chỗ nào chưa chốt.
   -------------------------------------------------------------------------- */
const OPEN_QUESTIONS = [
  { n: 1, q: "Popup \"đã trả về GPS thật\" là banner nhẹ hay dialog chặn?",
    assumed: "Banner nhẹ, tự tắt sau 6s, không chặn thao tác." },
  { n: 2, q: "Geofence background nằm trong scope Final Pro hay Phase sau?", assumed: null },
  { n: 3, q: "Màn xin quyền generic áp cho quyền nào ngoài Location?",
    assumed: "Dựng 4 case: location_always, notification, background_refresh, oem_autostart." },
  { n: 4, q: "Fake GPS đang bật mà user thật di chuyển — ai thắng?",
    assumed: "Vị trí kéo thắng cho tới khi GPS thật vào vùng tương tác POI (điều kiện 2)." },
  { n: 5, q: "Hidden Thread / Series — user gặp bằng cách nào?",
    assumed: "Hidden Thread ẩn + popup mở khoá; Series hiện sẵn + thanh tiến trình (PHẦN 8)." },
  { n: 6, q: "Chọn ngôn ngữ ở đâu, fallback là gì?",
    assumed: "Control 🌐 trên Home, fallback \"vi\". Prototype chỉ dựng vi (đã chốt)." },
  { n: 7, q: "POI vẽ vùng dài hơn 300m — nới trần kéo riêng không?",
    assumed: "Có: trần = đường chéo vùng + 50m. Văn Miếu → ~419m thay vì 300m." },
  { n: 8, q: "NPC trên tranh scale theo zoom hay giữ cỡ màn hình?",
    assumed: "Giữ cỡ màn hình + dưới zoom 0.75 thì gom thành cụm số lượng." },
  { n: 9, q: "Trần 750 tile pack của Mapbox — gói hiện tại có chạm không?", assumed: null },
  { n: 10, q: "Ngưỡng dung lượng offline tối đa + chính sách dọn dẹp?",
    assumed: "Prototype giả lập quota 2 GB + đồng hồ dung lượng, chưa có policy dọn." },
  { n: 11, q: "Kích thước THẬT của khu di tích trên artwork mẫu là bao nhiêu mét?", assumed: null },
];

/* -------------------------------------------------------------------------- */
const DB = {
  CONSTANTS, COUNTRIES, CITIES, TOPICS, SITES, POIS, NPCS, POI_LABELS,
  STORIES, HIDDEN_THREADS, SERIES, PERMISSION_REQUESTS, OPEN_QUESTIONS,

  poi: (id) => POIS.find((p) => p.id === id),
  npc: (id) => NPCS.find((n) => n.id === id),
  site: (id) => SITES.find((s) => s.id === id),
  topic: (id) => TOPICS.find((t) => t.id === id),
  city: (id) => CITIES.find((c) => c.id === id),
  story: (id) => STORIES.find((s) => s.id === id),
  thread: (id) => HIDDEN_THREADS.find((h) => h.id === id),
  series: (id) => SERIES.find((s) => s.id === id),
  storyOfNpc: (npcId) => STORIES.find((s) => s.npcId === npcId),
  npcsOfPoi: (poiId) => NPCS.filter((n) => n.poiId === poiId),
  poisOfSite: (siteId) => POIS.filter((p) => p.siteId === siteId),
  labelsOfSite: (siteId) => POI_LABELS.filter((l) => l.siteId === siteId),
  threadsOfSite: (siteId) => HIDDEN_THREADS.filter((h) => h.siteId === siteId),
  /** Các KHU thuộc một Topic (N↔N). */
  sitesOfTopic: (topicId) => {
    const t = TOPICS.find((x) => x.id === topicId);
    return t ? t.siteIds.map((id) => SITES.find((s) => s.id === id)).filter(Boolean) : [];
  },
  /** Mọi POI thuộc một Topic, qua các KHU của nó. */
  poisOfTopic: (topicId) =>
    DB.sitesOfTopic(topicId).flatMap((s) => DB.poisOfSite(s.id)),
};

window.DB = DB;
window.CONSTANTS = CONSTANTS;
