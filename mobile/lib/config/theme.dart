import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Global button text style helper
TextStyle getButtonTextStyle({
  Color color = Colors.white,
  FontWeight fontWeight = FontWeight.bold,
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
  static const Color textPrimary = Color(0xFF2f2215);
  static const Color textSecondary = Color(0xFF514732);
  static const Color background = Color(0xFFffffff);
  static const Color border = Color(0xFFe5dcd3);
  static const Color divider = Color(0xFFc9b8a3);
  static const Color warning = Color(0xFFffc107);
  static const Color info = Color(0xFF7F4422);
  static const Color navbarBg = Color(0xFF514732);
  static const Color btnBg = Color(0xFF702223); // Secondary button background
}

class AppTypography {
  static TextStyle h2 = GoogleFonts.sourceSerif4(
    fontSize: 28,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );

  static TextStyle h3 = GoogleFonts.sourceSerif4(
    fontSize: 20,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );

  static TextStyle button = GoogleFonts.nunito(
    fontSize: 14,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.0,
    color: AppColors.background,
  );

  static TextStyle body = GoogleFonts.nunito(
    fontSize: 16,
    fontWeight: FontWeight.w700,
    color: AppColors.textPrimary,
  );

  static TextStyle label = GoogleFonts.nunito(
    fontSize: 12,
    fontWeight: FontWeight.w600,
    color: AppColors.textSecondary,
  );

  static TextStyle formControl = GoogleFonts.nunito(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );
}

ThemeData buildAppTheme() {
  return ThemeData(
    useMaterial3: true,
    primaryColor: AppColors.primary,
    scaffoldBackgroundColor: AppColors.background,
    textTheme: TextTheme(
      displayLarge: GoogleFonts.sourceSerif4(
        fontSize: 32,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      ),
      displaySmall: GoogleFonts.sourceSerif4(
        fontSize: 28,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      ),
      headlineSmall: GoogleFonts.sourceSerif4(
        fontSize: 22,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      ),
      bodyLarge: GoogleFonts.nunito(
        fontSize: 16,
        fontWeight: FontWeight.w700,
        color: AppColors.textPrimary,
      ),
      bodyMedium: GoogleFonts.nunito(
        fontSize: 16,
        fontWeight: FontWeight.w700,
        color: AppColors.textPrimary,
      ),
      labelSmall: GoogleFonts.nunito(
        fontSize: 16,
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
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
    ),
  );
}
