"use strict";
// BonVoye Figma Plugin — All Mockup Screens
// Reads mockup-screens.json from UI, renders 50 phone frames in Figma.

figma.showUI(__html__, { width: 360, height: 460, themeColors: true });

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

  if (msg.type === "close") {
    figma.closePlugin();
  }
};
