import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/config/app_config.dart';
import '../../../core/providers/settings_provider.dart';
import '../../auth/data/auth_repository.dart';
import '../../auth/domain/auth_state.dart';
import '../../quran/data/quran_repository.dart';

/// Home шаблон F (UX-HOME-F.md): приветствие → Listen today →
/// Continue reading → ряды Quran/Bookmarks/Settings.
/// WHY: без daily ayah / лекций / спонсора; bottom nav без изменений.
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authStateProvider);
    final scheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: Text(AppConfig.appName),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () => context.push('/search'),
            tooltip: 'search_title'.tr(),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsetsDirectional.fromSTEB(16, 8, 16, 24),
        children: [
          _Greeting(auth: auth),
          const SizedBox(height: 20),
          _ListenTodayCard(scheme: scheme),
          const SizedBox(height: 16),
          _ContinueReadingCard(scheme: scheme),
          const SizedBox(height: 24),
          Text(
            'home_quick_links'.tr(),
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  color: scheme.onSurface.withValues(alpha: 0.7),
                ),
          ),
          const SizedBox(height: 8),
          _LinkRow(
            icon: Icons.menu_book_outlined,
            title: 'home_link_quran'.tr(),
            onTap: () => context.go('/quran'),
          ),
          _LinkRow(
            icon: Icons.bookmark_outline,
            title: 'home_link_bookmarks'.tr(),
            onTap: () => context.push('/favorites'),
          ),
          _LinkRow(
            icon: Icons.settings_outlined,
            title: 'home_link_settings'.tr(),
            onTap: () => context.push('/settings'),
          ),
        ],
      ),
    );
  }
}

class _Greeting extends StatelessWidget {
  const _Greeting({required this.auth});

  final AuthState auth;

  @override
  Widget build(BuildContext context) {
    final name = auth.isAuthenticated
        ? (auth.displayName ?? auth.email)
        : null;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'home_greeting_salam'.tr(),
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w600,
              ),
        ),
        const SizedBox(height: 4),
        Text(
          name != null && name.isNotEmpty
              ? 'home_greeting_welcome_named'.tr(namedArgs: {'name': name})
              : 'home_greeting_welcome'.tr(),
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: Theme.of(context)
                    .colorScheme
                    .onSurface
                    .withValues(alpha: 0.75),
              ),
        ),
      ],
    );
  }
}

/// Listen today: первый трек из API или CTA к /audio.
class _ListenTodayCard extends ConsumerWidget {
  const _ListenTodayCard({required this.scheme});

  final ColorScheme scheme;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tracks = ref.watch(audioListProvider);

    return Card(
      elevation: 0,
      color: scheme.primaryContainer.withValues(alpha: 0.45),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => context.push('/audio'),
        child: Padding(
          padding: const EdgeInsetsDirectional.all(16),
          child: Row(
            children: [
              CircleAvatar(
                backgroundColor: scheme.primary,
                child: const Icon(Icons.headphones, color: Colors.white),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: tracks.when(
                  loading: () => Text(
                    'home_listen_today'.tr(),
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  error: (_, __) => Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'home_listen_today'.tr(),
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      Text(
                        'home_listen_empty'.tr(),
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                  data: (list) {
                    if (list.isEmpty) {
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'home_listen_today'.tr(),
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          Text(
                            'home_listen_empty'.tr(),
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ],
                      );
                    }
                    final t = list.first;
                    final title = t.title?.isNotEmpty == true
                        ? t.title!
                        : (t.reciterName ?? 'home_listen_today'.tr());
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'home_listen_today'.tr(),
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        Text(
                          title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    );
                  },
                ),
              ),
              Icon(Icons.play_circle_fill, color: scheme.primary, size: 36),
            ],
          ),
        ),
      ),
    );
  }
}

/// Continue reading: last_surah из prefs → иначе первая сура API → empty.
class _ContinueReadingCard extends ConsumerWidget {
  const _ContinueReadingCard({required this.scheme});

  final ColorScheme scheme;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final last = ref.watch(lastReadingProvider);
    final surahs = ref.watch(surahListProvider);

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: scheme.outlineVariant),
      ),
      child: surahs.when(
        loading: () => const ListTile(
          leading: CircularProgressIndicator(strokeWidth: 2),
          title: Text('…'),
        ),
        error: (_, __) => ListTile(
          leading: Icon(Icons.menu_book, color: scheme.primary),
          title: Text('home_continue_reading'.tr()),
          subtitle: Text('home_continue_empty'.tr()),
        ),
        data: (list) {
          SurahSummary? target;
          if (last != null) {
            for (final s in list) {
              if (s.id == last.surahId) {
                target = s;
                break;
              }
            }
            // История есть, но суры нет в списке — всё равно открываем по id.
            target ??= SurahSummary(
              id: last.surahId,
              nameArabic: '',
              nameLatin: '${'surah_reader_title'.tr()} ${last.surahId}',
            );
          }
          target ??= list.isNotEmpty ? list.first : null;

          if (target == null) {
            return ListTile(
              leading: Icon(Icons.menu_book, color: scheme.primary),
              title: Text('home_continue_reading'.tr()),
              subtitle: Text('home_continue_empty'.tr()),
            );
          }

          final ayahHint = last?.ayahNumber != null
              ? 'home_continue_ayah'
                  .tr(namedArgs: {'n': '${last!.ayahNumber}'})
              : (target.ayahCount > 0
                  ? 'home_continue_ayahs'
                      .tr(namedArgs: {'n': '${target.ayahCount}'})
                  : null);

          return ListTile(
            leading: Icon(Icons.menu_book, color: scheme.primary),
            title: Text('home_continue_reading'.tr()),
            subtitle: Text(
              [
                target.displayTitle,
                if (ayahHint != null) ayahHint,
              ].join(' · '),
            ),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push('/quran/${target!.id}'),
          );
        },
      ),
    );
  }
}

class _LinkRow extends StatelessWidget {
  const _LinkRow({
    required this.icon,
    required this.title,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Icon(icon, color: Theme.of(context).colorScheme.primary),
      title: Text(title),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}
