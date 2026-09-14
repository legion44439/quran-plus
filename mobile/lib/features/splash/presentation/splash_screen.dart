import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/providers/settings_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../auth/data/auth_repository.dart';
import '../../auth/domain/auth_state.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() {
    super.initState();
    Future<void>.delayed(const Duration(milliseconds: 1200), _navigate);
  }

  void _navigate() {
    if (!mounted) return;
    final onboardingDone = ref.read(onboardingDoneProvider);
    final auth = ref.read(authStateProvider);
    if (!onboardingDone) {
      context.go('/onboarding');
    } else if (auth.status == AuthStatus.authenticated ||
        auth.status == AuthStatus.guest) {
      context.go('/home');
    } else {
      context.go('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.green,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.menu_book_rounded, size: 80, color: AppColors.goldSoft),
            const SizedBox(height: 16),
            Text(
              'app_name'.tr(),
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              'splash_tagline'.tr(),
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.white70,
                  ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
