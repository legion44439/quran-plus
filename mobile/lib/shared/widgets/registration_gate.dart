import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_theme.dart';

/// Shown for guest users on protected actions (chats compose, comments).
class RegistrationGate extends StatelessWidget {
  const RegistrationGate({super.key, this.compact = false});

  final bool compact;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsetsDirectional.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: compact ? MainAxisSize.min : MainAxisSize.max,
        children: [
          const Icon(Icons.lock_outline, size: 48, color: AppColors.gold),
          const SizedBox(height: 12),
          Text(
            'registration_required'.tr(),
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            'registration_required_body'.tr(),
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 20),
          FilledButton(
            onPressed: () => context.push('/login'),
            child: Text('profile_login'.tr()),
          ),
          TextButton(
            onPressed: () => context.push('/register'),
            child: Text('login_to_register'.tr()),
          ),
        ],
      ),
    );
  }
}
