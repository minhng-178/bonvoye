"use strict";

const IMPORTER_VERSION = "1.0.0";
const FILE_CACHE_KEY = "bonvoye.importer.fileCache.v1";
const FONT_CACHE = new Map();
const FALLBACK_CONFIG = {
  pageNames: {
    tokens: "BonVoye • Tokens",
    components: "BonVoye • Components",
    screens: "BonVoye • Screens",
  },
  viewport: {
    outerWidth: 393,
    outerHeight: 852,
    screenWidth: 371,
    screenHeight: 830,
    statusBarHeight: 50,
    homeIndicatorWidth: 134,
    homeIndicatorHeight: 5,
    homeIndicatorBottom: 7,
    screenInset: 11,
  },
  screenGrid: { columns: 4, columnGap: 56, rowGap: 72, labelHeight: 118 },
};

figma.showUI(__html__, { width: 440, height: 760, themeColors: true });

async function loadFileCache() {
  const cache = await figma.clientStorage.getAsync(FILE_CACHE_KEY);
  figma.ui.postMessage({ type: "file-cache", cache: cache || { contracts: {}, visuals: {} } });
}

async function saveFileCache(cache) {
  await figma.clientStorage.setAsync(FILE_CACHE_KEY, cache || { contracts: {}, visuals: {} });
}

loadFileCache().catch((error) => {
  figma.ui.postMessage({ type: "file-cache-error", message: String(error && error.message || error) });
});

function notify(message) {
  figma.notify(message);
  figma.ui.postMessage({ type: "progress", message });
}

function color(hex, opacity) {
  const value = String(hex || "#000000").trim();
  const match = /^#([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(value);
  if (!match) return { r: 0, g: 0, b: 0, a: opacity == null ? 1 : opacity };
  const raw = match[1].length === 3 ? match[1].split("").map((x) => x + x).join("") : match[1];
  return {
    r: parseInt(raw.slice(0, 2), 16) / 255,
    g: parseInt(raw.slice(2, 4), 16) / 255,
    b: parseInt(raw.slice(4, 6), 16) / 255,
    a: opacity == null ? 1 : opacity,
  };
}

function paint(hex, opacity) {
  const rgba = color(hex, opacity);
  return { type: "SOLID", color: { r: rgba.r, g: rgba.g, b: rgba.b }, opacity: rgba.a };
}

function setFill(node, hex, opacity) {
  node.fills = [paint(hex, opacity)];
}

function setStroke(node, hex, opacity, weight) {
  node.strokes = [paint(hex, opacity)];
  node.strokeWeight = weight == null ? 1 : weight;
}

function setMeta(node, meta) {
  node.setPluginData("bv.meta", JSON.stringify(meta || {}));
  Object.keys(meta || {}).forEach((key) => {
    const value = meta[key];
    if (value == null) return;
    node.setPluginData("bv." + key, typeof value === "string" ? value : JSON.stringify(value));
  });
  node.setPluginData("bv.generated", "true");
  node.setPluginData("bv.importerVersion", IMPORTER_VERSION);
}

function pageByName(name) {
  return figma.root.children.find((node) => node.type === "PAGE" && node.name === name) || null;
}

function getPage(name) {
  const existing = pageByName(name);
  if (existing) return existing;

  const reusable = figma.root.children.find((node) =>
    node.type === "PAGE" &&
    node.children.length === 0 &&
    !/^BonVoye • /.test(node.name)
  );
  if (reusable) {
    reusable.name = name;
    return reusable;
  }

  const pageCount = figma.root.children.filter((node) => node.type === "PAGE").length;
  if (pageCount >= 3) {
    throw new Error("This Figma file already has three pages. Reuse or remove a blank page before importing BonVoye.");
  }

  const page = figma.createPage();
  page.name = name;
  return page;
}

function clearGenerated(page) {
  page.children.slice().forEach((node) => {
    if (node.getPluginData("bv.generated") === "true") node.remove();
  });
}

function textStyle(size, colorValue, weight, family) {
  return {
    size: Number(size) || 13,
    color: colorValue || "#241c16",
    weight: Number(weight) || 400,
    family: family || "Inter",
  };
}

function styleName(weight) {
  if (weight >= 800) return "Extra Bold";
  if (weight >= 700) return "Bold";
  if (weight >= 600) return "Semi Bold";
  if (weight >= 500) return "Medium";
  return "Regular";
}

