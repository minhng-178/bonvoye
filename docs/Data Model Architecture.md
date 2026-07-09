## **06. DATA MODEL ARCHITECTURE**

**Status: implemented** (as part of the navigation-shell/Custom-Map-Mode pass — see
`docs/08. Navigation & Custom Map Mode.md` §1). `Country`/`City` exist in `lib/models/`,
`mock_data.dart` exports `mockCountries`, and `LocationProvider` has
`setCountry`/`setCity`. The rest of this document is kept as the historical spec for that
work, not a pending plan.

Engineering spec for reshaping `lib/models/` to match the content hierarchy defined in
[`Content Architecture.md`](Content%20Architecture.md):
`Country → City → Topic → POI → NPC → Story → Hidden Threads`.

This document is written to be executed by a Claude Code session with no prior context on
this change — it names exact files, exact class shapes, and an exact order of operations.
Read it top to bottom before touching code; don't skip to the class definitions.

## **1. Why**

`lib/models/` currently starts at `Topic`. There is no `Country` or `City` class, and
`Topic` is the root of the tree (`mock_data.dart` exports a top-level `List<Topic>`). The
content doc's hierarchy already assumes Country and City exist as real levels — this spec
closes that gap in code.

## **2. Current state**

```
mockTopics: List<Topic>            (lib/data/mock_data.dart)
  Topic { id, title, description, icon, pois: List<POI> }
  POI   { id, title, description, latitude, longitude, imageUrl?, npcs: List<NPC> }
  NPC   { id, name, role, avatarUrl?, latitude, longitude, zoneType, poiId, floor?, story: Story }
  Story { id, title, content, imagePath?, hiddenThreads: List<HiddenThread> }
  HiddenThread { id, title, content, isUnlocked }
```

Every level is a plain Dart class with a required-named constructor, `fromJson`, and
`toJson`, and each level owns the next one by composition (a list of children), not by
foreign-key reference. `LocationProvider` (`lib/providers/location_provider.dart`) holds
`Topic _selectedTopic = mockTopics.first` and derives NPC lists from it. The only other
direct consumer of the top-level `mockTopics` list is
`lib/widgets/nearby_list.dart`, which imports it to populate `TopicPickerSheet`.

There is currently exactly one country's worth of content (Vietnam) and one city's worth
(Hà Nội) — all five existing topics live under that one implicit city.

## **3. Target model**

Two new classes, same style as the existing ones (final fields, named constructor,
`fromJson`/`toJson`, one file per class, child imports parent-to-child same as
`topic.dart → poi.dart → npc.dart → story.dart → hidden_thread.dart`):

**`lib/models/city.dart`**
```dart
import 'topic.dart';

class City {
  final String id;
  final String name;
  final String description;
  final double centerLatitude;   // used to recenter the map camera when the
  final double centerLongitude;  // selected city changes
  final List<Topic> topics;

  City({
    required this.id,
    required this.name,
    required this.description,
    required this.centerLatitude,
    required this.centerLongitude,
    required this.topics,
  });

  factory City.fromJson(Map<String, dynamic> json) { ... } // mirrors Topic.fromJson
  Map<String, dynamic> toJson() { ... }                    // mirrors Topic.toJson
}
```

**`lib/models/country.dart`**
```dart
import 'city.dart';

class Country {
  final String id;
  final String name;
  final String description;
  final List<City> cities;

  Country({
    required this.id,
    required this.name,
    required this.description,
    required this.cities,
  });

  factory Country.fromJson(Map<String, dynamic> json) { ... }
  Map<String, dynamic> toJson() { ... }
}
```

`Topic`, `POI`, `NPC`, `Story`, `HiddenThread` are unchanged — no field, JSON shape, or
behavior changes. Only their root parent changes (they now live under a `City`, not at the
top level).

## **4. File-level change plan**

| File | Change |
|---|---|
| `lib/models/city.dart` | **New.** Class above. |
| `lib/models/country.dart` | **New.** Class above. |
| `lib/models/topic.dart` | No change. |
| `lib/models/poi.dart`, `npc.dart`, `story.dart`, `hidden_thread.dart` | No change. |
| `lib/data/mock_data.dart` | Wrap the existing `Topic(...)` list literal inside one `City(id: 'city_hanoi', name: 'Hà Nội', ...)`, inside one `Country(id: 'country_vietnam', name: 'Việt Nam', ...)`. Replace the top-level `mockTopics` export with `mockCountries: List<Country>`. Do not change any `Topic`/`POI`/`NPC`/`Story`/`HiddenThread` literal or id inside it — this is a re-nesting, not a content edit. |
| `lib/providers/location_provider.dart` | Add `_selectedCountry`/`_selectedCity` state, getters, and `setCity()` (see §5). Change `_selectedTopic` default from `mockTopics.first` to `_selectedCity.topics.first`. |
| `lib/widgets/nearby_list.dart` | Remove the `import '../data/mock_data.dart'` and the `topics: mockTopics` reference into `TopicPickerSheet`; source topics from `provider.selectedCity.topics` instead (see §5). |
| `test/providers/location_provider_test.dart`, `test/widgets/npc_chooser_sheet_test.dart` | No expected change — neither references `mockTopics` or `Topic` directly today. Re-run after the change to confirm. |

