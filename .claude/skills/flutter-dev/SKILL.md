---
name: flutter-dev
description: Flutter/Dart development workflow for the bonvoye app — use whenever editing code under lib/ or test/, running/debugging the app, or investigating UI/runtime issues. Covers using the Dart MCP server tools (hot reload, analysis, tests, widget inspector) instead of raw shell commands, and this project's conventions (Provider state management, flutter_map, Material 3 theme).
---

# Flutter dev (bonvoye)

This project is a Flutter app (Dart SDK ^3.12.2, Flutter 3.44.5) — a location-based
narrative/storytelling map ("Hồ Gươm Ký Ức"): a fullscreen `flutter_map` view, NPCs/POIs
the user triggers stories from when nearby, and a developer panel for simulating location.

A Dart/Flutter MCP server (`dart mcp-server`) is configured in `.mcp.json` at the project
root. Prefer its tools over raw `flutter`/`dart` shell commands wherever one exists — they
give structured results and don't require parsing terminal output.

## Preferred tools (MCP) vs shell

| Task | Use | Instead of |
|---|---|---|
| Static analysis | `analyze_files` | `flutter analyze` |
| Formatting | `dart_format` | `dart format` |
| Auto-fix lints | `dart_fix` | `dart fix --apply` |
| Run tests | `run_tests` | `flutter test` |
| List/pick devices | `list_devices` | `flutter devices` |
| Launch the app | `launch_app` | `flutter run` |
| Apply code changes live | `hot_reload` | killing/restarting the app |
| Full state reset | `hot_restart` | — |
| Check for exceptions after a change | `get_runtime_errors`, `get_app_logs` | asking the user "does it work?" |
| Inspect widget tree / layout issues | `widget_inspector`, `get_active_location` | guessing from source alone |
| Package docs/search | `pub_dev_search`, `read_package_uris` | web search |

## Workflow when editing code

1. Make the edit under `lib/` (or `test/`).
2. Run `dart_format` then `analyze_files` on the touched files before considering the change done.
3. If an app instance is already running (via `launch_app`), use `hot_reload` to apply the
   change, then check `get_runtime_errors`/`get_app_logs` for exceptions — don't assume success.
4. If the change affects widget structure/layout, use `widget_inspector` to confirm the tree
   looks right rather than only reading the code.
5. If the change affects `lib/providers/` or `lib/models/`, run `run_tests` (test/ currently
   has a starter widget test — add/extend tests there for new logic rather than only manual
   verification).
6. State-shape changes (adding a field to `LocationProvider`, a model, etc.) are a good signal
   to also hot-restart (not just hot-reload) since `initState`/constructors won't re-run on
   reload.

## Project conventions to follow

- **State management**: `provider` package, `ChangeNotifierProvider`/`Consumer` — see
  `lib/providers/location_provider.dart` and how it's wired in `lib/main.dart`. Don't introduce
  a second state-management approach (e.g. Bloc, Riverpod) without the user asking.
- **Theming**: Material 3, custom `ColorScheme` and `GoogleFonts.plusJakartaSans` text theme
  defined once in `lib/theme/app_theme.dart`. Reuse `Theme.of(context).colorScheme` /
  `.textTheme` in widgets instead of hardcoding new `Color(0x...)` literals — if a raw color
  value is genuinely needed outside the theme (e.g. a fixed marker color that shouldn't
  follow theme changes), add a named constant to `lib/utils/constants.dart` rather than
  repeating the literal at each call site.
- **Map**: `flutter_map` + `latlong2` for coordinates/geometry; distance calculations live in
  `lib/utils/haversine.dart` — reuse it rather than re-deriving distance math.
- **Domain models**: `lib/models/` (`npc.dart`, `poi.dart`, `story.dart`, `topic.dart`,
  `hidden_thread.dart`) are plain Dart data classes fed by `lib/data/mock_data.dart` — treat
  `mock_data.dart` as fixture data, not production content. Keep this layer Flutter-free (no
  `material`/`widgets` imports) — represent UI-facing choices like icons as an enum (see
  `TopicIcon` in `topic.dart`) and map the enum to Flutter types at the widget layer instead.
- **Screens vs widgets**: `lib/screens/` holds routed, full-page widgets (composed in
  `main.dart`'s `MaterialApp.home`, pushed via `Navigator`); `lib/widgets/` holds one
  reusable component or overlay/sheet per file, generally composed inside a screen's `Stack`.
  New full pages go in `screens/`, everything else in `widgets/`.

## Related skills

For actually launching/screenshotting the app end-to-end, or verifying a change works at
runtime beyond hot reload + logs, use the generic `run` and `verify` skills — they compose
with this one (this skill covers *how* to work with Flutter/Dart specifically; those cover
*when/why* to exercise the app).
