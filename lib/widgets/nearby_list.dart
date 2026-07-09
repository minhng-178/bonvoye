import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../data/mock_data.dart';
import '../providers/location_provider.dart';
import '../models/npc.dart';
import '../models/topic.dart';
import '../utils/image_utils.dart';
import '../utils/constants.dart';
import '../utils/zone_colors.dart';
import 'story_chip.dart';
import 'topic_picker_sheet.dart';

/// Persistent, draggable bottom panel (Google-Maps-style) listing nearby
/// NPCs. Lives directly in [MainNarrativeScreen]'s [Stack] - not a modal
/// bottom sheet - so it coexists with the map underneath and can be dragged
/// between a peek, mid, and near-fullscreen size.
class NearbyList extends StatelessWidget {
  final DraggableScrollableController? sheetController;

  const NearbyList({super.key, this.sheetController});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return DraggableScrollableSheet(
      controller: sheetController,
      initialChildSize: 0.30,
      minChildSize: 0.14,
      maxChildSize: 0.85,
      snap: true,
      snapSizes: const [0.14, 0.30, 0.85],
      builder: (context, scrollController) {
        return Container(
          decoration: BoxDecoration(
            color: colorScheme.surface,
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(20),
              topRight: Radius.circular(20),
            ),
            boxShadow: const [
              BoxShadow(
                color: Color(0x0F000000),
                blurRadius: 10,
                offset: Offset(0, -3),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Sliding indicator handlebar
              Center(
                child: Container(
                  margin: const EdgeInsets.only(top: 10, bottom: 6),
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: colorScheme.surfaceDim,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              // Header
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 20.0,
                  vertical: 8.0,
                ),
                child:
                    Selector<
                      LocationProvider,
                      ({int visibleCount, Topic selectedTopic})
                    >(
                      selector: (context, provider) => (
                        visibleCount:
                            provider.visibleNpcsSortedByDistance.length,
                        selectedTopic: provider.selectedTopic,
                      ),
                      builder: (context, data, child) {
                        final visibleCount = data.visibleCount;
                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            GestureDetector(
                              onTap: () {
                                final provider = context
                                    .read<LocationProvider>();
                                showModalBottomSheet(
                                  context: context,
                                  isScrollControlled: true,
                                  backgroundColor: Colors.transparent,
                                  barrierColor: Colors.black.withValues(
                                    alpha: 0.2,
                                  ),
                                  builder: (context) => TopicPickerSheet(
                                    topics: mockTopics,
                                    selectedTopicId: provider.selectedTopic.id,
                                    onSelect: (topic) {
                                      Navigator.pop(context);
                                      provider.setTopic(topic);
                                    },
                                  ),
                                );
                              },
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    data.selectedTopic.title,
                                    style: GoogleFonts.plusJakartaSans(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w700,
                                      letterSpacing: 0.4,
                                      color: colorScheme.primary,
                                    ),
                                  ),
                                  const SizedBox(width: 2),
                                  Icon(
                                    Icons.expand_more,
                                    size: 14,
                                    color: colorScheme.primary,
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 2),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Người Kể Chuyện Gần Bạn',
                                  style: GoogleFonts.ebGaramond(
                                    fontSize: 19,
                                    fontWeight: FontWeight.w600,
                                    color: colorScheme.onSurface,
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 2,
                                  ),
                                  decoration: BoxDecoration(
                                    color: const Color(
                                      0xFFE1E0FF,
                                    ), // primary-fixed
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    '$visibleCount NPCs',
                                    style: GoogleFonts.plusJakartaSans(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w700,
                                      color: const Color.fromARGB(255, 0, 0, 0),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        );
                      },
                    ),
              ),

              Divider(color: colorScheme.outlineVariant, height: 1),

              // Vertical, draggable list of nearby NPCs
              Expanded(
                child: Selector<LocationProvider, List<MapEntry<NPC, double>>>(
                  selector: (context, provider) =>
                      provider.visibleNpcsSortedByDistance,
                  builder: (context, visibleNpcs, child) {
                    if (visibleNpcs.isEmpty) {
                      return Center(
                        child: Text(
                          'Không tìm thấy NPC nào phù hợp.',
                          style: GoogleFonts.plusJakartaSans(
                            color: colorScheme.outline,
                          ),
                        ),
                      );
                    }

                    return ListView.separated(
                      controller: scrollController,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                      itemCount: visibleNpcs.length,
                      separatorBuilder: (context, index) =>
                          const SizedBox(height: 10),
                      itemBuilder: (context, index) {
                        final entry = visibleNpcs[index];
                        return _NpcListTile(
                          npc: entry.key,
                          distance: entry.value,
                          onTap: () => context
                              .read<LocationProvider>()
                              .selectNPC(entry.key),
                        );
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

/// A single Google-Maps-style horizontal list row: thumbnail on the left,
/// name/role/story/distance on the right.
class _NpcListTile extends StatelessWidget {
  final NPC npc;
  final double distance;
  final VoidCallback onTap;

  const _NpcListTile({
    required this.npc,
    required this.distance,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final zoneColors = Theme.of(context).extension<ZoneColors>()!;
    final isWithinRange = distance <= kProximityRadiusMeters;
    final zoneColor = zoneColors.baseFor(npc.zoneType);
    final zoneOnColor = zoneColors.onFor(npc.zoneType);
    final thumbnailCachePx = (64 * MediaQuery.devicePixelRatioOf(context))
        .round();

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: colorScheme.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isWithinRange
                ? colorScheme.primary
                : colorScheme.outlineVariant,
            width: isWithinRange ? 1.5 : 1.0,
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Thumbnail
            Stack(
              clipBehavior: Clip.none,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: SizedBox(
                    width: 64,
                    height: 64,
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        Container(color: zoneColor),
                        if (npc.avatarUrl != null)
                          Image(
                            image: getSafeImageProvider(
                              npc.avatarUrl,
                              cacheWidth: thumbnailCachePx,
                              cacheHeight: thumbnailCachePx,
                            ),
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) =>
                                const SizedBox.shrink(),
                          )
                        else
                          Center(
                            child: Icon(
                              Icons.person,
                              size: 28,
                              color: zoneOnColor,
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
                if (isWithinRange)
                  Positioned(
                    top: -4,
                    right: -4,
                    child: Container(
                      padding: const EdgeInsets.all(3),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: colorScheme.primary,
                        border: Border.all(color: Colors.white, width: 1.5),
                      ),
                      child: const Icon(
                        Icons.gps_fixed,
                        size: 10,
                        color: Colors.white,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(width: 12),

            // Text content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          npc.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: colorScheme.onSurface,
                          ),
                        ),
                      ),
                      const SizedBox(width: 6),
                      StoryChip(zoneType: npc.zoneType),
                    ],
                  ),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          npc.role,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                            color: colorScheme.outline,
                          ),
                        ),
                      ),
                      if (npc.floor != null) ...[
                        const SizedBox(width: 6),
                        Flexible(
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: colorScheme.primary.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(9999),
                            ),
                            child: Text(
                              npc.floor!,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 9,
                                fontWeight: FontWeight.w700,
                                color: colorScheme.primary,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    npc.story.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.ebGaramond(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: colorScheme.onSurface,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(
                        isWithinRange ? Icons.gps_fixed : Icons.gps_not_fixed,
                        size: 12,
                        color: isWithinRange
                            ? colorScheme.primary
                            : colorScheme.outline,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${distance.toStringAsFixed(0)} m',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 11,
                          fontWeight: isWithinRange
                              ? FontWeight.w700
                              : FontWeight.w500,
                          color: isWithinRange
                              ? colorScheme.primary
                              : colorScheme.outline,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
