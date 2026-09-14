import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

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
