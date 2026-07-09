import 'topic.dart';

class City {
  final String id;
  final String name;
  final String description;
  final double centerLatitude;
  final double centerLongitude;
  final List<Topic> topics;

  City({
    required this.id,
    required this.name,
    required this.description,
    required this.centerLatitude,
    required this.centerLongitude,
    required this.topics,
  });

  factory City.fromJson(Map<String, dynamic> json) {
    var topicList = json['topics'] as List? ?? [];
    List<Topic> topicObjects = topicList
        .map((t) => Topic.fromJson(t as Map<String, dynamic>))
        .toList();

    return City(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      centerLatitude: (json['centerLatitude'] as num).toDouble(),
      centerLongitude: (json['centerLongitude'] as num).toDouble(),
      topics: topicObjects,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'centerLatitude': centerLatitude,
      'centerLongitude': centerLongitude,
      'topics': topics.map((t) => t.toJson()).toList(),
    };
  }
}
