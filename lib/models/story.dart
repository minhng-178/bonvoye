import 'hidden_thread.dart';

class Story {
  final String id;
  final String title;
  final String content;
  final String? imagePath;
  final List<HiddenThread> hiddenThreads;

  Story({
    required this.id,
    required this.title,
    required this.content,
    this.imagePath,
    required this.hiddenThreads,
  });

  factory Story.fromJson(Map<String, dynamic> json) {
    var threadsList = json['hiddenThreads'] as List? ?? [];
    List<HiddenThread> threads = threadsList
        .map((t) => HiddenThread.fromJson(t as Map<String, dynamic>))
        .toList();

    return Story(
      id: json['id'] as String,
      title: json['title'] as String,
      content: json['content'] as String,
      imagePath: json['imagePath'] as String?,
      hiddenThreads: threads,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'content': content,
      'imagePath': imagePath,
      'hiddenThreads': hiddenThreads.map((t) => t.toJson()).toList(),
    };
  }
}
