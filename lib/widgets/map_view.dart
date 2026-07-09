import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import '../providers/location_provider.dart';
import '../models/custom_map_overlay.dart';
import '../models/npc.dart';
import '../utils/image_utils.dart';
import '../utils/constants.dart';
import '../utils/zone_colors.dart';
import 'npc_story_sheet.dart';
import 'npc_chooser_sheet.dart';

class MapView extends StatefulWidget {
  final MapController? mapController;

  const MapView({super.key, this.mapController});

  @override
  State<MapView> createState() => _MapViewState();
}

/// The subset of [LocationProvider] this widget's build actually depends on.
/// Selecting this record (rather than watching the whole provider) means
/// changes unrelated to the map - e.g. toggling simulation mode - don't force
/// a full marker-list rebuild of the [FlutterMap].
typedef _MapViewData = ({
  double userLatitude,
  double userLongitude,
  List<MapEntry<NPC, double>> visibleNpcs,
  bool shouldShowTriggerPopup,
  NPC? activeNPC,
  bool shouldShowChooser,
  List<MapEntry<NPC, double>> chooserCandidates,
  CustomMapOverlay? activeCustomMapOverlay,
});

class _MapViewState extends State<MapView> {
  late final MapController _mapController =
      widget.mapController ?? MapController();

  // Keep track of when we should programmatically show the bottom sheet
  NPC? _currentlyShowingNpc;
  bool _isChooserShowing = false;

  void _showChooserSheet(
    BuildContext context,
    List<MapEntry<NPC, double>> candidates,
    LocationProvider provider,
  ) {
    if (_isChooserShowing) return; // Prevent double sheets
    _isChooserShowing = true;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      barrierColor: Colors.black.withValues(alpha: 0.2),
      builder: (context) {
        return NpcChooserSheet(
          candidates: candidates,
          onSelect: (npc) {
            Navigator.pop(context);
            provider.selectFromChooser(npc);
          },
        );
      },
    ).then((_) {
      _isChooserShowing = false;
      provider.dismissChooser();
    });
  }

  void _showStorySheet(
    BuildContext context,
    NPC npc,
    LocationProvider provider,
  ) {
    if (_currentlyShowingNpc == npc) return; // Prevent double sheets
    _currentlyShowingNpc = npc;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      barrierColor: Colors.black.withValues(
        alpha: 0.2,
      ), // Soft blur overlay feel
      builder: (context) {
        return DraggableScrollableSheet(
          initialChildSize: 0.65,
          minChildSize: 0.4,
          maxChildSize: 0.95,
          expand: false,
          builder: (context, scrollController) {
            return NpcStorySheet(
              npc: npc,
              onClose: () {
                Navigator.pop(context);
              },
            );
          },
        );
      },
    ).then((_) {
      _currentlyShowingNpc = null;
      provider.clearActiveNPC();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Selector<LocationProvider, _MapViewData>(
      selector: (context, provider) => (
        userLatitude: provider.userLatitude,
        userLongitude: provider.userLongitude,
        visibleNpcs: provider.visibleNpcsSortedByDistance,
        shouldShowTriggerPopup: provider.shouldShowTriggerPopup,
        activeNPC: provider.activeNPC,
        shouldShowChooser: provider.shouldShowChooser,
        chooserCandidates: provider.chooserCandidates,
        activeCustomMapOverlay: provider.activeCustomMapOverlay,
      ),
      builder: (context, data, child) {
        final provider = context.read<LocationProvider>();

        // Auto-trigger BottomSheet when shouldShowTriggerPopup is true
        if (data.shouldShowTriggerPopup && data.activeNPC != null) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (_currentlyShowingNpc != data.activeNPC) {
              provider.markPopupShown();
              _showStorySheet(context, data.activeNPC!, provider);
            }
          });
        }

        // Two or more NPCs in range at once: let the user pick who they mean
        // instead of silently opening the nearest one.
        if (data.shouldShowChooser) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (!_isChooserShowing) {
              _showChooserSheet(context, data.chooserCandidates, provider);
            }
          });
        }

        // Center map on simulated position if user requests or to follow them
        // For a smoother demo, we don't snap the map on every small tap update to avoid jerky motion,
        // but we keep user marker in place.

        final userPos = LatLng(data.userLatitude, data.userLongitude);
        final colorScheme = Theme.of(context).colorScheme;
        final zoneColors = Theme.of(context).extension<ZoneColors>()!;

        // Build markers
        final List<Marker> markers = [];

        // 1. NPC markers - teardrop pins planted tip-first on their coordinate.
        // Only NPCs matching the active search/filter are shown, so the map
        // narrows down alongside the nearby list.
        //
        // NPCs sharing a `poiId` occupy the same physical location (e.g.
        // different floors of one building) even though their coordinates
        // aren't byte-identical - grouping by poiId (rather than each NPC
        // getting its own marker) avoids stacking overlapping pins on top of
        // each other, which hid everything but the topmost one.
        final Map<String, List<MapEntry<NPC, double>>> npcsByPoi = {};
        for (var entry in data.visibleNpcs) {
          npcsByPoi.putIfAbsent(entry.key.poiId, () => []).add(entry);
        }

        for (var group in npcsByPoi.values) {
          group.sort((a, b) => a.value.compareTo(b.value));
          final nearest = group.first;
          final npc = nearest.key;
          final inRange = group.any((e) => e.value <= kProximityRadiusMeters);

          markers.add(
            Marker(
              point: LatLng(npc.latitude, npc.longitude),
              width: _NpcPin.width,
              height: _NpcPin.height,
              alignment: Alignment.topCenter,
              child: _NpcPin(
                npc: npc,
                inRange: inRange,
                stackCount: group.length > 1 ? group.length : null,
                pinColor: inRange
                    ? colorScheme.primary
                    : zoneColors.baseFor(npc.zoneType),
                onTap: () {
                  if (group.length > 1) {
                    // Multiple NPCs sharing this location: let the user pick
                    // who/which floor they mean instead of silently opening
                    // the nearest one.
                    _showChooserSheet(context, group, provider);
                  } else {
                    // Direct selection bypasses range check
                    provider.selectNPC(npc);
                  }
                },
              ),
            ),
          );
        }

        // 2. User Simulated Location Marker
        markers.add(
          Marker(
            point: userPos,
            width: 44,
            height: 44,
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Outer halo
                _PulsingHalo(color: kUserLocationColor),
                // Solid inner dot
                Container(
                  width: 16,
                  height: 16,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: kUserLocationColor,
                    border: Border.all(color: Colors.white, width: 2),
                    boxShadow: const [
                      BoxShadow(
                        color: Colors.black26,
                        blurRadius: 4,
                        offset: Offset(0, 2),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );

        return FlutterMap(
          mapController: _mapController,
          options: MapOptions(
            initialCenter: LatLng(kDefaultUserLatitude, kDefaultUserLongitude),
            initialZoom: 16.5,
            minZoom: 14,
            maxZoom: 19,
            onTap: (tapPosition, point) {
              if (provider.isSimulationMode) {
                provider.updateLocation(point.latitude, point.longitude);
              }
            },
          ),
          children: [
            TileLayer(
              urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
              userAgentPackageName: 'com.bonvoye.app',
            ),
            // Custom Map Mode: pins a custom image over the real tiles,
            // anchored to real coordinates, while the user is inside a
            // POI's declared overlay bounds. Must come after TileLayer (per
            // OverlayImageLayer's own doc comment) and before MarkerLayer so
            // NPC pins stay tappable on top of it.
            if (data.activeCustomMapOverlay != null)
              OverlayImageLayer(
                overlayImages: [
                  OverlayImage(
                    bounds: LatLngBounds(
                      LatLng(
                        data.activeCustomMapOverlay!.northLat,
                        data.activeCustomMapOverlay!.westLng,
                      ),
                      LatLng(
                        data.activeCustomMapOverlay!.southLat,
                        data.activeCustomMapOverlay!.eastLng,
                      ),
                    ),
                    imageProvider: getSafeImageProvider(
                      data.activeCustomMapOverlay!.imageUrl,
                    ),
                  ),
                ],
              ),
            MarkerLayer(markers: markers),
          ],
        );
      },
    );
  }
}

