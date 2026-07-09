import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../models/npc.dart';
import '../providers/location_provider.dart';
import '../utils/constants.dart';
import '../utils/zone_colors.dart';
import '../screens/search_screen.dart';

/// Floating Google-Maps-style search bar + horizontal location-type filter
/// chips, anchored to the top of [MainNarrativeScreen]'s [Stack].
class MapTopBar extends StatelessWidget {
  const MapTopBar({super.key});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Selector<LocationProvider, String>(
                selector: (context, provider) => provider.searchQuery,
                builder: (context, query, child) {
                  return GestureDetector(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const SearchScreen()),
                      );
                    },
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
                            child: Text(
                              query.isEmpty
                                  ? 'Tìm kiếm địa điểm, NPC...'
                                  : query,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 14,
                                color: query.isEmpty
                                    ? colorScheme.outline
                                    : colorScheme.onSurface,
                              ),
                            ),
                          ),
                          if (query.isNotEmpty)
                            GestureDetector(
                              onTap: () => context
                                  .read<LocationProvider>()
                                  .setSearchQuery(''),
                              child: Icon(
                                Icons.close,
                                size: 18,
                                color: colorScheme.onSurfaceVariant,
                              ),
                            ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(width: 10),
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: colorScheme.surface.withValues(alpha: 0.96),
                shape: BoxShape.circle,
                border: Border.all(
                  color: colorScheme.secondaryContainer,
                  width: 1,
                ),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x1A000000),
                    blurRadius: 8,
                    offset: Offset(0, 2),
                  ),
                ],
              ),
              child: Icon(Icons.person, color: colorScheme.onSurfaceVariant),
            ),
          ],
        ),
        const SizedBox(height: 10),
        SizedBox(
          height: 34,
          child: Selector<LocationProvider, ZoneType?>(
            selector: (context, provider) => provider.selectedZoneType,
            builder: (context, selectedZoneType, child) {
              return ListView.separated(
                scrollDirection: Axis.horizontal,
                clipBehavior: Clip.none,
                itemCount: _filters.length,
                separatorBuilder: (context, index) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  final filter = _filters[index];
                  final isSelected = selectedZoneType == filter.zoneType;
                  return _FilterChip(
                    filter: filter,
                    isSelected: isSelected,
                    onTap: () => context
                        .read<LocationProvider>()
                        .setZoneTypeFilter(filter.zoneType),
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }
}

class _LocationFilter {
  final ZoneType? zoneType;
  final String label;
  final IconData icon;

  const _LocationFilter(this.zoneType, this.label, this.icon);
}

const List<_LocationFilter> _filters = [
  _LocationFilter(null, 'Tất cả', Icons.explore),
  _LocationFilter(ZoneType.legends, 'Truyền thuyết', Icons.auto_stories),
  _LocationFilter(ZoneType.history, 'Lịch sử', Icons.account_balance),
  _LocationFilter(ZoneType.localLife, 'Văn hóa & đời sống', Icons.groups),
  _LocationFilter(ZoneType.scenicSpot, 'Cảnh điểm', Icons.landscape),
  _LocationFilter(ZoneType.trueCrime, 'Vụ án có thật', Icons.local_police),
];

class _FilterChip extends StatelessWidget {
  final _LocationFilter filter;
  final bool isSelected;
  final VoidCallback onTap;

  const _FilterChip({
    required this.filter,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final zoneColors = Theme.of(context).extension<ZoneColors>()!;

    final Color background;
    final Color foreground;
    if (isSelected) {
      if (filter.zoneType == null) {
        background = colorScheme.primary;
        foreground = colorScheme.onPrimary;
      } else {
        background = zoneColors.baseFor(filter.zoneType!);
        foreground = zoneColors.onFor(filter.zoneType!);
      }
    } else {
      background = colorScheme.surface.withValues(alpha: 0.92);
      foreground = colorScheme.onSurfaceVariant;
    }

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12),
        decoration: BoxDecoration(
          color: background,
          borderRadius: BorderRadius.circular(9999),
          border: isSelected
              ? null
              : Border.all(color: colorScheme.outlineVariant, width: 1),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(filter.icon, size: 15, color: foreground),
            const SizedBox(width: 6),
            Text(
              filter.label,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: foreground,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
