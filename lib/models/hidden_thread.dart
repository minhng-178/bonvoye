class HiddenThread {
  final String id;
  final String title;
  final String content;
  bool isUnlocked;

  HiddenThread({
    required this.id,
    required this.title,
    required this.content,
    this.isUnlocked = false,
  });

  factory HiddenThread.fromJson(Map<String, dynamic> json) {
    return HiddenThread(
      id: json['id'] as String,
      title: json['title'] as String,
      content: json['content'] as String,
      isUnlocked: json['isUnlocked'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'content': content,
      'isUnlocked': isUnlocked,
    };
  }
}
