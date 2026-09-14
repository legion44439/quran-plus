import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/widgets/empty_state.dart';

class VideoListScreen extends StatelessWidget {
  const VideoListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('video_title'.tr())),
      body: EmptyState(
        icon: Icons.videocam_outlined,
        message: 'video_empty'.tr(),
        action: TextButton(
          onPressed: () => context.push('/video/demo'),
          child: Text('continue_label'.tr()),
        ),
      ),
    );
  }
}