async function resolveFont(requestedFamily, requestedWeight) {
  const family = String(requestedFamily || "Inter");
  const cacheKey = family + "::" + (Number(requestedWeight) || 400);
  if (FONT_CACHE.has(cacheKey)) return FONT_CACHE.get(cacheKey);
  const families = family === "system" || family === "ui-monospace"
    ? [family === "ui-monospace" ? "Roboto Mono" : "Inter", "Arial"]
    : [family, "Inter", "Arial"];
  const styles = [styleName(Number(requestedWeight) || 400), "Regular"];
  for (const candidateFamily of families) {
    for (const candidateStyle of styles) {
      try {
        await figma.loadFontAsync({ family: candidateFamily, style: candidateStyle });
        const resolved = { family: candidateFamily, style: candidateStyle };
        FONT_CACHE.set(cacheKey, resolved);
        return resolved;
      } catch (_) {
        // Try the next known fallback.
      }
    }
  }
  throw new Error("No usable font is available in this Figma environment");
}

async function addText(parent, value, x, y, width, style, meta) {
  const node = figma.createText();
  parent.appendChild(node);
  const font = await resolveFont(style.family, style.weight);
  node.fontName = font;
  node.fontSize = style.size;
  node.characters = String(value == null ? "" : value);
  node.fills = [paint(style.color)];
  node.x = x;
  node.y = y;
  node.textAutoResize = "HEIGHT";
  if (width) node.resize(width, Math.max(node.height, style.size * 1.25));
  if (style.letterSpacing != null) node.letterSpacing = { unit: "PIXELS", value: Number(style.letterSpacing) };
  if (style.lineHeight != null) node.lineHeight = { unit: "PIXELS", value: Number(style.lineHeight) };
  if (meta) setMeta(node, meta);
  return node;
}

function addRect(parent, x, y, width, height, fill, radius, meta) {
  const node = figma.createRectangle();
  parent.appendChild(node);
  node.x = x;
  node.y = y;
  node.resize(Math.max(1, width), Math.max(1, height));
  if (fill) setFill(node, fill);
  if (radius != null) node.cornerRadius = Number(radius);
  if (meta) setMeta(node, meta);
  return node;
}

function addFrame(parent, x, y, width, height, fill, radius, meta) {
  const node = figma.createFrame();
  parent.appendChild(node);
  node.x = x;
  node.y = y;
  node.resize(Math.max(1, width), Math.max(1, height));
  node.clipsContent = false;
  if (fill) setFill(node, fill);
  if (radius != null) node.cornerRadius = Number(radius);
  if (meta) setMeta(node, meta);
  return node;
}

function tokenValue(tokens, path) {
  return path.split(".").reduce((value, key) => value && value[key], tokens);
}

function firstColor(tokens) {
  return tokens.colors && (tokens.colors["surface.canvas"] || Object.values(tokens.colors)[0]) || "#faf5ea";
}

function tokenTypography(tokens, name) {
  const spec = (tokens.typography && tokens.typography[name]) || {};
  return textStyle(spec.size, tokens.colors?.["text.primary"] || "#241c16", spec.weight, spec.family === "system" ? "Inter" : spec.family);
}

