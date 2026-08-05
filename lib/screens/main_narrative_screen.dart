import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import 'package:bonvoye/widgets/map_view.dart';
import 'package:bonvoye/widgets/map_top_bar.dart';
import 'package:bonvoye/widgets/nearby_list.dart';
import 'package:bonvoye/widgets/webtoon_dialogue_demo.dart';
import 'package:bonvoye/widgets/fake_gps_drag_demo.dart';
import '../data/mock_data.dart';
import '../models/npc.dart';
import '../providers/location_provider.dart';
import '../utils/constants.dart';

/// Walks the mock data tree for the "webtoon động" concept demo - picks the
/// richest legend NPC so the typewriter-dialogue effect has good material.
NPC _findDemoNpc() {
  for (final country in mockCountries) {
    for (final city in country.cities) {
      for (final topic in city.topics) {
        for (final poi in topic.pois) {
          for (final npc in poi.npcs) {
            if (npc.id == 'npc_than_kim_quy') return npc;
          }
        }
      }
    }
  }
  return mockCountries.first.cities.first.topics.first.pois.first.npcs.first;
}

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

          // Temporary demo entry point for the "webtoon động" concept -
          // opens a fullscreen typewriter-dialogue demo over a real NPC.
          Positioned(
            left: 16,
            bottom: 16,
            child: FloatingActionButton.small(
              heroTag: 'demoWebtoon',
              onPressed: () {
                // Push on the root Navigator (not the tab's nested one) so
                // the modal covers the bottom NavigationBar too, like a real
                // interstitial rather than just replacing the tab's body.
                Navigator.of(context, rootNavigator: true).push(
                  MaterialPageRoute(
                    fullscreenDialog: true,
                    builder: (context) => WebtoonDialogueDemo(
                      npc: _findDemoNpc(),
                      onClose: () => Navigator.of(context).pop(),
                    ),
                  ),
                );
              },
              child: const Icon(Icons.auto_stories),
            ),
          ),

          // Temporary demo entry point for the Fake GPS drag + auto-reset
          // mockup (docs/app-core-text-diagram.md PHẦN 4-5) - stacked above
          // the webtoon demo FAB.
          Positioned(
            left: 16,
            bottom: 76,
            child: FloatingActionButton.small(
              heroTag: 'demoFakeGps',
              onPressed: () {
                Navigator.of(context, rootNavigator: true).push(
                  MaterialPageRoute(
                    fullscreenDialog: true,
                    builder: (context) => FakeGpsDragDemo(
                      onClose: () => Navigator.of(context).pop(),
                    ),
                  ),
                );
              },
              child: const Icon(Icons.gps_not_fixed),
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
