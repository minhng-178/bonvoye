/* =============================================================================
   BonVoye — App Core Prototype · art.js

   Sinh SVG cho:
     · lớp "map thật"  — thay chỗ Mapbox base
     · lớp TRANH       — isometric, palette lấy từ docs/images/NPC.png
     · NPC             — hình người nhỏ, scale theo npc.artwork_scale
     · khung webtoon   — cảnh đêm + bóng thoại (như docs/images/Story.png)

   QUAN TRỌNG: nhà trong lớp tranh được vẽ NGAY TẠI `poi.artwork_position`, và
   điểm đó là CHÂN công trình (CMS PHẦN 13). Mái vẽ vống LÊN TRÊN điểm đó — nên
   nhìn là thấy ngay vì sao chấm mốc ở đỉnh mái thì lệch 14–75m.

   Mọi hình vẽ trong hệ toạ độ "world" = artwork viewBox 1000×1340, để lớp tranh
   và lớp map thật dùng chung một phép biến đổi world→screen.
   ========================================================================== */

const PAL = {
  roof: "#b4472b", roofDark: "#8f3620", roofRidge: "#6f2916",
  roofGrey: "#4a5560", roofGreyDark: "#374049",
  wall: "#e0bd8e", wallDark: "#c09562",
  wallWhite: "#f0e8d8", wallWhiteDark: "#d8cdb8",
  wood: "#c98a3c", woodDark: "#a06c28",
  ground: "#f2e6ce", ground2: "#e8d9bb",
  grass: "#cfdcae", grassDark: "#a9bd84",
  tree: "#4f6f52", treeLight: "#7a9b78",
  road: "#efe6d4", roadLine: "#d9caac",
  water: "#cfe0dc", waterDark: "#a9c6c0",
  stone: "#cfc7b8", stoneDark: "#aaa192",
};

/* ── hình học isometric ──────────────────────────────────────────────────── */

