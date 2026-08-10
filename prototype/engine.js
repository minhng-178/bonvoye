/* =============================================================================
   BonVoye — App Core Prototype · engine.js

   Ba máy trạng thái chạy thật (đây là lý do prototype dựng bằng code, không
   phải mock tĩnh — `docs/app-core-text-diagram.md` PHẦN 13: "máy trạng thái
   không suy ra được từ mô tả UI đơn thuần"):

     A. Proximity      — 2 model: "hôm nay" (NPC 20m) vs "sau CMS PHẦN 5"
                          (POI 25/35/3s có hysteresis) — PHẦN 6 · TD §8.3b
     B. Fake GPS reset — 4 điều kiện SONG SONG + ngoại lệ audio — PHẦN 4–5
     C. Download       — resume + verify checksum, chỉ ready khi ĐỦ — PHẦN 9b

   Thời gian trong prototype là THỜI GIAN MÔ PHỎNG (`simNow`), tăng theo
   `timeScale` — để ép được mốc 15 phút / buffer 60s mà không phải chờ thật.
   ========================================================================== */

/* ==========================================================================
   0. GEO — mọi phép đo khoảng cách. PHẦN 6b: geofence LUÔN tính bằng
      `location` (GPS), KHÔNG BAO GIỜ bằng px tranh.
   ======================================================================== */
const geo = {
  R: 6371000,

  toRad: (d) => (d * Math.PI) / 180,

  /** Khoảng cách great-circle, mét. */
  haversine(a, b) {
    const dLat = geo.toRad(b.lat - a.lat);
    const dLng = geo.toRad(b.lng - a.lng);
    const la1 = geo.toRad(a.lat);
    const la2 = geo.toRad(b.lat);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
    return 2 * geo.R * Math.asin(Math.sqrt(h));
  },

  /** Chiếu về mét địa phương quanh `origin` (equirectangular — đủ chính xác ở
   *  vài trăm mét, và ta chỉ làm việc trong phạm vi một khu di tích). */
  toLocal(p, origin) {
    const mPerDegLat = 111320;
    const mPerDegLng = 111320 * Math.cos(geo.toRad(origin.lat));
    return {
      x: (p.lng - origin.lng) * mPerDegLng,
      y: (p.lat - origin.lat) * mPerDegLat,
    };
  },

  /** Dịch một toạ độ đi (dEast, dNorth) mét. */
  offset(p, dEast, dNorth) {
    const mPerDegLat = 111320;
    const mPerDegLng = 111320 * Math.cos(geo.toRad(p.lat));
    return { lat: p.lat + dNorth / mPerDegLat, lng: p.lng + dEast / mPerDegLng };
  },

  /** Nội suy từ a về b, tiến `dist` mét. */
  stepToward(a, b, dist) {
    const total = geo.haversine(a, b);
    if (total <= dist || total === 0) return { ...b };
    const t = dist / total;
    return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
  },

  pointInPolygon(p, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i].lng, yi = poly[i].lat;
      const xj = poly[j].lng, yj = poly[j].lat;
      const hit =
        yi > p.lat !== yj > p.lat &&
        p.lng < ((xj - xi) * (p.lat - yi)) / (yj - yi) + xi;
      if (hit) inside = !inside;
    }
    return inside;
  },

  /** 0 nếu trong vùng, ngược lại khoảng cách mét tới cạnh gần nhất. */
  distanceToPolygon(p, poly) {
    if (geo.pointInPolygon(p, poly)) return 0;
    const o = poly[0];
    const P = geo.toLocal(p, o);
    let best = Infinity;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const A = geo.toLocal(poly[j], o);
      const B = geo.toLocal(poly[i], o);
      best = Math.min(best, geo._segDist(P, A, B));
    }
    return best;
  },

  _segDist(P, A, B) {
    const vx = B.x - A.x, vy = B.y - A.y;
    const wx = P.x - A.x, wy = P.y - A.y;
    const len2 = vx * vx + vy * vy;
    let t = len2 === 0 ? 0 : (wx * vx + wy * vy) / len2;
    t = Math.max(0, Math.min(1, t));
    const dx = P.x - (A.x + t * vx);
    const dy = P.y - (A.y + t * vy);
    return Math.sqrt(dx * dx + dy * dy);
  },

  /** Khoảng cách xa nhất giữa 2 đỉnh — dùng cho trần kéo POI polygon (PHẦN 4). */
  polygonDiagonal(poly) {
    let best = 0;
    for (let i = 0; i < poly.length; i++)
      for (let j = i + 1; j < poly.length; j++)
        best = Math.max(best, geo.haversine(poly[i], poly[j]));
    return best;
  },

  polygonCentroid(poly) {
    const lat = poly.reduce((s, p) => s + p.lat, 0) / poly.length;
    const lng = poly.reduce((s, p) => s + p.lng, 0) / poly.length;
    return { lat, lng };
  },
};

/* ==========================================================================
   1. STATE
   ======================================================================== */
const C = window.CONSTANTS;

