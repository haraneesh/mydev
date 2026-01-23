import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Custom MaterialColor for success color (#519716)
const MaterialColor successGreen = MaterialColor(
  0xFF519716,
  <int, Color>{
    50: Color(0xFFF0F5E9),
    100: Color(0xFFD9E8CA),
    200: Color(0xFFC0DAA7),
    300: Color(0xFFA7CC84),
    400: Color(0xFF95C269),
    500: Color(0xFF519716),
    600: Color(0xFF4A8D0F),
    700: Color(0xFF428308),
    800: Color(0xFF3A7902),
    900: Color(0xFF2D6200),
  },
);

/// Custom MaterialColor for red (#EF0905)
const MaterialColor accentRed = MaterialColor(
  0xFFEF0905,
  <int, Color>{
    50: Color(0xFFFCEEED),
    100: Color(0xFFF7D5D2),
    200: Color(0xFFF1B8B4),
    300: Color(0xFFEB9B96),
    400: Color(0xFFE78581),
    500: Color(0xFFEF0905),
    600: Color(0xFFD80804),
    700: Color(0xFFC40703),
    800: Color(0xFFB00602),
    900: Color(0xFF920501),
  },
);

/// Custom MaterialColor for grey (#702223)
const MaterialColor primaryGrey = MaterialColor(
  0xFF702223,
  <int, Color>{
    50: Color(0xFFF5F0F0),
    100: Color(0xFFE6D9D9),
    200: Color(0xFFD5C0C0),
    300: Color(0xFFC4A7A7),
    400: Color(0xFFB79595),
    500: Color(0xFF702223),
    600: Color(0xFF681E1F),
    700: Color(0xFF5D1A1B),
    800: Color(0xFF531616),
    900: Color(0xFF400E0F),
  },
);

/// Global button text style helper
TextStyle getButtonTextStyle({
  Color color = Colors.white,
  FontWeight fontWeight = FontWeight.w700,
  double fontSize = 12,
  double letterSpacing = 1.2,
}) {
  return GoogleFonts.nunito(
    fontSize: fontSize,
    fontWeight: fontWeight,
    letterSpacing: letterSpacing,
    color: color,
  );
}

class AppColors {
  static const Color primary = Color(0xFF702223);
  static const Color secondary = Color(0xFFe04a06);
  static const Color accent = Color(0xFFEF0905);
  static const Color success = Color(0xFF519716);
  static const Color textPrimary = Color(0xFF412f1d);
  static const Color textSecondary = Color(0xFF514732);
  static const Color background = Color(0xFFffffff);
  static const Color border = Color(0xFFe5dcd3);
  static const Color divider = Color(0xFFc9b8a3);
  static const Color warning = Color(0xFFffc107);
  static const Color info = Color(0xFF7F4422);
  static const Color navbarBg = Color(0xFF514732);
  static const Color btnBg = Color(0xFF702223); // Secondary button background
  static const Color hintText = Color(0xFFa89584); // Lighter shade of brown for placeholder text
}

class AppTypography {
  static TextStyle h2 = GoogleFonts.nunito(
    fontSize: 28,
    fontWeight: FontWeight.w700,
    color: AppColors.textPrimary,
  );

  static TextStyle h3 = GoogleFonts.nunito(
    fontSize: 20,
    fontWeight: FontWeight.w700,
    color: AppColors.textPrimary,
  );

  static TextStyle button = GoogleFonts.nunito(
    fontSize: 14,
    fontWeight: FontWeight.w700,
    letterSpacing: 1.0,
    color: AppColors.background,
  );

  static TextStyle body = GoogleFonts.nunito(
    fontSize: 14,
    fontWeight: FontWeight.w700,
    color: AppColors.textPrimary,
  );

  static TextStyle label = GoogleFonts.nunito(
    fontSize: 12,
    fontWeight: FontWeight.w700,
    color: AppColors.textSecondary,
  );

  static TextStyle formControl = GoogleFonts.nunito(
    fontSize: 14,
    fontWeight: FontWeight.w700,
    color: AppColors.textPrimary,
  );
}

ThemeData buildAppTheme() {
  return ThemeData(
    useMaterial3: true,
    primaryColor: AppColors.primary,
    scaffoldBackgroundColor: AppColors.background,
    fontFamily: GoogleFonts.nunito().fontFamily,
    primarySwatch: successGreen,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      surface: AppColors.background,
      onSurface: AppColors.textPrimary,
      brightness: Brightness.light,
      error: Color(0xFFEF0905), // Red for error/overdue status
      errorContainer: Color(0xFFEF0905),
    ),
    textTheme: TextTheme(
      displayLarge: GoogleFonts.nunito(
        fontSize: 32,
        fontWeight: FontWeight.w700,
        color: AppColors.textPrimary,
      ),
      displaySmall: GoogleFonts.nunito(
        fontSize: 28,
        fontWeight: FontWeight.w700,
        color: AppColors.textPrimary,
      ),
      headlineMedium: GoogleFonts.nunito(
        fontSize: 24,
        fontWeight: FontWeight.w700,
        color: AppColors.textPrimary,
      ),
      headlineSmall: GoogleFonts.nunito(
        fontSize: 22,
        fontWeight: FontWeight.w700,
        color: AppColors.textPrimary,
      ),
      bodyLarge: GoogleFonts.nunito(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      ),
      bodyMedium: GoogleFonts.nunito(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      ),
      bodySmall: GoogleFonts.nunito(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      ),
      labelSmall: GoogleFonts.nunito(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: AppColors.textSecondary,
      ),
      labelMedium: GoogleFonts.nunito(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: AppColors.textSecondary,
      ),
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: AppColors.background,
      elevation: 0,
      shadowColor: Colors.transparent,
      scrolledUnderElevation: 0,
      iconTheme: const IconThemeData(color: AppColors.textPrimary),
      toolbarTextStyle: const TextStyle(color: Colors.transparent),
      titleTextStyle: const TextStyle(color: Colors.transparent),
    ),
    inputDecorationTheme: InputDecorationTheme(
      border: OutlineInputBorder(
        borderSide: const BorderSide(color: AppColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderSide: const BorderSide(color: AppColors.primary, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderSide: const BorderSide(color: AppColors.accent),
      ),
      labelStyle: const TextStyle(color: AppColors.textSecondary),
      hintStyle: const TextStyle(color: AppColors.hintText),
      errorStyle: const TextStyle(color: AppColors.accent, fontWeight: FontWeight.w700),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
    ),
    badgeTheme: BadgeThemeData(
      textStyle: GoogleFonts.nunito(
        fontWeight: FontWeight.w700,
        fontSize: 12,
      ),
    ),
  );
}
