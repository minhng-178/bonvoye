import 'package:flutter_test/flutter_test.dart';
import 'package:bonvoye/providers/location_provider.dart';
import 'package:bonvoye/models/npc.dart';
import 'package:bonvoye/models/story.dart';

void main() {
  group('LocationProvider proximity triggers', () {
    late LocationProvider provider;

    setUp(() {
      provider = LocationProvider();
    });

    test('single NPC in range auto-opens its story directly', () {
      // Tượng đài Lý Thái Tổ's NPC is alone at its POI, far from any other
      // NPC, so only it falls within range here.
      provider.updateLocation(21.0274, 105.8541);

      expect(provider.shouldShowTriggerPopup, isTrue);
      expect(provider.shouldShowChooser, isFalse);
      expect(provider.activeNPC?.id, 'npc_quan_truyen_tin');
    });

    test('two NPCs simultaneously in range show the chooser instead', () {
      // Midpoint between the two Đền Ngọc Sơn NPCs (~15m apart), so both
      // fall inside the 20m radius from here.
      provider.updateLocation(21.02945, 105.85245);

      expect(provider.shouldShowChooser, isTrue);
      expect(provider.shouldShowTriggerPopup, isFalse);
      expect(provider.chooserCandidates.length, 2);
      expect(provider.chooserCandidates.map((e) => e.key.id).toSet(), {
        'npc_than_kim_quy',
        'npc_nguyen_van_sieu',
      });
    });

    test(
      'the shared citadel coordinate yields 3 floor-distinct candidates',
      () {
        provider.updateLocation(21.0357, 105.8390);

        expect(provider.shouldShowChooser, isTrue);
        expect(provider.chooserCandidates.length, 3);
        final floors = provider.chooserCandidates
            .map((e) => e.key.floor)
            .toSet();
        expect(floors, hasLength(3));
        expect(floors, isNot(contains(null)));
      },
    );

    test('re-checking with an unchanged in-range set does not re-trigger', () {
      provider.updateLocation(21.0274, 105.8541);
      provider.markPopupShown();
      expect(provider.shouldShowTriggerPopup, isFalse);

      // Same spot, same single NPC in range - should stay cleared.
      provider.updateLocation(21.0274, 105.8541);
      expect(provider.shouldShowTriggerPopup, isFalse);
    });

    test(
      'shrinking from 2-in-range to 1-in-range re-triggers the remaining NPC',
      () {
        provider.updateLocation(21.02945, 105.85245);
        expect(provider.shouldShowChooser, isTrue);
        provider.dismissChooser();

        // Step past Thần Kim Quy, away from Nguyễn Văn Siêu, so only the
        // former stays within the 20m radius (they're ~15m apart).
        provider.updateLocation(21.0293, 105.8523);

        expect(provider.shouldShowChooser, isFalse);
        expect(provider.shouldShowTriggerPopup, isTrue);
        expect(provider.activeNPC?.id, 'npc_than_kim_quy');
      },
    );

    test('selectFromChooser sets the chosen NPC and clears the chooser', () {
      provider.updateLocation(21.02945, 105.85245);
      final chosen = provider.chooserCandidates.last.key;

      provider.selectFromChooser(chosen);

      expect(provider.shouldShowChooser, isFalse);
      expect(provider.activeNPC, chosen);
      expect(provider.shouldShowTriggerPopup, isTrue);
    });

    test('dismissChooser clears the chooser without selecting anyone', () {
      provider.updateLocation(21.02945, 105.85245);
      provider.dismissChooser();

      expect(provider.shouldShowChooser, isFalse);
      expect(provider.activeNPC, isNull);
    });
  });

  group('LocationProvider search', () {
    late LocationProvider provider;

    setUp(() {
      provider = LocationProvider();
    });

    test(
      'setSearchQuery debounces - filtering only applies once typing settles',
      () async {
        final totalCount = provider.visibleNpcsSortedByDistance.length;

        provider.setSearchQuery('Thần Kim Quy');

        // Right after the call, nothing should have taken effect yet.
        expect(provider.searchQuery, isEmpty);
        expect(provider.visibleNpcsSortedByDistance.length, totalCount);

        await Future.delayed(const Duration(milliseconds: 250));

        expect(provider.searchQuery, 'Thần Kim Quy');
        expect(provider.visibleNpcsSortedByDistance.length, 1);
      },
    );

    test(
      'clearing the query (empty string) applies immediately, no debounce',
      () async {
        provider.setSearchQuery('Thần Kim Quy');
        await Future.delayed(const Duration(milliseconds: 250));
        final filteredCount = provider.visibleNpcsSortedByDistance.length;

        provider.setSearchQuery('');

        expect(provider.searchQuery, isEmpty);
        expect(
          provider.visibleNpcsSortedByDistance.length,
          greaterThan(filteredCount),
        );
      },
    );

    test(
      'rapid successive keystrokes only apply the final query once',
      () async {
        provider.setSearchQuery('T');
        provider.setSearchQuery('Th');
        provider.setSearchQuery('Thầ');
        provider.setSearchQuery('Thần Kim Quy');

        await Future.delayed(const Duration(milliseconds: 250));

        expect(provider.searchQuery, 'Thần Kim Quy');
        expect(provider.visibleNpcsSortedByDistance.length, 1);
      },
    );
  });

  group('NPC.floor JSON round-trip', () {
    NPC buildNpc({String? floor}) {
      return NPC(
        id: 'npc_test',
        name: 'Test',
        role: 'Tester',
        latitude: 1.0,
        longitude: 2.0,
        zoneType: ZoneType.history,
        poiId: 'poi_test',
        floor: floor,
        story: Story(
          id: 'story_test',
          title: 'Title',
          content: 'Content',
          hiddenThreads: const [],
        ),
      );
    }

    test('preserves floor through toJson/fromJson', () {
      final npc = buildNpc(floor: 'Tầng 2');

      final restored = NPC.fromJson(npc.toJson());

      expect(restored.floor, 'Tầng 2');
    });

    test('parses to null when the floor key is absent', () {
      final npc = buildNpc();
      final json = npc.toJson()..remove('floor');

      final restored = NPC.fromJson(json);

      expect(restored.floor, isNull);
    });
  });
}
