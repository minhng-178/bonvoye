import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/npc.dart';
import '../utils/haversine.dart';
import '../utils/constants.dart';
import '../utils/image_utils.dart';
import 'story_chip.dart';

/// Shown when the user is simultaneously within range of 2+ NPCs, so they
/// can pick who they mean instead of the app silently choosing the nearest.
///
/// When every candidate shares essentially the same coordinate (e.g. NPCs
/// stacked across floors of the same building, where GPS can't tell them
/// apart), the sheet switches to "floor mode" and shows each NPC's [NPC.floor]
/// label instead of a meaningless ~0m distance.
class NpcChooserSheet extends StatelessWidget {
  final List<MapEntry<NPC, double>> candidates;
  final ValueChanged<NPC> onSelect;

  const NpcChooserSheet({
    super.key,
    required this.candidates,
    required this.onSelect,
  });

  bool get _isSameBuilding {
    for (var i = 0; i < candidates.length; i++) {
      for (var j = i + 1; j < candidates.length; j++) {
        final a = candidates[i].key;
        final b = candidates[j].key;
        final spread = Haversine.distance(
          a.latitude,
          a.longitude,
          b.latitude,
          b.longitude,
        );
        if (spread > kSameLocationEpsilonMeters) return false;
      }
    }
    return true;
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final sameBuilding = _isSameBuilding;
    final avatarCachePx = (48 * MediaQuery.devicePixelRatioOf(context)).round();

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
              child: Row(
                children: [
                  Icon(
                    sameBuilding ? Icons.apartment : Icons.groups,
                    color: colorScheme.primary,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          sameBuilding
                              ? 'Chọn tầng để khám phá'
                              : 'Chọn người kể chuyện',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: colorScheme.onSurface,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          sameBuilding
                              ? 'Bạn đang ở cùng một tọa độ với ${candidates.length} người kể chuyện — chọn tầng để khám phá.'
                              : 'Có ${candidates.length} người đang ở gần bạn — chọn người bạn muốn gặp.',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            Flexible(
              child: ListView.separated(
                shrinkWrap: true,
                padding: const EdgeInsets.symmetric(vertical: 8),
                itemCount: candidates.length,
                separatorBuilder: (context, index) => Divider(
                  height: 1,
                  indent: 76,
                  color: colorScheme.outlineVariant,
                ),
                itemBuilder: (context, index) {
                  final entry = candidates[index];
                  final npc = entry.key;
                  final distance = entry.value;

                  return InkWell(
                    onTap: () => onSelect(npc),
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
                              image: npc.avatarUrl != null
                                  ? DecorationImage(
                                      image: getSafeImageProvider(
                                        npc.avatarUrl,
                                        cacheWidth: avatarCachePx,
                                        cacheHeight: avatarCachePx,
                                      ),
                                      fit: BoxFit.cover,
                                    )
                                  : null,
                            ),
                            child: npc.avatarUrl == null
                                ? Icon(
                                    Icons.person,
                                    color: colorScheme.secondary,
                                  )
                                : null,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  npc.name,
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
                                  npc.role,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w500,
                                    color: colorScheme.onSurfaceVariant,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Row(
                                  children: [
                                    StoryChip(zoneType: npc.zoneType),
                                    if (sameBuilding) ...[
                                      const SizedBox(width: 6),
                                      Flexible(
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 8,
                                            vertical: 3,
                                          ),
                                          decoration: BoxDecoration(
                                            color: colorScheme.primary
                                                .withValues(alpha: 0.1),
                                            borderRadius: BorderRadius.circular(
                                              9999,
                                            ),
                                          ),
                                          child: Text(
                                            npc.floor ?? '—',
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                            style: GoogleFonts.plusJakartaSans(
                                              fontSize: 10,
                                              fontWeight: FontWeight.w700,
                                              color: colorScheme.primary,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.chevron_right,
                                color: colorScheme.outline,
                                size: 18,
                              ),
                              if (!sameBuilding) ...[
                                const SizedBox(height: 4),
                                Text(
                                  '${distance.toStringAsFixed(0)} m',
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                    color: colorScheme.primary,
                                  ),
                                ),
                              ],
                            ],
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
