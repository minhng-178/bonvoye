"use strict";
// BonVoye Figma Plugin — All Mockup Screens
// Reads mockup-screens.json from UI, renders 50 phone frames in Figma.

figma.showUI(__html__, { width: 380, height: 540, themeColors: true });

// ── Color helpers ─────────────────────────────────────────────────────────────
function hexRgb(h) {
  const v = h.replace("#", "");
  return { r: parseInt(v.slice(0,2),16)/255, g: parseInt(v.slice(2,4),16)/255, b: parseInt(v.slice(4,6),16)/255 };
}
function solid(h, a) {
  const c = hexRgb(h);
  return [{ type: "SOLID", color: c, opacity: a ?? 1 }];
}

// ── Font loading ──────────────────────────────────────────────────────────────
async function loadFonts() {
  await Promise.all([
    figma.loadFontAsync({ family: "Inter", style: "Regular" }),
    figma.loadFontAsync({ family: "Inter", style: "Semi Bold" }),
    figma.loadFontAsync({ family: "Inter", style: "Bold" }),
  ]);
}

// ── Phone device frame builder ────────────────────────────────────────────────
function makePhoneFrame(name, screenPngBytes) {
  // Outer device 393×852
  const device = figma.createFrame();
  device.name = name;
  device.resize(393, 852);
  device.cornerRadius = 52;
  device.clipsContent = true;
  device.fills = solid("#0b0d0f");
  device.strokes = [{ type: "SOLID", color: hexRgb("#2a3039"), opacity: 1 }];
  device.strokeWeight = 1.5;
  device.strokeAlign = "OUTSIDE";
  device.effects = [{
    type: "DROP_SHADOW",
    color: { r: 0, g: 0, b: 0, a: 0.65 },
    offset: { x: 0, y: 24 },
    radius: 50,
    spread: -12,
    visible: true,
    blendMode: "NORMAL",
  }];

  // Inner screen 371×830
  const screen = figma.createFrame();
  screen.name = "Screen";
  screen.resize(371, 830);
  screen.x = 11;
  screen.y = 11;
  screen.cornerRadius = 42;
  screen.clipsContent = true;

  // Set image fill from PNG bytes
  const imageHash = figma.createImage(screenPngBytes).hash;
  screen.fills = [{
    type: "IMAGE",
    imageHash: imageHash,
    scaleMode: "FILL",
  }];

  // Dynamic Island
  const island = figma.createRectangle();
  island.name = "Dynamic Island";
  island.resize(118, 33);
  island.x = (371 - 118) / 2;
  island.y = 9;
  island.cornerRadius = 16;
  island.fills = solid("#0b0d0f");
  screen.appendChild(island);

  device.appendChild(screen);
  return device;
}

// ── Group label ───────────────────────────────────────────────────────────────
function makeGroupLabel(groupName) {
  const label = figma.createText();
  label.name = "Group: " + groupName;
  label.characters = groupName.toUpperCase();
  label.fontSize = 11;
  label.fontName = { family: "Inter", style: "Bold" };
  label.fills = solid("#8899aa");
  label.letterSpacing = { value: 12, unit: "PERCENT" };
  return label;
}

// ── Screen caption ────────────────────────────────────────────────────────────
function makeCaption(num, title, note) {
  const wrap = figma.createFrame();
  wrap.name = "Caption";
  wrap.resize(393, 80);
  wrap.fills = [];
  wrap.layoutMode = "VERTICAL";
  wrap.itemSpacing = 4;
  wrap.paddingTop = 0;
  wrap.primaryAxisSizingMode = "AUTO";
  wrap.counterAxisSizingMode = "FIXED";

  const numBadge = figma.createText();
  numBadge.characters = num;
  numBadge.fontSize = 10;
  numBadge.fontName = { family: "Inter", style: "Bold" };
  numBadge.fills = solid("#b4472b");
  wrap.appendChild(numBadge);

  const titleT = figma.createText();
  titleT.characters = title;
  titleT.fontSize = 12;
  titleT.fontName = { family: "Inter", style: "Semi Bold" };
  titleT.fills = solid("#1a2430");
  titleT.resize(393, 20);
  wrap.appendChild(titleT);

  if (note) {
    const noteT = figma.createText();
    noteT.characters = note.slice(0, 120);
    noteT.fontSize = 10;
    noteT.fontName = { family: "Inter", style: "Regular" };
    noteT.fills = solid("#6b7d8d");
    noteT.textAutoResize = "HEIGHT";
    noteT.resize(393, 30);
    wrap.appendChild(noteT);
  }

  return wrap;
}

