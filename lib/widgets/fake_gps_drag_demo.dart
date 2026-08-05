import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:latlong2/latlong.dart' hide Haversine;
import 'package:provider/provider.dart';

import '../providers/location_provider.dart';
import '../utils/constants.dart';
import '../utils/haversine.dart';

/// The 4 auto-reset conditions from `docs/app-core-text-diagram.md` PHẦN 5.
enum _ResetReason { timeout, arrived, exitedScreen, gpsStable }

extension on _ResetReason {
  String get label => switch (this) {
    _ResetReason.timeout => 'Hết thời gian (15 phút)',
    _ResetReason.arrived => 'Bạn đã đi đến nơi',
    _ResetReason.exitedScreen => 'Đã thoát màn hình POI',
    _ResetReason.gpsStable => 'Tín hiệu GPS tốt trở lại',
  };

  String get detail => switch (this) {
    _ResetReason.timeout =>
      'Tự động sau ${kFakeGpsAutoResetTimeout.inMinutes} phút, phòng hờ quên tắt',
    _ResetReason.arrived =>
      'Vào bán kính ${kFakeGpsArrivedRadiusMeters.toInt()}m quanh điểm đã kéo',
    _ResetReason.exitedScreen => 'Rời khỏi màn hình POI đang xem',
    _ResetReason.gpsStable =>
      'GPS thật ổn định liên tục ${kFakeGpsGpsStableBuffer.inSeconds}s',
  };

  IconData get icon => switch (this) {
    _ResetReason.timeout => Icons.timer_outlined,
    _ResetReason.arrived => Icons.flag_outlined,
    _ResetReason.exitedScreen => Icons.logout,
    _ResetReason.gpsStable => Icons.gps_fixed,
  };
}

/// UX mockup of the "Fake GPS" drag + auto-reset flow from
/// `docs/app-core-text-diagram.md` PHẦN 4-5 - the doc's own "hardest cluster"
/// (drag a fake position with a 300m limit from the last real GPS fix, then
/// auto-reset on any of 4 independent conditions, unless a story's audio is
/// playing). This is a **mockup for review**, not the production feature:
/// it owns an isolated map/state and never touches [LocationProvider] - real
/// timers/GPS-noise can't be produced live here, so the dev panel below
/// exposes a manual "Giả lập" (simulate) trigger per condition instead.
class FakeGpsDragDemo extends StatefulWidget {
  final VoidCallback onClose;

  const FakeGpsDragDemo({super.key, required this.onClose});

  @override
  State<FakeGpsDragDemo> createState() => _FakeGpsDragDemoState();
}

class _FakeGpsDragDemoState extends State<FakeGpsDragDemo> {
  final MapController _mapController = MapController();

  late LatLng _realGps;
  late LatLng _fakePosition;
  bool _isBlocked = false;
  bool _audioPlayingMock = false;
  _ResetReason? _pendingReason;

  Timer? _countdownTimer;
  Duration _timeLeft = kFakeGpsAutoResetTimeout;

  String? _bannerText;
  Timer? _bannerTimer;

  bool get _isFakeActive => _dragDistance > 1.0; // ignore sub-meter jitter

  double get _dragDistance => Haversine.distance(
    _fakePosition.latitude,
    _fakePosition.longitude,
    _realGps.latitude,
    _realGps.longitude,
  );

  @override
  void initState() {
    super.initState();
    final provider = context.read<LocationProvider>();
    _realGps = LatLng(provider.userLatitude, provider.userLongitude);
    _fakePosition = _realGps;
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    _bannerTimer?.cancel();
    super.dispose();
  }

