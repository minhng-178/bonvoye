import 'package:flutter/material.dart';

/// Radius (in meters) within which a user is considered "in range" of an NPC.
const double kProximityRadiusMeters = 20.0;

/// Fixed color for the user's own location marker on the map (the pulsing
/// halo + dot) - intentionally independent of `colorScheme.primary` so it
/// stays constant across theme changes.
const Color kUserLocationColor = Color(0xFF5D5FEF);

/// Shared drop-shadow color for floating cards/panels/buttons over the map.
const Color kCardShadowColor = Color(0x1A000000);

/// Muted color for secondary/inactive text and disabled controls.
const Color kMutedColor = Color(0xFF767586);

/// Default simulated user starting position: Quảng trường Bưu điện Hà Nội,
/// the plaza at the north end of Hồ Hoàn Kiếm — a real, on-land location.
const double kDefaultUserLatitude = 21.0325;
const double kDefaultUserLongitude = 105.8524;

/// Below this spread (in meters), a set of NPC coordinates is treated as
/// "the same building" (e.g. different floors) rather than distinct nearby NPCs.
const double kSameLocationEpsilonMeters = 5.0;
