import 'dart:ui' as ui;
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/widgets/empty_state.dart';
import '../data/quran_repository.dart';

/// Список сур с API. Пусто до наполнения админом — ок, без хардкода Корана.
class SurahListScreen extends ConsumerWidget {
  const SurahListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final surahs = ref.watch(surahListProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text('quran_title'.tr()),
        actions: [
          IconButton(
            icon: const Icon(Icons.audiotrack_outlined),
            onPressed: () => context.push('/audio'),
            tooltip: 'audio_title'.tr(),
          ),
        ],
      ),
      body: surahs.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => EmptyState(
          icon: Icons.menu_book_outlined,
          message: 'quran_empty'.tr(),
        ),
        data: (list) {
          if (list.isEmpty) {
            return EmptyState(
              icon: Icons.menu_book_outlined,
              message: 'quran_empty'.tr(),
            );
          }
          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(surahListProvider);
              await ref.read(surahListProvider.future);
            },
            child: ListView.builder(
              itemCount: list.length,
              itemBuilder: (context, i) {
                final s = list[i];
                return ListTile(
                  leading: CircleAvatar(child: Text('${s.id}')),
                  title: Text(s.displayTitle),
                  subtitle: Text(
                    [
                      s.nameArabic,
                      if (s.ayahCount > 0) '${s.ayahCount} ayahs',
                      if (s.revelationType != null &&
                          s.revelationType!.isNotEmpty)
                        s.revelationType!,
                    ].join(' · '),
                    textDirection: ui.TextDirection.rtl,
                  ),
                  onTap: () => context.push('/quran/${s.id}'),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
