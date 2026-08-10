<!-- # bonvoye

Flutter app: a location-based narrative/storytelling map. A fullscreen `flutter_map` view
shows the user's position; NPCs/POIs on the map trigger story content when the user gets
within range (~20m), with a developer panel for simulating location during dev.

- Flutter 3.44.5, Dart SDK ^3.12.2
- State management: `provider` (`ChangeNotifierProvider`) — see `lib/providers/location_provider.dart`
- Map: `flutter_map` + `latlong2`
- Fonts/theme: `google_fonts` (Plus Jakarta Sans), Material 3 `ColorScheme` defined in `lib/main.dart`

## Structure

- `lib/main.dart` — app entry/bootstrap only (wires `Provider` + `MaterialApp`)
- `lib/theme/app_theme.dart` — the app's `ThemeData`/`ColorScheme` definition
- `lib/screens/` — routed, full-page widgets (`main_narrative_screen`, `search_screen`)
- `lib/providers/` — app state (location)
- `lib/models/` — domain data classes (`npc`, `poi`, `story`, `topic`, `hidden_thread`) —
  plain Dart, no Flutter/UI imports
- `lib/data/mock_data.dart` — fixture data feeding the models (not production content)
- `lib/widgets/` — one widget per file: reusable components and overlay/sheet panels that
  aren't full routed pages (map view, nearby list, story sheet, developer panel, etc.)
- `lib/utils/` — helpers (`haversine.dart` for distance calc, `image_utils.dart`,
  `constants.dart` for shared literals like colors/radii, `zone_colors.dart` theme extension)
- `test/` — widget tests

## Tooling

A Dart/Flutter MCP server is configured in `.mcp.json` (`dart mcp-server`). It exposes
analysis, formatting, test running, hot reload/restart, device/app lifecycle management, the
widget inspector, and runtime log/error inspection as tools — use these instead of shelling
out to `flutter`/`dart` directly when an equivalent tool is available.

## Skills to use

- **flutter-dev** — Flutter/Dart workflow and this project's conventions. Use for any change
  under `lib/` or `test/`, and for anything touching the Dart MCP server tools above.
- **run** — launching/screenshotting the app to see a change working end-to-end.
- **verify** — confirming a change actually behaves correctly at runtime, not just that it
  compiles/type-checks.

## Harness Method — process for non-trivial changes

For anything that isn't trivial (a new feature, a data-model/schema change, a refactor
touching more than ~2 files, or anything architectural) — as opposed to a typo fix,
single-line tweak, or a change whose requirements are already fully specified — follow this
process instead of jumping straight to code:

1. **Spec first.** Write or update an engineering spec under `docs/`, continuing the numbered
   series already started (`05. Content Architecture.md`, `06. Data Model Architecture.md`,
   next is `07.`, ...). A spec states: why, current state, target design (concrete code/data
   shapes — not prose), a file-level change table, invariants that must not break, what's
   explicitly out of scope, and an ordered list of implementation steps. Use `EnterPlanMode`
   to design it and get it approved before writing code. For changes with lasting
   architectural value, persist the approved plan as a spec doc in `docs/` — not just the
   session's ephemeral plan file — so the next session inherits it.
2. **Implement in the order the spec lists**, touching only the files the spec names. If
   implementation reveals the spec was wrong, update the spec doc — don't silently diverge
   from it.
3. **Verify before declaring done.** Never report a change complete on the strength of "it
   compiles":
   - `dart analyze` (Dart MCP `analyze_files`) with zero new errors/warnings.
   - Relevant tests green (Dart MCP test runner), including anything the spec's invariants
     section calls out as must-not-break.
   - Drive the actual feature at runtime via the **verify** skill (hot reload/restart,
     widget inspector, runtime error check) — analysis and tests confirm correctness, not
     that the feature behaves as intended on screen.
4. **Report against the spec** — state what changed vs. what the spec said, and call out any
   deviations explicitly rather than letting them pass silently.

Skip this process for trivial changes and use judgment — don't manufacture process for its
own sake. -->
