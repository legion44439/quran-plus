import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';

/// Surah list item from NestJS (`nameArabic` / `nameLatin` / …).
class SurahSummary {
  const SurahSummary({
    required this.id,
    required this.nameArabic,
    required this.nameLatin,
    this.nameEnglish,
    this.ayahCount = 0,
    this.revelationType,
  });

  final int id;
  final String nameArabic;
  final String nameLatin;
  final String? nameEnglish;
  final int ayahCount;
  final String? revelationType;

  String get displayTitle {
    if (nameEnglish != null && nameEnglish!.isNotEmpty) {
      return '$nameLatin · $nameEnglish';
    }
    return nameLatin;
  }

  factory SurahSummary.fromJson(Map<String, dynamic> m) {
    return SurahSummary(
      id: (m['id'] as num?)?.toInt() ?? 0,
      nameArabic: m['nameArabic']?.toString() ?? '',
      nameLatin: m['nameLatin']?.toString() ?? '',
      nameEnglish: m['nameEnglish']?.toString(),
      ayahCount: (m['ayahCount'] as num?)?.toInt() ?? 0,
      revelationType: m['revelationType']?.toString(),
    );
  }
}

class AyahItem {
  const AyahItem({
    required this.id,
    required this.number,
    required this.textArabic,
    this.translation,
  });

  final String id;
  final int number;
  final String textArabic;
  final String? translation;

  factory AyahItem.fromJson(Map<String, dynamic> m) {
    String? translation;
    final translations = m['translations'];
    if (translations is List && translations.isNotEmpty) {
      final first = translations.first;
      if (first is Map) {
        translation = first['text']?.toString();
      }
    }
    translation ??= m['translation']?.toString();
    return AyahItem(
      id: m['id']?.toString() ?? '',
      number: (m['number'] as num?)?.toInt() ?? 0,
      textArabic: m['textArabic']?.toString() ?? '',
      translation: translation,
    );
  }
}

class SurahDetail {
  const SurahDetail({
    required this.surah,
    required this.ayahs,
  });

  final SurahSummary surah;
  final List<AyahItem> ayahs;
}

class AudioTrack {
  const AudioTrack({
    required this.id,
    required this.url,
    this.title,
    this.durationSec,
    this.reciterName,
    this.surahId,
  });

  final String id;
  final String url;
  final String? title;
  final int? durationSec;
  final String? reciterName;
  final int? surahId;

  factory AudioTrack.fromJson(Map<String, dynamic> m) {
    String? reciterName;
    final reciter = m['reciter'];
    if (reciter is Map) {
      reciterName = reciter['name']?.toString();
    }
    return AudioTrack(
      id: m['id']?.toString() ?? '',
      url: m['url']?.toString() ?? '',
      title: m['title']?.toString(),
      durationSec: (m['durationSec'] as num?)?.toInt(),
      reciterName: reciterName,
      surahId: (m['surahId'] as num?)?.toInt(),
    );
  }
}

class SearchHit {
  const SearchHit({
    required this.type,
    required this.id,
    required this.title,
    this.subtitle,
  });

  final String type;
  final String id;
  final String title;
  final String? subtitle;
}

final quranRepositoryProvider = Provider<QuranRepository>((ref) {
  return QuranRepository(ref.watch(apiClientProvider));
});

final surahListProvider = FutureProvider<List<SurahSummary>>((ref) async {
  return ref.watch(quranRepositoryProvider).fetchSurahs();
});

final surahDetailProvider =
    FutureProvider.family<SurahDetail?, int>((ref, id) async {
  return ref.watch(quranRepositoryProvider).fetchSurah(id);
});

final audioListProvider = FutureProvider<List<AudioTrack>>((ref) async {
  return ref.watch(quranRepositoryProvider).fetchAudio();
});

class QuranRepository {
  QuranRepository(this._api);

  final ApiClient _api;

  Future<List<SurahSummary>> fetchSurahs() async {
    try {
      final response = await _api.dio.get('/surahs');
      final data = response.data;
      if (data is! List) return const [];
      return data
          .whereType<Map>()
          .map((e) => SurahSummary.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    } catch (_) {
      return const [];
    }
  }

  Future<SurahDetail?> fetchSurah(int id) async {
    try {
      final response = await _api.dio.get('/surahs/$id');
      final data = response.data;
      if (data is! Map) return null;
      final map = Map<String, dynamic>.from(data);
      final surah = SurahSummary.fromJson(map);
      final ayahsRaw = map['ayahs'];
      List<AyahItem> nestedAyahs = [];
      if (ayahsRaw is List) {
        nestedAyahs = ayahsRaw
            .whereType<Map>()
            .map((e) => AyahItem.fromJson(Map<String, dynamic>.from(e)))
            .toList();
      }
      // Nested /surahs/:id ayahs often omit translations; /ayahs is richer.
      final fromAyahs = await fetchAyahs(surahId: id);
      final ayahs = preferAyahsList(
        nested: nestedAyahs,
        fromAyahsEndpoint: fromAyahs,
      );
      return SurahDetail(surah: surah, ayahs: ayahs);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) return null;
      // Fallback: try ayahs list by surahId.
      try {
        final ayahs = await fetchAyahs(surahId: id);
        return SurahDetail(
          surah: SurahSummary(
            id: id,
            nameArabic: '',
            nameLatin: 'Surah $id',
          ),
          ayahs: ayahs,
        );
      } catch (_) {
        return null;
      }
    } catch (_) {
      return null;
    }
  }

