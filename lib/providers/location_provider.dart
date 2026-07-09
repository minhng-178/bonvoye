import 'dart:async';

import 'package:flutter/foundation.dart';
import '../models/npc.dart';
import '../models/topic.dart';
import '../utils/haversine.dart';
import '../utils/constants.dart';
import '../data/mock_data.dart';

/// How long to wait after the user stops typing before the search query
/// actually takes effect (re-filtering markers/nearby list/map rebuilds).
/// Keeps every keystroke cheap even though filtering re-walks the NPC list.
const Duration _kSearchDebounce = Duration(milliseconds: 200);

class LocationProvider extends ChangeNotifier {
  // Default starting position: Quảng trường Bưu điện Hà Nội (on land)
  double _userLatitude = kDefaultUserLatitude;
  double _userLongitude = kDefaultUserLongitude;
  bool _isSimulationMode =
      true; // Default to simulation mode for easier testing

  NPC? _activeNPC;
  bool _shouldShowTriggerPopup = false;

  String _searchQuery = '';
  ZoneType? _selectedZoneType;
  Topic _selectedTopic = mockTopics.first;

  // Tracks which set of NPC ids were in range as of the last check, so we
  // only re-evaluate (auto-open or show the chooser) when that set actually
  // changes - not on every location update while the user stands still.
  Set<String> _lastInRangeIds = {};
  bool _shouldShowChooser = false;
  List<MapEntry<NPC, double>> _chooserCandidates = [];

  // Caches for the derived NPC lists below - these are recomputed (Haversine
  // distance to every NPC, plus a sort) on every access, and are read from
  // several widgets (map markers, nearby list, search results) on every
  // rebuild, so an uncached getter redoes that work many times per frame.
  // Invalidated explicitly whenever something they depend on changes.
  List<NPC>? _allNpcsCache;
  List<MapEntry<NPC, double>>? _npcsSortedByDistanceCache;
  List<MapEntry<NPC, double>>? _visibleNpcsCache;

  Timer? _searchDebounceTimer;

  double get userLatitude => _userLatitude;
  double get userLongitude => _userLongitude;
  bool get isSimulationMode => _isSimulationMode;
  NPC? get activeNPC => _activeNPC;
  bool get shouldShowTriggerPopup => _shouldShowTriggerPopup;
  String get searchQuery => _searchQuery;
  ZoneType? get selectedZoneType => _selectedZoneType;
  Topic get selectedTopic => _selectedTopic;
  bool get shouldShowChooser => _shouldShowChooser;
  List<MapEntry<NPC, double>> get chooserCandidates => _chooserCandidates;

  // Flattened list of NPCs belonging to the selected topic. Cached and only
  // recomputed when the selected topic changes.
  List<NPC> get allNPCs {
    if (_allNpcsCache != null) return _allNpcsCache!;
    final List<NPC> npcs = [];
    for (var poi in _selectedTopic.pois) {
      npcs.addAll(poi.npcs);
    }
    return _allNpcsCache = npcs;
  }

  /// Returns NPCs sorted by distance from the user. Cached and only
  /// recomputed when the user's position changes.
  List<MapEntry<NPC, double>> get npcsSortedByDistance {
    if (_npcsSortedByDistanceCache != null) return _npcsSortedByDistanceCache!;

    final list = allNPCs.map((npc) {
      final distance = Haversine.distance(
        _userLatitude,
        _userLongitude,
        npc.latitude,
        npc.longitude,
      );
      return MapEntry(npc, distance);
    }).toList();

    list.sort((a, b) => a.value.compareTo(b.value));
    return _npcsSortedByDistanceCache = list;
  }

  /// NPCs currently within the proximity radius, sorted by distance.
  List<MapEntry<NPC, double>> get npcsInRange => npcsSortedByDistance
      .where((e) => e.value <= kProximityRadiusMeters)
      .toList();

  /// [npcsSortedByDistance] narrowed down by the active search query and
  /// location-type filter, for display in the map markers and nearby list.
  /// Proximity triggering deliberately ignores this - it's a display concern
  /// only, so walking up to a filtered-out NPC still opens their story.
  /// Cached and only recomputed when position, query, or filter change.
  List<MapEntry<NPC, double>> get visibleNpcsSortedByDistance {
    if (_visibleNpcsCache != null) return _visibleNpcsCache!;

    final query = _searchQuery.trim().toLowerCase();

    return _visibleNpcsCache = npcsSortedByDistance.where((entry) {
      final npc = entry.key;
      if (_selectedZoneType != null && npc.zoneType != _selectedZoneType) {
        return false;
      }
      if (query.isEmpty) return true;
      return npc.name.toLowerCase().contains(query) ||
          npc.role.toLowerCase().contains(query) ||
          npc.story.title.toLowerCase().contains(query);
    }).toList();
  }