async function createTokensPage(page, tokens, config) {
  let y = 40;
  const colors = tokens.colors || {};
  const typography = tokens.typography || {};
  const spacing = tokens.spacing || {};
  const radii = tokens.radii || {};
  const sections = [
    { title: "Colors", values: colors, kind: "color" },
    { title: "Typography", values: typography, kind: "typography" },
    { title: "Spacing", values: spacing, kind: "number" },
    { title: "Radii", values: radii, kind: "number" },
    { title: "Elevation", values: tokens.elevation || {}, kind: "string" },
    { title: "Layers", values: tokens.layers || {}, kind: "number" },
    { title: "Motion", values: tokens.motion || {}, kind: "number" },
  ];
  await addText(page, "BonVoye — Design Tokens", 40, y, 560, textStyle(28, colors["text.primary"] || "#241c16", 700, "Georgia"), { sourceKind: "token-page" });
  y += 56;
  await addText(page, "Imported from prototype/spec/design-tokens.json", 40, y, 560, textStyle(13, colors["text.muted"] || "#7c7168", 400, "Inter"));
  y += 42;

  for (const section of sections) {
    await addText(page, section.title, 40, y, 560, textStyle(18, colors["text.primary"] || "#241c16", 700, "Georgia"), { sourceKind: "token-section", tokenSection: section.title });
    y += 34;
    let x = 40;
    let rowHeight = section.kind === "typography" ? 62 : 48;
    for (const key of Object.keys(section.values)) {
      const value = section.values[key];
      const card = addFrame(page, x, y, 270, rowHeight, "#ffffff", 10, { sourceKind: "token", token: key, tokenValue: value });
      if (section.kind === "color") {
        addRect(card, 12, 12, 28, 24, value, 6);
        await addText(card, key, 52, 9, 190, textStyle(12, colors["text.primary"] || "#241c16", 600, "Inter"));
        await addText(card, String(value), 52, 27, 190, textStyle(10, colors["text.muted"] || "#7c7168", 400, "Roboto Mono"));
      } else if (section.kind === "typography") {
        const spec = value || {};
        await addText(card, key + "  Aa", 12, 8, 240, textStyle(spec.size || 13, colors["text.primary"] || "#241c16", spec.weight || 400, spec.family === "system" ? "Inter" : spec.family || "Inter"), { sourceKind: "token", token: key });
        await addText(card, `${spec.family || "system"} · ${spec.size || "—"}px · ${spec.weight || "—"}`, 12, 38, 240, textStyle(10, colors["text.muted"] || "#7c7168", 400, "Roboto Mono"));
      } else {
        await addText(card, key, 12, 8, 240, textStyle(12, colors["text.primary"] || "#241c16", 600, "Inter"));
        await addText(card, typeof value === "object" ? JSON.stringify(value) : String(value), 12, 27, 240, textStyle(10, colors["text.muted"] || "#7c7168", 400, "Roboto Mono"));
      }
      x += 290;
      if (x > 900) { x = 40; y += rowHeight + 12; }
    }
    y += rowHeight + 38;
  }
  const viewport = config.viewport || FALLBACK_CONFIG.viewport;
  await addText(page, "Reference viewport", 40, y, 240, textStyle(18, colors["text.primary"] || "#241c16", 700, "Georgia"));
  await addText(page, `${viewport.outerWidth} × ${viewport.outerHeight} outer · ${viewport.screenWidth} × ${viewport.screenHeight} screen · ${viewport.statusBarHeight}px status bar`, 40, y + 32, 700, textStyle(12, colors["text.secondary"] || "#4d423a", 400, "Inter"));
}

function variantFill(variant, tokens) {
  const c = tokens.colors || {};
  if (variant === "primary" || variant === "recommended" || variant === "on") return c["brand.primary"] || "#b4472b";
  if (variant === "dark") return c["surface.dark"] || "#16212b";
  if (variant === "danger") return c["status.danger"] || "#c0392b";
  if (variant === "warn" || variant === "warning") return c["status.warning"] || "#c98a3c";
  if (variant === "ok" || variant === "success") return c["status.success"] || "#4f8a5b";
  return "#ffffff";
}

