import 'package:bonvoye/screens/main_narrative_screen.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/location_provider.dart';
import 'theme/app_theme.dart';

void main() {
  runApp(const BonVoyeApp());
}

class BonVoyeApp extends StatelessWidget {
  const BonVoyeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => LocationProvider(),
      child: MaterialApp(
        title: 'BonVoye - Storytelling',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light,
        home: const MainNarrativeScreen(),
      ),
    );
  }
}
