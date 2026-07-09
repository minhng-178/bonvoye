import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Hồ sơ tab: placeholder until there's an actual account/auth system to
/// back it - deliberately not a fake settings list.
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Hồ sơ',
          style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700),
        ),
      ),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircleAvatar(
              radius: 40,
              backgroundColor: colorScheme.secondaryContainer,
              child: Icon(Icons.person, size: 40, color: colorScheme.secondary),
            ),
            const SizedBox(height: 16),
            Text(
              'Hồ sơ cá nhân',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Sắp ra mắt',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 13,
                color: colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