async function renderComponentSample(parent, contract, variant, state, tokens) {
  const c = tokens.colors || {};
  const ink = c["text.primary"] || "#241c16";
  const muted = c["text.muted"] || "#7c7168";
  const primary = c["brand.primary"] || "#b4472b";
  const dark = c["surface.dark"] || "#16212b";
  const bg = variantFill(variant, tokens);
  const foreground = ["primary", "dark", "danger", "recommended", "on", "ok", "warn"].indexOf(variant) >= 0 ? "#ffffff" : ink;
  const meta = { sourceKind: "component-contract", componentId: contract.id, variant, state };
  const width = contract.id === "sheet" ? 320 : 250;
  const height = contract.id === "sheet" ? 180 : contract.id === "progress" ? 72 : 84;
  const box = addFrame(parent, 0, 0, width, height, contract.id === "map-surface" ? c["map.water"] || "#cfe0dc" : bg, 14, meta);

  if (contract.id === "button") {
    const button = addFrame(box, 16, 20, width - 32, 44, bg, 12, meta);
    await addText(button, state === "loading" ? "Loading…" : state === "disabled" ? "Disabled" : "Continue", 14, 13, width - 60, textStyle(14, foreground, 650, "Inter"), meta);
  } else if (contract.id === "icon-button") {
    addRect(box, 16, 16, 44, 44, bg, 22, meta);
    await addText(box, "⌁", 28, 22, 24, textStyle(20, foreground, 700, "Inter"), meta);
    await addText(box, "Icon button", 72, 27, 150, textStyle(12, ink, 600, "Inter"));
  } else if (contract.id === "chip") {
    const chip = addFrame(box, 16, 20, 110, 36, bg, 18, meta);
    await addText(chip, variant === "on" ? "Selected" : variant === "warn" ? "Warning" : "Filter", 12, 9, 90, textStyle(12, foreground, 650, "Inter"), meta);
  } else if (contract.id === "card") {
    await addText(box, variant === "recommended" ? "Recommended option" : "Card title", 16, 14, width - 32, textStyle(15, foreground, 700, "Inter"), meta);
    await addText(box, "Reusable content container", 16, 40, width - 32, textStyle(12, foreground === ink ? muted : "#e7edf0", 400, "Inter"));
  } else if (contract.id === "row") {
    addRect(box, 16, 18, 42, 42, primary, 21, meta);
    await addText(box, "Row title", 72, 16, 150, textStyle(14, ink, 650, "Inter"), meta);
    await addText(box, "Detail and metadata", 72, 39, 150, textStyle(11, muted, 400, "Inter"));
    await addText(box, "›", 220, 28, 20, textStyle(20, muted, 400, "Inter"));
  } else if (contract.id === "section") {
    await addText(box, "SECTION LABEL", 16, 14, width - 32, textStyle(10, primary, 650, "Inter"));
    await addText(box, "Section body", 16, 37, width - 32, textStyle(15, ink, 650, "Inter"));
  } else if (contract.id === "progress") {
    await addText(box, "Download progress", 16, 12, width - 32, textStyle(12, ink, 600, "Inter"));
    addRect(box, 16, 42, width - 32, 10, c["surface.subtle"] || "#f2ead9", 5, meta);
    addRect(box, 16, 42, state === "complete" ? width - 32 : 138, 10, variant === "warning" ? c["status.warning"] : c["status.success"] || "#4f8a5b", 5, meta);
  } else if (contract.id === "field") {
    await addText(box, "Search", 16, 12, width - 32, textStyle(11, muted, 600, "Inter"), meta);
    addRect(box, 16, 34, width - 32, 38, "#ffffff", 8, meta);
    await addText(box, "Enter a place…", 28, 45, width - 56, textStyle(12, muted, 400, "Inter"));
  } else if (contract.id === "price") {
    await addText(box, "149.000₫", 16, 12, width - 32, textStyle(24, variant === "emphasis" ? primary : ink, 700, "Georgia"), meta);
    await addText(box, "Full story package", 16, 49, width - 32, textStyle(11, muted, 400, "Inter"));
  } else if (contract.id === "empty") {
    await addText(box, "⌂", 16, 14, 32, textStyle(24, primary, 700, "Inter"), meta);
    await addText(box, "Nothing here yet", 56, 16, 170, textStyle(14, ink, 650, "Inter"), meta);
    await addText(box, "Try another search", 56, 40, 170, textStyle(11, muted, 400, "Inter"));
  } else if (contract.id === "sheet") {
    addRect(box, 136, 12, 48, 5, c["surface.line"] || "#ddd2be", 3, meta);
    await addText(box, "Bottom sheet", 20, 32, width - 40, textStyle(18, variant === "dark" ? "#ffffff" : ink, 700, "Georgia"), meta);
    await addText(box, "Sheet content and footer", 20, 70, width - 40, textStyle(12, variant === "dark" ? "#d6e0e5" : muted, 400, "Inter"));
  } else if (contract.id === "banner") {
    await addText(box, variant.toUpperCase(), 16, 14, width - 32, textStyle(10, foreground, 700, "Inter"), meta);
    await addText(box, "Status banner message", 16, 34, width - 32, textStyle(13, foreground, 600, "Inter"));
  } else if (contract.id === "map-surface") {
    addRect(box, 0, 0, width, 18, c["map.sand"] || "#ded1b4", 0, meta);
    addRect(box, 24, 26, 40, 40, primary, 20, meta);
    addRect(box, 170, 48, 18, 18, c["status.info"] || "#3d6b8e", 9, meta);
    await addText(box, "Map surface · " + (variant || "realMap"), 16, 126, width - 32, textStyle(12, dark, 650, "Inter"), meta);
  }
  return box;
}

