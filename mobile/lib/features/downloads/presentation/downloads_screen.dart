import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';

import '../../../shared/widgets/empty_state.dart';

class DownloadsScreen extends StatelessWidget {
  const DownloadsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('downloads_title'.tr())),
      body: EmptyState(
        icon: Icons.download_outlined,
        message: 'downloads_empty'.tr(),
      ),
    );
  }
}
