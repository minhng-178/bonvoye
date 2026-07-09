import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../data/mock_data.dart';
import '../models/city.dart';
import '../models/country.dart';
import '../models/poi.dart';
import '../models/topic.dart';
import '../providers/location_provider.dart';
import '../utils/image_utils.dart';
import '../widgets/topic_picker_sheet.dart' show iconForTopic;

/// Khám phá tab: browse Country → City → Topic → POI as plain lists/cards
/// (not a map) - each level is a screen pushed onto this tab's own
/// [Navigator] (see [RootShellScreen._tab]), so the bottom nav bar stays put.
class ExploreScreen extends StatelessWidget {
  final VoidCallback onOpenOnMap;

  const ExploreScreen({super.key, required this.onOpenOnMap});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Khám phá',
          style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700),
        ),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.symmetric(vertical: 8),
        itemCount: mockCountries.length,
        separatorBuilder: (context, index) =>
            const Divider(height: 1, indent: 76),
        itemBuilder: (context, index) {
          final country = mockCountries[index];
          return _ExploreListTile(
            leadingIcon: Icons.public,
            title: country.name,
            subtitle: country.description,
            onTap: () {
              context.read<LocationProvider>().setCountry(country);
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => _CityListScreen(
                    country: country,
                    onOpenOnMap: onOpenOnMap,
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

class _CityListScreen extends StatelessWidget {
  final Country country;
  final VoidCallback onOpenOnMap;

  const _CityListScreen({required this.country, required this.onOpenOnMap});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          country.name,
          style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700),
        ),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.symmetric(vertical: 8),
        itemCount: country.cities.length,
        separatorBuilder: (context, index) =>
            const Divider(height: 1, indent: 76),
        itemBuilder: (context, index) {
          final city = country.cities[index];
          return _ExploreListTile(
            leadingIcon: Icons.location_city,
            title: city.name,
            subtitle: city.description,
            onTap: () {
              context.read<LocationProvider>().setCity(city);
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) =>
                      _TopicListScreen(city: city, onOpenOnMap: onOpenOnMap),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

class _TopicListScreen extends StatelessWidget {
  final City city;
  final VoidCallback onOpenOnMap;

  const _TopicListScreen({required this.city, required this.onOpenOnMap});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          city.name,
          style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700),
        ),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.symmetric(vertical: 8),
        itemCount: city.topics.length,
        separatorBuilder: (context, index) =>
            const Divider(height: 1, indent: 76),
        itemBuilder: (context, index) {
          final topic = city.topics[index];
          return _ExploreListTile(
            leadingIcon: iconForTopic(topic.icon),
            title: topic.title,
            subtitle: topic.description,
            onTap: () {
              context.read<LocationProvider>().setTopic(topic);
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) =>
                      _PoiListScreen(topic: topic, onOpenOnMap: onOpenOnMap),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

class _PoiListScreen extends StatelessWidget {
  final Topic topic;
  final VoidCallback onOpenOnMap;

  const _PoiListScreen({required this.topic, required this.onOpenOnMap});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          topic.title,
          style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700),
        ),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.symmetric(vertical: 8),
        itemCount: topic.pois.length,
        separatorBuilder: (context, index) =>
            const Divider(height: 1, indent: 76),
        itemBuilder: (context, index) {
          final poi = topic.pois[index];
          return _ExploreListTile(
            leadingIcon: Icons.place,
            imageUrl: poi.imageUrl,
            title: poi.title,
            subtitle: poi.description,
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) =>
                      _PoiDetailScreen(poi: poi, onOpenOnMap: onOpenOnMap),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

class _PoiDetailScreen extends StatelessWidget {
  final POI poi;
  final VoidCallback onOpenOnMap;

  const _PoiDetailScreen({required this.poi, required this.onOpenOnMap});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          poi.title,
          style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700),
        ),
      ),
      body: ListView(
        padding: EdgeInsets.zero,
        children: [
          if (poi.imageUrl != null)
            AspectRatio(
              aspectRatio: 16 / 9,
              child: Image(
                image: getSafeImageProvider(poi.imageUrl),
                fit: BoxFit.cover,
              ),
            ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  poi.description,
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 14,
                    height: 1.5,
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  onPressed: () {
                    context.read<LocationProvider>().updateLocation(
                      poi.latitude,
                      poi.longitude,
                    );
                    onOpenOnMap();
                    Navigator.of(context).popUntil((route) => route.isFirst);
                  },
                  icon: const Icon(Icons.map),
                  label: Text(
                    'Xem trên bản đồ',
                    style: GoogleFonts.plusJakartaSans(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: colorScheme.primary,
                    foregroundColor: colorScheme.onPrimary,
                    minimumSize: const Size.fromHeight(48),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(9999),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Shared card row for the Country/City/Topic/POI lists above: an icon or
/// thumbnail, title/subtitle, and a chevron - mirrors the item style already
/// used by `topic_picker_sheet.dart`'s topic list.
class _ExploreListTile extends StatelessWidget {
  final IconData leadingIcon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  final String? imageUrl;

  const _ExploreListTile({
    required this.leadingIcon,
    required this.title,
    required this.subtitle,
    required this.onTap,
    this.imageUrl,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Container(
                width: 48,
                height: 48,
                color: colorScheme.secondaryContainer,
                child: imageUrl != null
                    ? Image(
                        image: getSafeImageProvider(
                          imageUrl,
                          cacheWidth: 96,
                          cacheHeight: 96,
                        ),
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) =>
                            Icon(leadingIcon, color: colorScheme.secondary),
                      )
                    : Icon(leadingIcon, color: colorScheme.secondary),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: colorScheme.onSurface,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Icon(Icons.chevron_right, color: colorScheme.outline, size: 18),
          ],
        ),
      ),
    );
  }
}
