import 'dart:ui' as ui;
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/providers/settings_provider.dart';
import '../../../shared/widgets/empty_state.dart';
import '../data/quran_repository.dart';

/// Чтение суры: арабский текст + перевод (репозиторий тянет /ayahs).
/// WHY: при открытии сохраняем last_surah_id для Home «Continue reading».
class SurahReaderScreen extends ConsumerStatefulWidget {
  const SurahReaderScreen({super.key, required this.surahId});

  final String surahId;

  @override
  ConsumerState<SurahReaderScreen> createState() => _SurahReaderScreenState();
}

class _SurahReaderScreenState extends ConsumerState<SurahReaderScreen> {
  @override
  void initState() {
    super.initState();
    final id = int.tryParse(widget.surahId);
    if (id != null && id > 0) {
      // После первого кадра — prefs async, не блокируем build.
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(lastReadingProvider.notifier).save(surahId: id);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final id = int.tryParse(widget.surahId) ?? 0;
    final detail = ref.watch(surahDetailProvider(id));

    return Scaffold(
      appBar: AppBar(
        title: Text(
          detail.maybeWhen(
            data: (d) => d?.surah.nameLatin.isNotEmpty == true
                ? d!.surah.nameLatin
                : '${'surah_reader_title'.tr()} · ${widget.surahId}',
            orElse: () =>
                '${'surah_reader_title'.tr()} · ${widget.surahId}',
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.play_arrow),
            onPressed: () => context.push('/audio'),
          ),
        ],
      ),
      body: detail.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => EmptyState(
          icon: Icons.article_outlined,
          message: 'surah_reader_empty'.tr(),
        ),
        data: (d) {
          if (d == null || d.ayahs.isEmpty) {
            return EmptyState(
              icon: Icons.article_outlined,
              message: 'surah_reader_empty'.tr(),
            );
          }
          return ListView.separated(
            padding: const EdgeInsetsDirectional.all(16),
            itemCount: d.ayahs.length,
            separatorBuilder: (_, __) => const Divider(height: 24),
            itemBuilder: (context, i) {
              final a = d.ayahs[i];
              return Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Align(
                    alignment: AlignmentDirectional.centerStart,
                    child: Chip(label: Text('${a.number}')),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    a.textArabic,
                    textAlign: TextAlign.right,
                    textDirection: ui.TextDirection.rtl,
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          height: 1.8,
                        ),
                  ),
                  if (a.translation != null && a.translation!.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Text(
                      a.translation!,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ],
              );
            },
          );
        },
      ),
    );
  }
}