/** Nhà isometric. (bx,by) = CHÂN công trình. Mái vẽ lên trên. */
function isoHouse(bx, by, w, d, h, o = {}) {
  const roof = o.roof || PAL.roof;
  const roofD = o.roofDark || PAL.roofDark;
  const wall = o.wall || PAL.wall;
  const wallD = o.wallDark || PAL.wallDark;
  const hw = w / 2;
  const hd = d / 4; // ép dẹt 2:1 cho phối cảnh iso
  const cx = bx, cy = by - hd;

  const F = [bx, by], R = [bx + hw, by - hd], B = [bx, by - hd * 2], L = [bx - hw, by - hd];
  const up = (p) => [p[0], p[1] - h];
  const pt = (p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
  const poly = (pts, fill, extra = "") =>
    `<polygon points="${pts.map(pt).join(" ")}" fill="${fill}" ${extra}/>`;

  // mái đua ra ngoài tường
  const k = 1 + (o.eave ?? 0.2);
  const sc = (p) => [cx + (p[0] - cx) * k, cy + (p[1] - cy) * k - h];
  const Fe = sc(F), Re = sc(R), Be = sc(B), Le = sc(L);
  const rh = o.roofH ?? Math.max(9, w * 0.34);
  const apex = [bx, cy - h - rh];

  let s = "";
  // thân nhà — hai mặt thấy được
  s += poly([L, F, up(F), up(L)], wallD);
  s += poly([F, R, up(R), up(F)], wall);
  // cửa / cột gỗ trên mặt sáng
  if (!o.noDoor && w > 26) {
    const dw = w * 0.16, dh = h * 0.6;
    const mx = (F[0] + R[0]) / 2, my = (F[1] + R[1]) / 2;
    // Nghiêng cửa theo đúng độ dốc của mặt tường sáng (F→R có slope -hd/hw).
    // `skewY()` chỉ nhận MỘT tham số góc và luôn quay quanh gốc toạ độ, nên phải
    // kẹp giữa hai translate để lấy tâm là (mx,my).
    const skew = (-Math.atan2(hd, hw) * 180 / Math.PI).toFixed(2);
    s += `<rect x="${(mx - dw / 2).toFixed(1)}" y="${(my - dh).toFixed(1)}" width="${dw.toFixed(1)}" height="${dh.toFixed(1)}" fill="${PAL.woodDark}" opacity=".82" transform="translate(${mx.toFixed(1)} ${my.toFixed(1)}) skewY(${skew}) translate(${(-mx).toFixed(1)} ${(-my).toFixed(1)})"/>`;
  }
  // mái hình chóp — 2 dốc thấy được
  s += poly([Le, Fe, apex], roofD);
  s += poly([Fe, Re, apex], roof);
  // diềm mái
  s += `<polyline points="${pt(Le)} ${pt(Fe)} ${pt(Re)}" fill="none" stroke="${PAL.roofRidge}" stroke-width="1.6" stroke-linejoin="round" opacity=".55"/>`;
  // bóng đổ dưới chân
  s = `<ellipse cx="${cx.toFixed(1)}" cy="${(by - hd + 2).toFixed(1)}" rx="${(hw * 1.15).toFixed(1)}" ry="${(hd * 1.2).toFixed(1)}" fill="#8a7358" opacity=".16"/>` + s;
  return s;
}

/** Tháp: xếp nhiều tầng mái nhỏ dần. */
function isoTower(bx, by, w, tiers, tierH) {
  let s = "", cw = w, y = by;
  for (let i = 0; i < tiers; i++) {
    s += isoHouse(bx, y, cw, cw * 0.78, tierH, { eave: 0.3, roofH: cw * 0.3, noDoor: true, roof: PAL.wood, roofDark: PAL.woodDark, wall: "#d8a05a", wallDark: "#b07e3c" });
    y -= tierH + cw * 0.22;
    cw *= 0.84;
  }
  return s;
}

function isoTree(x, y, r) {
  return (
    `<ellipse cx="${x}" cy="${y + 1}" rx="${r * 0.9}" ry="${r * 0.32}" fill="#8a7358" opacity=".15"/>` +
    `<rect x="${x - r * 0.11}" y="${y - r * 0.75}" width="${r * 0.22}" height="${r * 0.8}" fill="#7a5c3a"/>` +
    `<circle cx="${x}" cy="${y - r * 1.05}" r="${r * 0.72}" fill="${PAL.tree}"/>` +
    `<circle cx="${x - r * 0.34}" cy="${y - r * 0.8}" r="${r * 0.5}" fill="${PAL.treeLight}" opacity=".85"/>` +
    `<circle cx="${x + r * 0.36}" cy="${y - r * 0.88}" r="${r * 0.46}" fill="${PAL.tree}"/>`
  );
}

/* ── lớp TRANH (isometric) ──────────────────────────────────────────────── */

/** Vẽ theo `style` của KHU, và cắm nhà đúng tại artwork_position của từng POI. */
function artIso(site) {
  const { w, h } = site.artwork.viewBox;
  const pois = DB.poisOfSite(site.id);
  let s = "";

  // nền + thảm cỏ
  s += `<rect width="${w}" height="${h}" fill="${PAL.ground}"/>`;
  s += `<path d="M0,${h * 0.1} C${w * 0.3},${h * 0.02} ${w * 0.7},${h * 0.2} ${w},${h * 0.08} L${w},0 L0,0 Z" fill="${PAL.grass}" opacity=".7"/>`;
  s += `<path d="M0,${h} L0,${h * 0.82} C${w * 0.35},${h * 0.9} ${w * 0.6},${h * 0.76} ${w},${h * 0.86} L${w},${h} Z" fill="${PAL.grass}" opacity=".55"/>`;

  if (site.artwork.style === "phoco") {
    // sông Hồng phía đông
    s += `<path d="M${w * 0.94},0 C${w * 1.02},${h * 0.3} ${w * 0.96},${h * 0.6} ${w * 1.1},${h} L${w},${h} L${w * 0.86},${h} C${w * 0.9},${h * 0.62} ${w * 0.88},${h * 0.28} ${w * 0.87},0 Z" fill="${PAL.water}"/>`;
    s += `<path d="M${w * 0.9},0 C${w * 0.94},${h * 0.35} ${w * 0.92},${h * 0.65} ${w},${h}" fill="none" stroke="${PAL.waterDark}" stroke-width="2" opacity=".5"/>`;

    // TRỤC PHỐ vẽ ĐI QUA đúng artwork_position của các POI — nhờ vậy trang trí
    // luôn khớp với marker, dù toạ độ tranh có được căn lại.
    const road = pois.map((p) => p.artwork_position).sort((a, b) => a.x - b.x);
    if (road.length > 1) {
      const dpath = road.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y - 6}`).join(" ");
      s += `<path d="${dpath}" fill="none" stroke="${PAL.road}" stroke-width="46" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += `<path d="${dpath}" fill="none" stroke="${PAL.roadLine}" stroke-width="1.6" stroke-dasharray="11 11"/>`;
      // dãy nhà ống hai bên phố, nội suy dọc trục
      for (let i = 0; i < 16; i++) {
        const t = i / 15;
        const seg = t * (road.length - 1);
        const a = road[Math.floor(seg)], b = road[Math.min(road.length - 1, Math.floor(seg) + 1)];
        const f = seg - Math.floor(seg);
        const x = a.x + (b.x - a.x) * f + (i % 2 ? 8 : -8);
        const y = a.y + (b.y - a.y) * f + (i % 2 ? 62 : -54);
        s += isoHouse(x, y, 40 + (i % 3) * 9, 34, 30 + (i % 4) * 11, {
          roof: i % 3 === 0 ? PAL.roofGrey : PAL.roof,
          roofDark: i % 3 === 0 ? PAL.roofGreyDark : PAL.roofDark,
        });
      }
      // ngõ ngang
      for (let i = 1; i < road.length; i++) {
        const m = { x: (road[i - 1].x + road[i].x) / 2, y: (road[i - 1].y + road[i].y) / 2 };
        s += `<line x1="${m.x}" y1="${m.y - 200}" x2="${m.x}" y2="${m.y + 240}" stroke="${PAL.road}" stroke-width="24"/>`;
      }
    }
    s += isoTree(w * 0.34, h * 0.42, 26) + isoTree(w * 0.2, h * 0.88, 22) + isoTree(w * 0.72, h * 0.44, 19);
    s += isoTree(w * 0.78, h * 0.92, 24) + isoTree(w * 0.46, h * 0.24, 21) + isoTree(w * 0.06, h * 0.7, 18);
    // vài khối nhà rải ngoài trục cho đỡ trống khi pan
    for (let i = 0; i < 12; i++) {
      const x = ((i * 271) % 900) + 50, y = ((i * 431) % 1000) + 160;
      if (Math.abs(y - 700) < 150) continue; // tránh đè trục phố
      s += isoHouse(x, y, 34 + (i % 3) * 8, 30, 26 + (i % 3) * 9, {
        roof: i % 2 ? PAL.roofGrey : PAL.roof,
        roofDark: i % 2 ? PAL.roofGreyDark : PAL.roofDark,
      });
    }
  }

  if (site.artwork.style === "vanmieu") {
    // trục thần đạo dọc giữa + tường bao
    s += `<rect x="${w * 0.16}" y="${h * 0.14}" width="${w * 0.68}" height="${h * 0.74}" fill="${PAL.ground2}" stroke="${PAL.stoneDark}" stroke-width="3" rx="6"/>`;
    s += `<path d="M${w * 0.5},${h * 0.86} L${w * 0.5},${h * 0.16}" stroke="${PAL.stone}" stroke-width="30"/>`;
    s += `<path d="M${w * 0.5},${h * 0.86} L${w * 0.5},${h * 0.16}" stroke="${PAL.stoneDark}" stroke-width="1.5" stroke-dasharray="10 10"/>`;
    // vườn bia hai bên trục, quanh cao độ của POI "Bia Tiến sĩ"
    for (let i = 0; i < 12; i++) {
      const x = w * (i < 6 ? 0.33 : 0.67);
      const y = h * (0.33 + (i % 6) * 0.031);
      s += `<rect x="${x - 9}" y="${y - 22}" width="18" height="22" rx="8" fill="${PAL.stone}" stroke="${PAL.stoneDark}"/>`;
      s += `<ellipse cx="${x}" cy="${y + 1}" rx="13" ry="5" fill="${PAL.stoneDark}" opacity=".3"/>`;
    }
    // nhà Thái Học phía bắc + cổng Đại Trung phía nam
    s += isoHouse(w * 0.5, h * 0.22, 150, 84, 44, { eave: 0.26, roofH: 34, wall: PAL.wallWhite, wallDark: PAL.wallWhiteDark });
    s += isoHouse(w * 0.5, h * 0.93, 110, 62, 34, { eave: 0.3, roofH: 26 });
    for (let i = 0; i < 8; i++)
      s += isoTree(w * (0.24 + (i % 2) * 0.54), h * (0.18 + i * 0.1), 20 + (i % 3) * 5);
  }

  if (site.artwork.style === "den") {
    s += `<rect x="${w * 0.22}" y="${h * 0.3}" width="${w * 0.56}" height="${h * 0.5}" fill="${PAL.ground2}" stroke="${PAL.stoneDark}" stroke-width="3" rx="6"/>`;
    s += `<path d="M${w * 0.5},${h * 0.8} L${w * 0.5},${h * 0.34}" stroke="${PAL.stone}" stroke-width="26"/>`;
    s += isoTree(w * 0.3, h * 0.42, 28) + isoTree(w * 0.7, h * 0.44, 26) + isoTree(w * 0.36, h * 0.72, 22);
    for (let i = 0; i < 5; i++)
      s += isoHouse(w * (0.28 + i * 0.11), h * (0.9 + (i % 2) * 0.03), 42, 34, 30, { roof: PAL.roofGrey, roofDark: PAL.roofGreyDark });
  }

  // ── công trình CHÍNH: cắm đúng tại artwork_position của POI ────────────
  // Sắp theo y để nhà phía trước che nhà phía sau (đúng thứ tự vẽ iso).
  const anchors = [...pois].sort((a, b) => a.artwork_position.y - b.artwork_position.y);
  for (const poi of anchors) {
    const { x, y } = poi.artwork_position;
    if (/Khuê Văn Các/.test(poi.name)) {
      s += isoTower(x, y, 74, 2, 40);
    } else if (/Ô Quan Chưởng/.test(poi.name)) {
      // cổng thành: khối tường + vọng lâu nhỏ trên đỉnh
      s += isoHouse(x, y, 116, 62, 52, { wall: PAL.wallWhite, wallDark: PAL.wallWhiteDark, roofH: 16, eave: 0.1, noDoor: true });
      s += `<path d="M${x - 14},${y - 16} a14,20 0 0 1 28,0 L${x + 14},${y - 16} Z" fill="#5c4632" opacity=".9"/>`;
      s += isoHouse(x, y - 62, 60, 40, 26, { eave: 0.34, roofH: 22, noDoor: true });
    } else if (/Bia Tiến sĩ/.test(poi.name)) {
      s += isoHouse(x, y, 88, 56, 34, { eave: 0.3, roofH: 26, wall: PAL.wallWhite, wallDark: PAL.wallWhiteDark });
    } else if (/Giếng/.test(poi.name)) {
      s += `<rect x="${x - 52}" y="${y - 30}" width="104" height="30" fill="${PAL.water}" stroke="${PAL.waterDark}" stroke-width="2.5"/>`;
      s += `<path d="M${x - 40},${y - 20} q12,-6 24,0 q12,6 24,0" fill="none" stroke="${PAL.waterDark}" stroke-width="1.6" opacity=".7"/>`;
    } else if (/Chợ/.test(poi.name)) {
      s += isoHouse(x, y, 128, 76, 46, { roof: PAL.roofGrey, roofDark: PAL.roofGreyDark, wall: PAL.wallWhite, wallDark: PAL.wallWhiteDark, eave: 0.14, roofH: 20 });
    } else if (/Đền/.test(poi.name)) {
      s += isoHouse(x, y, 104, 66, 40, { eave: 0.32, roofH: 34 });
    } else {
      // POI dạng phố (Hàng Chiếu): dãy nhà ống liền kề
      for (let i = -2; i <= 2; i++)
        s += isoHouse(x + i * 34, y + Math.abs(i) * 5, 32, 28, 34 + (i % 2) * 8, {
          roof: i % 2 ? PAL.roofGrey : PAL.roof,
          roofDark: i % 2 ? PAL.roofGreyDark : PAL.roofDark,
        });
    }
  }
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">${s}</svg>`;
}

