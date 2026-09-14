import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/providers/settings_provider.dart';
import '../../../core/theme/app_theme.dart';

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  final _controller = PageController();
  int _page = 0;

  static const _pages = [
    (Icons.menu_book_outlined, 'onboarding_1_title', 'onboarding_1_body'),
    (Icons.headphones_outlined, 'onboarding_2_title', 'onboarding_2_body'),
    (Icons.forum_outlined, 'onboarding_3_title', 'onboarding_3_body'),
    (Icons.bookmark_border, 'onboarding_4_title', 'onboarding_4_body'),
  ];

  Future<void> _finish() async {
    await ref.read(onboardingDoneProvider.notifier).complete();
    if (mounted) context.go('/login');
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isLast = _page == _pages.length - 1;
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Align(
              alignment: AlignmentDirectional.centerEnd,
              child: TextButton(
                onPressed: _finish,
                child: Text('onboarding_skip'.tr()),
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: _controller,
                itemCount: _pages.length,
                onPageChanged: (i) => setState(() => _page = i),
                itemBuilder: (context, index) {
                  final p = _pages[index];
                  return Padding(
                    padding: const EdgeInsetsDirectional.symmetric(horizontal: 32),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(p.$1, size: 96, color: AppColors.green),
                        const SizedBox(height: 32),
                        Text(
                          p.$2.tr(),
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: AppColors.ink,
                              ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          p.$3.tr(),
                          style: Theme.of(context).textTheme.bodyLarge,
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                _pages.length,
                (i) => Container(
                  margin: const EdgeInsetsDirectional.symmetric(horizontal: 4),
                  width: i == _page ? 24 : 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: i == _page ? AppColors.green : AppColors.greenLight,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsetsDirectional.all(24),
              child: SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: () {
                    if (isLast) {
                      _finish();
                    } else {
                      _controller.nextPage(
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeOut,
                      );
                    }
                  },
                  child: Text(
                    isLast ? 'onboarding_start'.tr() : 'onboarding_next'.tr(),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
