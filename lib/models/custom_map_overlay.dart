/// A hand-drawn/custom image pinned over a rectangular lat/lng area, used to
/// replace the real map tiles with custom art while the user is physically
/// inside that area - GPS still tracks accurately on top of it because the
/// image is anchored to real coordinates, not just displayed statically.
///
/// Plain-Dart on purpose (no `flutter_map`/`latlong2` types) so the model
/// layer stays framework-independent; the widget layer builds the real
/// `LatLngBounds`/`OverlayImage` from these fields.
class CustomMapOverlay {
  final String imageUrl;
  final double northLat;
  final double southLat;
  final double eastLng;
  final double westLng;

  const CustomMapOverlay({
    required this.imageUrl,
    required this.northLat,
    required this.southLat,
    required this.eastLng,
    required this.westLng,
  });

  bool contains(double lat, double lng) =>
      lat <= northLat && lat >= southLat && lng <= eastLng && lng >= westLng;

  factory CustomMapOverlay.fromJson(Map<String, dynamic> json) {
    return CustomMapOverlay(
      imageUrl: json['imageUrl'] as String,
      northLat: (json['northLat'] as num).toDouble(),
      southLat: (json['southLat'] as num).toDouble(),
      eastLng: (json['eastLng'] as num).toDouble(),
      westLng: (json['westLng'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'imageUrl': imageUrl,
      'northLat': northLat,
      'southLat': southLat,
      'eastLng': eastLng,
      'westLng': westLng,
    };
  }
}