// ── Main render function ──────────────────────────────────────────────────────
async function drawAllScreens(screens) {
  await loadFonts();

  const PHONE_W = 393;
  const PHONE_H = 852;
  const COL_GAP = 60;   // khoảng cách ngang giữa các phone
  const ROW_GAP = 120;  // khoảng cách dọc giữa các hàng
  const COLS = 6;       // số cột mỗi hàng
  const CAPTION_H = 90; // chiều cao caption dưới phone
  const GROUP_LABEL_H = 40; // chiều cao label nhóm

  const STEP_X = PHONE_W + COL_GAP;
  const STEP_Y = PHONE_H + CAPTION_H + ROW_GAP;

  // Tạo / tìm page
  let page = figma.root.children.find(p => p.name === "BonVoye Mockups");
  if (!page) {
    page = figma.createPage();
    page.name = "BonVoye Mockups";
  }
  figma.currentPage = page;

  // Group screens by group name
  const groups = [];
  const groupMap = new Map();
  screens.forEach(sc => {
    const g = sc.group || "Khác";
    if (!groupMap.has(g)) {
      groupMap.set(g, []);
      groups.push(g);
    }
    groupMap.get(g).push(sc);
  });

  let currentY = 0;
  const allNodes = [];

  for (const groupName of groups) {
    const groupScreens = groupMap.get(groupName);

    // Group label
    const label = makeGroupLabel(groupName);
    label.x = 0;
    label.y = currentY;
    page.appendChild(label);
    allNodes.push(label);
    currentY += GROUP_LABEL_H;

    // Place screens in rows of COLS
    for (let i = 0; i < groupScreens.length; i++) {
      const sc = groupScreens[i];
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x = col * STEP_X;
      const y = currentY + row * STEP_Y;

      // PNG from base64
      let device;
      if (sc.pngBase64) {
        const pngBytes = base64ToUint8Array(sc.pngBase64);
        device = makePhoneFrame(sc.num + " — " + sc.title, pngBytes);
      } else {
        // Fallback: empty frame
        device = figma.createFrame();
        device.name = sc.num + " — " + sc.title;
        device.resize(393, 852);
        device.cornerRadius = 52;
        device.fills = solid("#1a2430");
      }

      device.x = x;
      device.y = y;
      page.appendChild(device);
      allNodes.push(device);

      // Caption
      const caption = makeCaption(sc.num, sc.title, sc.note);
      caption.x = x;
      caption.y = y + PHONE_H + 16;
      page.appendChild(caption);
      allNodes.push(caption);

      // Progress
      figma.ui.postMessage({
        type: "progress",
        current: screens.indexOf(sc) + 1,
        total: screens.length,
        title: sc.title,
      });

      // Yield to avoid blocking
      await new Promise(r => setTimeout(r, 0));
    }

    const rowsUsed = Math.ceil(groupScreens.length / COLS);
    currentY += rowsUsed * STEP_Y + ROW_GAP;
  }

  // Zoom to fit
  figma.viewport.scrollAndZoomIntoView(allNodes.slice(0, 12));
  figma.currentPage.selection = [];

  figma.ui.postMessage({ type: "done", count: screens.length });
  figma.notify("✅ Đã vẽ " + screens.length + " màn hình vào BonVoye Mockups!", { timeout: 4000 });
}