class _PulsingHalo extends StatefulWidget {
  final Color color;

  const _PulsingHalo({required this.color});

  @override
  State<_PulsingHalo> createState() => _PulsingHaloState();
}

class _PulsingHaloState extends State<_PulsingHalo>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat();
    _animation = Tween<double>(
      begin: 24.0,
      end: 44.0,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOut));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        final double opacity = 1.0 - (_animation.value - 24.0) / 20.0;
        return Container(
          width: _animation.value,
          height: _animation.value,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: widget.color.withValues(alpha: opacity * 0.4),
          ),
        );
      },
    );
  }
}

/// A teardrop pin planted tip-first on an NPC's coordinate, with the NPC's
/// avatar inset into the pin's head - used with `Marker.alignment:
/// Alignment.topCenter` so the visual tip (the glyph's bottom point) lands
/// exactly on the geographic point, rather than the pin's centroid.
class _NpcPin extends StatelessWidget {
  final NPC npc;
  final bool inRange;
  final Color pinColor;
  final VoidCallback onTap;

  /// When this pin represents multiple NPCs stacked at the same location
  /// (e.g. different floors of one building), the count to badge on the pin.
  /// Null/1 renders as a normal single-NPC pin.
  final int? stackCount;

  static const double width = 46;
  static const double height = 46;

  const _NpcPin({
    required this.npc,
    required this.inRange,
    required this.pinColor,
    required this.onTap,
    this.stackCount,
  });

  @override
  Widget build(BuildContext context) {
    const avatarSize = width * 0.46;
    final avatarCachePx = (avatarSize * MediaQuery.devicePixelRatioOf(context))
        .round();

    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: width,
        height: height,
        child: Stack(
          alignment: Alignment.topCenter,
          clipBehavior: Clip.none,
          children: [
            if (inRange)
              Positioned(top: 0, child: _PulsingHalo(color: pinColor)),
            Icon(
              Icons.location_on,
              size: width,
              color: pinColor,
              shadows: const [
                Shadow(
                  color: Colors.black38,
                  blurRadius: 4,
                  offset: Offset(0, 2),
                ),
              ],
            ),
            Positioned(
              top: height * 0.14,
              child: Container(
                width: avatarSize,
                height: avatarSize,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white,
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
                        size: avatarSize * 0.55,
                        color: pinColor,
                      )
                    : null,
              ),
            ),
            if (inRange)
              Positioned(
                top: 0,
                right: width * 0.06,
                child: Container(
                  width: 14,
                  height: 14,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: pinColor,
                    border: Border.all(color: Colors.white, width: 1),
                  ),
                  child: const Icon(
                    Icons.gps_fixed,
                    size: 8,
                    color: Colors.white,
                  ),
                ),
              ),
            if (stackCount != null && stackCount! > 1)
              Positioned(
                top: height * 0.02,
                left: width * 0.02,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 5,
                    vertical: 1,
                  ),
                  constraints: const BoxConstraints(minWidth: 16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(9999),
                    border: Border.all(color: pinColor, width: 1.2),
                  ),
                  child: Text(
                    '$stackCount',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.w800,
                      color: pinColor,
                      height: 1.2,
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
