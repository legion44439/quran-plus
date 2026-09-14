import 'dart:ui' as ui;
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/widgets/empty_state.dart';
import '../data/quran_repository.dart';

class SurahReaderScreen extends ConsumerWidget {
  const SurahReaderScreen({super.key, required this.surahId});

  final String surahId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final id = int.tryParse(surahId) ?? 0;
    final detail = ref.watch(surahDetailProvider(id));

    return Scaffold(
      appBar: AppBar(
        title: Text(
          detail.maybeWhen(
            data: (d) => d?.surah.nameLatin.isNotEmpty == true
                ? d!.surah.nameLatin
                : '${'surah_reader_title'.tr()} · $surahId',
            orElse: () => '${'surah_reader_title'.tr()} · $surahId',
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
