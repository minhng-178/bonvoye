import 'custom_map_overlay.dart';
import 'npc.dart';

class POI {
  final String id;
  final String title;
  final String description;
  final double latitude;
  final double longitude;
  final List<NPC> npcs;
  final String? imageUrl;

  /// When set, the map switches to this custom-drawn overlay while the user
  /// is within its bounds, instead of the real map tiles. Most POIs don't
  /// have one.
  final CustomMapOverlay? customMapOverlay;

  POI({
    required this.id,
    required this.title,
    required this.description,
    required this.latitude,
    required this.longitude,
    required this.npcs,
    this.imageUrl,
    this.customMapOverlay,
  });

  factory POI.fromJson(Map<String, dynamic> json) {
    var npcList = json['npcs'] as List? ?? [];
    List<NPC> npcObjects = npcList
        .map(
          (n) =>
              NPC.fromJson({...n as Map<String, dynamic>, 'poiId': json['id']}),
        )
        .toList();

    return POI(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      npcs: npcObjects,
      imageUrl: json['imageUrl'] as String?,
      customMapOverlay: json['customMapOverlay'] != null
          ? CustomMapOverlay.fromJson(
              json['customMapOverlay'] as Map<String, dynamic>,
            )
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'latitude': latitude,
      'longitude': longitude,
      'npcs': npcs.map((n) => n.toJson()).toList(),
      'imageUrl': imageUrl,
      'customMapOverlay': customMapOverlay?.toJson(),
    };
  }
}
