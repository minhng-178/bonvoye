import 'story.dart';

enum ZoneType { legends, history, localLife, scenicSpot, trueCrime }

class NPC {
  final String id;
  final String name;
  final String role;
  final String? avatarUrl;
  final double latitude;
  final double longitude;
  final Story story;
  final ZoneType zoneType;

  /// Id of the [POI] this NPC belongs to. NPCs sharing a `poiId` are treated
  /// as occupying the same physical location (e.g. different floors of one
  /// building) even if their coordinates aren't byte-identical, so the map
  /// can render them as a single cluster pin instead of stacking overlapping
  /// markers on top of each other.
  final String poiId;

  /// Optional floor/level label, for NPCs that share a coordinate with others
  /// in the same building (e.g. a multi-story citadel) and can only be told
  /// apart by which level they're on, not by GPS position.
  final String? floor;

  NPC({
    required this.id,
    required this.name,
    required this.role,
    this.avatarUrl,
    required this.latitude,
    required this.longitude,
    required this.story,
    required this.zoneType,
    required this.poiId,
    this.floor,
  });

  factory NPC.fromJson(Map<String, dynamic> json) {
    return NPC(
      id: json['id'] as String,
      name: json['name'] as String,
      role: json['role'] as String,
      avatarUrl: json['avatarUrl'] as String?,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      story: Story.fromJson(json['story'] as Map<String, dynamic>),
      zoneType: ZoneType.values.firstWhere(
        (e) => e.toString().split('.').last == json['zoneType'],
        orElse: () => ZoneType.history,
      ),
      poiId: json['poiId'] as String,
      floor: json['floor'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'role': role,
      'avatarUrl': avatarUrl,
      'latitude': latitude,
      'longitude': longitude,
      'story': story.toJson(),
      'zoneType': zoneType.toString().split('.').last,
      'poiId': poiId,
      'floor': floor,
    };
  }
}