  void _onPinPanUpdate(DragUpdateDetails details) {
    final camera = _mapController.camera;
    final currentScreen = camera.latLngToScreenOffset(_fakePosition);
    final candidate = camera.screenOffsetToLatLng(
      currentScreen + details.delta,
    );

    final distance = Haversine.distance(
      candidate.latitude,
      candidate.longitude,
      _realGps.latitude,
      _realGps.longitude,
    );

    setState(() {
      if (distance > kFakeGpsMaxDragMeters) {
        // Clamp to the boundary along the same bearing rather than simply
        // rejecting the move - linear scaling in degree-space is an
        // acceptable approximation at this scale (a few hundred meters).
        _isBlocked = true;
        final scale = kFakeGpsMaxDragMeters / distance;
        _fakePosition = LatLng(
          _realGps.latitude + (candidate.latitude - _realGps.latitude) * scale,
          _realGps.longitude +
              (candidate.longitude - _realGps.longitude) * scale,
        );
      } else {
        _isBlocked = false;
        _fakePosition = candidate;
      }
    });

    _syncCountdown();
  }

  void _onPinPanEnd(DragEndDetails details) {
    setState(() => _isBlocked = false);
  }

  /// Condition 1 (hết thời gian) is the one condition that runs on its own
  /// clock rather than needing a manual "Giả lập" tap - starts counting down
  /// the moment the pin leaves the real-GPS anchor, resets whenever it
  /// returns.
  void _syncCountdown() {
    if (_isFakeActive && _countdownTimer == null) {
      _timeLeft = kFakeGpsAutoResetTimeout;
      _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
        setState(() => _timeLeft -= const Duration(seconds: 1));
        if (_timeLeft <= Duration.zero) {
          timer.cancel();
          _countdownTimer = null;
          _triggerReset(_ResetReason.timeout);
        }
      });
    } else if (!_isFakeActive) {
      _countdownTimer?.cancel();
      _countdownTimer = null;
    }
  }

  /// Entry point for both the automatic 15-minute timeout and the dev
  /// panel's manual "Giả lập" buttons. Mirrors PHẦN 5's NGOẠI LỆ: while
  /// audio is (mock) playing, resetting is deferred to the next interaction
  /// instead of cutting in immediately.
  void _triggerReset(_ResetReason reason) {
    if (!_isFakeActive) return;
    if (_audioPlayingMock) {
      setState(() => _pendingReason = reason);
      return;
    }
    _performReset(reason);
  }

  void _performReset(_ResetReason reason) {
    setState(() {
      _fakePosition = _realGps;
      _pendingReason = null;
      _isBlocked = false;
    });
    _countdownTimer?.cancel();
    _countdownTimer = null;
    _showBanner('Đã trả về vị trí thật — lý do: ${reason.label}');
  }

  void _showBanner(String text) {
    _bannerTimer?.cancel();
    setState(() => _bannerText = text);
    _bannerTimer = Timer(const Duration(seconds: 3), () {
      if (!mounted) return;
      setState(() => _bannerText = null);
    });
  }

  void _handleNextInteraction() {
    if (_pendingReason != null && !_audioPlayingMock) {
      _performReset(_pendingReason!);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final boundaryColor = _isBlocked ? Colors.red : colorScheme.primary;

    return Scaffold(
      backgroundColor: colorScheme.surface,
      body: Stack(
        children: [
          Positioned.fill(
            child: FlutterMap(
              mapController: _mapController,
              options: MapOptions(
                initialCenter: _realGps,
                initialZoom: 17,
                minZoom: 15,
                maxZoom: 19,
                // Map panning is off - the only drag gesture on screen is
                // the fake-GPS pin itself, so there's no ambiguity between
                // "move the map" and "move the pin".
                interactionOptions: const InteractionOptions(
                  flags:
                      InteractiveFlag.pinchZoom | InteractiveFlag.doubleTapZoom,
                ),
                onTap: (_, _) => _handleNextInteraction(),
              ),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.bonvoye.app',
                ),
                CircleLayer(
                  circles: [
                    CircleMarker(
                      point: _realGps,
                      useRadiusInMeter: true,
                      radius: kFakeGpsMaxDragMeters,
                      color: boundaryColor.withValues(alpha: 0.08),
                      borderStrokeWidth: 2,
                      borderColor: boundaryColor.withValues(alpha: 0.6),
                    ),
                  ],
                ),
                MarkerLayer(
                  markers: [
                    Marker(
                      point: _realGps,
                      width: 26,
                      height: 26,
                      child: const _RealGpsDot(),
                    ),
                    Marker(
                      point: _fakePosition,
                      width: 52,
                      height: 52,
                      alignment: Alignment.topCenter,
                      child: GestureDetector(
                        onPanUpdate: _onPinPanUpdate,
                        onPanEnd: _onPinPanEnd,
                        child: _FakeGpsPin(
                          isActive: _isFakeActive,
                          isBlocked: _isBlocked,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: Row(
                children: [
                  _RoundIconButton(icon: Icons.close, onTap: widget.onClose),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _DistanceBadge(
                      distance: _dragDistance,
                      isBlocked: _isBlocked,
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (_bannerText != null)
            Positioned(
              top: 64,
              left: 16,
              right: 16,
              child: SafeArea(child: _ResetBanner(text: _bannerText!)),
            ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: _DevPanel(
              isFakeActive: _isFakeActive,
              timeLeft: _timeLeft,
              audioPlayingMock: _audioPlayingMock,
              pendingReason: _pendingReason,
              onToggleAudio: (value) =>
                  setState(() => _audioPlayingMock = value),
              onSimulate: _triggerReset,
            ),
          ),
        ],
      ),
    );
  }
}

class _RealGpsDot extends StatelessWidget {
  const _RealGpsDot();

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: kUserLocationColor.withValues(alpha: 0.85),
        border: Border.all(color: Colors.white, width: 2),
        boxShadow: const [
          BoxShadow(color: Colors.black26, blurRadius: 4, offset: Offset(0, 2)),
        ],
      ),
    );
  }
}

class _FakeGpsPin extends StatelessWidget {
  final bool isActive;
  final bool isBlocked;

  const _FakeGpsPin({required this.isActive, required this.isBlocked});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final color = isBlocked
        ? Colors.red
        : isActive
        ? colorScheme.primary
        : kMutedColor;

    return SizedBox(
      width: 52,
      height: 52,
      child: Stack(
        alignment: Alignment.topCenter,
        clipBehavior: Clip.none,
        children: [
          Icon(
            Icons.location_on,
            size: 52,
            color: color,
            shadows: const [
              Shadow(
                color: Colors.black38,
                blurRadius: 4,
                offset: Offset(0, 2),
              ),
            ],
          ),
          Positioned(
            top: 8,
            child: Icon(Icons.drag_indicator, size: 20, color: Colors.white),
          ),
        ],
      ),
    );
  }
}

class _RoundIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;

  const _RoundIconButton({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: colorScheme.surface.withValues(alpha: 0.96),
          shape: BoxShape.circle,
          boxShadow: const [
            BoxShadow(
              color: kCardShadowColor,
              blurRadius: 8,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Icon(icon, color: colorScheme.onSurfaceVariant, size: 20),
      ),
    );
  }
}

class _DistanceBadge extends StatelessWidget {
  final double distance;
  final bool isBlocked;

  const _DistanceBadge({required this.distance, required this.isBlocked});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final color = isBlocked ? Colors.red : colorScheme.onSurface;

    return Container(
      height: 40,
      padding: const EdgeInsets.symmetric(horizontal: 14),
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: colorScheme.surface.withValues(alpha: 0.96),
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [
          BoxShadow(
            color: kCardShadowColor,
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Text(
        '${distance.round()}m / ${kFakeGpsMaxDragMeters.toInt()}m kéo tối đa',
        style: GoogleFonts.plusJakartaSans(
          fontSize: 13,
          fontWeight: FontWeight.w700,
          color: color,
        ),
      ),
    );
  }
}

class _ResetBanner extends StatelessWidget {
  final String text;

  const _ResetBanner({required this.text});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: colorScheme.inverseSurface.withValues(alpha: 0.94),
        borderRadius: BorderRadius.circular(14),
        boxShadow: const [
          BoxShadow(
            color: Colors.black38,
            blurRadius: 10,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Icon(Icons.gps_fixed, size: 18, color: colorScheme.onInverseSurface),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: colorScheme.onInverseSurface,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _DevPanel extends StatelessWidget {
  final bool isFakeActive;
  final Duration timeLeft;
  final bool audioPlayingMock;
  final _ResetReason? pendingReason;
  final ValueChanged<bool> onToggleAudio;
  final ValueChanged<_ResetReason> onSimulate;

  const _DevPanel({
    required this.isFakeActive,
    required this.timeLeft,
    required this.audioPlayingMock,
    required this.pendingReason,
    required this.onToggleAudio,
    required this.onSimulate,
  });

  String _formatCountdown(Duration d) {
    final clamped = d.isNegative ? Duration.zero : d;
    final minutes = clamped.inMinutes.remainder(60).toString().padLeft(2, '0');
    final seconds = clamped.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return DecoratedBox(
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        boxShadow: const [
          BoxShadow(
            color: Colors.black26,
            blurRadius: 16,
            offset: Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(18, 14, 18, 10),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    'Dev Panel · Fake GPS',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: colorScheme.onSurface,
                    ),
                  ),
                  const Spacer(),
                  _StatusChip(isActive: isFakeActive),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                isFakeActive
                    ? 'Còn lại đến khi hết giờ tự reset: ${_formatCountdown(timeLeft)}'
                    : 'Kéo pin trên bản đồ để bật Fake GPS',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 12,
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
              const Divider(height: 20),
              Row(
                children: [
                  Expanded(
                    child: Text(
                      'Đang nghe audio story (ngoại lệ không cắt ngang)',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w600,
                        color: colorScheme.onSurface,
                      ),
                    ),
                  ),
                  Switch(value: audioPlayingMock, onChanged: onToggleAudio),
                ],
              ),
              if (pendingReason != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: _PendingChip(reason: pendingReason!),
                ),
              ..._ResetReason.values.map(
                (reason) => _ConditionRow(
                  reason: reason,
                  isPending: pendingReason == reason,
                  enabled: isFakeActive,
                  onSimulate: () => onSimulate(reason),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  final bool isActive;

  const _StatusChip({required this.isActive});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final color = isActive ? colorScheme.primary : kMutedColor;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(9999),
      ),
      child: Text(
        isActive ? 'FAKE GPS' : 'GPS THẬT',
        style: GoogleFonts.plusJakartaSans(
          fontSize: 11,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.4,
          color: color,
        ),
      ),
    );
  }
}

class _PendingChip extends StatelessWidget {
  final _ResetReason reason;

  const _PendingChip({required this.reason});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.amber.withValues(alpha: 0.18),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.hourglass_bottom, size: 14, color: Colors.amber),
          const SizedBox(width: 6),
          Flexible(
            child: Text(
              '"${reason.label}" đang chờ — audio đang phát nên sẽ reset ở lần chạm kế tiếp',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 11.5,
                fontWeight: FontWeight.w600,
                color: Colors.amber.shade900,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ConditionRow extends StatelessWidget {
  final _ResetReason reason;
  final bool isPending;
  final bool enabled;
  final VoidCallback onSimulate;

  const _ConditionRow({
    required this.reason,
    required this.isPending,
    required this.enabled,
    required this.onSimulate,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(reason.icon, size: 18, color: colorScheme.onSurfaceVariant),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  reason.label,
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w700,
                    color: colorScheme.onSurface,
                  ),
                ),
                Text(
                  reason.detail,
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 11,
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
          TextButton(
            onPressed: enabled ? onSimulate : null,
            child: Text(
              isPending ? 'Đang chờ' : 'Giả lập',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
