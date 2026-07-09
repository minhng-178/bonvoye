import 'package:flutter/material.dart';
import '../models/npc.dart';

/// Single source of truth for the color pairing used to represent each
/// [ZoneType] across markers, chips, and cards. Access via
/// `Theme.of(context).extension<ZoneColors>()!`.
@immutable
class ZoneColors extends ThemeExtension<ZoneColors> {
  final Color legendsBase;
  final Color legendsOn;
  final Color historyBase;
  final Color historyOn;
  final Color localLifeBase;
  final Color localLifeOn;
  final Color scenicSpotBase;
  final Color scenicSpotOn;
  final Color trueCrimeBase;
  final Color trueCrimeOn;

  const ZoneColors({
    required this.legendsBase,
    required this.legendsOn,
    required this.historyBase,
    required this.historyOn,
    required this.localLifeBase,
    required this.localLifeOn,
    required this.scenicSpotBase,
    required this.scenicSpotOn,
    required this.trueCrimeBase,
    required this.trueCrimeOn,
  });

  /// The zone's signature fill/accent color.
  Color baseFor(ZoneType zoneType) {
    switch (zoneType) {
      case ZoneType.legends:
        return legendsBase;
      case ZoneType.history:
        return historyBase;
      case ZoneType.localLife:
        return localLifeBase;
      case ZoneType.scenicSpot:
        return scenicSpotBase;
      case ZoneType.trueCrime:
        return trueCrimeBase;
    }
  }

  /// The readable-on-[baseFor] color for text/icons over that zone's fill.
  Color onFor(ZoneType zoneType) {
    switch (zoneType) {
      case ZoneType.legends:
        return legendsOn;
      case ZoneType.history:
        return historyOn;
      case ZoneType.localLife:
        return localLifeOn;
      case ZoneType.scenicSpot:
        return scenicSpotOn;
      case ZoneType.trueCrime:
        return trueCrimeOn;
    }
  }

  @override
  ZoneColors copyWith({
    Color? legendsBase,
    Color? legendsOn,
    Color? historyBase,
    Color? historyOn,
    Color? localLifeBase,
    Color? localLifeOn,
    Color? scenicSpotBase,
    Color? scenicSpotOn,
    Color? trueCrimeBase,
    Color? trueCrimeOn,
  }) {
    return ZoneColors(
      legendsBase: legendsBase ?? this.legendsBase,
      legendsOn: legendsOn ?? this.legendsOn,
      historyBase: historyBase ?? this.historyBase,
      historyOn: historyOn ?? this.historyOn,
      localLifeBase: localLifeBase ?? this.localLifeBase,
      localLifeOn: localLifeOn ?? this.localLifeOn,
      scenicSpotBase: scenicSpotBase ?? this.scenicSpotBase,
      scenicSpotOn: scenicSpotOn ?? this.scenicSpotOn,
      trueCrimeBase: trueCrimeBase ?? this.trueCrimeBase,
      trueCrimeOn: trueCrimeOn ?? this.trueCrimeOn,
    );
  }

  @override
  ZoneColors lerp(ThemeExtension<ZoneColors>? other, double t) {
    if (other is! ZoneColors) return this;
    return ZoneColors(
      legendsBase: Color.lerp(legendsBase, other.legendsBase, t)!,
      legendsOn: Color.lerp(legendsOn, other.legendsOn, t)!,
      historyBase: Color.lerp(historyBase, other.historyBase, t)!,
      historyOn: Color.lerp(historyOn, other.historyOn, t)!,
      localLifeBase: Color.lerp(localLifeBase, other.localLifeBase, t)!,
      localLifeOn: Color.lerp(localLifeOn, other.localLifeOn, t)!,
      scenicSpotBase: Color.lerp(scenicSpotBase, other.scenicSpotBase, t)!,
      scenicSpotOn: Color.lerp(scenicSpotOn, other.scenicSpotOn, t)!,
      trueCrimeBase: Color.lerp(trueCrimeBase, other.trueCrimeBase, t)!,
      trueCrimeOn: Color.lerp(trueCrimeOn, other.trueCrimeOn, t)!,
    );
  }

  static const ZoneColors bonvoye = ZoneColors(
    legendsBase: Color(0xFFFF8B8B),
    legendsOn: Color(0xFF973B3D),
    historyBase: Color(0xFFF5F1E0),
    historyOn: Color(0xFF605F52),
    localLifeBase: Color(0xFFB794F4),
    localLifeOn: Color(0xFF4849DA),
    scenicSpotBase: Color(0xFF8ED1B0),
    scenicSpotOn: Color(0xFF1F6D45),
    trueCrimeBase: Color(0xFFB9C2D0),
    trueCrimeOn: Color(0xFF2E3A4A),
  );
}