// ── Base64 → Uint8Array ───────────────────────────────────────────────────────
function base64ToUint8Array(b64) {
  const binaryStr = atob(b64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}

// ── Single Home Screen builder ────────────────────────────────────
async function buildHomeScreen() {
  await loadFonts();
  const T = {
    terracotta: "#b4472b", ink: "#241c16", ink70: "#4d423a",
    ink45: "#7c7168", paper: "#faf5ea", line: "#ddd2be",
  };
  const PAL = {
    roof: "#b4472b", roofDark: "#8f3620", roofRidge: "#6f2916",
    roofGrey: "#4a5560", roofGreyDark: "#374049",
    wall: "#e0bd8e", wallDark: "#c09562",
    wood: "#c98a3c", woodDark: "#a06c28",
    grass: "#cfdcae", tree: "#4f6f52", treeLight: "#7a9b78",
  };

  function pt(p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }
  function polyS(pts, fill) { return `<polygon points="${pts.map(pt).join(" ")}" fill="${fill}"/>`; }

  function isoHouse(bx, by, w, d, h, o) {
    o = o || {};
    const roof = o.roof || PAL.roof, roofD = o.roofDark || PAL.roofDark;
    const wall = o.wall || PAL.wall, wallD = o.wallDark || PAL.wallDark;
    const hw = w/2, hd = d/4, cx = bx, cy = by - hd;
    const F=[bx,by], R=[bx+hw,by-hd], L=[bx-hw,by-hd];
    const up = p => [p[0], p[1]-h];
    const k = 1 + (o.eave != null ? o.eave : 0.2);
    const sc = p => [cx+(p[0]-cx)*k, cy+(p[1]-cy)*k-h];
    const Fe=sc(F), Re=sc(R), Le=sc(L);
    const rh = o.roofH != null ? o.roofH : Math.max(9, w*0.34);
    const apex = [bx, cy-h-rh];
    let s = "";
    s += polyS([L,F,up(F),up(L)], wallD);
    s += polyS([F,R,up(R),up(F)], wall);
    if (!o.noDoor && w > 26) {
      const dw=w*0.16, dh=h*0.6, mx=(F[0]+R[0])/2, my=(F[1]+R[1])/2;
      const skew=(-Math.atan2(hd,hw)*180/Math.PI).toFixed(2);
      s += `<rect x="${(mx-dw/2).toFixed(1)}" y="${(my-dh).toFixed(1)}" width="${dw.toFixed(1)}" height="${dh.toFixed(1)}" fill="${PAL.woodDark}" opacity=".82" transform="translate(${mx.toFixed(1)} ${my.toFixed(1)}) skewY(${skew}) translate(${(-mx).toFixed(1)} ${(-my).toFixed(1)})"/>`;
    }
    s += polyS([Le,Fe,apex], roofD);
    s += polyS([Fe,Re,apex], roof);
    s += `<polyline points="${pt(Le)} ${pt(Fe)} ${pt(Re)}" fill="none" stroke="${PAL.roofRidge}" stroke-width="1.6" stroke-linejoin="round" opacity=".55"/>`;
    s = `<ellipse cx="${cx.toFixed(1)}" cy="${(by-hd+2).toFixed(1)}" rx="${(hw*1.15).toFixed(1)}" ry="${(hd*1.2).toFixed(1)}" fill="#8a7358" opacity=".16"/>` + s;
    return s;
  }

  function isoTower(bx, by, w, tiers, tierH) {
    let s="", cw=w, y=by;
    for (let i=0; i<tiers; i++) {
      s += isoHouse(bx, y, cw, cw*0.78, tierH, { eave:0.3, roofH:cw*0.3, noDoor:true, roof:PAL.wood, roofDark:PAL.woodDark, wall:"#d8a05a", wallDark:"#b07e3c" });
      y -= tierH + cw*0.22; cw *= 0.84;
    }
    return s;
  }

  function isoTree(x, y, r) {
    return `<ellipse cx="${x}" cy="${y+1}" rx="${(r*0.9).toFixed(1)}" ry="${(r*0.32).toFixed(1)}" fill="#8a7358" opacity=".15"/>` +
      `<rect x="${(x-r*0.11).toFixed(1)}" y="${(y-r*0.75).toFixed(1)}" width="${(r*0.22).toFixed(1)}" height="${(r*0.8).toFixed(1)}" fill="#7a5c3a"/>` +
      `<circle cx="${x}" cy="${(y-r*1.05).toFixed(1)}" r="${(r*0.72).toFixed(1)}" fill="${PAL.tree}"/>` +
      `<circle cx="${(x-r*0.34).toFixed(1)}" cy="${(y-r*0.8).toFixed(1)}" r="${(r*0.5).toFixed(1)}" fill="${PAL.treeLight}" opacity=".85"/>` +
      `<circle cx="${(x+r*0.36).toFixed(1)}" cy="${(y-r*0.88).toFixed(1)}" r="${(r*0.46).toFixed(1)}" fill="${PAL.tree}"/>`;
  }

  function buildHeroSVG() {
    let s = `<rect width="360" height="176" fill="none"/>`;
    s += `<path d="M0,150 C70,132 130,158 190,142 C250,126 310,150 360,136 L360,176 L0,176 Z" fill="${PAL.grass}" opacity=".65"/>`;
    s += isoTower(66, 150, 42, 3, 22);
    s += isoHouse(150, 156, 74, 44, 34, { eave: 0.28, roofH: 26 });
    s += isoHouse(226, 150, 58, 36, 28, { roof: PAL.roofGrey, roofDark: PAL.roofGreyDark });
    s += isoHouse(292, 158, 50, 32, 24, { eave: 0.3 });
    s += isoTree(196,160,18) + isoTree(258,166,15) + isoTree(112,164,14) + isoTree(336,154,16);
    s += `<path d="M40,44 q6,-5 12,0 q6,-5 12,0" fill="none" stroke="#6f8797" stroke-width="1.6"/>`;
    s += `<path d="M84,28 q5,-4 10,0 q5,-4 10,0" fill="none" stroke="#6f8797" stroke-width="1.4"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 176">${s}</svg>`;
  }

  function makeText(content, opts) {
    opts = opts || {};
    const t = figma.createText();
    t.characters = content;
    t.fontSize = opts.size || 13;
    t.fontName = { family: opts.serif ? "Georgia" : "Inter", style: opts.weight || "Regular" };
    t.fills = solid(opts.color || T.ink);
    if (opts.ls != null) t.letterSpacing = { value: opts.ls, unit: "PERCENT" };
    t.name = content.slice(0, 40);
    return t;
  }

  await figma.loadFontAsync({ family: "Georgia", style: "Regular" });
  await figma.loadFontAsync({ family: "Georgia", style: "Bold" });

  const device = figma.createFrame();
  device.name = "📱 BonVoye — Home (mo-dau · step 3)";
  device.resize(393, 852);
  device.cornerRadius = 52;
  device.clipsContent = true;
  device.fills = solid("#0b0d0f");
  device.strokes = [{ type: "SOLID", color: hexRgb("#3a4249"), opacity: 1 }];
  device.strokeWeight = 1.5;
  device.strokeAlign = "OUTSIDE";
  device.effects = [{ type: "DROP_SHADOW", color: { r:0,g:0,b:0,a:0.85 }, offset: { x:0,y:34 }, radius:70, spread:-18, visible:true, blendMode:"NORMAL" }];

  const screen = figma.createFrame();
  screen.name = "Screen";
  screen.resize(371, 830);
  screen.x = 11; screen.y = 11;
  screen.cornerRadius = 42; screen.clipsContent = true;
  screen.fills = [{ type:"GRADIENT_LINEAR", gradientTransform:[[0,1,0.5],[-1,0,1]], gradientStops:[
    { position:0, color:{ ...hexRgb("#fbf6ec"), a:1 } },
    { position:0.44, color:{ ...hexRgb("#f4e9d6"), a:1 } },
    { position:1, color:{ ...hexRgb("#eddfc6"), a:1 } },
  ]}];

  const island = figma.createRectangle();
  island.name = "Dynamic Island"; island.resize(118, 33);
  island.x = (371-118)/2; island.y = 9; island.cornerRadius = 16;
  island.fills = solid("#0b0d0f"); screen.appendChild(island);

  const sbTime = makeText("09:41", { size:15, weight:"Semi Bold", color:T.ink });
  sbTime.x = 26; sbTime.y = 17; screen.appendChild(sbTime);

  const gpsChip = figma.createFrame(); gpsChip.name = "GPS";
  gpsChip.resize(60,24); gpsChip.x = 371-26-60; gpsChip.y = 13;
  gpsChip.fills = solid("#e8f4e8",0.9); gpsChip.cornerRadius = 12;
  gpsChip.strokes = solid("#a8d8a8"); gpsChip.strokeWeight = 1;
  const gpsL = makeText("⚡ GPS", { size:10.5, weight:"Semi Bold", color:"#2d6a2d" });
  gpsL.x = 8; gpsL.y = 5; gpsChip.appendChild(gpsL);
  screen.appendChild(gpsChip);

  const langBtn = figma.createFrame(); langBtn.name = "Lang Button";
  langBtn.resize(108,30); langBtn.x = 371-22-108; langBtn.y = 52;
  langBtn.cornerRadius = 20; langBtn.fills = solid("#ffffff",0.7);
  langBtn.strokes = solid(T.line); langBtn.strokeWeight = 1;
  const langL = makeText("🌐 Tiếng Việt", { size:11.5, weight:"Semi Bold", color:T.ink });
  langL.x = 10; langL.y = 8; langBtn.appendChild(langL); screen.appendChild(langBtn);

  const heroY = 90;
  const ey = makeText("CHÀO MỪNG BẠN ĐẾN VỚI", { size:10, weight:"Semi Bold", color:T.ink45, ls:15 });
  ey.x = 22; ey.y = heroY; screen.appendChild(ey);
  const title = makeText("BonVoye", { size:32, weight:"Bold", serif:true, color:T.ink });
  title.x = 22; title.y = heroY+18; screen.appendChild(title);
  const tag = makeText("Những câu chuyện ẩn trong từng con phố.", { size:13, weight:"Regular", color:T.ink70 });
  tag.x = 22; tag.y = heroY+62; screen.appendChild(tag);

  try {
    const heroSvg = buildHeroSVG();
    const heroArt = figma.createNodeFromSvg(heroSvg);
    heroArt.name = "Home Hero Art"; heroArt.resize(371,176);
    heroArt.x = 0; heroArt.y = heroY+86; screen.appendChild(heroArt);
  } catch(_) {}

  const artBottom = heroY+86+176;
  const cityLabelY = artBottom+6;
  const cityL = makeText("THÀNH PHỐ", { size:10, weight:"Semi Bold", color:T.ink45, ls:15 });
  cityL.x = 22; cityL.y = cityLabelY; screen.appendChild(cityL);

  const hanoiY = cityLabelY+18;
  const hanoiRow = figma.createFrame(); hanoiRow.name = "City — Hà Nội (selected)";
  hanoiRow.resize(327,60); hanoiRow.x = 22; hanoiRow.y = hanoiY;
  hanoiRow.cornerRadius = 14; hanoiRow.fills = solid(T.paper);
  hanoiRow.strokes = solid(T.terracotta); hanoiRow.strokeWeight = 1;
  const hn1 = makeText("Hà Nội", { size:14, weight:"Semi Bold", color:T.ink }); hn1.x=13; hn1.y=12; hanoiRow.appendChild(hn1);
  const hn2 = makeText("2 chủ đề", { size:11.5, weight:"Regular", color:T.ink45 }); hn2.x=13; hn2.y=36; hanoiRow.appendChild(hn2);
  screen.appendChild(hanoiRow);

  const hueY = hanoiY+60+11;
  const hueRow = figma.createFrame(); hueRow.name = "City — Huế";
  hueRow.resize(327,60); hueRow.x=22; hueRow.y=hueY;
  hueRow.cornerRadius=14; hueRow.fills=[]; hueRow.strokes=solid(T.line);
  hueRow.strokeWeight=1; hueRow.dashPattern=[6,4];
  const hue1 = makeText("Huế", { size:14, weight:"Semi Bold", color:T.ink70 }); hue1.x=13; hue1.y=12; hueRow.appendChild(hue1);
  const hue2 = makeText("0 chủ đề", { size:11.5, weight:"Regular", color:T.ink45 }); hue2.x=13; hue2.y=36; hueRow.appendChild(hue2);
  const soonC = figma.createFrame(); soonC.resize(58,26); soonC.x=327-13-58; soonC.y=17;
  soonC.cornerRadius=20; soonC.fills=solid("#efe9df"); soonC.strokes=solid("#d6cab6"); soonC.strokeWeight=1;
  const soonL = makeText("Sắp có", { size:11, weight:"Semi Bold", color:T.ink45 }); soonL.x=9; soonL.y=6; soonC.appendChild(soonL);
  hueRow.appendChild(soonC); screen.appendChild(hueRow);

  const topicLY = hueY+60+12;
  const topicL = makeText("CHỦ ĐỀ", { size:10, weight:"Semi Bold", color:T.ink45, ls:15 });
  topicL.x=22; topicL.y=topicLY; screen.appendChild(topicL);

  [
    { name:"36 phố phường", sub:"Cửa ô, phố nghề và những người giữ nếp", meta:"~75 phút · 4 điểm" },
    { name:"Ngàn năm bia đá", sub:"Đường học, bia tiến sĩ và giếng trời", meta:"~90 phút · 4 điểm" },
  ].forEach((tp, idx) => {
    const tY = topicLY+18+(64+11)*idx;
    const tf = figma.createFrame(); tf.name = "Topic — "+tp.name;
    tf.resize(327,64); tf.x=22; tf.y=tY; tf.cornerRadius=14;
    tf.fills=solid(T.paper); tf.strokes=solid(T.line); tf.strokeWeight=1;
    const tn = makeText(tp.name, { size:14, weight:"Semi Bold", color:T.ink }); tn.x=13; tn.y=10; tf.appendChild(tn);
    const ts = makeText(tp.sub, { size:11.5, weight:"Regular", color:T.ink45 }); ts.x=13; ts.y=33; tf.appendChild(ts);
    const tm = makeText(tp.meta, { size:11, weight:"Regular", color:T.ink45 });
    tm.textAlignHorizontal="RIGHT"; tm.resize(110,16); tm.x=327-13-110; tm.y=10; tf.appendChild(tm);
    screen.appendChild(tf);
  });

  const ctaBar = figma.createFrame(); ctaBar.name = "Sticky CTA";
  ctaBar.resize(371,88); ctaBar.x=0; ctaBar.y=830-88;
  ctaBar.fills=solid("#faf5ea",0.96); ctaBar.strokes=solid(T.line); ctaBar.strokeWeight=1;
  ctaBar.strokeAlign="INSIDE";
  const ctaBtn = figma.createFrame(); ctaBtn.resize(327,48); ctaBtn.x=22; ctaBtn.y=10;
  ctaBtn.cornerRadius=14; ctaBtn.fills=solid(T.paper); ctaBtn.strokes=solid(T.line); ctaBtn.strokeWeight=1;
  ctaBtn.opacity=0.42;
  const ctaL = makeText("Chọn thành phố và chủ đề để bắt đầu", { size:13.5, weight:"Semi Bold", color:T.ink });
  ctaL.textAlignHorizontal="CENTER"; ctaL.resize(295,20); ctaL.x=16; ctaL.y=14;
  ctaBtn.appendChild(ctaL); ctaBar.appendChild(ctaBtn); screen.appendChild(ctaBar);

  const homeBar = figma.createRectangle(); homeBar.name = "Home Bar";
  homeBar.resize(134,5); homeBar.x=(371-134)/2; homeBar.y=830-12;
  homeBar.cornerRadius=3; homeBar.fills=solid(T.ink,0.34);
  screen.appendChild(homeBar);

  device.appendChild(screen);
  const center = figma.viewport.center;
  device.x = Math.round(center.x - 393/2);
  device.y = Math.round(center.y - 852/2);
  figma.currentPage.appendChild(device);
  figma.currentPage.selection = [device];
  figma.viewport.scrollAndZoomIntoView([device]);

  figma.ui.postMessage({ type: "done" });
}

// ── Message handler ───────────────────────────────────────────────────────────
figma.ui.onmessage = async (msg) => {
  if (msg.type === "draw-all-screens") {
    try {
      await drawAllScreens(msg.screens);
    } catch (err) {
      const m = String(err && err.message || err);
      figma.notify("❌ " + m, { error: true });
      figma.ui.postMessage({ type: "error", message: m });
    }
  }

  if (msg.type === "build-home") {
    try {
      await buildHomeScreen();
    } catch (err) {
      const m = String(err && err.message || err);
      figma.notify("❌ " + m, { error: true });
      figma.ui.postMessage({ type: "error", message: m });
    }
  }

  if (msg.type === "close") {
    figma.closePlugin();
  }
};
