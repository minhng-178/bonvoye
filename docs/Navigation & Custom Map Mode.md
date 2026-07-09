## **08. NAVIGATION & CUSTOM MAP MODE**

**Status: implemented.** Engineering spec + record for turning the single-screen app into
a 4-tab product shell, making the `Country → City → Topic → POI` hierarchy from
`docs/06. Data Model Architecture.md` actually navigable, and adding "Custom Map Mode."

## 1. Why

The app was one screen (the map). To read as a real product it needed: persistent bottom
navigation, a way to browse the content hierarchy without needing to already be standing
on the right spot on the map, a place to see what you've unlocked, and the Ground Overlay
technique described early in this project's docs — pinning a custom image over real GPS
coordinates — actually wired up end to end for at least one POI.

## 2. Bottom navigation shell

`lib/screens/root_shell_screen.dart` — `RootShellScreen`, the new `MaterialApp.home`
(`lib/main.dart`). A `Scaffold` with:

- `IndexedStack` over the four tab bodies, so switching tabs doesn't rebuild them from
  scratch (the map's controller/markers and the nearby panel's drag position survive a
  trip to another tab and back).
- Each tab body wrapped in its **own `Navigator`** (`_tab()`, `onGenerateRoute` returning a
  single `MaterialPageRoute`). This is the detail that makes drill-down navigation inside a
  tab (Explore's Country→City→Topic→POI pushes, the map's existing search-screen push in
  `map_top_bar.dart`) cover only the body area — the bottom `NavigationBar` stays visible
  and each tab keeps an independent push stack. Without this, `Navigator.push` from inside
  a tab would resolve to the app's root `Navigator` and cover the nav bar itself.
- A Material 3 `NavigationBar` (not the legacy `BottomNavigationBar` — matches
  `useMaterial3: true` in `AppTheme`) with 4 destinations: Khám phá, Bản đồ, Hành Trình,
  Hồ sơ. Default landing tab is index 1 (Bản đồ), preserving the app's pre-existing
  behavior of opening straight to the map.

## 3. Explore tab — Country → City → Topic → POI

`lib/screens/explore_screen.dart` — `ExploreScreen` plus four private screens
(`_CityListScreen`, `_TopicListScreen`, `_PoiListScreen`, `_PoiDetailScreen`), one push per
level, all in this one file since they're a single cohesive flow. Each list screen shares
one row widget, `_ExploreListTile` (icon/thumbnail + title/subtitle + chevron), mirroring
the item style `topic_picker_sheet.dart` already used — no generic `EntityListScreen<T>`,
since each level shows different fields (POI has a photo, Topic has an icon, Country/City
are text-only) and a shared generic would need type-specific builders anyway.

Tapping a level calls the matching `LocationProvider` setter (`setCountry`/`setCity`/
`setTopic`) so the provider's selection stays in sync with what's being browsed, before
pushing the next screen. `_PoiDetailScreen`'s "Xem trên bản đồ" button:
`provider.updateLocation(poi.latitude, poi.longitude)` (teleports the simulated position
there — this is now the *only* way to move the simulated position, since the dev panel was
removed), calls the `onOpenOnMap` callback threaded down from `RootShellScreen` to switch
the bottom nav to the Bản đồ tab, then pops this tab's Explore stack back to its root.

`iconForTopic` (the `TopicIcon → IconData` mapping) was promoted from private
(`_iconFor`) to public in `topic_picker_sheet.dart` so `explore_screen.dart` could reuse it
instead of duplicating the switch.

## 4. Hành Trình tab — visited stories

Nothing previously tracked "which NPC stories has the user actually opened" (only
`HiddenThread.isUnlocked`, mutated in place on the shared mock object, persisted).
`LocationProvider` gained:

- `final List<NPC> _visitedNpcs` + `List<NPC> get visitedNpcs` (most-recent-first, deduped
  by id via `_markVisited`).
- `_markVisited` is called at the three places `_activeNPC` is set with intent to show its
  story: `selectNPC`, `selectFromChooser`, and the single-NPC-in-range branch of
  `_checkProximityTriggers`.