/* ── lớp MAP THẬT (thay chỗ Mapbox) ─────────────────────────────────────── */

/** Nền phố xám lạnh + block nhà, để toggle "Xem Map thật" thấy rõ khác biệt. */
function artBase(site, geoToWorld) {
  const { w, h } = site.artwork.viewBox;
  let s = `<rect width="${w}" height="${h}" fill="#eceee9"/>`;
  // block nhà
  for (let gx = 0; gx < 6; gx++)
    for (let gy = 0; gy < 8; gy++) {
      const x = 20 + gx * (w / 6), y = 20 + gy * (h / 8);
      s += `<rect x="${x}" y="${y}" width="${w / 6 - 40}" height="${h / 8 - 40}" fill="#e2e5df" stroke="#d5d9d1" rx="3"/>`;
    }
  // đường
  for (let gx = 1; gx < 6; gx++)
    s += `<line x1="${gx * (w / 6)}" y1="0" x2="${gx * (w / 6)}" y2="${h}" stroke="#fff" stroke-width="13"/>`;
  for (let gy = 1; gy < 8; gy++)
    s += `<line x1="0" y1="${gy * (h / 8)}" x2="${w}" y2="${gy * (h / 8)}" stroke="#fff" stroke-width="11"/>`;
  s += `<line x1="0" y1="${h * 0.52}" x2="${w}" y2="${h * 0.52}" stroke="#f6e6b8" stroke-width="20"/>`;
  s += `<line x1="0" y1="${h * 0.52}" x2="${w}" y2="${h * 0.52}" stroke="#e8d59c" stroke-width="1.5" stroke-dasharray="16 12"/>`;

  // vùng tương tác thật (polygon) vẽ theo GPS — chứng minh hai hệ toạ độ khác nhau
  for (const poi of DB.poisOfSite(site.id)) {
    if (poi.interaction.mode !== "polygon") continue;
    const pts = poi.interaction.polygon.map((p) => { const q = geoToWorld(p); return `${q.x.toFixed(0)},${q.y.toFixed(0)}`; }).join(" ");
    s += `<polygon points="${pts}" fill="rgba(180,71,43,.1)" stroke="rgba(180,71,43,.5)" stroke-width="2" stroke-dasharray="6 5"/>`;
  }
  if (site.geofence.mode === "polygon") {
    const pts = site.geofence.polygon.map((p) => { const q = geoToWorld(p); return `${q.x.toFixed(0)},${q.y.toFixed(0)}`; }).join(" ");
    s += `<polygon points="${pts}" fill="none" stroke="rgba(61,107,142,.55)" stroke-width="2.5" stroke-dasharray="12 7"/>`;
  }
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">${s}</svg>`;
}

