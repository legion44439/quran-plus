import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers/settings_provider.dart';
import '../../../core/theme/app_theme.dart';

/// Настройки: light/dark/system + выбор палитры (доступ из Profile).
class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);
    final localeCode = ref.watch(localeCodeProvider);
    final palette = ref.watch(appPaletteProvider);

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
          // WHY: палитра — цвета Home F; layout не меняется.
          ListTile(
            title: Text('settings_palette'.tr()),
            subtitle: Text(_paletteLabel(palette)),
          ),
          ...AppPalette.values.map((p) {
            final tokens = AppTheme.lightTokens(p);
            final selected = palette == p;
            return ListTile(
              leading: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _Swatch(color: tokens.primary),
                  const SizedBox(width: 4),
                  _Swatch(color: tokens.secondary),
                  const SizedBox(width: 4),
                  _Swatch(color: tokens.surface, border: true),
                ],
              ),
              title: Text(_paletteLabel(p)),
              trailing: selected
                  ? Icon(Icons.check_circle,
                      color: Theme.of(context).colorScheme.primary)
                  : const Icon(Icons.circle_outlined),
              selected: selected,
              onTap: () {
                ref.read(appPaletteProvider.notifier).setPalette(p);
              },
            );
          }),
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

  String _paletteLabel(AppPalette palette) {
    return switch (palette) {
      AppPalette.emerald => 'settings_palette_emerald'.tr(),
      AppPalette.sapphire => 'settings_palette_sapphire'.tr(),
      AppPalette.charcoalCopper => 'settings_palette_charcoal_copper'.tr(),
      AppPalette.burgundy => 'settings_palette_burgundy'.tr(),
    };
  }
}

class _Swatch extends StatelessWidget {
  const _Swatch({required this.color, this.border = false});

  final Color color;
  final bool border;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 20,
      height: 20,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        border: border
            ? Border.all(color: Colors.black26)
            : null,
      ),
    );
  }
}