No other file under `lib/` references `Topic`, `POI`, `NPC`, `mockTopics`, or
`selectedTopic` outside what's listed above (confirmed by grepping `lib/` and `test/` for
those symbols before writing this spec).

## **5. Provider changes, concretely**

In `LocationProvider`:

- Add fields: `Country _selectedCountry = mockCountries.first;` and
  `City _selectedCity = mockCountries.first.cities.first;`.
- Add getters: `selectedCountry`, `selectedCity`.
- Change `Topic _selectedTopic = mockTopics.first;` to
  `Topic _selectedTopic = mockCountries.first.cities.first.topics.first;`.
- Add `setCity(City city)`, mirroring the existing `setTopic(Topic topic)`: no-op if same
  id, otherwise update `_selectedCity`, reset `_selectedTopic` to `city.topics.first`, and
  clear the same caches `setTopic` already clears (`_allNpcsCache`,
  `_npcsSortedByDistanceCache`, `_visibleNpcsCache`, `_lastInRangeIds`) — a city change
  invalidates everything a topic change does, plus the topic itself.
- `setTopic` keeps its current signature and cache-invalidation logic unchanged.

In `nearby_list.dart`, the `Selector<LocationProvider, ...>` record that currently exposes
`selectedTopic` should also expose `selectedCity`, and `TopicPickerSheet(topics: mockTopics, ...)`
becomes `TopicPickerSheet(topics: data.selectedCity.topics, ...)`.

## **6. Invariants — do not break these**

- Every existing id (`topic_hanoi_old_quarter`, `poi_ngoc_son_temple`, `npc_than_kim_quy`,
  `story_kim_quy`, `thread_turtle_biological`, etc.) stays byte-identical. This is a
  re-nesting of the same objects, not a content rewrite.
- `mockCountries.first.cities.first.topics` must equal the old `mockTopics` list exactly
  (same length, same order, same ids) — a future reader diffing before/after should see
  only added wrapper objects, not reordered or edited leaf content.
- `NPC.poiId` / `NPC.floor` semantics, the Haversine proximity logic, and the
  single-vs-multiple-NPCs-in-range chooser logic in `LocationProvider` are untouched by
  this change — this spec only touches what sits *above* `Topic`.
- Keep the `fromJson`/`toJson` pattern consistent with sibling models even though nothing
  currently deserializes `Country`/`City` from real JSON — `NPC.fromJson`/`toJson` is
  round-trip tested (`test/providers/location_provider_test.dart`), and the other models
  carry the same methods for that eventual (backend) use case.

## **7. Explicitly out of scope**

- No `CityPickerSheet` / `CountryPickerSheet` widget. The app only ships one city today;
  building a picker for a single option is premature. Add it when a second `City` is
  actually added to `mockCountries`.
- No backend/API work — `mock_data.dart` stays the only data source.
- No change to `docs/Content Architecture.md` (already restructured separately).
- No renaming or restructuring of `Topic`/`POI`/`NPC`/`Story`/`HiddenThread` fields.

## **8. Order of operations**

1. Add `lib/models/city.dart` and `lib/models/country.dart`.
2. Rewrite `lib/data/mock_data.dart` to nest the existing content under one `City` under
   one `Country`, exporting `mockCountries`.
3. Update `LocationProvider` per §5.
4. Update `nearby_list.dart` per §5.
5. Run `dart analyze` (Dart MCP `analyze_files`) — fix every reference this change breaks;
   there should be none left outside the files listed in §4.
6. Run the test suite (Dart MCP test runner) — `location_provider_test.dart` and
   `npc_chooser_sheet_test.dart` must stay green with no edits.
7. Use the **verify** skill to run the app and confirm zero behavior change: the topic
   picker still opens and still lists "Hồ Gươm Ký Ức" (and the other existing topics), the
   map still shows the same NPC markers at the same coordinates, and walking into a
   simulated NPC's radius still triggers its story. This step exists because §4-6 are a
   pure refactor — if anything looks different at runtime, something was mis-nested.

## **9. Follow-up work (not part of this pass)**

Once a second `City` or `Country` is actually added to `mockCountries`:

- Build `CityPickerSheet` (same shape as `TopicPickerSheet`) and wire it wherever the topic
  picker is triggered from.
- Decide whether `Topic` needs a `cityId` back-reference (like `NPC.poiId`) — only worth
  adding once a widget actually needs to resolve "which city is this topic in" without
  walking the tree from `LocationProvider`.
- Decide whether `City.centerLatitude`/`centerLongitude` should drive an automatic map
  camera recenter in `map_view.dart` on `setCity()` — not needed today since there's only
  one city and the camera already centers on the (simulated) user position.