`lib/screens/journey_screen.dart` — `JourneyScreen` lists `visitedNpcs` (empty state if
none yet), each row an `ExpansionTile` showing that NPC's unlocked hidden threads and a
"Đọc lại story" action that reopens `NpcStorySheet` via a plain `showModalBottomSheet` —
deliberately not reusing `MapView`'s `_showStorySheet`, whose dedupe/proximity-popup
bookkeeping doesn't apply to an explicit re-read from history.

## 5. Hồ sơ tab

`lib/screens/profile_screen.dart` — centered placeholder (avatar icon + "Hồ sơ cá nhân" +
"Sắp ra mắt"). No fake settings, no auth — there's no backend to make any of that real yet.

## 6. Custom Map Mode

The Ground Overlay technique: pin a custom image to real lat/lng bounds so it renders
under/over the GPS dot with GPS accuracy preserved, without hiding the real map elsewhere.

- `lib/models/custom_map_overlay.dart` — `CustomMapOverlay { imageUrl, northLat, southLat,
  eastLng, westLng }` + `bool contains(lat, lng)`. Plain Dart, no `flutter_map`/`latlong2`
  types, per the "models stay framework-free" rule in `docs/07. Code Conventions.md` §2 —
  the widget layer builds the real `LatLngBounds`/`OverlayImage` from these raw doubles.
- `POI.customMapOverlay` (nullable — most POIs have none). `poi_ngoc_son_temple` in
  `mock_data.dart` got a demo overlay reusing its own existing photo `imageUrl` as
  placeholder art (bounds: a ~70m box around its coordinates) — proves the mechanism works
  end to end without needing real hand-drawn art yet.
- `LocationProvider.activeCustomMapOverlay` — an **uncached** getter scanning
  `_selectedTopic.pois` (same scope `allNPCs` already uses) for the first overlay whose
  bounds contain the current simulated position. Uncached deliberately: the POI list per
  topic is small, so a linear scan per position update is cheap, and caching a nullable
  result would need a tri-state "not computed vs. computed-and-null" flag for no real gain.
- `map_view.dart` renders `OverlayImageLayer` between `TileLayer` and `MarkerLayer` when
  `activeCustomMapOverlay` is non-null — **after** `TileLayer` (required by
  `OverlayImageLayer`'s own doc comment to be visible at all) and **before** `MarkerLayer`
  so NPC pins stay tappable on top of the custom art. The overlay is layered on top of the
  real tiles, not a replacement of the whole map — outside its rectangle, real tiles still
  show. This matches how `flutter_map`'s `OverlayImageLayer` actually works and matches the
  Ground Overlay description from earlier in this project ("đè lên bản đồ thực").
- Trigger is automatic and GPS/bounds-based, the same style as the existing NPC proximity
  trigger — not a manual toggle.

## 7. Considered and rejected (over-engineering right now)

- **Generic drill-down screen** for Country/City/Topic/POI — rejected, see §3.
- **Reusing `MapView`'s story-sheet launcher from Journey** — rejected, see §4.
- **Caching `activeCustomMapOverlay`** — rejected, see §6.
- **Real settings/auth on the Hồ sơ tab** — nothing to back it yet.
- **Hiding the tile layer entirely inside a custom-map POI** — the overlay layers on top
  instead (see §6); flag if the intent was actually a full replacement.

## 8. If you're the next session touching this area

- New tab content goes inside that tab's own pushed screen (each tab already has its own
  `Navigator` from `RootShellScreen._tab`) — don't push onto the app root `Navigator` from
  inside a tab, or the bottom nav bar will get covered.
- A second `City`/`Country` in `mock_data.dart` is the trigger to finally build
  `CityPickerSheet`/`CountryPickerSheet` (flagged as not-yet-needed in `docs/06` §7) —
  Explore's screens already handle an arbitrary-length list, nothing else changes.
- A POI's `customMapOverlay` bounds should stay small (building/complex-sized) — this is a
  local pin-over-the-real-map effect, not a base-map replacement.