  /// Updates the search query. Debounced so that filtering/rebuilding the
  /// map markers and nearby list doesn't happen on every single keystroke -
  /// only once typing pauses. Clearing the query (e.g. tapping "x") applies
  /// immediately so the UI feels responsive.
  void setSearchQuery(String query) {
    _searchDebounceTimer?.cancel();
    if (query.isEmpty) {
      _applySearchQuery(query);
      return;
    }
    _searchDebounceTimer = Timer(
      _kSearchDebounce,
      () => _applySearchQuery(query),
    );
  }

  void _applySearchQuery(String query) {
    if (_searchQuery == query) return;
    _searchQuery = query;
    _visibleNpcsCache = null;
    notifyListeners();
  }

  void setZoneTypeFilter(ZoneType? zoneType) {
    if (_selectedZoneType == zoneType) return;
    _selectedZoneType = zoneType;
    _visibleNpcsCache = null;
    notifyListeners();
  }

  void setTopic(Topic topic) {
    if (_selectedTopic.id == topic.id) return;
    _selectedTopic = topic;
    _allNpcsCache = null;
    _npcsSortedByDistanceCache = null;
    _visibleNpcsCache = null;
    _lastInRangeIds = {};
    notifyListeners();
  }

  void toggleSimulationMode() {
    _isSimulationMode = !_isSimulationMode;
    notifyListeners();
  }

  void setSimulationMode(bool enabled) {
    _isSimulationMode = enabled;
    notifyListeners();
  }

  void updateLocation(double lat, double lng) {
    _userLatitude = lat;
    _userLongitude = lng;
    _npcsSortedByDistanceCache = null;
    _visibleNpcsCache = null;

    _checkProximityTriggers();
    notifyListeners();
  }

  @override
  void dispose() {
    _searchDebounceTimer?.cancel();
    super.dispose();
  }

  /// Direct user selection (bypasses proximity requirements)
  void selectNPC(NPC npc) {
    _activeNPC = npc;
    _shouldShowTriggerPopup = true; // Show story view
    notifyListeners();
  }

  void clearActiveNPC() {
    _activeNPC = null;
    _shouldShowTriggerPopup = false;
    notifyListeners();
  }

  void markPopupShown() {
    _shouldShowTriggerPopup = false;
    notifyListeners();
  }

  /// Called when the user picks one NPC out of the multi-NPC chooser.
  void selectFromChooser(NPC npc) {
    _activeNPC = npc;
    _shouldShowTriggerPopup = true;
    _shouldShowChooser = false;
    notifyListeners();
  }

  /// Dismisses the chooser without picking anyone (e.g. user swipes it away).
  void dismissChooser() {
    _shouldShowChooser = false;
    notifyListeners();
  }

  /// Automatically check which NPCs the user is within range of.
  ///
  /// Invariant: at most one of [shouldShowTriggerPopup] / [shouldShowChooser]
  /// is ever true at a time - exactly one NPC in range auto-opens its story
  /// directly, while two or more in range at once opens a chooser so the
  /// user can say which one they mean instead of silently picking the
  /// nearest.
  void _checkProximityTriggers() {
    final inRange = npcsInRange;
    final currentIds = inRange.map((e) => e.key.id).toSet();

    if (currentIds.isEmpty) {
      // Reset so walking back into range (even of the same NPC) re-triggers.
      _lastInRangeIds = {};
      return;
    }

    if (setEquals(currentIds, _lastInRangeIds)) {
      // Same NPCs in range as last check - don't re-pop while standing still.
      return;
    }

    _lastInRangeIds = currentIds;

    if (inRange.length == 1) {
      _activeNPC = inRange.first.key;
      _shouldShowTriggerPopup = true;
      _shouldShowChooser = false;
    } else {
      _chooserCandidates = inRange;
      _shouldShowChooser = true;
      _shouldShowTriggerPopup = false;
    }
  }
}
