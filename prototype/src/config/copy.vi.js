/* Compatibility bridge for the current T table. ui.js remains the source of
   legacy copy during this migration; new screens read BV_CONFIG.copy.vi. */
(function (root) {
  "use strict";
  root.BV_CONFIG = root.BV_CONFIG || {};
  root.BV_CONFIG.copy = root.BV_CONFIG.copy || {};
  root.BV_CONFIG.copy.vi = root.BV_CONFIG.copy.vi || {};
  root.BV_TEXT_VI = root.BV_CONFIG.copy.vi;
})(window);
