import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';

import '../../../shared/widgets/empty_state.dart';

class FavoritesScreen extends StatelessWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('favorites_title'.tr())),
      body: EmptyState(
        icon: Icons.favorite_border,
        message: 'favorites_empty'.tr(),
      ),
    );
  }
}
