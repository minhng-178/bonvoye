/* Small HTML helpers for classic-script renderers. */
(function (root) {
  "use strict";
  var BV = root.BV_UI = root.BV_UI || {};

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function attr(name, value) {
    if (value == null || value === false) return "";
    if (value === true) return " " + name;
    return " " + name + '="' + esc(value) + '"';
  }

  function attrs(values) {
    var out = "";
    Object.keys(values || {}).forEach(function (key) {
      out += attr(key, values[key]);
    });
    return out;
  }

  function join(parts) {
    return (parts || []).filter(function (part) { return part != null && part !== false; }).join("");
  }

  BV.html = {
    esc: esc,
    attr: attr,
    attrs: attrs,
    join: join,
    raw: function (value) { return value == null ? "" : String(value); },
  };
})(window);
