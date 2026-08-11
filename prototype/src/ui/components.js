/* Reusable UI components. Every component receives data and returns HTML. */
(function (root) {
  "use strict";
  var BV = root.BV_UI = root.BV_UI || {};
  var H = BV.html;

  function classes() {
    return Array.prototype.slice.call(arguments).filter(Boolean).join(" ");
  }

  function componentMeta(id, options) {
    options = options || {};
    var inferredAction = options.actionId || (options.href ? "navigate:" + String(options.href).replace(/^#/, "") : null);
    var inferredPayload = options.actionPayload == null && options.href ? { route: String(options.href).replace(/^#/, "") } : options.actionPayload;
    var payload = inferredPayload == null ? null : JSON.stringify(inferredPayload);
    return H.attrs({
      "data-bv-component": options.componentId || id,
      "data-bv-variant": options.variant || null,
      "data-bv-state": options.state || (options.disabled ? "disabled" : "idle"),
      "data-bv-testid": options.testId || null,
      "data-bv-action": inferredAction,
      "data-bv-action-payload": payload,
      "aria-label": options.semanticsLabel || options.ariaLabel || null,
    });
  }

  function button(options) {
    options = options || {};
    var tag = options.href ? "a" : "button";
    var attrs = options.href ? ' href="' + H.esc(options.href) + '"' : ' type="button"';
    if (options.onclick) attrs += ' onclick="' + H.esc(options.onclick) + '"';
    if (options.disabled) attrs += " disabled";
    var body = (options.icon || "") + '<span>' + H.esc(options.label || "") + '</span>';
    return '<' + tag + ' class="' + classes("btn", options.variant && options.variant !== "default" ? options.variant : "", options.size || "", options.className) + '"' + componentMeta("button", options) + attrs + '>' + body + '</' + tag + '>';
  }

  function iconButton(options) {
    options = options || {};
    var attrs = ' type="button"';
    if (options.onclick) attrs += ' onclick="' + H.esc(options.onclick) + '"';
    if (options.disabled) attrs += " disabled";
    return '<button class="bv-icon-button ' + (options.className || "") + '"' + componentMeta("icon-button", options) + attrs + '>' + (options.icon || "") + '</button>';
  }

  function chip(label, tone, icon, options) {
    options = options || {};
    return '<span class="chip' + (tone ? " " + H.esc(tone) : "") + '"' + componentMeta("chip", { variant: tone || "default", state: options.selected ? "selected" : undefined, componentId: options.componentId, testId: options.testId, actionId: options.actionId, actionPayload: options.actionPayload, semanticsLabel: options.semanticsLabel }) + '>' + (icon || "") + H.esc(label) + '</span>';
  }

  function card(body, className, options) {
    options = options || {};
    return '<div class="card bv-card' + (className ? " " + H.esc(className) : "") + '"' + componentMeta("card", options) + '>' + body + '</div>';
  }

  function row(options) {
    options = options || {};
    var tag = options.href ? "a" : "button";
    var attrs = options.href ? ' href="' + H.esc(options.href) + '"' : ' type="button"';
    if (options.onclick) attrs += ' onclick="' + H.esc(options.onclick) + '"';
    if (options.disabled) attrs += " disabled";
    return '<' + tag + ' class="rowbtn bv-row' + (options.selected ? " sel" : "") + (options.className ? " " + H.esc(options.className) : "") + '"' + componentMeta("row", options) + attrs + '>' +
      (options.leading || "") + '<div class="grow"><b>' + H.esc(options.title || "") + '</b>' +
      (options.detail ? '<span>' + H.esc(options.detail) + '</span>' : "") +
      (options.meta ? '<small class="bv-row-meta">' + H.esc(options.meta) + '</small>' : "") +
      '</div>' + (options.trailing || "") + '</' + tag + '>';
  }

  function section(label, body, className, options) {
    options = options || {};
    return '<section class="bv-section' + (className ? " " + H.esc(className) : "") + '"' + componentMeta("section", options) + '>' +
      (label ? '<div class="eyebrow">' + H.esc(label) + '</div>' : "") + body + '</section>';
  }

  function progress(value, tone, options) {
    options = options || {};
    var pct = Math.max(0, Math.min(100, Number(value) || 0));
    return '<div class="bar bv-progress' + (tone ? " " + H.esc(tone) : "") + '"' + componentMeta("progress", { variant: tone || "default", state: pct >= 100 ? "complete" : "progressing", componentId: options.componentId, testId: options.testId }) + '><i style="width:' + pct + '%"></i></div>';
  }

  function field(options) {
    options = options || {};
    return '<label class="bv-field"' + componentMeta("field", options) + '><span class="form-label">' + H.esc(options.label || "") + '</span>' +
      '<input class="form-input" type="' + H.esc(options.type || "text") + '" placeholder="' + H.esc(options.placeholder || "") + '" value="' + H.esc(options.value || "") + '"></label>';
  }

  function price(options) {
    options = options || {};
    return '<div class="bv-price"' + componentMeta("price", options) + '><b>' + H.esc(options.amount || "") + '</b>' +
      (options.caption ? '<span>' + H.esc(options.caption) + '</span>' : "") + '</div>';
  }

  function empty(options) {
    options = options || {};
    return '<div class="empty bv-empty"' + componentMeta("empty", options) + '><div>' + (options.icon || "🗺") + '</div><p>' + H.esc(options.title || "") + '</p>' +
      (options.detail ? '<span>' + H.esc(options.detail) + '</span>' : "") + '</div>';
  }

  function sheet(options) {
    options = options || {};
    return '<div class="scrim" data-bv-component="sheet-scrim"></div><div class="sheet' + (options.tall ? " tall" : "") + (options.dark ? " dark" : "") + '"' + componentMeta("sheet", options) + '><div class="sheet-grip"></div>' +
      (options.header || "") + '<div class="sheet-body">' + (options.body || "") + '</div>' + (options.footer || "") + '</div>';
  }

  function sheetHeader(title, subtitle, closeHref, options) {
    options = options || {};
    return '<div class="sheet-head"' + componentMeta("sheet-header", options) + '><' + (closeHref ? 'a href="' + H.esc(closeHref) + '"' : 'button type="button"') + ' class="sheet-x" aria-label="Đóng">✕</' + (closeHref ? "a" : "button") + '><b class="h3">' + H.esc(title || "") + '</b>' + (subtitle ? '<div class="tiny bv-sheet-subtitle">' + H.esc(subtitle) + '</div>' : "") + '</div>';
  }

  function sheetFooter(body, options) {
    options = options || {};
    return '<div class="sheet-foot"' + componentMeta("sheet-footer", options) + '>' + body + '</div>';
  }

  function banner(title, detail, tone, options) {
    options = options || {};
    return '<div class="banner' + (tone ? " " + H.esc(tone) : "") + '"' + componentMeta("banner", { variant: tone || "default", state: options.state, componentId: options.componentId, testId: options.testId, actionId: options.actionId, actionPayload: options.actionPayload, semanticsLabel: options.semanticsLabel }) + '><b>' + H.esc(title || "") + '</b>' + (detail ? '<span>' + H.esc(detail) + '</span>' : "") + '</div>';
  }

  BV.components = {
    button: button,
    iconButton: iconButton,
    chip: chip,
    card: card,
    row: row,
    section: section,
    progress: progress,
    field: field,
    price: price,
    empty: empty,
    sheet: sheet,
    sheetHeader: sheetHeader,
    sheetFooter: sheetFooter,
    banner: banner,
    metadata: componentMeta,
  };
})(window);
