# BonVoye → Figma handoff

## 1. Validate

From `prototype/`:

```bash
node tools/validate-figma-import.js
node tools/validate-flutter-spec.js
```

## 2. Import editable contract structure

In Figma Desktop:

1. Plugins → Development → Import plugin from manifest…
2. Select `../figma-plugin/manifest.json`.
3. Run **BonVoye Spec Importer**.
4. Select these JSON files from `prototype/spec/`:
   - `design-tokens.json`
   - `components.json`
   - `screens.json`
   - `actions.json`
   - `flows.json`
   - `figma-import.json`
5. Set **Import scope** to `Spec only`.
6. Select `Replace generated content only`.
7. Click **Import into Figma**.

## 3. Add rendered visual sources

In the plugin's **Visual source folder** field, select the folder:

```text
/Users/hd-569/Documents/bonvoye/prototype/handoff/visual-source
```

That folder contains `figma-visual-sources.html` and all required CSS files. Select the folder once; the plugin imports the visual batch together.

Set **Import scope** to `Visual only`, keep **Replace generated content only**, then click **Import into Figma**. Do not use `Spec + visual` for the full 50-state source.

The plugin will create editable frames for the contract and use the rendered prototype DOM where a matching `data-bv-screen` exists. OpenStreetMap tiles and remote fonts are intentionally not embedded; replace them with approved local assets in Figma.
