import 'package:flutter/material.dart';

/// Палитры приложения (выбор в Settings, SharedPreferences).
/// WHY: один layout Home F — меняются только цвета ThemeData/ColorScheme.
enum AppPalette {
  emerald,
  sapphire,
  charcoalCopper,
  burgundy,
}

/// Токены одной палитры для light/dark ColorScheme.
/// WHY: primary/secondary/surface/ink/indicator — единый источник для M3.
class PaletteTokens {
  const PaletteTokens({
    required this.primary,
    required this.secondary,
    required this.surface,
    required this.ink,
    required this.indicator,
  });

  final Color primary;
  final Color secondary;
  final Color surface;
  final Color ink;
  final Color indicator;
}

/// Legacy emerald константы — совместимость со splash/onboarding.
/// WHY: не ломаем старые экраны; новые UI берут ColorScheme.primary.
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

/// Сборка ThemeData из выбранной палитры (Material 3).
class AppTheme {
  AppTheme._();

  /// Токены светлой темы по палитре.
  /// WHY: Emerald = текущий зелёный+золото; остальные — UX-HOME-F.md.
  static PaletteTokens lightTokens(AppPalette palette) {
    switch (palette) {
      case AppPalette.emerald:
        return const PaletteTokens(
          primary: AppColors.green,
          secondary: AppColors.gold,
          surface: AppColors.cream,
          ink: AppColors.ink,
          indicator: AppColors.greenLight,
        );
      case AppPalette.sapphire:
        // Deep navy + gold (советник).
        return const PaletteTokens(
          primary: Color(0xFF1A365D),
          secondary: Color(0xFFC9A227),
          surface: Color(0xFFF0F4F8),
          ink: Color(0xFF0F172A),
          indicator: Color(0xFFBEE3F8),
        );
      case AppPalette.charcoalCopper:
        // Near-black + warm copper; светлый вариант с тёплыми поверхностями.
        return const PaletteTokens(
          primary: Color(0xFF2D2A26),
          secondary: Color(0xFFB87333),
          surface: Color(0xFFF5F0EB),
          ink: Color(0xFF1A1614),
          indicator: Color(0xFFE8D5C4),
        );
      case AppPalette.burgundy:
        // Deep maroon/plum + soft gold + warm cream.
        return const PaletteTokens(
          primary: Color(0xFF6B2D3C),
          secondary: Color(0xFFC9A227),
          surface: Color(0xFFFAF6F0),
          ink: Color(0xFF3D1A24),
          indicator: Color(0xFFF0D6DE),
        );
    }
  }

  /// Токены тёмной темы по палитре.
  static PaletteTokens darkTokens(AppPalette palette) {
    switch (palette) {
      case AppPalette.emerald:
        return const PaletteTokens(
          primary: AppColors.greenSoft,
          secondary: AppColors.goldSoft,
          surface: Color(0xFF121A16),
          ink: Color(0xFFE8F5E9),
          indicator: Color(0x662D6A4F),
        );
      case AppPalette.sapphire:
        return const PaletteTokens(
          primary: Color(0xFF63B3ED),
          secondary: Color(0xFFE8D48B),
          surface: Color(0xFF0B1220),
          ink: Color(0xFFE2E8F0),
          indicator: Color(0x661A365D),
        );
      case AppPalette.charcoalCopper:
        // Charcoal особенно силён в dark.
        return const PaletteTokens(
          primary: Color(0xFFD4926A),
          secondary: Color(0xFFB87333),
          surface: Color(0xFF12100E),
          ink: Color(0xFFF5EDE6),
          indicator: Color(0x66B87333),
        );
      case AppPalette.burgundy:
        return const PaletteTokens(
          primary: Color(0xFFC47A8A),
          secondary: Color(0xFFE8D48B),
          surface: Color(0xFF1A1014),
          ink: Color(0xFFF5E8EC),
          indicator: Color(0x666B2D3C),
        );
    }
  }

  static ThemeData light(AppPalette palette) {
    final t = lightTokens(palette);
    final scheme = ColorScheme.fromSeed(
      seedColor: t.primary,
      primary: t.primary,
      secondary: t.secondary,
      surface: t.surface,
      brightness: Brightness.light,
    ).copyWith(
      onPrimary: Colors.white,
      onSecondary: t.ink,
      onSurface: t.ink,
    );
    return _build(scheme: scheme, tokens: t, brightness: Brightness.light);
  }

  static ThemeData dark(AppPalette palette) {
    final t = darkTokens(palette);
    final scheme = ColorScheme.fromSeed(
      seedColor: t.primary,
      primary: t.primary,
      secondary: t.secondary,
      surface: t.surface,
      brightness: Brightness.dark,
    ).copyWith(
      onPrimary: Colors.white,
      onSecondary: t.ink,
      onSurface: t.ink,
    );
    return _build(scheme: scheme, tokens: t, brightness: Brightness.dark);
  }

  static ThemeData _build({
    required ColorScheme scheme,
    required PaletteTokens tokens,
    required Brightness brightness,
  }) {
    final isLight = brightness == Brightness.light;
    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: tokens.surface,
      appBarTheme: AppBarTheme(
        backgroundColor: tokens.surface,
        foregroundColor: tokens.ink,
        elevation: 0,
        centerTitle: true,
      ),
      navigationBarTheme: NavigationBarThemeData(
        indicatorColor: tokens.indicator,
        backgroundColor: isLight ? Colors.white : tokens.surface,
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: isLight ? tokens.primary : tokens.secondary,
            );
          }
          return const TextStyle(fontSize: 12);
        }),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: tokens.primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: tokens.primary,
          side: BorderSide(color: tokens.primary),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
    );
  }
}