/* ── NPC ─────────────────────────────────────────────────────────────────── */

const AVATAR = {
  tea: { robe: "#8c5a3c", trim: "#c98a3c", skin: "#e8c39e", hat: null, prop: "bowl" },
  guard: { robe: "#5a6b7c", trim: "#b4472b", skin: "#e0b892", hat: "conical", prop: "spear" },
  weaver: { robe: "#6b7a4a", trim: "#cfdcae", skin: "#e8c39e", hat: null, prop: null },
  smith: { robe: "#4a4a52", trim: "#b4472b", skin: "#d8ab84", hat: null, prop: "hammer" },
  vendor: { robe: "#a8547a", trim: "#f0e8d8", skin: "#e8c39e", hat: "scarf", prop: null },
  student: { robe: "#3f5f8a", trim: "#f0e8d8", skin: "#eccba6", hat: "cap", prop: "scroll" },
  elder: { robe: "#7a5c3a", trim: "#e0bd8e", skin: "#ddb894", hat: "cap", prop: "staff" },
  scribe: { robe: "#4f6f52", trim: "#e0bd8e", skin: "#e8c39e", hat: "cap", prop: "scroll" },
  sweeper: { robe: "#8a7358", trim: "#cfc7b8", skin: "#ddb894", hat: "conical", prop: "broom" },
};

