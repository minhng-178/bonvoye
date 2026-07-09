import 'package:flutter/material.dart';
import 'explore_screen.dart';
import 'journey_screen.dart';
import 'main_narrative_screen.dart';
import 'profile_screen.dart';

/// App-wide bottom navigation shell: Khám phá / Bản đồ / Hành Trình / Hồ sơ.
/// Uses an [IndexedStack] rather than rebuilding the active tab from scratch
/// on every switch, so e.g. the map's controller/markers and the nearby
/// panel's drag position survive a trip to another tab and back.
class RootShellScreen extends StatefulWidget {
  const RootShellScreen({super.key});

  @override
  State<RootShellScreen> createState() => _RootShellScreenState();
}

class _RootShellScreenState extends State<RootShellScreen> {
  // Opens straight to the map, matching the app's behavior before this
  // navigation shell existed.
  int _selectedIndex = 1;

  void _goToMapTab() => setState(() => _selectedIndex = 1);

  /// Wraps a tab's root widget in its own [Navigator], so that screen pushes
  /// within a tab (Explore's drill-down, the map's search screen) only cover
  /// the body area - the bottom [NavigationBar] built below stays visible
  /// the whole time, and each tab keeps its own push stack independently.
  Widget _tab(Widget root) {
    return Navigator(
      onGenerateRoute: (_) => MaterialPageRoute(builder: (_) => root),
    );
  }

  @override
  Widget build(BuildContext context) {
    final tabs = [
      _tab(ExploreScreen(onOpenOnMap: _goToMapTab)),
      _tab(const MainNarrativeScreen()),
      _tab(const JourneyScreen()),
      _tab(const ProfileScreen()),
    ];

    return Scaffold(
      body: IndexedStack(index: _selectedIndex, children: tabs),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) =>
            setState(() => _selectedIndex = index),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.explore_outlined),
            selectedIcon: Icon(Icons.explore),
            label: 'Khám phá',
          ),
          NavigationDestination(
            icon: Icon(Icons.map_outlined),
            selectedIcon: Icon(Icons.map),
            label: 'Bản đồ',
          ),
          NavigationDestination(
            icon: Icon(Icons.route_outlined),
            selectedIcon: Icon(Icons.route),
            label: 'Hành Trình',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Hồ sơ',
          ),
        ],
      ),
    );
  }
}
