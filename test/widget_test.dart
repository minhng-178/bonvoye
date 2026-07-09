import 'package:flutter_test/flutter_test.dart';
import 'package:bonvoye/main.dart';

void main() {
  testWidgets('BonVoye App Smoke Test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const BonVoyeApp());

    // Verify that the title of the Topic exists on the screen.
    expect(find.text('Hồ Gươm Ký Ức'), findsOneWidget);
  });
}