function initialState() {
  return {
    // ── điều hướng / thiết lập ────────────────────────────────────────────
    route: "01-home",
    lang: "vi", // PHẦN 1 · prototype chỉ dựng "vi" (đã chốt)
    cityId: "hn",
    topicId: null,

    // ── quyền (màn 03 · 10) ──────────────────────────────────────────────
    permissions: {
      location: "not_asked", // not_asked | while_using | always | denied
      notification: "not_asked",
      background_refresh: "granted",
      oem_autostart: "not_asked",
    },

    // ── GPS ──────────────────────────────────────────────────────────────
    gps: {
      mode: "real", // real | faked
      truth: { lat: 21.037, lng: 105.8543 }, // vị trí "thật sự" của người đi
      measured: { lat: 21.037, lng: 105.8543 }, // = truth + nhiễu (app chỉ thấy cái này)
      accuracy_m: C.GPS_ACCURACY_GOOD_M,
      noisy: false,
      walkTarget: null, // đang đi bộ tới đâu (giả lập)

      // trạng thái Fake GPS (PHẦN 4–5)
      fake: null, // {lat,lng} — vị trí đã kéo
      realAnchor: null, // GPS THỰC lúc bắt đầu kéo — trần 300m đo TỪ ĐÂY
      dragLimitM: C.FAKE_DRAG_LIMIT_M,
      fakedAt: null, // simNow lúc vào chế độ kéo (điều kiện 1)
      fakeContextPoiId: null, // POI đang test (điều kiện 3)
      goodSince: null, // buffer 60s (điều kiện 4)
      resetPending: null, // {reason} — bị audio nhịn (ngoại lệ PHẦN 5)
      lastResetReason: null,
    },

    // ── proximity ────────────────────────────────────────────────────────
    proximityModel: "npc20", // npc20 (hôm nay) | poi2535 (sau CMS PHẦN 5)
    activeSiteId: null, // tầng 1 — geofence cấp KHU (final-summary §8 mục 2)
    npcRange: {}, // npcId -> bool     (model npc20)
    poiFsm: {}, // poiId -> {state:'far'|'entering'|'near_confirmed', since}
    inRangePoiIds: [],
    inRangeNpcIds: [],

    // ── nội dung / tiến trình ────────────────────────────────────────────
    progress: {}, // "story:id" | "poi:id" | "hidden_thread:id" -> {...}
    freeFirstPoiId: null, // TD §10 · free-first-POI, user tự chọn
    partnerUnlockedPoiIds: [], // POIs được mở khoá bằng mã đối tác (B2B2C)
    unlockedThreadIds: [],
    contentUpdates: {}, // poiId -> version mới trên server

    // ── offline (PHẦN 9b) ────────────────────────────────────────────────
    online: true,
    downloads: {}, // poiId -> {status, pkg, mb, totalMB}
    outbox: [], // Lưu trữ các sự kiện offline chờ đồng bộ (outbox pattern)

    // ── bản đồ (PHẦN 6b) ─────────────────────────────────────────────────
    layer: "artwork", // artwork | real
    zoom: 1,

    // ── story sheet (PHẦN 7) ─────────────────────────────────────────────
    audio: {
      storyId: null,
      blockIdx: null,
      playing: false,
      pos_s: 0,
      screenOff: false, // "cất máy vào túi"
    },
    storyMode: "audio", // audio | webtoon

    // ── UI ───────────────────────────────────────────────────────────────
    overlay: null, // {kind, ...} — sheet/popup đang mở
    banner: null, // {text, tone, until}
    dragMode: false, // màn 08
    dragCandidate: null, // {lat,lng,dist,allowed}
    lockScreen: false, // màn 11
    notifications: [],

    // ── đồng hồ mô phỏng ─────────────────────────────────────────────────
    simNow: 0,
    timeScale: 1,
    events: [],
  };
}

const S = initialState();
const listeners = new Set();
let rafPending = false;

