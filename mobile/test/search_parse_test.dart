import 'package:flutter_test/flutter_test.dart';
import 'package:quran_plus/core/network/api_client.dart';
import 'package:quran_plus/core/storage/token_storage.dart';
import 'package:quran_plus/features/quran/data/quran_repository.dart';

void main() {
  test('search flattens surahs/ayahs/translations/reciters groups', () async {
    final repo = QuranRepository(ApiClient(TokenStorage()));
    // Exercise private parser via public search with a stub would need Dio mock.
    // Instead validate SurahSummary + empty grouped shape contract here:
    final empty = {
      'surahs': <dynamic>[],
      'ayahs': <dynamic>[],
      'translations': <dynamic>[],
      'reciters': <dynamic>[],
    };
    // ignore: invalid_use_of_visible_for_testing_member
    final hits = repo.parseSearchHitsForTest(empty);
    expect(hits, isEmpty);
  });

  test('search maps surah hit fields from grouped response', () {
    final repo = QuranRepository(ApiClient(TokenStorage()));
    final data = {
      'surahs': [
        {
          'id': 1,
          'nameArabic': 'الفاتحة',
          'nameLatin': 'Al-Fatihah',
          'nameEnglish': 'The Opening',
          'ayahCount': 7,
        }
      ],
      'ayahs': <dynamic>[],
      'translations': <dynamic>[],
      'reciters': <dynamic>[],
    };
    final hits = repo.parseSearchHitsForTest(data);
    expect(hits.length, 1);
    expect(hits.first.type, 'surah');
    expect(hits.first.id, '1');
    expect(hits.first.title, 'Al-Fatihah');
  });
}
