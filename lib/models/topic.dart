import 'poi.dart';

/// Which glyph represents a [Topic] in pickers/chips. Mapped to an actual
/// `IconData` at the UI layer (see `topic_picker_sheet.dart`) - kept as an
/// enum here, rather than an `IconData` field, so the model layer stays
/// framework-independent and so JSON round-tripping doesn't have to
/// reconstruct an `IconData` from a runtime int (Flutter's icon-font
/// tree-shaker requires `IconData.codePoint` to be a compile-time constant).
enum TopicIcon { autoStories }

class Topic {
  final String id;
  final String title;
  final String description;
  final List<POI> pois;
  final TopicIcon icon;

  Topic({
    required this.id,
    required this.title,
    required this.description,
    required this.pois,
    required this.icon,
  });

  factory Topic.fromJson(Map<String, dynamic> json) {
    var poiList = json['pois'] as List? ?? [];
    List<POI> poiObjects = poiList
        .map((p) => POI.fromJson(p as Map<String, dynamic>))
        .toList();

    return Topic(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      pois: poiObjects,
      icon: TopicIcon.values.firstWhere(
        (e) => e.toString().split('.').last == json['icon'],
        orElse: () => TopicIcon.autoStories,
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'pois': pois.map((p) => p.toJson()).toList(),
      'icon': icon.toString().split('.').last,
    };
  }
}