async function createComponentsPage(page, components, tokens) {
  const contracts = components.components || [];
  let x = 40;
  let y = 40;
  await addText(page, "BonVoye — Components", x, y, 600, textStyle(28, tokens.colors?.["text.primary"] || "#241c16", 700, "Georgia"));
  y += 56;
  await addText(page, "Editable samples generated from prototype/spec/components.json", x, y, 700, textStyle(13, tokens.colors?.["text.muted"] || "#7c7168", 400, "Inter"));
  y += 44;
  for (const contract of contracts) {
    const variant = contract.variants?.[0] || "default";
    const state = contract.states?.[0] || "idle";
    const component = figma.createComponent();
    page.appendChild(component);
    component.name = `BonVoye / ${contract.id} / ${variant} / ${state}`;
    component.x = x;
    component.y = y + 28;
    await renderComponentSample(component, contract, variant, state, tokens);
    setMeta(component, { sourceKind: "component-contract", componentId: contract.id, variant, state, flutterWidget: contract.flutterWidget, callback: contract.callback || null });
    await addText(page, contract.id, x, y, 250, textStyle(14, tokens.colors?.["text.primary"] || "#241c16", 700, "Inter"), { sourceKind: "component-label", componentId: contract.id });
    await addText(page, `${contract.flutterWidget} · ${variant} · ${state}`, x, y + 18, 250, textStyle(10, tokens.colors?.["text.muted"] || "#7c7168", 400, "Roboto Mono"));
    x += 310;
    if (x > 980) { x = 40; y += 190; }
  }
}

