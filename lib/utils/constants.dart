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

// --- Fake GPS (docs/app-core-text-diagram.md PHẦN 4-5) ---
// Numbers as agreed in the 2026-07-27 discussion (PHẦN 11). Currently only
// consumed by the UX mockup in `fake_gps_drag_demo.dart` - not yet wired into
// the real [LocationProvider] state machine.

/// Max distance (in meters) a dragged "fake GPS" pin may move away from the
/// last real GPS fix, measured from that fixed anchor (not cumulatively).
const double kFakeGpsMaxDragMeters = 300.0;

/// Distance (in meters) within which the user is considered to have "arrived"
/// at a dragged fake-GPS point, auto-resetting back to the real GPS fix.
/// Distinct from [kProximityRadiusMeters] (NPC trigger radius) - same-looking
/// number range, different purpose, don't conflate the two.
const double kFakeGpsArrivedRadiusMeters = 50.0;

/// How long a fake-GPS position is held before auto-resetting to the real GPS
/// fix, in case the user forgot it was active.
const Duration kFakeGpsAutoResetTimeout = Duration(minutes: 15);

/// How long the real GPS signal must stay "good" before the app trusts it
/// enough to reset off a fake-GPS position - avoids flip-flopping back and
/// forth on a momentary GPS blip.
const Duration kFakeGpsGpsStableBuffer = Duration(seconds: 60);
