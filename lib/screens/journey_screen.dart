import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../models/npc.dart';
import '../providers/location_provider.dart';
import '../utils/image_utils.dart';
import '../widgets/npc_story_sheet.dart';
import '../widgets/story_chip.dart';

/// Hành Trình tab: every NPC story the user has actually opened, most-recent
/// first, each expandable to any Hidden Threads unlocked within it.
class JourneyScreen extends StatelessWidget {
  const JourneyScreen({super.key});

  void _reopenStory(BuildContext context, NPC npc) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      barrierColor: Colors.black.withValues(alpha: 0.2),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.65,
        minChildSize: 0.4,
        maxChildSize: 0.95,
        expand: false,
        builder: (context, scrollController) {
          return NpcStorySheet(npc: npc, onClose: () => Navigator.pop(context));
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Hành Trình',
          style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700),
        ),
      ),
      body: Selector<LocationProvider, List<NPC>>(
        selector: (context, provider) => provider.visitedNpcs,
        builder: (context, visitedNpcs, child) {
          if (visitedNpcs.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 32),
                child: Text(
                  'Chưa khám phá story nào — hãy đi dạo trên bản đồ!',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 14,
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.symmetric(vertical: 8),
            itemCount: visitedNpcs.length,
            separatorBuilder: (context, index) =>
                const Divider(height: 1, indent: 76),
            itemBuilder: (context, index) {
              final npc = visitedNpcs[index];
              final unlockedThreads = npc.story.hiddenThreads
                  .where((t) => t.isUnlocked)
                  .toList();

              return ExpansionTile(
                leading: ClipOval(
                  child: SizedBox(
                    width: 48,
                    height: 48,
                    child: npc.avatarUrl != null
                        ? Image(
                            image: getSafeImageProvider(
                              npc.avatarUrl,
                              cacheWidth: 96,
                              cacheHeight: 96,
                            ),
                            fit: BoxFit.cover,
                          )
                        : Container(
                            color: colorScheme.secondaryContainer,
                            child: Icon(
                              Icons.person,
                              color: colorScheme.secondary,
                            ),
                          ),
                  ),
                ),
                title: Text(
                  npc.name,
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: colorScheme.onSurface,
                  ),
                ),
                subtitle: Row(
                  children: [
                    Expanded(
                      child: Text(
                        npc.story.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 12,
                          color: colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),
                    StoryChip(zoneType: npc.zoneType),
                  ],
                ),
                children: [
                  ListTile(
                    dense: true,
                    title: Text(
                      'Đọc lại story',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: colorScheme.primary,
                      ),
                    ),
                    trailing: Icon(
                      Icons.chevron_right,
                      color: colorScheme.primary,
                    ),
                    onTap: () => _reopenStory(context, npc),
                  ),
                  if (unlockedThreads.isEmpty)
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                      child: Text(
                        'Chưa mở khóa Hidden Thread nào.',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 12,
                          color: colorScheme.outline,
                        ),
                      ),
                    )
                  else
                    ...unlockedThreads.map(
                      (thread) => ListTile(
                        dense: true,
                        leading: Icon(
                          Icons.bookmark,
                          size: 18,
                          color: colorScheme.primary,
                        ),
                        title: Text(
                          thread.title,
                          style: GoogleFonts.plusJakartaSans(fontSize: 13),
                        ),
                      ),
                    ),
                ],
              );
            },
          );
        },
      ),
    );
  }
}
