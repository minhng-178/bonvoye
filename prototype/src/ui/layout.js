/* Shared screen/layout adapters for the legacy renderer and new screens. */
(function (root) {
  "use strict";
  var BV = root.BV_UI = root.BV_UI || {};
  BV.layout = {
    copy: function () {
      return root.BV_TEXT_VI || (root.BV_CONFIG && root.BV_CONFIG.copy && root.BV_CONFIG.copy.vi) || {};
    },
    frame: function (body, dark) {
      return typeof root.BV_SCREEN === "function" ? root.BV_SCREEN(body, !!dark) : body;
    },
    tabbar: function (active, badge) {
      return typeof root.BV_TABBAR === "function" ? root.BV_TABBAR(active, badge) : "";
    },
  };
})(window);
