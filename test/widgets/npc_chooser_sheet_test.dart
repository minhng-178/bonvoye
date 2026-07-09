import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:bonvoye/widgets/npc_chooser_sheet.dart';
import 'package:bonvoye/models/npc.dart';
import 'package:bonvoye/models/story.dart';
import 'package:bonvoye/utils/zone_colors.dart';

NPC _buildNpc({
  required String id,
  required double lat,
  required double lng,
  String? floor,
}) {
  return NPC(
    id: id,
    name: 'NPC $id',
    role: 'Role $id',
    latitude: lat,
    longitude: lng,
    zoneType: ZoneType.history,
    poiId: 'poi_test',
    floor: floor,
    story: Story(
      id: 'story_$id',
      title: 'Title',
      content: 'Content',
      hiddenThreads: const [],
    ),
  );
}

Future<void> _pump(
  WidgetTester tester,
  List<MapEntry<NPC, double>> candidates,
) {
  return tester.pumpWidget(
    MaterialApp(
      theme: ThemeData(extensions: const [ZoneColors.bonvoye]),
      home: Scaffold(
        body: NpcChooserSheet(candidates: candidates, onSelect: (_) {}),
      ),
    ),
  );
}

void main() {
  testWidgets(
    'shows floor labels, not distances, when candidates share a coordinate',
    (tester) async {
      final candidates = [
        MapEntry(
          _buildNpc(id: 'a', lat: 21.0357, lng: 105.8390, floor: 'Tầng hầm'),
          0.0,
        ),
        MapEntry(
          _buildNpc(id: 'b', lat: 21.0357, lng: 105.8390, floor: 'Tầng 1'),
          0.0,
        ),
      ];

      await _pump(tester, candidates);

      expect(find.text('Tòa nhà nhiều tầng'), findsOneWidget);
      expect(find.text('Tầng hầm'), findsOneWidget);
      expect(find.text('Tầng 1'), findsOneWidget);
      final distanceLike = RegExp(r'^\d+ m$');
      expect(
        find.byWidgetPredicate(
          (w) => w is Text && distanceLike.hasMatch(w.data ?? ''),
        ),
        findsNothing,
      );
    },
  );

  testWidgets('shows distances, not floor labels, when candidates are apart', (
    tester,
  ) async {
    final candidates = [
      MapEntry(
        _buildNpc(id: 'a', lat: 21.0294, lng: 105.8524, floor: null),
        3.0,
      ),
      MapEntry(
        _buildNpc(id: 'b', lat: 21.0295, lng: 105.8525, floor: null),
        12.0,
      ),
    ];

    await _pump(tester, candidates);

    expect(find.text('Có nhiều người gần bạn'), findsOneWidget);
    expect(find.text('3 m'), findsOneWidget);
    expect(find.text('12 m'), findsOneWidget);
  });
}
