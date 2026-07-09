import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/npc.dart';
import '../models/hidden_thread.dart';
import '../utils/constants.dart';
import '../utils/image_utils.dart';
import '../utils/zone_colors.dart';
import 'story_chip.dart';

class NpcStorySheet extends StatefulWidget {
  final NPC npc;
  final VoidCallback onClose;

  const NpcStorySheet({super.key, required this.npc, required this.onClose});

  @override
  State<NpcStorySheet> createState() => _NpcStorySheetState();
}

class _NpcStorySheetState extends State<NpcStorySheet> {
  // Keep track of unlocked thread IDs locally for demo purposes
  final Set<String> _unlockedThreadIds = {};

  void _unlockThread(HiddenThread thread) {
    setState(() {
      _unlockedThreadIds.add(thread.id);
      thread.isUnlocked = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    final npc = widget.npc;
    final story = npc.story;
    final colorScheme = Theme.of(context).colorScheme;
    final zoneColors = Theme.of(context).extension<ZoneColors>()!;
    final zoneColor = zoneColors.baseFor(npc.zoneType);
    final zoneOnColor = zoneColors.onFor(npc.zoneType);
    final dpr = MediaQuery.devicePixelRatioOf(context);
    final heroCacheWidth = (MediaQuery.sizeOf(context).width * dpr).round();
    final heroCacheHeight = (200 * dpr).round();

    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: colorScheme.secondaryContainer,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(24),
          topRight: Radius.circular(24),
        ),
        boxShadow: [
          BoxShadow(
            color: kUserLocationColor.withAlpha(
              0x1A,
            ), // diffused primary tint shadow
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Hero banner: NPC portrait with name/role/chip captioned over it
            SizedBox(
              height: 200,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  if (npc.avatarUrl != null)
                    Image(
                      image: getSafeImageProvider(
                        npc.avatarUrl,
                        cacheWidth: heroCacheWidth,
                        cacheHeight: heroCacheHeight,
                      ),
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) =>
                          Container(color: zoneColor),
                    )
                  else
                    Container(
                      color: zoneColor,
                      child: Center(
                        child: Icon(Icons.person, size: 56, color: zoneOnColor),
                      ),
                    ),
                  DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.black.withValues(alpha: 0.0),
                          Colors.black.withValues(alpha: 0.65),
                        ],
                        stops: const [0.4, 1.0],
                      ),
                    ),
                  ),
                  Align(
                    alignment: Alignment.topCenter,
                    child: Container(
                      margin: const EdgeInsets.only(top: 12),
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.7),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  Positioned(
                    left: 20,
                    right: 20,
                    bottom: 16,
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Expanded(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                npc.name,
                                style: GoogleFonts.plusJakartaSans(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                npc.role,
                                style: GoogleFonts.plusJakartaSans(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                  color: Colors.white.withValues(alpha: 0.85),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        StoryChip(zoneType: npc.zoneType),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Scrollable Story Content
            Flexible(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(
                  horizontal: 24.0,
                  vertical: 20.0,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Story Title
                    Text(
                      story.title,
                      style: GoogleFonts.ebGaramond(
                        fontSize: 32,
                        fontWeight: FontWeight.w600,
                        height: 1.15,
                        color: colorScheme.onSurface,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Main Story Content
                    Text(
                      story.content,
                      style: GoogleFonts.ebGaramond(
                        fontSize: 19,
                        fontWeight: FontWeight.w400,
                        height: 1.5,
                        color: colorScheme.onSurface,
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Hidden Threads Section
                    if (story.hiddenThreads.isNotEmpty) ...[
                      Row(
                        children: [
                          Icon(
                            Icons.psychology,
                            size: 20,
                            color: colorScheme.primary,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'HIDDEN THREADS',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 1.2,
                              color: colorScheme.primary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),

                      // List of Hidden Threads
                      ...story.hiddenThreads.map((thread) {
                        final isUnlocked =
                            _unlockedThreadIds.contains(thread.id) ||
                            thread.isUnlocked;

                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          decoration: BoxDecoration(
                            color: isUnlocked
                                ? colorScheme.surface
                                : colorScheme.surfaceContainerHighest
                                      .withValues(alpha: 0.5),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isUnlocked
                                  ? colorScheme.primary.withValues(alpha: 0.2)
                                  : colorScheme.outlineVariant,
                              width: 1,
                            ),
                          ),
                          child: Material(
                            type: MaterialType.transparency,
                            child: Theme(
                              data: Theme.of(
                                context,
                              ).copyWith(dividerColor: Colors.transparent),
                              child: ExpansionTile(
                                key: PageStorageKey<String>(thread.id),
                                enabled: isUnlocked,
                                leading: Icon(
                                  isUnlocked
                                      ? Icons.bookmark
                                      : Icons.lock_outline,
                                  color: isUnlocked
                                      ? colorScheme.primary
                                      : colorScheme.outline,
                                ),
                                title: Text(
                                  thread.title,
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: isUnlocked
                                        ? colorScheme.onSurface
                                        : colorScheme.outline,
                                  ),
                                ),
                                subtitle: !isUnlocked
                                    ? Text(
                                        'Chạm vào nút Mở khóa để khám phá...',
                                        style: GoogleFonts.plusJakartaSans(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w400,
                                          color: colorScheme.outline,
                                        ),
                                      )
                                    : null,
                                trailing: isUnlocked
                                    ? Icon(
                                        Icons.keyboard_arrow_down,
                                        color: colorScheme.primary,
                                      )
                                    : TextButton(
                                        onPressed: () => _unlockThread(thread),
                                        style: TextButton.styleFrom(
                                          backgroundColor: colorScheme.primary,
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 12,
                                            vertical: 6,
                                          ),
                                          minimumSize: Size.zero,
                                          tapTargetSize:
                                              MaterialTapTargetSize.shrinkWrap,
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(
                                              16,
                                            ),
                                          ),
                                        ),
                                        child: Text(
                                          'Mở khóa',
                                          style: GoogleFonts.plusJakartaSans(
                                            color: Colors.white,
                                            fontSize: 11,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                children: [
                                  Padding(
                                    padding: const EdgeInsets.only(
                                      left: 16.0,
                                      right: 16.0,
                                      bottom: 16.0,
                                      top: 4.0,
                                    ),
                                    child: Text(
                                      thread.content,
                                      style: GoogleFonts.ebGaramond(
                                        fontSize: 17,
                                        fontWeight: FontWeight.w400,
                                        height: 1.4,
                                        color: colorScheme.onSurfaceVariant,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      }),
                    ],
                  ],
                ),
              ),
            ),

            // Close Button
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: ElevatedButton(
                onPressed: widget.onClose,
                style: ElevatedButton.styleFrom(
                  backgroundColor: colorScheme.primary,
                  foregroundColor: Colors.white,
                  minimumSize: const Size.fromHeight(48),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(9999), // Pill-shaped
                  ),
                  elevation: 2,
                  shadowColor: kUserLocationColor.withAlpha(0x33),
                ),
                child: Text(
                  'Đóng câu chuyện',
                  style: GoogleFonts.plusJakartaSans(
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
