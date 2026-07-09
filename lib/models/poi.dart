import 'npc.dart';

class POI {
  final String id;
  final String title;
  final String description;
  final double latitude;
  final double longitude;
  final List<NPC> npcs;
  final String? imageUrl;

  POI({
    required this.id,
    required this.title,
    required this.description,
    required this.latitude,
    required this.longitude,
    required this.npcs,
    this.imageUrl,
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
    };
  }
}
