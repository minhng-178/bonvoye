import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../utils/zone_colors.dart';

/// The app's single [ThemeData] definition — kept out of [main] so app
/// bootstrap and visual design don't live in the same file.
class AppTheme {
  AppTheme._();

  static final ThemeData light = ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: const Color(0xFFFBF8F2), // surface
    colorScheme: const ColorScheme(
      brightness: Brightness.light,
      primary: Color(0xFF8B4542), // Đỏ gạch nung (Cổ kính, mái ngói)
      onPrimary: Color(0xFFFFFFFF),
      primaryContainer: Color(0xFFFFDAD6),
      onPrimaryContainer: Color(0xFF3A0A09),
      secondary: Color(
        0xFF53664C,
      ), // Xanh rêu/Lá trà (Gắn với thiên nhiên, bản đồ)
      onSecondary: Color(0xFFFFFFFF),
      secondaryContainer: Color(0xFFD6ECCB),
      onSecondaryContainer: Color(0xFF11210E),
      tertiary: Color(0xFFB07D3E), // Vàng sậm/Amber (Hidden threads, bí ẩn)
      onTertiary: Color(0xFFFFFFFF),
      error: Color(0xFFBA1A1A),
      onError: Color(0xFFFFFFFF),
      surface: Color(0xFFFBF8F2), // Be sáng (Màu giấy da, sữa nhẹ)
      onSurface: Color(0xFF2E2B2A), // Nâu xám đen (Dịu mắt khi đọc text dài)
      surfaceDim: Color(0xFFEBE6DF),
      surfaceBright: Color(0xFFFBF8F2),
      surfaceContainerLowest: Color(0xFFFFFFFF),
      surfaceContainerLow: Color(0xFFF5F2EB),
      surfaceContainer: Color(0xFFEFEDE6),
      surfaceContainerHigh: Color(0xFFE9E7E0),
      surfaceContainerHighest: Color(0xFFE3E2DB),
      onSurfaceVariant: Color(0xFF534341),
      outline: Color(0xFF857371),
      outlineVariant: Color(0xFFD8C2BF),
    ),
    extensions: const [ZoneColors.bonvoye],
    textTheme: TextTheme(
      displayLarge: GoogleFonts.plusJakartaSans(
        fontSize: 40,
        fontWeight: FontWeight.bold,
        letterSpacing: -0.8,
      ),
      headlineLarge: GoogleFonts.plusJakartaSans(
        fontSize: 32,
        fontWeight: FontWeight.bold,
      ),
      bodyMedium: GoogleFonts.plusJakartaSans(
        fontSize: 16,
        fontWeight: FontWeight.normal,
      ),
    ),
  );
}
