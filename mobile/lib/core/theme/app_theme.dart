import 'package:flutter/material.dart';

/// Calm green + soft gold Material 3 palette.
/// RTL-ready: prefer EdgeInsetsDirectional / AlignmentDirectional in UI.
class AppColors {
  AppColors._();

  static const Color green = Color(0xFF2D6A4F);
  static const Color greenSoft = Color(0xFF40916C);
  static const Color greenLight = Color(0xFFD8F3DC);
  static const Color gold = Color(0xFFC9A227);
  static const Color goldSoft = Color(0xFFE8D48B);
  static const Color cream = Color(0xFFF8F6F0);
  static const Color ink = Color(0xFF1B4332);
}

class AppTheme {
  AppTheme._();

  static ThemeData light() {
    final scheme = ColorScheme.fromSeed(
      seedColor: AppColors.green,
      primary: AppColors.green,
      secondary: AppColors.gold,
      surface: AppColors.cream,
      brightness: Brightness.light,
    );
    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: AppColors.cream,
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.cream,
        foregroundColor: AppColors.ink,
        elevation: 0,
        centerTitle: true,
      ),
      navigationBarTheme: NavigationBarThemeData(
        indicatorColor: AppColors.greenLight,
        backgroundColor: Colors.white,
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: AppColors.green,
            );
          }
          return const TextStyle(fontSize: 12);
        }),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.green,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.green,
          side: const BorderSide(color: AppColors.green),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
    );
  }

  static ThemeData dark() {
    final scheme = ColorScheme.fromSeed(
      seedColor: AppColors.greenSoft,
      primary: AppColors.greenSoft,
      secondary: AppColors.goldSoft,
      brightness: Brightness.dark,
    );
    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      appBarTheme: const AppBarTheme(
        elevation: 0,
        centerTitle: true,
      ),
      navigationBarTheme: NavigationBarThemeData(
        indicatorColor: AppColors.green.withValues(alpha: 0.4),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: AppColors.goldSoft,
            );
          }
          return const TextStyle(fontSize: 12);
        }),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.greenSoft,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
    );
  }
}
