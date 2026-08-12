#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(process.argv[2] || path.join(__dirname, ".."));
const specDir = path.join(root, "spec");
const required = ["design-tokens.json", "components.json", "screens.json", "actions.json", "flows.json", "figma-import.json"];
const errors = [];
const warnings = [];

function readJson(name) {
  const file = path.join(specDir, name);
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`${name}: ${error.message}`);
    return null;
  }
}

function unique(values, label) {
  const seen = new Set();
  values.forEach((value, index) => {
    if (seen.has(value)) errors.push(`${label}[${index}]: duplicate ${value}`);
    seen.add(value);
  });
}

required.forEach((name) => {
  if (!fs.existsSync(path.join(specDir, name))) errors.push(`missing ${path.join("spec", name)}`);
});

const tokens = readJson("design-tokens.json");
const components = readJson("components.json");
const screens = readJson("screens.json");
const actions = readJson("actions.json");
const flows = readJson("flows.json");
const config = readJson("figma-import.json");

if (tokens) {
  const viewport = tokens.viewport || {};
  if (viewport.outer?.width !== 393 || viewport.outer?.height !== 852) {
    errors.push("design-tokens.json: viewport.outer must be 393x852");
  }
  if (viewport.screen?.width !== 371 || viewport.screen?.height !== 830) {
    errors.push("design-tokens.json: viewport.screen must be 371x830");
  }
  ["colors", "typography", "spacing", "radii"].forEach((key) => {
    if (!tokens[key] || typeof tokens[key] !== "object") errors.push(`design-tokens.json: missing ${key}`);
  });
}

const actionIds = new Set((actions?.actions || []).map((action) => action.id));
const screenIds = new Set((screens?.screens || []).map((screen) => screen.id));
const routes = new Set((screens?.screens || []).map((screen) => screen.route));
const componentIds = new Set((components?.components || []).map((component) => component.id));

if (screens) {
  unique((screens.screens || []).map((screen) => screen.id), "screens");
  unique((screens.screens || []).map((screen) => screen.route), "screen routes");
  (screens.screens || []).forEach((screen) => {
    if (!screen.id || !screen.route) errors.push("screens: every screen needs id and route");
    (screen.actions || []).forEach((actionId) => {
      if (!actionIds.has(actionId)) errors.push(`screens/${screen.id}: unknown action ${actionId}`);
    });
    (screen.widgetTree || []).forEach((widget) => {
      if (widget.endsWith("Surface") && !componentIds.has(widget.replace(/Surface$/, "-surface"))) {
        warnings.push(`screens/${screen.id}: widget ${widget} has no direct component contract`);
      }
    });
  });
}

if (components) {
  unique((components.components || []).map((component) => component.id), "components");
  (components.components || []).forEach((component) => {
    if (!component.id || !component.flutterWidget) errors.push("components: every component needs id and flutterWidget");
    if (!Array.isArray(component.variants) || !component.variants.length) warnings.push(`components/${component.id}: no variants`);
    if (!Array.isArray(component.states) || !component.states.length) warnings.push(`components/${component.id}: no states`);
  });
}

if (flows) {
  (flows.flows || []).forEach((flow) => {
    (flow.routes || []).forEach((route) => {
      if (!routes.has(route)) errors.push(`flows/${flow.id}: unknown route ${route}`);
    });
  });
  (flows.transitionAssertions || []).forEach((transition) => {
    if (!routes.has(transition.from)) errors.push(`transition/${transition.id}: unknown from route ${transition.from}`);
    if (!routes.has(transition.to)) errors.push(`transition/${transition.id}: unknown to route ${transition.to}`);
    if (!actionIds.has(transition.actionId)) errors.push(`transition/${transition.id}: unknown action ${transition.actionId}`);
  });
}

if (config) {
  if (config.viewport?.outerWidth !== 393 || config.viewport?.outerHeight !== 852) {
    errors.push("figma-import.json: outer viewport must be 393x852");
  }
  if (!Array.isArray(config.supportedVisualSources)) errors.push("figma-import.json: supportedVisualSources must be an array");
  const pageNames = config.pageNames || {};
  const requiredPages = ["tokens", "components", "screens"];
  const pageNameKeys = Object.keys(pageNames);
  const pageNameValues = Object.values(pageNames);
  requiredPages.forEach((key) => {
    if (!pageNames[key]) errors.push(`figma-import.json: missing pageNames.${key}`);
  });
  if (pageNameKeys.length !== requiredPages.length || pageNameKeys.some((key) => requiredPages.indexOf(key) < 0)) {
    errors.push("figma-import.json: pageNames must contain exactly tokens, components, and screens");
  }
  if (new Set(pageNameValues).size !== pageNameValues.length) {
    errors.push("figma-import.json: pageNames must be unique");
  }
}

const result = {
  ok: errors.length === 0,
  root,
  counts: {
    screens: screens?.screens?.length || 0,
    components: components?.components?.length || 0,
    actions: actions?.actions?.length || 0,
    flows: flows?.flows?.length || 0,
  },
  errors,
  warnings,
};

process.stdout.write(JSON.stringify(result, null, 2) + "\n");
process.exitCode = errors.length ? 1 : 0;
