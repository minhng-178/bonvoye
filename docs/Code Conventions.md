## **07. CODE CONVENTIONS**

Record of a code-convention cleanup pass under the Harness Method: no duplicated
hardcoded values, no loosely/stringly-typed fields, clear `screens/` vs `widgets/`
separation, and nothing added that the codebase didn't already need. This doc exists so a
future session doesn't reintroduce what was removed here, or re-litigate what was
deliberately left alone.

## 1. What was actually wrong (and fixed)

- **`kUserLocationColor` (`Color(0xFF5D5FEF)`) was re-typed as a raw literal 7 times** in
  `lib/widgets/developer_panel.dart` and `lib/widgets/npc_story_sheet.dart`, even though
  `lib/utils/constants.dart` already defined it for this exact purpose — one file even had
  it imported and still didn't use it. All 7 call sites (plus 3 tinted variants built with
  `Color(0x265D5FEF)` / `Color(0x1A5D5FEF)` / `Color(0x335D5FEF)`) now reference
  `kUserLocationColor` (or `kUserLocationColor.withAlpha(...)` for the tints).
- **A 10%-black shadow (`Color(0x1A000000)`) was duplicated 4 times** with no name, across
  `search_screen.dart`, `main_narrative_screen.dart`, and `map_top_bar.dart`. Now
  `kCardShadowColor` in `constants.dart`.
- **A muted/inactive gray (`Color(0xFF767586)`) was duplicated 3 times**, all inside
  `developer_panel.dart`. Now `kMutedColor` in `constants.dart`.
- **`main.dart` built the entire `ThemeData`/`ColorScheme` inline** inside
  `BonVoyeApp.build()`. Extracted to `lib/theme/app_theme.dart` (`AppTheme.light`) —
  `main.dart` is now bootstrap only.
- **`Topic.icon` was a `String`** (`'auto_stories'`), matched in
  `topic_picker_sheet.dart`'s private `_iconForName()` via a `switch` with a silent
  `default: return Icons.explore` — a typo in mock data would render the wrong icon
  instead of failing to compile. Fixed by introducing `enum TopicIcon` in `topic.dart`
  and an exhaustive `switch (TopicIcon)` at the one call site (compiler now errors if a
  new `TopicIcon` value is added without a matching UI mapping).

## 2. A real constraint discovered mid-fix — don't reach for `IconData` fields

The first attempt at fixing `Topic.icon` typed the field as `IconData` directly. That
doesn't work: Flutter's icon-font tree-shaker requires every `IconData.codePoint` to be a
**compile-time constant**, and `Topic.fromJson` would need to reconstruct one from a
runtime `int` — the analyzer flags this (`const_eval_method_invocation` /
"Argument 'codePoint' must be a constant"). This isn't a style nitpick, it's a real
constraint on any real (non-mock) Flutter build pipeline.

**Rule going forward**: never store `IconData` on a plain-Dart model that might ever be
constructed from external data (JSON, a backend, user input). Use an enum instead — the
model stays framework-independent (no `material`/`widgets` import in `lib/models/`), the
enum serializes safely to/from JSON as its name (see `NPC.zoneType` / `ZoneType` for the
existing precedent this now matches), and the enum-to-`IconData` mapping lives at the UI
layer where `const Icons.xxx` values are safe to reference directly.

## 3. Structure — verified, not changed

`lib/screens/` (routed, full-page widgets) vs `lib/widgets/` (reusable components and
overlay/sheet panels) was already a clean, correctly-followed split — nothing was
misplaced. The only fix needed was to `CLAUDE.md` and the `flutter-dev` skill, whose
"Structure"/"Theming"/"Widgets" notes still described the pre-`lib/screens/`,
pre-`lib/theme/` layout. Both now describe the actual tree, including the new
`lib/theme/app_theme.dart`.

## 4. Considered and deliberately not done (would be over-engineering right now)

- **An l10n/ARB layer for UI copy.** All Vietnamese strings stay as plain literals in
  their widgets. That's normal Flutter, not hardcoding — there's no multi-language
  requirement today, so adding one now would be solving a problem that doesn't exist yet.
- **A design-token/spacing scale** (`AppSpacing`, `AppRadius`, etc.). Only three color
  values were duplicated verbatim across files at meaningful scale (§1) — those got named
  constants. One-off `EdgeInsets`/radius literals that don't repeat aren't a violation of
  anything; forcing every dimension through a token system for a three-screen app would be
  process for its own sake.
- **A repository/service abstraction around `lib/data/mock_data.dart`.** There is no real
  backend yet. Introducing an interface for a data source that doesn't exist is
  speculative generality — add it when a real API shows up, not before.

## 5. If you're the next session touching this area

- New duplicated literal (color, string, magic number) appearing in ≥2 files → it belongs
  in `lib/utils/constants.dart` (or `lib/theme/app_theme.dart` if it's a theme color), not
  re-typed at each site.
- New field on a `lib/models/` class that represents "one of a fixed set of UI choices"
  (an icon, a category, a display variant) → an enum in the model file, mapped to the
  concrete Flutter type at the widget layer that consumes it. Never `String` with a
  hand-written lookup `switch`, never the Flutter type itself if the model could ever be
  built from external data.
- New full-page UI → `lib/screens/`. New reusable component/overlay → `lib/widgets/`.
