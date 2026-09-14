import 'dart:convert';
import 'dart:ui';

import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/services.dart';

/// Поддерживаемые локали Quran Plus (7 шт.).
///
/// WHY: prefs `locale_code` = [Locale.toString] (`ru`, `uz_Cyrl`, …).
/// WHY: два узбекских варианта — Latin (`uz`) и Cyrillic (`uz_Cyrl`) — отдельные ряды,
/// не объединять. Файл переводов: `uz_Cyrl.json` (underscore), не `uz-Cyrl.json`.
/// WHY: `ar` — RTL; Flutter сам переключает Directionality через MaterialApp.locale.
class AppLocales {
  AppLocales._();

  static const Locale ru = Locale('ru');
  static const Locale en = Locale('en');
  static const Locale ar = Locale('ar');
  static const Locale tg = Locale('tg');
  static const Locale uz = Locale('uz');

  /// Cyrillic Uzbek. toString → `uz_Cyrl` (скрипт, не country).
  /// WHY: Locale.fromSubtags(scriptCode), не Locale('uz','Cyrl') как country.
  static final Locale uzCyrl =
      Locale.fromSubtags(languageCode: 'uz', scriptCode: 'Cyrl');

  static const Locale tr = Locale('tr');

  /// Все 7 локалей для EasyLocalization.supportedLocales.
  static final List<Locale> supported = [
    ru,
    en,
    ar,
    tg,
    uz,
    uzCyrl,
    tr,
  ];

  static const Locale fallback = ru;

  /// Нативные названия для пикера (не переводятся).
  static String nativeName(Locale locale) {
    final code = locale.toString();
    return switch (code) {
      'ru' => 'Русский',
      'en' => 'English',
      'ar' => 'العربية',
      'tg' => 'Тоҷикӣ',
      'uz' => 'Oʻzbekcha',
      'uz_Cyrl' => 'Ўзбекча',
      'tr' => 'Türkçe',
      _ => code,
    };
  }

  /// Парсит prefs `locale_code` → Locale.
  /// WHY: `uz_Cyrl` → fromSubtags(scriptCode: Cyrl), не Locale('uz','Cyrl') country.
  static Locale parse(String? code) {
    if (code == null || code.isEmpty) return fallback;
    switch (code) {
      case 'ru':
        return ru;
      case 'en':
        return en;
      case 'ar':
        return ar;
      case 'tg':
        return tg;
      case 'uz':
        return uz;
      case 'uz_Cyrl':
        return uzCyrl;
      case 'tr':
        return tr;
      default:
        return fallback;
    }
  }

  /// Код для prefs: всегда [Locale.toString] (`uz_Cyrl`, не `uz-Cyrl`).
  static String codeOf(Locale locale) => locale.toString();
}

/// AssetLoader с underscore-разделителем.
///
/// WHY: RootBundleAssetLoader по умолчанию использует separator "-" → `uz-Cyrl.json`,
/// а CODE/QP Перевод фиксирует имя файла `uz_Cyrl.json` (underscore).
class UnderscoreAssetLoader extends AssetLoader {
  const UnderscoreAssetLoader();

  @override
  Future<Map<String, dynamic>?> load(String path, Locale locale) async {
    final localePath =
        '$path/${locale.toStringWithSeparator(separator: "_")}.json';
    return json.decode(await rootBundle.loadString(localePath))
        as Map<String, dynamic>?;
  }
}
