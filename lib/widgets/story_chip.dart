import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/npc.dart';
import '../utils/zone_colors.dart';

class StoryChip extends StatelessWidget {
  final ZoneType zoneType;

  const StoryChip({super.key, required this.zoneType});

  static const _labels = {
    ZoneType.legends: 'LEGENDS',
    ZoneType.history: 'HISTORY',
    ZoneType.localLife: 'LOCAL LIFE',
    ZoneType.scenicSpot: 'SCENIC SPOT',
    ZoneType.trueCrime: 'TRUE CRIME',
  };

  @override
  Widget build(BuildContext context) {
    final zoneColors = Theme.of(context).extension<ZoneColors>()!;
    final baseColor = zoneColors.baseFor(zoneType);
    final textColor = zoneColors.onFor(zoneType);
    final isHistory = zoneType == ZoneType.history;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: baseColor.withValues(alpha: isHistory ? 0.8 : 0.15),
        borderRadius: BorderRadius.circular(9999), // Pill-shaped
        border: isHistory
            ? Border.all(color: const Color(0xFFE6E3D2), width: 1)
            : null,
      ),
      child: Text(
        _labels[zoneType]!,
        style: GoogleFonts.plusJakartaSans(
          fontSize: 10,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.8,
          color: textColor,
        ),
      ),
    );
  }
}
