import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/widgets/empty_state.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('home_title'.tr()),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () => context.push('/search'),
            tooltip: 'search_title'.tr(),
          ),
        ],
      ),
      body: EmptyState(
        icon: Icons.spa_outlined,
        message: 'home_empty'.tr(),
      ),
    );
  }
}
