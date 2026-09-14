import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../auth/data/auth_repository.dart';
import '../../auth/domain/auth_state.dart';

/// Профиль: гость/юзер, выход, ярлыки настроек/избранного/поиска.
class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authStateProvider);
    final name = auth.isGuest
        ? 'profile_guest'.tr()
        : (auth.displayName ?? auth.email ?? '—');

    return Scaffold(
      appBar: AppBar(title: Text('profile_title'.tr())),
      body: ListView(
        children: [
          const SizedBox(height: 16),
          CircleAvatar(
            radius: 40,
            child: Icon(
              auth.isAuthenticated ? Icons.person : Icons.person_outline,
              size: 40,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            name,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.titleLarge,
          ),
          if (auth.email != null && auth.isAuthenticated)
            Text(
              auth.email!,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodySmall,
            ),
          if (auth.role != null && auth.isAuthenticated)
            Padding(
              padding: const EdgeInsetsDirectional.only(top: 4),
              child: Text(
                '${'profile_role'.tr()}: ${auth.role}',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.labelMedium,
              ),
            ),
          const SizedBox(height: 24),
          ListTile(
            leading: const Icon(Icons.settings_outlined),
            title: Text('profile_settings'.tr()),
            onTap: () => context.push('/settings'),
          ),
          ListTile(
            leading: const Icon(Icons.favorite_outline),
            title: Text('profile_favorites'.tr()),
            onTap: () => context.push('/favorites'),
          ),
          ListTile(
            leading: const Icon(Icons.download_outlined),
            title: Text('profile_downloads'.tr()),
            onTap: () => context.push('/downloads'),
          ),
          ListTile(
            leading: const Icon(Icons.search),
            title: Text('profile_search'.tr()),
            onTap: () => context.push('/search'),
          ),
          const Divider(),
          if (auth.status == AuthStatus.authenticated)
            ListTile(
              leading: const Icon(Icons.logout),
              title: Text('profile_logout'.tr()),
              onTap: () async {
                await ref.read(authStateProvider.notifier).logout();
                if (context.mounted) context.go('/login');
              },
            )
          else
            ListTile(
              leading: const Icon(Icons.login),
              title: Text('profile_login'.tr()),
              onTap: () => context.push('/login'),
            ),
        ],
      ),
    );
  }
}
