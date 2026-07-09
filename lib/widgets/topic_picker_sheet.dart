import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/topic.dart';

IconData _iconFor(TopicIcon icon) {
  switch (icon) {
    case TopicIcon.autoStories:
      return Icons.auto_stories;
  }
}

/// Lets the user pick which [Topic] (story pack) drives the map's NPCs,
/// markers, and nearby list.
class TopicPickerSheet extends StatelessWidget {
  final List<Topic> topics;
  final String selectedTopicId;
  final ValueChanged<Topic> onSelect;

  const TopicPickerSheet({
    super.key,
    required this.topics,
    required this.selectedTopicId,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Container(
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(24),
          topRight: Radius.circular(24),
        ),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Container(
                margin: const EdgeInsets.only(top: 12, bottom: 8),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: colorScheme.outlineVariant,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 4, 20, 12),
              child: Text(
                'Chọn chủ đề',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: colorScheme.onSurface,
                ),
              ),
            ),
            const Divider(height: 1),
            Flexible(
              child: ListView.separated(
                shrinkWrap: true,
                padding: const EdgeInsets.symmetric(vertical: 8),
                itemCount: topics.length,
                separatorBuilder: (context, index) => Divider(
                  height: 1,
                  indent: 76,
                  color: colorScheme.outlineVariant,
                ),
                itemBuilder: (context, index) {
                  final topic = topics[index];
                  final isSelected = topic.id == selectedTopicId;

                  return InkWell(
                    onTap: () => onSelect(topic),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 12,
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: colorScheme.secondaryContainer,
                            ),
                            child: Icon(
                              _iconFor(topic.icon),
                              color: colorScheme.secondary,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  topic.title,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                    color: colorScheme.onSurface,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  topic.description,
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w500,
                                    color: colorScheme.onSurfaceVariant,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          if (isSelected)
                            Icon(
                              Icons.check_circle,
                              color: colorScheme.primary,
                              size: 20,
                            )
                          else
                            Icon(
                              Icons.chevron_right,
                              color: colorScheme.outline,
                              size: 18,
                            ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}
