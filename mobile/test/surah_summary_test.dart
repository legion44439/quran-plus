import 'package:flutter_test/flutter_test.dart';
import 'package:quran_plus/core/network/api_client.dart';
import 'package:quran_plus/core/storage/token_storage.dart';
import 'package:quran_plus/features/quran/data/quran_repository.dart';

void main() {
  test('SurahSummary maps backend fields (not title/number)', () {
    final s = SurahSummary.fromJson({
      'id': 1,
      'nameArabic': 'الفاتحة',
      'nameLatin': 'Al-Fatihah',
      'nameEnglish': 'The Opening',
      'revelationType': 'Meccan',
      'ayahCount': 7,
    });
    expect(s.id, 1);
    expect(s.nameLatin, 'Al-Fatihah');
    expect(s.nameArabic, 'الفاتحة');
    expect(s.ayahCount, 7);
    expect(s.displayTitle, contains('Al-Fatihah'));
  });

  test('AyahItem maps textArabic and optional translations', () {
    final a = AyahItem.fromJson({
      'id': 'uuid',
      'number': 1,
      'textArabic': 'بِسْمِ',
      'translations': [
        {'language': 'ru', 'text': 'Во имя'},
      ],
    });
    expect(a.number, 1);
    expect(a.textArabic, 'بِسْمِ');
    expect(a.translation, 'Во имя');
  });

  test('preferAyahsList prefers /ayahs with translations over nested', () {
    final repo = QuranRepository(ApiClient(TokenStorage()));
    final nested = [
      AyahItem.fromJson({
        'id': 'n1',
        'number': 1,
        'textArabic': 'بِسْمِ',
      }),
    ];
    final fromAyahs = [
      AyahItem.fromJson({
        'id': 'a1',
        'number': 1,
        'textArabic': 'بِسْمِ',
        'translations': [
          {'language': 'ru', 'text': 'Во имя'},
        ],
      }),
    ];
    final chosen = repo.preferAyahsList(
      nested: nested,
      fromAyahsEndpoint: fromAyahs,
    );
    expect(chosen, same(fromAyahs));
    expect(chosen.first.translation, 'Во имя');

    final fallback = repo.preferAyahsList(
      nested: nested,
      fromAyahsEndpoint: const [],
    );
    expect(fallback, same(nested));
    expect(fallback.first.translation, isNull);
  });
}
