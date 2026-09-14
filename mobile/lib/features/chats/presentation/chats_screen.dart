import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/registration_gate.dart';
import '../../auth/data/auth_repository.dart';

class ChatsScreen extends ConsumerWidget {
  const ChatsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authStateProvider);

    return Scaffold(
      appBar: AppBar(title: Text('chats_title'.tr())),
      body: auth.canCompose
          ? EmptyState(
              icon: Icons.forum_outlined,
              message: 'chats_empty'.tr(),
            )
          : const RegistrationGate(),
      floatingActionButton: auth.canCompose
          ? FloatingActionButton(
              onPressed: () {},
              child: const Icon(Icons.edit),
            )
          : null,
    );
  }
}