/** Người nhỏ, neo ĐÁY: gốc toạ độ ở chân (0,44). */
function npcFigure(avatar) {
  const a = AVATAR[avatar] || AVATAR.elder;
  let s = "";
  s += `<ellipse cx="17" cy="43" rx="10" ry="3" fill="#8a7358" opacity=".25"/>`;
  if (a.prop === "staff") s += `<line x1="26" y1="16" x2="27" y2="42" stroke="#7a5c3a" stroke-width="2"/>`;
  if (a.prop === "spear") s += `<line x1="27" y1="6" x2="28" y2="42" stroke="#7a5c3a" stroke-width="2"/><path d="M27,6 l3,6 -5,0 z" fill="#cfc7b8"/>`;
  if (a.prop === "broom") s += `<line x1="26" y1="18" x2="28" y2="42" stroke="#a08050" stroke-width="2"/><path d="M25,40 l7,0 2,4 -11,0 z" fill="#c9a86a"/>`;
  // áo dài: hình thang
  s += `<path d="M11,42 L23,42 L21,20 Q17,17 13,20 Z" fill="${a.robe}"/>`;
  s += `<path d="M13,42 L21,42 L20,32 L14,32 Z" fill="${a.trim}" opacity=".55"/>`;
  s += `<path d="M13,20 Q17,25 21,20 L21,24 Q17,28 13,24 Z" fill="${a.trim}" opacity=".8"/>`;
  // tay
  s += `<line x1="12.5" y1="23" x2="9" y2="32" stroke="${a.robe}" stroke-width="3.2" stroke-linecap="round"/>`;
  s += `<line x1="21.5" y1="23" x2="25" y2="31" stroke="${a.robe}" stroke-width="3.2" stroke-linecap="round"/>`;
  if (a.prop === "bowl") s += `<ellipse cx="9" cy="32" rx="4" ry="2.2" fill="#e8ded0"/><path d="M5,32 a4,3 0 0 0 8,0" fill="#cfc7b8"/>`;
  if (a.prop === "hammer") s += `<rect x="23" y="28" width="6" height="4" rx="1" fill="#6b6b73"/>`;
  if (a.prop === "scroll") s += `<rect x="5.5" y="29" width="7.5" height="4" rx="2" fill="#f0e8d8" stroke="#cbbfa8" stroke-width=".8"/>`;
  // đầu
  s += `<circle cx="17" cy="14" r="5.4" fill="${a.skin}"/>`;
  s += `<path d="M11.8,12.5 Q17,7 22.2,12.5 Q17,10.5 11.8,12.5 Z" fill="#2b2018"/>`;
  if (a.hat === "conical") s += `<path d="M8.5,11 L17,1 L25.5,11 Z" fill="#dcc48a" stroke="#b89f66" stroke-width=".8"/>`;
  if (a.hat === "cap") s += `<path d="M11,10.5 Q17,4.5 23,10.5 Z" fill="#2f3a4a"/><rect x="10.5" y="10" width="13" height="2.2" rx="1" fill="#222b38"/>`;
  if (a.hat === "scarf") s += `<path d="M11.5,11 Q17,6 22.5,11 L22,14 Q17,11 12,14 Z" fill="${a.trim}"/>`;
  return `<svg viewBox="0 0 34 46">${s}</svg>`;
}

