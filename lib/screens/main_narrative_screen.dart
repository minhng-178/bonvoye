import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import 'package:bonvoye/widgets/map_view.dart';
import 'package:bonvoye/widgets/map_top_bar.dart';
import 'package:bonvoye/widgets/nearby_list.dart';
import '../providers/location_provider.dart';
import '../utils/constants.dart';

class MainNarrativeScreen extends StatefulWidget {
  const MainNarrativeScreen({super.key});

  @override
  State<MainNarrativeScreen> createState() => _MainNarrativeScreenState();
}

class _MainNarrativeScreenState extends State<MainNarrativeScreen> {
  final MapController _mapController = MapController();
  final DraggableScrollableController _sheetController =
      DraggableScrollableController();

  @override
  void dispose() {
    _sheetController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Fullscreen Map Layeride
          Positioned.fill(child: MapView(mapController: _mapController)),

          // Floating Search Bar + Profile Icon + Location-Type Filter Chips
          const Positioned(top: 54, left: 20, right: 20, child: MapTopBar()),

          // Draggable Nearby-NPC Panel (Google-Maps-style bottom sheet)
          Positioned.fill(child: NearbyList(sheetController: _sheetController)),

          // Floating "locate me" button - tracks the sheet's live drag
          // position so it never sits underneath it, however far it's dragged.
          AnimatedBuilder(
            animation: _sheetController,
            builder: (context, child) {
              final sheetExtent = _sheetController.isAttached
                  ? _sheetController.size
                  : 0.30;
              return Positioned(
                right: 16,
                bottom: MediaQuery.sizeOf(context).height * sheetExtent + 16,
                child: child!,
              );
            },
            child: _LocateMeButton(
              onPressed: () {
                final provider = context.read<LocationProvider>();
                final userPos = LatLng(
                  provider.userLatitude,
                  provider.userLongitude,
                );
                _mapController.move(userPos, _mapController.camera.zoom);
              },
            ),
          ),
        ],
      ),
    );
  }
}

/// Floating circular button that recenters the map on the user's (simulated)
/// position - styled to match the profile-icon circle in [MapTopBar].
class _LocateMeButton extends StatelessWidget {
  final VoidCallback onPressed;

  const _LocateMeButton({required this.onPressed});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return GestureDetector(
      onTap: onPressed,
      child: Container(
        width: 48,
        height: 48,
        decoration: BoxDecoration(
          color: colorScheme.surface.withValues(alpha: 0.96),
          shape: BoxShape.circle,
          border: Border.all(color: colorScheme.secondaryContainer, width: 1),
          boxShadow: const [
            BoxShadow(
              color: kCardShadowColor,
              blurRadius: 8,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Icon(Icons.my_location, color: colorScheme.primary),
      ),
    );
  }
}
