import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:quran_plus/core/config/app_config.dart';
import 'package:quran_plus/core/l10n/app_locales.dart';

void main() {
  test('default API base includes /api on port 4000', () {
    expect(AppConfig.apiBaseUrl, 'http://localhost:4000/api');
  });

  group('AppLocales', () {
    test('supports exactly 7 locales including two Uzbek variants', () {
      expect(AppLocales.supported, hasLength(7));
      final codes = AppLocales.supported.map(AppLocales.codeOf).toList();
      expect(codes, containsAll(['ru', 'en', 'ar', 'tg', 'uz', 'uz_Cyrl', 'tr']));
      expect(codes.where((c) => c.startsWith('uz')).length, 2);
    });

    test('parse uz_Cyrl uses scriptCode, not country', () {
      final locale = AppLocales.parse('uz_Cyrl');
      expect(locale.languageCode, 'uz');
      expect(locale.scriptCode, 'Cyrl');
      expect(locale.countryCode, isNull);
      expect(locale.toString(), 'uz_Cyrl');
    });

    test('parse simple codes and fallback', () {
      expect(AppLocales.parse('ar'), const Locale('ar'));
      expect(AppLocales.parse('tg'), const Locale('tg'));
      expect(AppLocales.parse(null), AppLocales.fallback);
      expect(AppLocales.parse('xx'), AppLocales.fallback);
    });

    test('native names keep two distinct Uzbek labels', () {
      expect(AppLocales.nativeName(AppLocales.uz), 'Oʻzbekcha');
      expect(AppLocales.nativeName(AppLocales.uzCyrl), 'Ўзбекча');
      expect(AppLocales.nativeName(AppLocales.ar), 'العربية');
    });
  });
}
