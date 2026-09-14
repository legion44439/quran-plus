import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers/settings_provider.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);
    final localeCode = ref.watch(localeCodeProvider);

    return Scaffold(
      appBar: AppBar(title: Text('settings_title'.tr())),
      body: ListView(
        children: [
          ListTile(
            title: Text('settings_theme'.tr()),
            subtitle: Text(_themeLabel(themeMode)),
          ),
          Padding(
            padding: const EdgeInsetsDirectional.symmetric(horizontal: 16),
            child: SegmentedButton<ThemeMode>(
              segments: [
                ButtonSegment(
                  value: ThemeMode.light,
                  label: Text('settings_theme_light'.tr()),
                  icon: const Icon(Icons.light_mode),
                ),
                ButtonSegment(
                  value: ThemeMode.dark,
                  label: Text('settings_theme_dark'.tr()),
                  icon: const Icon(Icons.dark_mode),
                ),
                ButtonSegment(
                  value: ThemeMode.system,
                  label: Text('settings_theme_system'.tr()),
                  icon: const Icon(Icons.brightness_auto),
                ),
              ],
              selected: {themeMode},
              onSelectionChanged: (s) {
                ref.read(themeModeProvider.notifier).setMode(s.first);
              },
            ),
          ),
          const SizedBox(height: 24),
          ListTile(
            title: Text('settings_language'.tr()),
            subtitle: Text(localeCode == 'ru' ? 'Русский' : 'English'),
          ),
          Padding(
            padding: const EdgeInsetsDirectional.symmetric(horizontal: 16),
            child: SegmentedButton<String>(
              segments: const [
                ButtonSegment(value: 'ru', label: Text('RU')),
                ButtonSegment(value: 'en', label: Text('EN')),
              ],
              selected: {localeCode},
              onSelectionChanged: (s) async {
                final code = s.first;
                await ref.read(localeCodeProvider.notifier).setLocale(code);
                if (context.mounted) {
                  await context.setLocale(Locale(code));
                }
              },
            ),
          ),
          const SizedBox(height: 16),
          // Arabic / RTL can be added later — layouts use EdgeInsetsDirectional.
        ],
      ),
    );
  }

  String _themeLabel(ThemeMode mode) {
    return switch (mode) {
      ThemeMode.light => 'settings_theme_light'.tr(),
      ThemeMode.dark => 'settings_theme_dark'.tr(),
      ThemeMode.system => 'settings_theme_system'.tr(),
    };
  }
}
