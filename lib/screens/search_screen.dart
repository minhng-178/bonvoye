import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../models/npc.dart';
import '../providers/location_provider.dart';
import '../utils/constants.dart';
import '../utils/image_utils.dart';
import '../utils/zone_colors.dart';
import '../widgets/story_chip.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  late final TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(
      text: context.read<LocationProvider>().searchQuery,
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _selectNpc(NPC npc) {
    context.read<LocationProvider>().selectNPC(npc);
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      backgroundColor: colorScheme.surface,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 12, 20, 12),
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: Icon(Icons.arrow_back, color: colorScheme.onSurface),
                  ),
                  Expanded(
                    child: Container(
                      height: 48,
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                      decoration: BoxDecoration(
                        color: colorScheme.surface.withValues(alpha: 0.96),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(
                          color: colorScheme.secondaryContainer,
                          width: 1,
                        ),
                        boxShadow: const [
                          BoxShadow(
                            color: kCardShadowColor,
                            blurRadius: 8,
                            offset: Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.search,
                            size: 20,
                            color: colorScheme.onSurfaceVariant,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: TextField(
                              controller: _controller,
                              autofocus: true,
                              onChanged: (value) => context
                                  .read<LocationProvider>()
                                  .setSearchQuery(value),
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 14,
                                color: colorScheme.onSurface,
                              ),
                              decoration: InputDecoration(
                                isDense: true,
                                border: InputBorder.none,
                                hintText: 'Tìm kiếm địa điểm, NPC...',
                                hintStyle: GoogleFonts.plusJakartaSans(
                                  fontSize: 14,
                                  color: colorScheme.outline,
                                ),
                              ),
                            ),
                          ),

                          ValueListenableBuilder<TextEditingValue>(
                            valueListenable: _controller,
                            builder: (context, value, child) {
                              if (value.text.isEmpty) {
                                return const SizedBox.shrink();
                              }
                              return child!;
                            },
                            child: GestureDetector(
                              onTap: () {
                                _controller.clear();
                                context.read<LocationProvider>().setSearchQuery(
                                  '',
                                );
                              },
                              child: Icon(
                                Icons.close,
                                size: 18,
                                color: colorScheme.onSurfaceVariant,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Divider(color: colorScheme.outlineVariant, height: 1),
            Expanded(
              child: Selector<LocationProvider, List<MapEntry<NPC, double>>>(
                selector: (context, provider) =>
                    provider.visibleNpcsSortedByDistance,
                builder: (context, results, child) {
                  if (results.isEmpty) {
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
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    itemCount: results.length,
                    separatorBuilder: (context, index) => Divider(
                      color: colorScheme.outlineVariant,
                      height: 1,
                      indent: 76,
                    ),
                    itemBuilder: (context, index) {
                      final entry = results[index];
                      return _SearchResultTile(
                        npc: entry.key,
                        distance: entry.value,
                        onTap: () => _selectNpc(entry.key),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// A single search-result row: circular avatar, name/role/story title, and a
/// distance readout - a lighter-weight sibling of `NearbyList`'s card tile.
class _SearchResultTile extends StatelessWidget {
  final NPC npc;
  final double distance;
  final VoidCallback onTap;

  const _SearchResultTile({
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
    final thumbnailCachePx = (48 * MediaQuery.devicePixelRatioOf(context))
        .round();

    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: SizedBox(
                width: 48,
                height: 48,
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
                        child: Icon(Icons.person, size: 22, color: zoneOnColor),
                      ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 12),
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
                ],
              ),
            ),
            const SizedBox(width: 8),
            Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Icon(
                  isWithinRange ? Icons.gps_fixed : Icons.gps_not_fixed,
                  size: 14,
                  color: isWithinRange
                      ? colorScheme.primary
                      : colorScheme.outline,
                ),
                const SizedBox(height: 2),
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
    );
  }
}