  /// Prefer /ayahs payload when non-empty (includes translations); nested is fallback.
  /// Visible for unit tests.
  List<AyahItem> preferAyahsList({
    required List<AyahItem> nested,
    required List<AyahItem> fromAyahsEndpoint,
  }) {
    if (fromAyahsEndpoint.isNotEmpty) return fromAyahsEndpoint;
    return nested;
  }

    Future<List<AyahItem>> fetchAyahs({int? surahId}) async {
    try {
      final response = await _api.dio.get(
        '/ayahs',
        queryParameters: {
          if (surahId != null) 'surahId': surahId,
        },
      );
      final data = response.data;
      if (data is! List) return const [];
      return data
          .whereType<Map>()
          .map((e) => AyahItem.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    } catch (_) {
      return const [];
    }
  }

  Future<List<AudioTrack>> fetchAudio({String? reciterId, int? surahId}) async {
    try {
      final response = await _api.dio.get(
        '/audio',
        queryParameters: {
          if (reciterId != null) 'reciterId': reciterId,
          if (surahId != null) 'surahId': surahId,
        },
      );
      final data = response.data;
      if (data is! List) return const [];
      return data
          .whereType<Map>()
          .map((e) => AudioTrack.fromJson(Map<String, dynamic>.from(e)))
          .where((t) => t.url.isNotEmpty)
          .toList();
    } catch (_) {
      return const [];
    }
  }

  /// Hits GET /search. Empty groups = no hits; still tolerant of 404/501.
  Future<List<SearchHit>> search(String query) async {
    final q = query.trim();
    if (q.isEmpty) return const [];
    try {
      final response = await _api.dio.get(
        '/search',
        queryParameters: {'q': q},
      );
      return _parseSearchHits(response.data);
    } on DioException catch (e) {
      final code = e.response?.statusCode;
      if (code == 404 || code == 501) {
        return const [];
      }
      return const [];
    } catch (_) {
      return const [];
    }
  }

  /// Visible for unit tests — flattens live GET /search shape.
  List<SearchHit> parseSearchHitsForTest(dynamic data) => _parseSearchHits(data);

  List<SearchHit> _parseSearchHits(dynamic data) {
    if (data == null) return const [];

    // NestJS search returns { surahs, ayahs, translations, reciters }.
    if (data is Map) {
      final hits = <SearchHit>[];
      final surahs = data['surahs'];
      if (surahs is List) {
        for (final raw in surahs.whereType<Map>()) {
          final m = Map<String, dynamic>.from(raw);
          hits.add(SearchHit(
            type: 'surah',
            id: m['id']?.toString() ?? '',
            title: m['nameLatin']?.toString() ??
                m['nameEnglish']?.toString() ??
                '',
            subtitle: m['nameArabic']?.toString(),
          ));
        }
      }
      final ayahs = data['ayahs'];
      if (ayahs is List) {
        for (final raw in ayahs.whereType<Map>()) {
          final m = Map<String, dynamic>.from(raw);
          final surah = m['surah'];
          String? surahName;
          if (surah is Map) {
            surahName = surah['nameLatin']?.toString();
          }
          final surahId = m['surahId']?.toString() ?? '';
          hits.add(SearchHit(
            type: 'ayah',
            id: surahId.isNotEmpty ? surahId : (m['id']?.toString() ?? ''),
            title: m['textArabic']?.toString() ?? '',
            subtitle: [
              if (surahName != null) surahName,
              if (m['number'] != null) 'ayah ${m['number']}',
            ].join(' · '),
          ));
        }
      }
      final translations = data['translations'];
      if (translations is List) {
        for (final raw in translations.whereType<Map>()) {
          final m = Map<String, dynamic>.from(raw);
          final ayah = m['ayah'];
          String? surahId;
          if (ayah is Map) {
            surahId = ayah['surahId']?.toString();
          }
          hits.add(SearchHit(
            type: 'translation',
            id: surahId ?? m['ayahId']?.toString() ?? m['id']?.toString() ?? '',
            title: m['text']?.toString() ?? '',
            subtitle: m['language']?.toString(),
          ));
        }
      }
      final reciters = data['reciters'];
      if (reciters is List) {
        for (final raw in reciters.whereType<Map>()) {
          final m = Map<String, dynamic>.from(raw);
          hits.add(SearchHit(
            type: 'reciter',
            id: m['id']?.toString() ?? '',
            title: m['name']?.toString() ?? '',
            subtitle: m['nameArabic']?.toString(),
          ));
        }
      }
      if (hits.isNotEmpty) return hits;

      // Fallback flat shapes
      final results = data['results'] ?? data['items'] ?? data['data'];
      if (results is List) {
        return _parseFlatHits(results);
      }
      return const [];
    }

    if (data is List) return _parseFlatHits(data);
    return const [];
  }

  List<SearchHit> _parseFlatHits(List<dynamic> items) {
    return items.whereType<Map>().map((raw) {
      final m = Map<String, dynamic>.from(raw);
      final type = m['type']?.toString() ??
          m['kind']?.toString() ??
          'result';
      final id = m['id']?.toString() ?? '';
      final title = m['title']?.toString() ??
          m['nameLatin']?.toString() ??
          m['name']?.toString() ??
          m['textArabic']?.toString() ??
          id;
      final subtitle = m['subtitle']?.toString() ??
          m['nameArabic']?.toString() ??
          m['snippet']?.toString();
      return SearchHit(
        type: type,
        id: id,
        title: title,
        subtitle: subtitle,
      );
    }).toList();
  }
}
