#!/usr/bin/env node
/* Validate the Flutter handoff manifests without requiring a build step. */
const fs = require("fs");
const path = require("path");

const prototypeRoot = path.resolve(__dirname, "..");
const specRoot = path.join(prototypeRoot, "spec");
const files = [
  "manifest.json",
  "design-tokens.json",
  "components.json",
  "screens.json",
  "flows.json",
  "actions.json",
  "map-contract.json",
  "state-machines.json",
];
const errors = [];
const warnings = [];

function readJson(file) {
  const fullPath = path.join(specRoot, file);
  try {
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (error) {
    errors.push(`${file}: ${error.message}`);
    return null;
  }
}

function unique(items, label) {
  const seen = new Set();
  (items || []).forEach((item) => {
    if (seen.has(item)) errors.push(`${label}: duplicate "${item}"`);
    seen.add(item);
  });
}

const docs = Object.fromEntries(files.map((file) => [file, readJson(file)]));
const manifestFiles = docs["manifest.json"]?.files || {};
Object.entries(manifestFiles).forEach(([name, file]) => {
  if (!fs.existsSync(path.join(specRoot, file))) errors.push(`manifest.files.${name}: missing ${file}`);
});
const screens = docs["screens.json"]?.screens || [];
const components = docs["components.json"]?.components || [];
const actions = docs["actions.json"]?.actions || [];
const flows = docs["flows.json"]?.flows || [];
const assertions = docs["flows.json"]?.transitionAssertions || [];

unique(screens.map((screen) => screen.id), "screens.id");
unique(screens.map((screen) => screen.route), "screens.route");
unique(components.map((component) => component.id), "components.id");
unique(actions.map((action) => action.id), "actions.id");
unique(flows.map((flow) => flow.id), "flows.id");
unique(assertions.map((assertion) => assertion.id), "transitionAssertions.id");

const screenRoutes = new Set(screens.map((screen) => screen.route));
const actionIds = new Set(actions.map((action) => action.id));
flows.forEach((flow) => {
  (flow.routes || []).forEach((route) => {
    if (!screenRoutes.has(route)) errors.push(`flow ${flow.id}: unknown route "${route}"`);
  });
});
assertions.forEach((assertion) => {
  if (!screenRoutes.has(assertion.from)) errors.push(`${assertion.id}: unknown from route "${assertion.from}"`);
  if (!screenRoutes.has(assertion.to)) errors.push(`${assertion.id}: unknown to route "${assertion.to}"`);
  if (!actionIds.has(assertion.actionId)) errors.push(`${assertion.id}: unknown action "${assertion.actionId}"`);
});

const uiSource = fs.readFileSync(path.join(prototypeRoot, "ui.js"), "utf8");
const runtimeRoutes = new Set();
for (const match of uiSource.matchAll(/\{\s*hash:\s*"([^"]+)"/g)) runtimeRoutes.add(match[1]);
screens.forEach((screen) => {
  if (!runtimeRoutes.has(screen.route)) warnings.push(`screens.route not found in ui.js: ${screen.route}`);
});
for (const route of runtimeRoutes) {
  if (!screenRoutes.has(route)) warnings.push(`ui.js route has no screen manifest entry: ${route}`);
}

if (!docs["design-tokens.json"]?.viewport?.outer) errors.push("design-tokens.json: missing viewport.outer");
if (!docs["design-tokens.json"]?.flutterMapping) errors.push("design-tokens.json: missing flutterMapping");
if (!docs["components.json"]?.contract?.metadata) errors.push("components.json: missing contract.metadata");
if (!docs["map-contract.json"]?.layerOrder?.length) errors.push("map-contract.json: missing layerOrder");
if (!docs["state-machines.json"]?.machines) errors.push("state-machines.json: missing machines");

const totalReferences = flows.reduce((count, flow) => count + (flow.routes || []).length, 0) + assertions.length * 2;
console.log(`Flutter spec: ${screens.length} screens, ${components.length} components, ${actions.length} actions, ${flows.length} flows, ${totalReferences} route references`);
warnings.forEach((warning) => console.warn(`WARN ${warning}`));
if (errors.length) {
  errors.forEach((error) => console.error(`ERROR ${error}`));
  process.exitCode = 1;
} else {
  console.log("Flutter spec validation passed.");
}
