import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../theme/app_theme.dart';

final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('Override in main()');
});

final themeModeProvider =
    StateNotifierProvider<ThemeModeNotifier, ThemeMode>((ref) {
  return ThemeModeNotifier(ref.watch(sharedPreferencesProvider));
});

class ThemeModeNotifier extends StateNotifier<ThemeMode> {
  ThemeModeNotifier(this._prefs) : super(_read(_prefs));

  final SharedPreferences _prefs;
  static const _key = 'theme_mode';

  static ThemeMode _read(SharedPreferences prefs) {
    switch (prefs.getString(_key)) {
      case 'light':
        return ThemeMode.light;
      case 'dark':
        return ThemeMode.dark;
      default:
        return ThemeMode.system;
    }
  }

  Future<void> setMode(ThemeMode mode) async {
    state = mode;
    final value = switch (mode) {
      ThemeMode.light => 'light',
      ThemeMode.dark => 'dark',
      ThemeMode.system => 'system',
    };
    await _prefs.setString(_key, value);
  }
}

/// Палитра UI (Emerald по умолчанию). Ключ app_palette.
/// WHY: цвет отдельно от light/dark — layout Home F один на все темы.
final appPaletteProvider =
    StateNotifierProvider<AppPaletteNotifier, AppPalette>((ref) {
  return AppPaletteNotifier(ref.watch(sharedPreferencesProvider));
});

class AppPaletteNotifier extends StateNotifier<AppPalette> {
  AppPaletteNotifier(this._prefs) : super(_read(_prefs));

  final SharedPreferences _prefs;
  static const _key = 'app_palette';

  static AppPalette _read(SharedPreferences prefs) {
    switch (prefs.getString(_key)) {
      case 'sapphire':
        return AppPalette.sapphire;
      case 'charcoalCopper':
        return AppPalette.charcoalCopper;
      case 'burgundy':
        return AppPalette.burgundy;
      case 'emerald':
      default:
        return AppPalette.emerald;
    }
  }

  Future<void> setPalette(AppPalette palette) async {
    state = palette;
    final value = switch (palette) {
      AppPalette.emerald => 'emerald',
      AppPalette.sapphire => 'sapphire',
      AppPalette.charcoalCopper => 'charcoalCopper',
      AppPalette.burgundy => 'burgundy',
    };
    await _prefs.setString(_key, value);
  }
}

final localeCodeProvider =
    StateNotifierProvider<LocaleCodeNotifier, String>((ref) {
  return LocaleCodeNotifier(ref.watch(sharedPreferencesProvider));
});

class LocaleCodeNotifier extends StateNotifier<String> {
  LocaleCodeNotifier(this._prefs) : super(_prefs.getString(_key) ?? 'ru');

  final SharedPreferences _prefs;
  static const _key = 'locale_code';

  Future<void> setLocale(String code) async {
    state = code;
    await _prefs.setString(_key, code);
  }
}

final onboardingDoneProvider =
    StateNotifierProvider<OnboardingDoneNotifier, bool>((ref) {
  return OnboardingDoneNotifier(ref.watch(sharedPreferencesProvider));
});

class OnboardingDoneNotifier extends StateNotifier<bool> {
  OnboardingDoneNotifier(this._prefs)
      : super(_prefs.getBool(_key) ?? false);

  final SharedPreferences _prefs;
  static const _key = 'onboarding_done';

  Future<void> complete() async {
    state = true;
    await _prefs.setBool(_key, true);
  }
}

/// Последняя открытая сура для «Continue reading» на Home F.
/// WHY: прогресс локальный; без истории — первая сура из API.
final lastReadingProvider =
    StateNotifierProvider<LastReadingNotifier, LastReading?>((ref) {
  return LastReadingNotifier(ref.watch(sharedPreferencesProvider));
});

class LastReading {
  const LastReading({required this.surahId, this.ayahNumber});

  final int surahId;
  final int? ayahNumber;
}

class LastReadingNotifier extends StateNotifier<LastReading?> {
  LastReadingNotifier(this._prefs) : super(_read(_prefs));

  final SharedPreferences _prefs;
  static const _surahKey = 'last_surah_id';
  static const _ayahKey = 'last_ayah_number';

  static LastReading? _read(SharedPreferences prefs) {
    final id = prefs.getInt(_surahKey);
    if (id == null || id <= 0) return null;
    return LastReading(
      surahId: id,
      ayahNumber: prefs.getInt(_ayahKey),
    );
  }

  Future<void> save({required int surahId, int? ayahNumber}) async {
    state = LastReading(surahId: surahId, ayahNumber: ayahNumber);
    await _prefs.setInt(_surahKey, surahId);
    if (ayahNumber != null) {
      await _prefs.setInt(_ayahKey, ayahNumber);
    }
  }
}