function parseCssColor(value, fallback) {
  const match = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i.exec(String(value || ""));
  if (match) return "#" + [match[1], match[2], match[3]].map((n) => Number(n).toString(16).padStart(2, "0")).join("");
  if (/^rgba\(/i.test(value)) return fallback;
  return /^#/.test(String(value || "")) ? value : fallback;
}

async function renderVisualNode(parent, node, tokens, budget, warnings) {
  if (!node || (budget && budget.value <= 0)) return;
  const style = node.style || {};
  const x = Number(node.x || 0);
  const y = Number(node.y || 0);
  const width = Math.max(1, Number(node.width || 1));
  const height = Math.max(1, Number(node.height || 1));
  const bg = parseCssColor(style.backgroundColor, null);
  const border = parseCssColor(style.borderColor, null);
  const hasPaint = !!bg || !!border;
  const hasText = !!node.text;
  const meta = Object.assign({ sourceKind: "html" }, node.meta || {});

  // Skip layout-only wrappers. Keep their children flat in screen coordinates;
  // nested DOM frames are expensive and can distort child positions in Figma.
  if (hasPaint && budget.value > 0) {
    budget.value -= 1;
    const frame = addFrame(parent, x, y, width, height, bg, parseFloat(style.borderRadius) || 0, meta);
    if (border) setStroke(frame, border, 1, parseFloat(style.borderWidth) || 1);
  }
  if (hasText && budget.value > 0) {
    budget.value -= 1;
    const family = style.fontFamily && /Georgia/i.test(style.fontFamily) ? "Georgia" : "Inter";
    await addText(parent, node.text, x, y, width, textStyle(parseFloat(style.fontSize) || 13, parseCssColor(style.color, tokens.colors?.["text.primary"] || "#241c16"), parseFloat(style.fontWeight) || 400, family), meta);
  }
  for (const child of node.children || []) {
    await renderVisualNode(parent, child, tokens, budget, warnings);
    if (budget.value <= 0) {
      if (warnings && !warnings.value) warnings.value = true;
      break;
    }
  }
}

function screenBodyColor(screen, tokens) {
  return screen.theme === "dark" ? tokens.colors?.["surface.dark"] || "#16212b" : tokens.colors?.["surface.canvas"] || "#faf5ea";
}

async function createScreen(page, screen, index, data, config, actionMap) {
  const viewport = config.viewport || FALLBACK_CONFIG.viewport;
  const grid = config.screenGrid || FALLBACK_CONFIG.screenGrid;
  const columns = Number(grid.columns) || 4;
  const col = index % columns;
  const row = Math.floor(index / columns);
  const x = 40 + col * (viewport.outerWidth + Number(grid.columnGap || 56));
  const y = 40 + row * (viewport.outerHeight + Number(grid.rowGap || 72) + Number(grid.labelHeight || 118));
  const frame = addFrame(page, x, y, viewport.outerWidth, viewport.outerHeight, "#14181c", 30, {
    sourceKind: screen.visual?.kind || "contract-placeholder",
    screenId: screen.id,
    route: screen.route,
    family: screen.family,
    runtimeKind: screen.runtimeKind || "staticFixture",
    scroll: !!screen.scroll,
    actions: screen.actions || [],
    widgetTree: screen.widgetTree || [],
  });
  frame.name = `BV Screen / ${screen.route} / ${screen.title}`;
  const inset = Number(viewport.screenInset || 11);
  const inner = addFrame(frame, inset, inset, viewport.screenWidth, viewport.screenHeight, screenBodyColor(screen, data.tokens), 22, {
    sourceKind: screen.visual?.kind || "contract-placeholder",
    screenId: screen.id,
    route: screen.route,
  });
  inner.clipsContent = true;
  addRect(inner, 0, 0, viewport.screenWidth, viewport.statusBarHeight, screen.theme === "dark" ? "#16212b" : "#faf5ea", 0, { sourceKind: "device-chrome", screenId: screen.id });
  addRect(inner, viewport.screenWidth - 127, 8, 118, 33, "#0d1114", 18, { sourceKind: "device-chrome", screenId: screen.id });
  addRect(inner, (viewport.screenWidth - viewport.homeIndicatorWidth) / 2, viewport.screenHeight - viewport.homeIndicatorBottom - viewport.homeIndicatorHeight, viewport.homeIndicatorWidth, viewport.homeIndicatorHeight, screen.theme === "dark" ? "#ffffff" : "#241c16", 3, { sourceKind: "device-chrome", screenId: screen.id });

  const body = addFrame(inner, 0, viewport.statusBarHeight, viewport.screenWidth, viewport.screenHeight - viewport.statusBarHeight, screenBodyColor(screen, data.tokens), 0, { sourceKind: screen.visual?.kind || "contract-placeholder", screenId: screen.id, route: screen.route });
  if (screen.visual && screen.visual.kind === "svg" && screen.visual.content) {
    try {
      const svg = figma.createNodeFromSvg(screen.visual.content);
      body.appendChild(svg);
      svg.x = 0;
      svg.y = 0;
      svg.resize(viewport.screenWidth, viewport.screenHeight - viewport.statusBarHeight);
      setMeta(svg, { sourceKind: "svg", screenId: screen.id, route: screen.route, sourceName: screen.visual.name || "" });
    } catch (error) {
      await addText(body, "SVG import warning: " + error.message, 16, 20, 330, textStyle(11, "#c0392b", 600, "Inter"));
    }
  } else if (screen.visual && screen.visual.kind === "html" && screen.visual.root) {
    const visualBudget = { value: 180 };
    const visualWarnings = { value: false };
    for (const child of screen.visual.root.children || []) {
      await renderVisualNode(body, child, data.tokens, visualBudget, visualWarnings);
      if (visualBudget.value <= 0) break;
    }
    if (visualWarnings.value) {
      await addText(body, "Visual truncated for safe import", 16, 72, 330, textStyle(10, "#c98a3c", 600, "Inter"), { sourceKind: "html-warning", screenId: screen.id });
    }
  } else {
    const accent = data.tokens.colors?.["brand.primary"] || "#b4472b";
    await addText(body, screen.family ? screen.family.toUpperCase() : "SCREEN", 18, 20, 330, textStyle(10, accent, 700, "Inter"), { sourceKind: "contract-placeholder", screenId: screen.id });
    await addText(body, screen.title, 18, 46, 330, textStyle(22, screen.theme === "dark" ? "#ffffff" : data.tokens.colors?.["text.primary"] || "#241c16", 400, "Georgia"), { sourceKind: "contract-placeholder", screenId: screen.id });
    await addText(body, screen.route, 18, 82, 330, textStyle(11, screen.theme === "dark" ? "#b8c5cc" : data.tokens.colors?.["text.muted"] || "#7c7168", 400, "Roboto Mono"), { sourceKind: "contract-placeholder", screenId: screen.id, route: screen.route });
    addRect(body, 18, 116, 335, 1, screen.theme === "dark" ? "#2b3f4f" : data.tokens.colors?.["surface.line"] || "#ddd2be", 0, { sourceKind: "contract-placeholder", screenId: screen.id });
    await addText(body, "Widget contract", 18, 136, 330, textStyle(11, accent, 700, "Inter"));
    const widgets = screen.widgetTree && screen.widgetTree.length ? screen.widgetTree : ["ScreenShell", "ScreenHeader", "ScreenBody"];
    for (let i = 0; i < widgets.length; i++) {
      const item = addFrame(body, 18, 164 + i * 42, 335, 32, screen.theme === "dark" ? "#1f2f3c" : "#f2ead9", 8, { sourceKind: "contract-placeholder", screenId: screen.id, widget: widgets[i] });
      await addText(item, widgets[i], 12, 8, 300, textStyle(12, screen.theme === "dark" ? "#e5edf1" : data.tokens.colors?.["text.secondary"] || "#4d423a", 600, "Inter"));
    }
    const actionY = 190 + widgets.length * 42;
    await addText(body, "Actions", 18, actionY, 330, textStyle(11, accent, 700, "Inter"));
    const actionList = screen.actions || [];
    for (let i = 0; i < Math.min(actionList.length, 4); i++) {
      const action = actionMap[actionList[i]];
      await addText(body, "• " + actionList[i] + (action?.category ? "  ·  " + action.category : ""), 18, actionY + 22 + i * 20, 335, textStyle(10, screen.theme === "dark" ? "#b8c5cc" : data.tokens.colors?.["text.muted"] || "#7c7168", 400, "Roboto Mono"), { sourceKind: "action-reference", screenId: screen.id, actionId: actionList[i], actionPayload: action?.payload || null });
    }
  }
  const captionY = y + viewport.outerHeight + 14;
  await addText(page, screen.title, x, captionY, viewport.outerWidth, textStyle(14, data.tokens.colors?.["text.primary"] || "#241c16", 700, "Inter"), { sourceKind: "screen-caption", screenId: screen.id, route: screen.route });
  await addText(page, `${screen.id} · ${screen.route}`, x, captionY + 22, viewport.outerWidth, textStyle(10, data.tokens.colors?.["text.muted"] || "#7c7168", 400, "Roboto Mono"));
  return frame;
}

async function createScreensPage(page, data, config) {
  const actionMap = Object.fromEntries((data.actions.actions || []).map((action) => [action.id, action]));
  const existing = page.children.filter((node) => node.type === "FRAME" && /^BV Screen \/ /.test(node.name)).length;
  for (let i = 0; i < (data.screens.screens || []).length; i++) {
    notify(`Rendering screen ${i + 1}/${data.screens.screens.length}: ${data.screens.screens[i].route}`);
    await createScreen(page, data.screens.screens[i], existing + i, data, config, actionMap);
    if ((i + 1) % 5 === 0) notify(`Created ${i + 1}/${data.screens.screens.length} screen frames`);
  }
  return existing + (data.screens.screens || []).length;
}

function screensContentBottom(data, config, screenCount) {
  const viewport = config.viewport || FALLBACK_CONFIG.viewport;
  const grid = config.screenGrid || FALLBACK_CONFIG.screenGrid;
  const columns = Math.max(1, Number(grid.columns) || 4);
  const count = Number(screenCount) || (data.screens.screens || []).length;
  const rows = Math.ceil(count / columns);
  const rowPitch = Number(viewport.outerHeight || 852) + Number(grid.rowGap || 72) + Number(grid.labelHeight || 118);
  return 40 + rows * rowPitch + 40;
}

function removeLegacyMetadataPage(config, screensPage) {
  const legacyName = (config.pageNames && config.pageNames.metadata) || "BonVoye • Metadata";
  const legacyPage = pageByName(legacyName);
  if (!legacyPage || legacyPage === screensPage) return;
  const generatedOnly = legacyPage.children.every((node) => node.getPluginData("bv.generated") === "true");
  if (generatedOnly) {
    legacyPage.remove();
    notify(`Removed legacy generated page: ${legacyName}`);
  } else {
    notify(`Legacy page kept because it contains non-generated content: ${legacyName}`);
  }
}

async function createMetadataSection(page, data, startY) {
  let y = Number(startY) || 40;
  const ink = data.tokens.colors?.["text.primary"] || "#241c16";
  const muted = data.tokens.colors?.["text.muted"] || "#7c7168";
  await addText(page, "BonVoye — Metadata", 40, y, 700, textStyle(28, ink, 700, "Georgia"));
  y += 56;
  await addText(page, "Actions, flow coverage, and transition assertions preserved from the prototype contracts", 40, y, 900, textStyle(13, muted, 400, "Inter"));
  y += 44;
  await addText(page, "Actions", 40, y, 700, textStyle(20, ink, 700, "Georgia"));
  y += 38;
  for (const action of data.actions.actions || []) {
    const row = addFrame(page, 40, y, 860, 46, "#ffffff", 8, { sourceKind: "action-definition", actionId: action.id, actionPayload: action.payload || {}, category: action.category, route: action.route || null, guards: action.guards || [], sideEffects: action.sideEffects || [] });
    await addText(row, action.id, 14, 8, 210, textStyle(12, ink, 700, "Inter"), { sourceKind: "action-definition", actionId: action.id });
    await addText(row, `${action.category || "—"} · payload ${JSON.stringify(action.payload || {})}`, 230, 9, 590, textStyle(10, muted, 400, "Roboto Mono"));
    y += 56;
  }
  y += 20;
  await addText(page, "Flows", 40, y, 700, textStyle(20, ink, 700, "Georgia"));
  y += 38;
  for (const flow of data.flows.flows || []) {
    const row = addFrame(page, 40, y, 860, 58, "#ffffff", 8, { sourceKind: "flow-definition", flowId: flow.id, routes: flow.routes || [], stepCount: flow.stepCount || 0 });
    await addText(row, flow.title, 14, 9, 330, textStyle(13, ink, 700, "Inter"));
    await addText(row, `${flow.id} · ${flow.stepCount} steps`, 14, 32, 260, textStyle(10, muted, 400, "Roboto Mono"));
    await addText(row, (flow.routes || []).join(" → "), 280, 20, 550, textStyle(10, muted, 400, "Roboto Mono"));
    y += 68;
  }
}

function normalizeConfig(config) {
  return Object.assign({}, FALLBACK_CONFIG, config || {}, {
    pageNames: Object.assign({}, FALLBACK_CONFIG.pageNames, config?.pageNames || {}),
    viewport: Object.assign({}, FALLBACK_CONFIG.viewport, config?.viewport || {}),
    screenGrid: Object.assign({}, FALLBACK_CONFIG.screenGrid, config?.screenGrid || {}),
  });
}

async function runImport(data, mode, scope) {
  if (!data || !data.tokens || !data.components || !data.screens || !data.actions || !data.flows) {
    throw new Error("Missing one or more required contract files");
  }
  const config = normalizeConfig(data.config);
  const importSpec = scope !== "visual";
  const importVisual = scope !== "spec";
  const pages = {
    tokens: getPage(config.pageNames.tokens),
    components: getPage(config.pageNames.components),
    screens: getPage(config.pageNames.screens),
  };
  if (mode === "replace-generated") {
    Object.values(pages).forEach(clearGenerated);
    removeLegacyMetadataPage(config, pages.screens);
  }
  let screenCount = 0;
  if (importSpec) {
    notify("Creating token page…");
    await createTokensPage(pages.tokens, data.tokens, config);
    notify("Creating component samples…");
    await createComponentsPage(pages.components, data.components, data.tokens);
  }
  if (importVisual) {
    notify("Creating screen frames…");
    screenCount = await createScreensPage(pages.screens, data, config);
  }
  if (importSpec) {
    notify("Creating metadata section on Screens…");
    await createMetadataSection(pages.screens, data, screensContentBottom(data, config, screenCount));
  }
  figma.ui.postMessage({ type: "done", summary: {
    pages: Object.values(pages).map((page) => page.name),
    screens: data.screens.screens.length,
    components: data.components.components.length,
    actions: data.actions.actions.length,
    flows: data.flows.flows.length,
    visualSources: Object.keys(data.visuals || {}).length,
    scope: scope || "all",
  }});
  figma.notify(`BonVoye import complete: ${data.screens.screens.length} screens`);
}

figma.ui.onmessage = async (message) => {
  if (message.type === "cancel") return figma.closePlugin();
  if (message.type === "load-file-cache") return loadFileCache();
  if (message.type === "save-file-cache") return saveFileCache(message.cache);
  if (message.type !== "import") return;
  try {
    await runImport(message.data, message.mode || "replace-generated", message.scope || "all");
  } catch (error) {
    figma.ui.postMessage({ type: "error", message: error && error.stack ? error.stack : String(error) });
    figma.notify("BonVoye import failed");
  }
};
