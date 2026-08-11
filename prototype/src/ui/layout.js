/* Shared screen/layout adapters for the legacy renderer and new screens. */
(function (root) {
  "use strict";
  var BV = root.BV_UI = root.BV_UI || {};
  var H = BV.html;

  function injectMetadata(html, metadata) {
    if (!metadata || !metadata.screenId) return html;
    var attrs = H.attrs({
      "data-bv-screen": metadata.screenId,
      "data-bv-route": metadata.route || null,
      "data-bv-screen-kind": metadata.kind || "staticFixture",
      "data-bv-scroll": metadata.scroll ? "true" : "false",
      "data-bv-theme": metadata.theme || "light",
    });
    return String(html || "").replace(/^(\s*<[^!/][^>]*)(>)/, "$1" + attrs + "$2");
  }

  BV.layout = {
    copy: function () {
      return root.BV_TEXT_VI || (root.BV_CONFIG && root.BV_CONFIG.copy && root.BV_CONFIG.copy.vi) || {};
    },
    frame: function (body, dark, metadata) {
      var rendered = typeof root.BV_SCREEN === "function" ? root.BV_SCREEN(body, !!dark) : body;
      return injectMetadata(rendered, metadata);
    },
    screenMetadata: injectMetadata,
    tabbar: function (active, badge) {
      return typeof root.BV_TABBAR === "function" ? root.BV_TABBAR(active, badge) : "";
    },
  };
})(window);