/* ── webtoon ─────────────────────────────────────────────────────────────── */

const SCENES = {
  "gate-dawn": () => {
    let s = `<rect width="340" height="240" fill="#2c3a4a"/>`;
    s += `<circle cx="270" cy="58" r="26" fill="#e8b06a" opacity=".5"/>`;
    s += `<path d="M0,240 L0,150 L340,150 L340,240 Z" fill="#1b2530"/>`;
    // vòm cổng
    s += `<path d="M90,150 L90,80 L250,80 L250,150 Z" fill="#39485a"/>`;
    s += `<path d="M143,150 L143,112 a27,32 0 0 1 54,0 L197,150 Z" fill="#0f151c"/>`;
    s += `<path d="M78,80 L262,80 L250,62 L90,62 Z" fill="#5c3b2c"/>`;
    s += `<path d="M100,62 L240,62 L232,48 L108,48 Z" fill="#8f3620"/>`;
    s += `<rect x="150" y="70" width="40" height="7" rx="2" fill="#c98a3c" opacity=".8"/>`;
    // người
    s += `<ellipse cx="120" cy="196" rx="16" ry="4" fill="#0d1218" opacity=".6"/>`;
    s += `<path d="M112,194 L128,194 L125,158 Q120,154 115,158 Z" fill="#6b4a34"/><circle cx="120" cy="150" r="7" fill="#d8ab84"/>`;
    s += `<ellipse cx="200" cy="200" rx="14" ry="4" fill="#0d1218" opacity=".6"/>`;
    s += `<path d="M193,198 L207,198 L205,166 Q200,162 195,166 Z" fill="#3f5f8a"/><circle cx="200" cy="158" r="6.5" fill="#e0b892"/>`;
    return s;
  },
  "gate-night": () => {
    let s = `<rect width="340" height="240" fill="#0f1620"/>`;
    for (let i = 0; i < 22; i++)
      s += `<circle cx="${(i * 71) % 340}" cy="${(i * 37) % 110}" r="${i % 3 ? 0.9 : 1.5}" fill="#dfe8f0" opacity="${i % 2 ? 0.5 : 0.85}"/>`;
    s += `<path d="M0,240 L0,152 L340,152 L340,240 Z" fill="#141d27"/>`;
    s += `<path d="M84,152 L84,78 L256,78 L256,152 Z" fill="#1d2a36"/>`;
    s += `<path d="M141,152 L141,110 a29,34 0 0 1 58,0 L199,152 Z" fill="#050809"/>`;
    s += `<path d="M72,78 L268,78 L256,58 L84,58 Z" fill="#2b2018"/>`;
    // đèn lồng
    [110, 230].forEach((x) => {
      s += `<line x1="${x}" y1="78" x2="${x}" y2="92" stroke="#5c4632" stroke-width="1.5"/>`;
      s += `<ellipse cx="${x}" cy="102" rx="10" ry="13" fill="#e8a13c" opacity=".92"/>`;
      s += `<circle cx="${x}" cy="102" r="24" fill="#e8a13c" opacity=".14"/>`;
    });
    s += `<ellipse cx="118" cy="206" rx="16" ry="4" fill="#000" opacity=".5"/>`;
    s += `<path d="M110,204 L126,204 L124,164 Q118,160 112,164 Z" fill="#3a4756"/><circle cx="118" cy="156" r="7" fill="#c8a184"/>`;
    s += `<line x1="128" y1="150" x2="130" y2="204" stroke="#5c4632" stroke-width="2"/><path d="M128,150 l4,8 -7,0 z" fill="#aab4bd"/>`;
    return s;
  },
  "teahouse-night": () => {
    let s = `<rect width="340" height="240" fill="#16212b"/>`;
    s += `<rect y="0" width="340" height="120" fill="#1f2f3c"/>`;
    // hàng cột + mái hiên
    for (let i = 0; i < 5; i++) s += `<rect x="${18 + i * 76}" y="14" width="9" height="106" fill="#3a2b1e"/>`;
    s += `<path d="M0,20 L340,20 L340,6 L0,6 Z" fill="#4a3423"/>`;
    // bàn + người ngồi
    s += `<rect x="26" y="86" width="70" height="8" rx="2" fill="#5c4632"/><rect x="34" y="94" width="6" height="26" fill="#4a3423"/><rect x="82" y="94" width="6" height="26" fill="#4a3423"/>`;
    s += `<circle cx="48" cy="72" r="8" fill="#dcae86"/><path d="M40,86 L56,86 L54,78 Q48,74 42,78 Z" fill="#6b7a4a"/>`;
    s += `<circle cx="76" cy="74" r="7.5" fill="#d8a884"/><path d="M69,86 L83,86 L81,79 Q76,75 71,79 Z" fill="#8c5a3c"/>`;
    // người đứng
    s += `<path d="M150,120 L166,120 L163,74 Q157,70 152,74 Z" fill="#2f4a6b"/><circle cx="158" cy="66" r="7.5" fill="#e8c39e"/><path d="M150,64 Q158,58 166,64 Q158,61 150,64 Z" fill="#241c16"/>`;
    s += `<path d="M196,120 L214,120 L211,70 Q204,65 198,70 Z" fill="#3f5f8a"/><circle cx="205" cy="61" r="8" fill="#eccba6"/><path d="M196,59 Q205,52 214,59 Q205,56 196,59 Z" fill="#241c16"/>`;
    // sàn dưới + đèn
    s += `<rect y="120" width="340" height="120" fill="#101a22"/>`;
    s += `<path d="M0,120 L340,120 L340,132 L0,132 Z" fill="#2b2018"/>`;
    [40, 300].forEach((x) => {
      s += `<ellipse cx="${x}" cy="164" rx="12" ry="16" fill="#e8a13c" opacity=".9"/>`;
      s += `<circle cx="${x}" cy="164" r="30" fill="#e8a13c" opacity=".12"/>`;
    });
    s += `<circle cx="150" cy="188" r="7" fill="#dcae86"/><path d="M142,214 L158,214 L156,196 Q150,192 144,196 Z" fill="#5a6b7c"/>`;
    s += `<circle cx="212" cy="184" r="7.5" fill="#e0b892"/><path d="M204,214 L220,214 L218,192 Q212,188 206,192 Z" fill="#7a5c3a"/><path d="M204,180 Q212,172 220,180 Z" fill="#2f3a4a"/>`;
    return s;
  },
  "courtyard-day": () => {
    let s = `<rect width="340" height="240" fill="#cfe0dc"/>`;
    s += `<rect y="118" width="340" height="122" fill="#ded1b4"/>`;
    s += `<path d="M40,118 L300,118 L300,56 L40,56 Z" fill="#e0bd8e"/>`;
    s += `<path d="M28,56 L312,56 L296,30 L44,30 Z" fill="#b4472b"/>`;
    s += `<path d="M44,30 L296,30 L286,20 L54,20 Z" fill="#8f3620"/>`;
    s += `<rect x="150" y="70" width="42" height="48" fill="#5c4632"/>`;
    // bảng vàng
    s += `<rect x="96" y="72" width="42" height="34" fill="#f2e6ce" stroke="#a06c28" stroke-width="2"/>`;
    for (let i = 0; i < 5; i++) s += `<line x1="101" y1="${79 + i * 6}" x2="133" y2="${79 + i * 6}" stroke="#a89878" stroke-width="1.2"/>`;
    // đám đông
    for (let i = 0; i < 9; i++) {
      const x = 60 + i * 27, y = 196 + (i % 3) * 8;
      s += `<path d="M${x - 7},${y} L${x + 7},${y} L${x + 5},${y - 30} Q${x},${y - 35} ${x - 5},${y - 30} Z" fill="${["#3f5f8a", "#4f6f52", "#7a5c3a", "#5a6b7c"][i % 4]}"/>`;
      s += `<circle cx="${x}" cy="${y - 40}" r="6.5" fill="#e8c39e"/><path d="M${x - 6},${y - 42} Q${x},${y - 48} ${x + 6},${y - 42} Z" fill="#241c16"/>`;
    }
    s += isoTree(310, 150, 22);
    return s;
  },
  "stele-dusk": () => {
    let s = `<rect width="340" height="240" fill="#3c3a4a"/>`;
    s += `<circle cx="60" cy="52" r="30" fill="#e8956a" opacity=".38"/>`;
    s += `<rect y="140" width="340" height="100" fill="#2a2833"/>`;
    // hàng bia trên lưng rùa
    for (let i = 0; i < 5; i++) {
      const x = 44 + i * 66, y = 168 + (i % 2) * 10;
      s += `<ellipse cx="${x}" cy="${y}" rx="21" ry="8" fill="#4a4756"/>`;
      s += `<rect x="${x - 13}" y="${y - 52}" width="26" height="52" rx="12" fill="#cfc7b8"/>`;
      s += `<rect x="${x - 9}" y="${y - 44}" width="18" height="36" rx="3" fill="#b3ab9c"/>`;
      for (let k = 0; k < 5; k++) s += `<line x1="${x - 6}" y1="${y - 40 + k * 7}" x2="${x + 6}" y2="${y - 40 + k * 7}" stroke="#8d8577" stroke-width="1.1"/>`;
    }
    s += `<path d="M232,230 L250,230 L247,176 Q240,171 234,176 Z" fill="#4f6f52"/><circle cx="241" cy="168" r="8" fill="#e0b892"/>`;
    s += `<line x1="250" y1="182" x2="262" y2="196" stroke="#4f6f52" stroke-width="4" stroke-linecap="round"/>`;
    return s;
  },
};