function notify() {
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(() => {
    rafPending = false;
    listeners.forEach((fn) => fn(S));
  });
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/* ── log sự kiện — Inspector đọc cái này ─────────────────────────────────── */
function log(tag, msg) {
  S.events.unshift({ t: S.simNow, tag, msg });
  if (S.events.length > 220) S.events.length = 220;
}

function fmtClock(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/* ==========================================================================
   2. VÙNG TƯƠNG TÁC — dùng chung cho proximity VÀ cho điều kiện 2 của
      Fake GPS (đề xuất hợp nhất ở PHẦN 5: không để hai hệ hình học rời nhau).
   ======================================================================== */

/** Khoảng cách (mét) từ `p` tới vùng tương tác của POI. 0 = đang trong vùng. */
function distanceToPoi(p, poi) {
  const it = poi.interaction;
  if (it.mode === "polygon") return geo.distanceToPolygon(p, it.polygon);
  return geo.haversine(p, poi.location);
}

/** Đã VÀO vùng chưa (bán kính vào, hoặc trong polygon). */
function isInsideEnterZone(p, poi) {
  const it = poi.interaction;
  if (it.mode === "polygon") return geo.pointInPolygon(p, it.polygon);
  return geo.haversine(p, poi.location) <= it.enter_radius_m;
}

/** Đã RA khỏi vùng chưa — hysteresis: ngưỡng ra LUÔN rộng hơn ngưỡng vào. */
function isOutsideExitZone(p, poi) {
  const it = poi.interaction;
  if (it.mode === "polygon")
    return geo.distanceToPolygon(p, it.polygon) > it.area_buffer_m;
  return geo.haversine(p, poi.location) > it.exit_radius_m;
}

function distanceToSite(p, site) {
  const g = site.geofence;
  if (g.mode === "polygon") return geo.distanceToPolygon(p, g.polygon);
  return Math.max(0, geo.haversine(p, site.center) - g.radius_m);
}

/* ==========================================================================
   3. MÁY TRẠNG THÁI A — PROXIMITY
   ======================================================================== */

/** Tầng 1 — geofence cấp KHU (final-summary §8 mục 2: kích hoạt 2 tầng). */
function updateSiteGeofence(pos) {
  const sites = S.topicId ? DB.sitesOfTopic(S.topicId) : DB.SITES;
  let best = null, bestD = Infinity;
  for (const s of sites) {
    const d = distanceToSite(pos, s);
    if (d < bestD) { bestD = d; best = s; }
  }
  if (!best) return null;
  S.siteDistanceM = bestD;
  const inside = bestD === 0;
  if (S.activeSiteId !== best.id) {
    // Chưa vào khu nào thì vẫn hiển thị khu gần nhất để user biết đường đi;
    // chỉ khi bestD === 0 mới là "đã vào geofence cấp KHU" (tầng 1).
    if (inside) log("KHU", `Vào geofence KHU "${best.name}" → tải lớp tranh của khu`);
    S.activeSiteId = best.id;
  }
  S.insideSite = inside;
  return best.id;
}

/** Model "HÔM NAY" — đo tới TỪNG NPC, một bán kính 20m, không hysteresis,
 *  không thời gian đứng. Đây đúng là hành vi app đang có (PHẦN 6). */
function tickProximityNpc20(pos) {
  const inRange = [];
  for (const npc of DB.NPCS) {
    const d = geo.haversine(pos, npc.location);
    const nowIn = d <= C.NPC_PROXIMITY_M;
    const wasIn = !!S.npcRange[npc.id];
    if (nowIn !== wasIn) {
      S.npcRange[npc.id] = nowIn;
      log(
        "NPC",
        `${npc.name}: ${nowIn ? "VÀO" : "RA"} tầm ${C.NPC_PROXIMITY_M}m (đo ${d.toFixed(1)}m)` +
          (nowIn ? "" : " — không hysteresis nên dễ nhấp nháy")
      );
    }
    if (nowIn) inRange.push(npc.id);
  }
  S.inRangeNpcIds = inRange;
  S.inRangePoiIds = [...new Set(inRange.map((id) => DB.npc(id).poiId))];
  S.poiFsm = {};
}

/** Model "SAU CMS PHẦN 5" — đo tới VÙNG TƯƠNG TÁC của POI cha, có hysteresis
 *  vào/ra + thời gian đứng tối thiểu (TD §8.3b).
 *    far → entering → near_confirmed → far
 *  Chỉ `near_confirmed` mới bật interactable, `entering` thì CHƯA. */
function tickProximityPoi2535(pos) {
  const inRange = [];
  for (const poi of DB.POIS) {
    const fsm = S.poiFsm[poi.id] || (S.poiFsm[poi.id] = { state: "far", since: S.simNow });
    const d = distanceToPoi(pos, poi);
    fsm.dist = d;
    const dwellMs = (poi.interaction.dwell_s ?? C.POI_DWELL_S) * 1000;
    const inside = isInsideEnterZone(pos, poi);
    const outside = isOutsideExitZone(pos, poi);

    switch (fsm.state) {
      case "far":
        if (inside) {
          fsm.state = "entering";
          fsm.since = S.simNow;
          log("POI", `${poi.name}: far → entering (${d.toFixed(1)}m) · chờ đứng đủ ${poi.interaction.dwell_s ?? C.POI_DWELL_S}s`);
        }
        break;
      case "entering":
        if (!inside) {
          fsm.state = "far";
          fsm.since = S.simNow;
          log("POI", `${poi.name}: entering → far (${d.toFixed(1)}m) · chưa đứng đủ, KHÔNG bật interactable`);
        } else if (S.simNow - fsm.since >= dwellMs) {
          fsm.state = "near_confirmed";
          fsm.since = S.simNow;
          log("POI", `${poi.name}: entering → near_confirmed · đứng đủ ${dwellMs / 1000}s → BẬT interactable`);
        }
        break;
      case "near_confirmed":
        // Chỉ rời khi vượt ngưỡng RA (rộng hơn ngưỡng vào) — đây là hysteresis,
        // nhờ nó GPS dao động quanh biên không làm NPC nhấp nháy.
        if (outside) {
          fsm.state = "far";
          fsm.since = S.simNow;
          log("POI", `${poi.name}: near_confirmed → far (${d.toFixed(1)}m > ngưỡng ra)`);
        }
        break;
    }
    if (fsm.state === "near_confirmed") inRange.push(poi.id);
  }
  S.inRangePoiIds = inRange;
  // near_confirmed → liệt kê NPC con của POI đó (PHẦN 6)
  S.inRangeNpcIds = inRange.flatMap((id) => DB.npcsOfPoi(id).map((n) => n.id));
  S.npcRange = {};
  S.inRangeNpcIds.forEach((id) => (S.npcRange[id] = true));
}

/* ==========================================================================
   4. MÁY TRẠNG THÁI B — FAKE GPS (PHẦN 4–5)
   ======================================================================== */

/** Trần kéo. Mặc định 300m đo TỪ GPS THỰC (PHẦN 4 — không cộng dồn qua các
 *  lần kéo). Nếu người test đang neo ở một POI/KHU dùng "vẽ vùng" thì nới
 *  theo kích thước thật của vùng + biên độ, để Văn Miếu (~369m đường chéo)
 *  không bị chặn oan (đề xuất PHẦN 4 · PHẦN 12 câu 7). */
function computeDragLimit(anchor) {
  let best = null;
  const consider = (poly, label) => {
    if (!poly) return;
    const d = geo.distanceToPolygon(anchor, poly);
    if (d <= C.FAKE_ARRIVED_M) {
      const lim = geo.polygonDiagonal(poly) + C.FAKE_POLY_MARGIN_M;
      if (!best || lim > best.limit) best = { limit: lim, label };
    }
  };
  for (const poi of DB.POIS)
    if (poi.interaction.mode === "polygon") consider(poi.interaction.polygon, `POI "${poi.name}"`);
  for (const site of DB.SITES)
    if (site.geofence.mode === "polygon") consider(site.geofence.polygon, `KHU "${site.name}"`);

  if (best) return { limit: Math.round(best.limit), reason: `vùng vẽ của ${best.label} (đường chéo + ${C.FAKE_POLY_MARGIN_M}m)` };
  return { limit: C.FAKE_DRAG_LIMIT_M, reason: `hằng số mặc định ${C.FAKE_DRAG_LIMIT_M}m` };
}

/** Thử một điểm kéo — trả về có cho phép hay không, để UI báo đỏ trước khi thả. */
function probeDrag(target) {
  const anchor = S.gps.realAnchor || S.gps.measured;
  const dist = geo.haversine(anchor, target);
  const { limit, reason } = S.gps.realAnchor
    ? { limit: S.gps.dragLimitM, reason: S.gps.dragLimitReason }
    : computeDragLimit(anchor);
  return { dist, limit, reason, allowed: dist <= limit };
}

/** Bắt đầu / cập nhật vị trí kéo (màn 08). */
function setFakePosition(target) {
  if (S.gps.mode === "real") {
    // Neo mốc đo: GPS THỰC cuối cùng. Mọi lần kéo sau vẫn đo từ mốc này.
    S.gps.realAnchor = { ...S.gps.measured };
    const { limit, reason } = computeDragLimit(S.gps.realAnchor);
    S.gps.dragLimitM = limit;
    S.gps.dragLimitReason = reason;
  }
  const probe = probeDrag(target);
  if (!probe.allowed) {
    log("FAKE", `CHẶN kéo: ${probe.dist.toFixed(0)}m > trần ${probe.limit}m (${probe.reason})`);
    S.banner = { text: `Không kéo xa hơn ${probe.limit} m tính từ vị trí GPS thật`, tone: "danger", until: S.simNow + 4000 };
    return false;
  }
  const first = S.gps.mode === "real";
  S.gps.mode = "faked";
  S.gps.fake = { ...target };
  if (first) {
    S.gps.fakedAt = S.simNow;
    S.gps.goodSince = null;
    S.gps.resetPending = null;
    // POI đang test = POI có vùng chứa điểm kéo, hoặc POI gần nhất
    S.gps.fakeContextPoiId = (findPoiAtPosition(target) || nearestPoi(target)).id;
    log("FAKE", `BẬT chế độ kéo · trần ${S.gps.dragLimitM}m (${S.gps.dragLimitReason}) · hết hạn sau ${fmtClock(C.FAKE_EXPIRY_MS)}`);
  } else {
    log("FAKE", `Kéo tới điểm mới · ${probe.dist.toFixed(0)}m/${probe.limit}m từ GPS thật`);
  }
  return true;
}

function findPoiAtPosition(p) {
  return DB.POIS.find((poi) => isInsideEnterZone(p, poi)) || null;
}

function nearestPoi(p) {
  return DB.POIS.reduce((a, b) => (distanceToPoi(p, b) < distanceToPoi(p, a) ? b : a));
}

/** Điều kiện 2 — "đã tới nơi".
 *  Nếu điểm kéo nằm trong vùng tương tác của 1 POI thì dùng CHÍNH vùng đó
 *  (hợp nhất hai hệ hình học — đề xuất PHẦN 5). Không thuộc POI nào thì
 *  fallback vòng tròn 50m quanh điểm kéo. 50m này KHÁC 20m proximity NPC —
 *  hai hằng số khác mục đích, PHẦN 5 cảnh báo không được gộp. */
function arrivedCheck() {
  const fake = S.gps.fake;
  const real = S.gps.measured;
  const poi = findPoiAtPosition(fake);
  if (poi) {
    const inside = isInsideEnterZone(real, poi);
    return {
      hit: inside,
      detail: `vùng tương tác POI "${poi.name}" · ${distanceToPoi(real, poi).toFixed(0)}m`,
      basis: "poi-zone",
    };
  }
  const d = geo.haversine(real, fake);
  return {
    hit: d <= C.FAKE_ARRIVED_M,
    detail: `${d.toFixed(0)}m / ${C.FAKE_ARRIVED_M}m quanh điểm kéo (fallback)`,
    basis: "fallback-50m",
  };
}

/** Ảnh chụp 4 điều kiện — Inspector render trực tiếp từ đây. */
function fakeConditions() {
  if (S.gps.mode !== "faked") return null;
  const g = S.gps;
  const elapsed = S.simNow - g.fakedAt;
  const arrived = arrivedCheck();
  const goodNow = g.accuracy_m <= C.GPS_ACCURACY_GOOD_M;
  const buffered = g.goodSince == null ? 0 : S.simNow - g.goodSince;

  return [
    {
      n: 1, key: "expiry", title: "Hết thời gian",
      value: `còn ${fmtClock(C.FAKE_EXPIRY_MS - elapsed)} / ${fmtClock(C.FAKE_EXPIRY_MS)}`,
      pct: Math.min(1, elapsed / C.FAKE_EXPIRY_MS),
      hit: elapsed >= C.FAKE_EXPIRY_MS,
      reason: "hết giờ",
    },
    {
      n: 2, key: "arrived", title: "User đã đi đến nơi",
      value: arrived.detail,
      pct: arrived.hit ? 1 : 0,
      hit: arrived.hit,
      reason: "đã tới nơi",
      note: arrived.basis === "fallback-50m" ? `fallback ${C.FAKE_ARRIVED_M}m` : "dùng vùng POI",
    },
    {
      n: 3, key: "screen", title: "Thoát màn hình POI",
      value: g.fakeContextPoiId ? `đang ở màn POI "${DB.poi(g.fakeContextPoiId)?.name || "?"}"` : "—",
      pct: 0, hit: false, reason: "thoát màn",
      note: "do UI báo khi rời context",
    },
    {
      n: 4, key: "signal", title: "Tín hiệu GPS tốt trở lại",
      value: goodNow
        ? `buffer ${fmtClock(buffered)} / ${fmtClock(C.FAKE_GOOD_SIGNAL_BUFFER_MS)} (±${g.accuracy_m}m)`
        : `tín hiệu xấu ±${g.accuracy_m}m — buffer về 0`,
      pct: Math.min(1, buffered / C.FAKE_GOOD_SIGNAL_BUFFER_MS),
      hit: goodNow && buffered >= C.FAKE_GOOD_SIGNAL_BUFFER_MS,
      reason: "tín hiệu tốt",
      note: `giữ ≥${C.FAKE_GOOD_SIGNAL_BUFFER_MS / 1000}s mới coi là ổn định`,
    },
  ];
}

function tickFakeGps() {
  if (S.gps.mode !== "faked") return;
  const g = S.gps;

  // Buffer 60s của điều kiện 4: tín hiệu xấu là ĐẾM LẠI TỪ 0. Đây là chỗ
  // PHẦN 5 nói dễ hiểu lầm nhất — không phải "GPS tốt thì reset ngay".
  if (g.accuracy_m <= C.GPS_ACCURACY_GOOD_M) {
    if (g.goodSince == null) {
      g.goodSince = S.simNow;
      log("FAKE", "Điều kiện 4: tín hiệu tốt — bắt đầu buffer 60s");
    }
  } else if (g.goodSince != null) {
    g.goodSince = null;
    log("FAKE", "Điều kiện 4: tín hiệu xấu lại — buffer về 0 (chống giật lùi)");
  }

  const hit = fakeConditions().find((c) => c.hit);
  if (hit) requestFakeReset(hit.reason, `điều kiện ${hit.n}`);
}

/** Điều kiện 3 — UI gọi khi user rời context POI đang test. */
function notifyScreenExit(poiId) {
  if (S.gps.mode === "faked" && S.gps.fakeContextPoiId === poiId)
    requestFakeReset("thoát màn", "điều kiện 3");
}

/** NGOẠI LỆ PHẦN 5: đang nghe audio thì KHÔNG cắt mạch — hoãn tới lần tương
 *  tác kế tiếp. Áp cho cả 4 điều kiện, không riêng điều kiện nào. */
function requestFakeReset(reason, which) {
  if (S.gps.mode !== "faked") return;
  if (S.audio.playing) {
    if (!S.gps.resetPending) {
      S.gps.resetPending = { reason, which };
      log("FAKE", `${which} chạm (${reason}) — NHỊN vì audio đang phát, reset ở tương tác kế`);
    }
    return;
  }
  applyFakeReset(reason, which);
}

function applyFakeReset(reason, which) {
  const g = S.gps;
  log("FAKE", `RESET về GPS thực · lý do: ${reason} (${which})`);
  g.mode = "real";
  g.fake = null;
  g.realAnchor = null;
  g.fakedAt = null;
  g.goodSince = null;
  g.resetPending = null;
  g.fakeContextPoiId = null;
  g.lastResetReason = reason;
  S.dragMode = false;
  // Màn 09 — banner NHẸ, không phải dialog chặn (PHẦN 12 câu 1: giả định)
  S.banner = {
    text: `Vị trí đã được đưa về GPS thật — ${reason}`,
    tone: "info",
    until: S.simNow + 6000,
    reason,
  };
}

/** Mọi tap của user đi qua đây, để "reset ở lần tương tác kế tiếp" là thật. */
function userInteraction() {
  const p = S.gps.resetPending;
  if (p && !S.audio.playing) applyFakeReset(p.reason, p.which + " · hoãn do audio");
}

/* ==========================================================================
   5. MÁY TRẠNG THÁI C — DOWNLOAD (PHẦN 9b · TD §5)
      not_downloaded → downloading ⇄ paused → verifying → ready
      Resume tiếp từ MB đã tải, KHÔNG về 0. Chỉ `ready` sau khi verify ĐỦ.
   ======================================================================== */
const DL_SPEED_MBPS = 6; // giả lập, đủ nhanh để demo mà vẫn thấy tiến trình

function dl(poiId) {
  return S.downloads[poiId] || { status: "not_downloaded", mb: 0, totalMB: 0, pkg: null };
}

function startDownload(poiId, pkg /* 'full' | 'audio' */) {
  const poi = DB.poi(poiId);
  const totalMB = pkg === "full" ? poi.pkg.fullMB : poi.pkg.audioMB;
  const cur = dl(poiId);
  // Đổi loại gói thì tải lại từ đầu; cùng loại thì resume.
  const mb = cur.pkg === pkg ? cur.mb : 0;
  S.downloads[poiId] = { status: "downloading", pkg, mb, totalMB, verifyMs: 0 };
  log("TẢI", `${poi.name}: tải gói ${pkg === "full" ? "đầy đủ" : "chỉ audio"} ~${totalMB}MB${mb > 0 ? ` (resume từ ${mb.toFixed(0)}MB)` : ""}`);
}

function pauseDownload(poiId) {
  const d = S.downloads[poiId];
  if (d && d.status === "downloading") {
    d.status = "paused";
    log("TẢI", `${DB.poi(poiId).name}: tạm dừng ở ${d.mb.toFixed(0)}/${d.totalMB}MB — resume được`);
  }
}

function resumeDownload(poiId) {
  const d = S.downloads[poiId];
  if (d && d.status === "paused") {
    d.status = "downloading";
    log("TẢI", `${DB.poi(poiId).name}: tiếp tục từ ${d.mb.toFixed(0)}MB (không tải lại từ 0)`);
  }
}

function deleteDownload(poiId) {
  delete S.downloads[poiId];
  log("TẢI", `${DB.poi(poiId).name}: đã xoá gói offline`);
}

function storageUsedMB() {
  return Object.values(S.downloads).reduce((s, d) => s + (d.status === "ready" ? d.totalMB : d.mb), 0);
}

function tickDownloads(dtMs) {
  for (const [poiId, d] of Object.entries(S.downloads)) {
    if (d.status === "downloading") {
      if (!S.online) {
        d.status = "paused";
        log("TẢI", `${DB.poi(poiId).name}: mất mạng → tạm dừng ở ${d.mb.toFixed(0)}MB, resume khi có mạng`);
        continue;
      }
      d.mb = Math.min(d.totalMB, d.mb + (DL_SPEED_MBPS * dtMs) / 1000);
      if (d.mb >= d.totalMB) {
        d.status = "verifying"; // pha checksum — TD §5: chỉ ready khi ĐỦ
        d.verifyMs = 0;
        log("TẢI", `${DB.poi(poiId).name}: tải xong → verify checksum từng asset`);
      }
    } else if (d.status === "verifying") {
      d.verifyMs += dtMs;
      if (d.verifyMs >= 1600) {
        d.status = "ready";
        log("TẢI", `${DB.poi(poiId).name}: ✓ ready — dùng được khi mất mạng`);
      }
    }
  }
}

/* ==========================================================================
   6. ENTITLEMENT (TD §10) + PROGRESS (TD §7)
   ======================================================================== */

function entitlementOf(poi) {
  if (poi.entitlement === "purchased" || poi.entitlement === "free") return { ok: true, source: poi.entitlement };
  if (S.partnerUnlockedPoiIds && S.partnerUnlockedPoiIds.includes(poi.id)) return { ok: true, source: "partner_code" };
  if (poi.entitlement === "free_first_choice") {
    if (S.freeFirstPoiId === poi.id) return { ok: true, source: "free_first_poi" };
    if (S.freeFirstPoiId == null) return { ok: false, source: "claimable_free", claimable: true };
    return { ok: false, source: "free_slot_used" };
  }
  return { ok: false, source: "locked" };
}

function claimFreeFirstPoi(poiId) {
  if (S.freeFirstPoiId != null) return false;
  S.freeFirstPoiId = poiId;
  log("QUYỀN", `Đã dùng suất POI miễn phí đầu tiên cho "${DB.poi(poiId).name}"`);
  return true;
}

function redeemPartnerCode(code) {
  if (!code) return;
  const uppercaseCode = code.trim().toUpperCase();
  log("B2B2C", `Nhập mã đối tác: "${uppercaseCode}"`);
  
  if (!S.online) {
    const event = {
      user_id: "user_test_123",
      partner_id: "unknown_partner",
      code_id: uppercaseCode,
      timestamp: Date.now(),
      status: "pending"
    };
    if (!S.outbox) S.outbox = [];
    S.outbox.push(event);
    log("SQLITE", `Lưu event partner_code_redeemed offline (pending) vào SQLite outbox: ${uppercaseCode}`);
    
    S.banner = {
      text: (window.T && T.partnerCodeOffline) || "Đang ngoại tuyến. Mã đã được lưu và sẽ kích hoạt khi có mạng.",
      tone: "warn",
      until: S.simNow + 5000
    };
    notify();
    return;
  }
  
  if (uppercaseCode === "ABC2026") {
    if (!S.partnerUnlockedPoiIds) S.partnerUnlockedPoiIds = [];
    if (!S.partnerUnlockedPoiIds.includes("p-oquanchuong")) {
      S.partnerUnlockedPoiIds.push("p-oquanchuong");
    }
    
    const event = {
      user_id: "user_test_123",
      partner_id: "hotel_abc",
      code_id: "ABC2026",
      timestamp: Date.now(),
      status: "synced"
    };
    log("B2B2C", `Mã đối tác "${uppercaseCode}" hợp lệ! Đối tác: Hotel ABC. Đã mở khoá "Ô Quan Chưởng".`);
    log("EVENT", `Đã gửi event partner_code_redeemed lên NestJS.`);
    
    S.overlay = {
      kind: "partner_code_success",
      code: "ABC2026",
      partnerName: "Hotel ABC",
      poiName: "Ô Quan Chưởng"
    };
    S.route = "15-partner-code-success";
  } else if (uppercaseCode === "EXPIRED") {
    log("B2B2C", `Mã đối tác "${uppercaseCode}" đã hết hạn.`);
    S.banner = {
      text: "Mã đối tác đã hết hạn sử dụng",
      tone: "danger",
      until: S.simNow + 5000
    };
  } else if (uppercaseCode === "USED") {
    log("B2B2C", `Mã đối tác "${uppercaseCode}" đã hết lượt sử dụng.`);
    S.banner = {
      text: "Mã đối tác đã hết lượt đổi",
      tone: "danger",
      until: S.simNow + 5000
    };
  } else {
    log("B2B2C", `Mã đối tác "${uppercaseCode}" không hợp lệ.`);
    S.banner = {
      text: (window.T && T.partnerCodeInvalid) || "Mã đối tác không hợp lệ hoặc đã hết hạn",
      tone: "danger",
      until: S.simNow + 5000
    };
  }
  notify();
}

function simulateDeepLink() {
  log("B2B2C", "Giả lập quét QR Code (Branch.io Deep Link)");
  log("BRANCH", "Nhận metadata: partner_id=hotel_abc, partner_code=ABC2026");
  
  if (!S.online) {
    log("BRANCH", "Quét QR offline: Trình duyệt không thể kết nối server Branch.");
    S.banner = {
      text: "Không thể quét QR: Bạn đang offline",
      tone: "danger",
      until: S.simNow + 5000
    };
    notify();
    return;
  }
  
  redeemPartnerCode("ABC2026");
}

/** Lớp 2 — điều kiện trải nghiệm (final-summary §6): GPS-unlocked.
 *  Trả về lý do KHÔNG mở được, hoặc null nếu mở được. */
function blockerFor(poi) {
  const ent = entitlementOf(poi);
  if (!ent.ok) return { kind: "entitlement", ent };
  if (!S.inRangePoiIds.includes(poi.id)) return { kind: "gps" };
  // PHẦN 9b · Focus Mode: mất mạng thì chỉ POI đã ready mới mở được
  if (!S.online && dl(poi.id).status !== "ready") return { kind: "offline" };
  return null;
}

const pkey = (type, id) => `${type}:${id}`;

function prog(type, id) {
  return S.progress[pkey(type, id)] || { state: "available", pct: 0 };
}

function setProg(type, id, patch) {
  const k = pkey(type, id);
  S.progress[k] = { ...prog(type, id), ...patch };
}

function startStory(storyId) {
  const st = DB.story(storyId);
  const poi = DB.poi(DB.npc(st.npcId).poiId);
  if (prog("story", storyId).state !== "completed") {
    setProg("story", storyId, { state: "in_progress" });
    setProg("poi", poi.id, { state: "in_progress" });
    log("TIẾN TRÌNH", `"${st.title}" → in_progress (user TỰ TAP — GPS không auto-complete)`);
  }
}

/** Hoàn thành story. Ghi `content_version_at_completion` để về sau so version
 *  mà KHÔNG đổi state (nguyên tắc "xong là xong" — TD §3.4 · PHẦN 9b). */
function completeStory(storyId) {
  const st = DB.story(storyId);
  const npc = DB.npc(st.npcId);
  const poi = DB.poi(npc.poiId);
  setProg("story", storyId, {
    state: "completed",
    pct: 100,
    completed_at: S.simNow,
    content_version_at_completion: poi.version,
  });
  log("TIẾN TRÌNH", `"${st.title}" → completed (version ${poi.version})`);

  // POI completed khi mọi story của các NPC con đã xong
  const allDone = DB.npcsOfPoi(poi.id).every(
    (n) => prog("story", DB.storyOfNpc(n.id).id).state === "completed"
  );
  if (allDone) {
    setProg("poi", poi.id, {
      state: "completed",
      completed_at: S.simNow,
      content_version_at_completion: poi.version,
    });
    log("TIẾN TRÌNH", `POI "${poi.name}" → completed`);
  }
  return checkUnlocks();
}

/** Hidden Thread: ẩn tới khi đủ điều kiện tiên quyết → popup màn 13. */
function checkUnlocks() {
  const newly = [];
  for (const ht of DB.HIDDEN_THREADS) {
    if (S.unlockedThreadIds.includes(ht.id)) continue;
    const req = ht.requires;
    const ok =
      req.type === "stories_completed" &&
      req.ids.every((id) => prog("story", id).state === "completed");
    if (ok) {
      S.unlockedThreadIds.push(ht.id);
      setProg("hidden_thread", ht.id, { state: "available" });
      log("BÍ MẬT", `🔓 Mở khoá "${ht.name}"`);
      newly.push(ht);
    }
  }
  return newly;
}

/** Series completed khi MỌI item is_required=true đã completed (TD §7.2). */
function seriesProgress(seriesId) {
  const sr = DB.series(seriesId);
  const req = sr.items.filter((i) => i.is_required);
  const done = req.filter((i) => prog(i.ref_type, i.ref_id).state === "completed");
  return { done: done.length, total: req.length, completed: done.length === req.length };
}

/** Sync DOWN — chỉ GỢI Ý, không tự tải đè, và KHÔNG reset `completed`. */
function pushContentUpdate(poiId) {
  const poi = DB.poi(poiId);
  S.contentUpdates[poiId] = poi.version + 1;
  log("SYNC", `Server có bản mới cho "${poi.name}" (v${poi.version} → v${poi.version + 1}) — chỉ GỢI Ý, không tự tải đè`);
}

function applyContentUpdate(poiId) {
  const poi = DB.poi(poiId);
  const v = S.contentUpdates[poiId];
  poi.version = v;
  delete S.contentUpdates[poiId];
  const p = prog("poi", poiId);
  log("SYNC", `Đã cập nhật "${poi.name}" lên v${v} · state giữ nguyên "${p.state}" ("xong là xong")`);
  // Gói offline cũ không còn khớp version → phải tải lại
  const d = S.downloads[poiId];
  if (d && d.status === "ready") { d.status = "paused"; d.mb = d.totalMB * 0.0; }
}

/* ==========================================================================
   7. AUDIO / STORY (PHẦN 7)
   ======================================================================== */

/** Các lớp nội dung xếp theo `order` (CMS PHẦN 6). */
function blocksOf(storyId) {
  return [...DB.story(storyId).blocks].sort((a, b) => a.order - b.order);
}

function playBlock(storyId, blockIdx) {
  const b = blocksOf(storyId)[blockIdx];
  S.audio = { storyId, blockIdx, playing: true, pos_s: 0, screenOff: S.audio.screenOff };
  S.storyMode = b.type === "webtoon" ? "webtoon" : "audio";
  log("STORY", `Phát lớp ${b.order} · ${b.type} · "${b.label}"`);
}

function togglePlay() {
  S.audio.playing = !S.audio.playing;
  if (!S.audio.playing) userInteraction(); // dừng audio = mở đường cho reset đang bị nhịn
}

/** "Cất máy vào túi" — bỏ qua lớp không nghe được (`playable_screen_off`
 *  = false) và phát tiếp lớp audio kế, thay vì dừng im lặng (PHẦN 7). */
function setScreenOff(off) {
  S.audio.screenOff = off;
  if (!off) return;
  const { storyId, blockIdx } = S.audio;
  if (storyId == null) return;
  const blocks = blocksOf(storyId);
  if (blocks[blockIdx]?.playable_screen_off) return;
  const next = blocks.findIndex((b, i) => i > blockIdx && b.playable_screen_off);
  if (next >= 0) {
    log("STORY", `Màn hình tắt: bỏ qua lớp ${blocks[blockIdx].order} (${blocks[blockIdx].type}, không nghe được) → nhảy tới lớp ${blocks[next].order}`);
    playBlock(storyId, next);
  } else {
    log("STORY", "Màn hình tắt: không còn lớp nào phát được → dừng");
    S.audio.playing = false;
  }
}

function tickAudio(dtMs) {
  const a = S.audio;
  if (!a.playing || a.storyId == null) return;
  const blocks = blocksOf(a.storyId);
  const b = blocks[a.blockIdx];
  if (!b) return;
  // Lớp không có thời lượng (text/webtoon) thì user tự đọc, không tự chạy.
  if (!b.duration_s) return;
  a.pos_s += dtMs / 1000;
  const pct = Math.min(100, (a.pos_s / b.duration_s) * 100);
  setProg("story", a.storyId, { pct: Math.round(pct) });
  if (a.pos_s >= b.duration_s) {
    if (b.loop) { a.pos_s = 0; return; }
    // lớp kế: nếu màn hình tắt thì chỉ chọn lớp phát được
    const next = blocks.findIndex((x, i) => i > a.blockIdx && (!a.screenOff || x.playable_screen_off));
    if (next >= 0) playBlock(a.storyId, next);
    else {
      a.playing = false;
      log("STORY", "Hết lớp cuối — story sẵn sàng đánh dấu hoàn thành");
      userInteraction(); // audio dừng → áp reset đang bị nhịn (PHẦN 5)
    }
  }
}

/* ==========================================================================
   8. GPS GIẢ LẬP + VÒNG LẶP
   ======================================================================== */

/** Vị trí mà APP nhìn thấy: đã kéo thì lấy điểm kéo, không thì lấy GPS đo được.
 *  Câu trả lời cho PHẦN 12 câu 4 ("ai thắng?"): vị trí kéo thắng cho tới khi
 *  một trong 4 điều kiện chạm. */
function effectivePosition() {
  return S.gps.mode === "faked" ? S.gps.fake : S.gps.measured;
}

function walkTo(target, label) {
  S.gps.walkTarget = { ...target };
  log("GPS", `Bắt đầu đi bộ tới ${label || "điểm đã chọn"} (1.4 m/s)`);
}

function teleport(target, label) {
  S.gps.truth = { ...target };
  S.gps.walkTarget = null;
  log("GPS", `Dịch GPS thật tới ${label || "điểm đã chọn"}`);
}

function setNoisy(noisy) {
  S.gps.noisy = noisy;
  S.gps.accuracy_m = noisy ? C.GPS_ACCURACY_NOISY_M : C.GPS_ACCURACY_GOOD_M;
  log("GPS", `Sai số GPS: ±${S.gps.accuracy_m}m (${noisy ? "nhiễu — như phố cổ nhà cao tầng" : "tốt"})`);
}

let noisePhase = 0;
function tickGps(dtMs) {
  const g = S.gps;
  if (g.walkTarget) {
    const step = 1.4 * (dtMs / 1000); // tốc độ đi bộ
    g.truth = geo.stepToward(g.truth, g.walkTarget, step);
    if (geo.haversine(g.truth, g.walkTarget) < 0.5) {
      g.walkTarget = null;
      log("GPS", "Đã tới điểm đi bộ");
    }
  }
  // Nhiễu: dao động tất định (không random) để test lặp lại được — PHẦN 10
  // nói rõ simulator dùng cho logic "tự động, lặp lại được".
  noisePhase += dtMs / 1000;
  if (g.noisy) {
    const amp = g.accuracy_m * 0.32;
    g.measured = geo.offset(g.truth, Math.sin(noisePhase * 1.7) * amp, Math.cos(noisePhase * 1.1) * amp);
  } else {
    g.measured = { ...g.truth };
  }
}

let lastWall = null;

function tick() {
  const wall = performance.now();
  const dtWall = lastWall == null ? C.TICK_MS : Math.min(1000, wall - lastWall);
  lastWall = wall;
  const dt = dtWall * S.timeScale;
  S.simNow += dt;

  tickGps(dt);
  if (S.permissions.location === "while_using" || S.permissions.location === "always") {
    const pos = effectivePosition();
    updateSiteGeofence(pos);
    if (S.proximityModel === "npc20") tickProximityNpc20(pos);
    else tickProximityPoi2535(pos);
  }
  tickFakeGps();
  tickDownloads(dt);
  tickAudio(dt);

  if (S.banner && S.simNow > S.banner.until) S.banner = null;
  notify();
}

/* ==========================================================================
   9. XUẤT RA
   ======================================================================== */
window.Engine = {
  S, geo, subscribe, notify, log, fmtClock,
  reset() { Object.assign(S, initialState()); notify(); },

  // proximity
  distanceToPoi, isInsideEnterZone, distanceToSite, effectivePosition,
  setProximityModel(m) {
    S.proximityModel = m;
    S.poiFsm = {}; S.npcRange = {}; S.inRangeNpcIds = []; S.inRangePoiIds = [];
    log("MODEL", m === "npc20"
      ? `Đổi sang model HÔM NAY: đo tới từng NPC, 1 bán kính ${C.NPC_PROXIMITY_M}m, không hysteresis`
      : `Đổi sang model SAU CMS PHẦN 5: đo tới vùng POI, vào ${C.POI_ENTER_RADIUS_M}m / ra ${C.POI_EXIT_RADIUS_M}m / đứng ${C.POI_DWELL_S}s`);
  },

  // fake gps
  probeDrag, setFakePosition, fakeConditions, notifyScreenExit,
  requestFakeReset, userInteraction, computeDragLimit,
  forceCondition(key) {
    const g = S.gps;
    if (g.mode !== "faked") { log("FAKE", "Chưa ở chế độ kéo — không có gì để reset"); return; }
    if (key === "expiry") { g.fakedAt = S.simNow - C.FAKE_EXPIRY_MS; log("DEV", "Ép điều kiện 1 — hết 15 phút"); }
    if (key === "arrived") { teleport(g.fake, "điểm đã kéo"); log("DEV", "Ép điều kiện 2 — dịch GPS thật tới điểm kéo"); }
    if (key === "screen") { notifyScreenExit(g.fakeContextPoiId); log("DEV", "Ép điều kiện 3 — thoát màn POI"); }
    if (key === "signal") { setNoisy(false); g.goodSince = S.simNow - C.FAKE_GOOD_SIGNAL_BUFFER_MS; log("DEV", "Ép điều kiện 4 — buffer 60s đã đủ"); }
  },

  // gps sim
  walkTo, teleport, setNoisy,
  /** Đặt user đứng đúng biên vùng vào của POI + bật nhiễu → tái hiện ca
   *  23→27→22→31→24m ở CMS PHẦN 5, để kiểm chứng hysteresis chống nhấp nháy. */
  parkAtBoundary(poiId) {
    const poi = DB.poi(poiId);
    const r = poi.interaction.mode === "polygon" ? 0 : poi.interaction.enter_radius_m;
    const center = poi.interaction.mode === "polygon"
      ? geo.polygonCentroid(poi.interaction.polygon) : poi.location;
    teleport(geo.offset(center, r, 0), `đúng biên ${r}m của "${poi.name}"`);
    setNoisy(true);
    log("DEV", `Đứng sát biên "${poi.name}" + GPS nhiễu → xem NPC có nhấp nháy không`);
  },

  // downloads
  dl, startDownload, pauseDownload, resumeDownload, deleteDownload, storageUsedMB,
  setOnline(v) {
    S.online = v;
    log("MẠNG", v ? "Có mạng trở lại" : "MẤT MẠNG → Focus Mode: chỉ highlight POI đã ready");
  },

  // entitlement + progress
  entitlementOf, claimFreeFirstPoi, redeemPartnerCode, simulateDeepLink, blockerFor, prog, setProg,
  startStory, completeStory, checkUnlocks, seriesProgress,
  pushContentUpdate, applyContentUpdate,

  // story
  blocksOf, playBlock, togglePlay, setScreenOff,

  // vòng lặp
  start() {
    if (window.__bvTimer) return;
    window.__bvTimer = setInterval(tick, C.TICK_MS);
  },
  setTimeScale(x) {
    S.timeScale = x;
    log("DEV", `Tốc độ thời gian mô phỏng: ×${x}`);
  },
};
