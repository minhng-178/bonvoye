# BonVoye Spec Importer

This is a no-build Figma development plugin. It imports a small set of key BonVoye prototype screens as editable Figma frames, prioritizing visual fidelity over importing every contract and state.

## What it imports

- Required: `prototype/spec/screens.json`
- Optional: `prototype/spec/figma-import.json`
- Optional visual source folder: `prototype/handoff/visual-source/` containing `figma-visual-sources.html` and its CSS files

The plugin creates or reuses one page: `BonVoye • Screens`. It is intentionally locked to one target: `flow.html#f=mo-dau&s=3`, the third step of the `mo-dau` flow (`home.empty`, “Mở app — chưa chọn gì”). Every import clears previous generated content and creates exactly one screen.

The importer renders the selected prototype DOM into editable Figma layers. It intentionally skips token, component, action, flow, and metadata pages so the Figma file stays focused on the screens that matter most. Node-level `bv.*` plugin data remains available for tracing screens, routes, states, and actions.

## Load it in Figma

1. Open the Figma desktop app.
2. Go to **Plugins → Development → Import plugin from manifest...**.
3. Select `figma-plugin/manifest.json`.
4. Run **BonVoye Spec Importer** from **Plugins → Development**.
5. Select `prototype/spec/screens.json` (and optionally `figma-import.json`).
6. The plugin is fixed to the single target screen: `flow.html#f=mo-dau&s=3`.
7. For visual fidelity, select the prototype folder containing `flow.html`, `flow.js`, and the referenced CSS files. The plugin reads the visual source as one batch.
8. Click **Import into Figma**. Previous generated content is always cleared so the file contains only one generated screen.

The plugin does not fetch remote assets. OpenStreetMap tiles and external fonts are reported as warnings instead of being downloaded; the imported map screen therefore preserves the prototype layout and overlays while using the local fallback surface where tiles are unavailable.

## Validate before importing

From the repository root:

```bash
node prototype/tools/validate-figma-import.js
node prototype/tools/validate-flutter-spec.js
```

## Generated metadata

Generated nodes carry `bv.*` plugin data, including `bv.screenId`, `bv.route`, `bv.componentId`, `bv.variant`, `bv.state`, `bv.actionId`, `bv.actionPayload`, `bv.sourceKind`, and `bv.generated`. This makes it safe to identify generated content during a later re-import without deleting unrelated designer work.