function webtoonScene(bg) {
  const f = SCENES[bg] || SCENES["teahouse-night"];
  return `<svg viewBox="0 0 340 240" preserveAspectRatio="xMidYMid meet">${f()}</svg>`;
}

/* ── hình trang trí Home + map nhỏ trong dialog OS ───────────────────────── */

function homeHero() {
  let s = `<rect width="360" height="176" fill="none"/>`;
  s += `<path d="M0,150 C70,132 130,158 190,142 C250,126 310,150 360,136 L360,176 L0,176 Z" fill="${PAL.grass}" opacity=".65"/>`;
  s += isoTower(66, 150, 42, 3, 22);
  s += isoHouse(150, 156, 74, 44, 34, { eave: 0.28, roofH: 26 });
  s += isoHouse(226, 150, 58, 36, 28, { roof: PAL.roofGrey, roofDark: PAL.roofGreyDark });
  s += isoHouse(292, 158, 50, 32, 24, { eave: 0.3 });
  s += isoTree(196, 160, 18) + isoTree(258, 166, 15) + isoTree(112, 164, 14) + isoTree(336, 154, 16);
  // vài chim
  s += `<path d="M40,44 q6,-5 12,0 q6,-5 12,0" fill="none" stroke="#6f8797" stroke-width="1.6"/>`;
  s += `<path d="M84,28 q5,-4 10,0 q5,-4 10,0" fill="none" stroke="#6f8797" stroke-width="1.4"/>`;
  return `<svg viewBox="0 0 360 176">${s}</svg>`;
}

function osMapMini() {
  let s = `<rect width="240" height="84" fill="#dfe8e2"/>`;
  for (let i = 1; i < 5; i++) s += `<line x1="${i * 48}" y1="0" x2="${i * 48}" y2="84" stroke="#fff" stroke-width="7"/>`;
  for (let i = 1; i < 3; i++) s += `<line x1="0" y1="${i * 28}" x2="240" y2="${i * 28}" stroke="#fff" stroke-width="6"/>`;
  s += `<circle cx="120" cy="44" r="22" fill="#0a7aff" opacity=".18"/>`;
  s += `<circle cx="120" cy="44" r="6" fill="#0a7aff" stroke="#fff" stroke-width="2.4"/>`;
  return `<svg viewBox="0 0 240 84">${s}</svg>`;
}

window.Art = { artIso, artBase, npcFigure, webtoonScene, homeHero, osMapMini, PAL, isoHouse, isoTree };
