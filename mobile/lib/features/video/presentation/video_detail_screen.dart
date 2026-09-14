import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';

import '../../../shared/widgets/empty_state.dart';

class VideoDetailScreen extends StatelessWidget {
  const VideoDetailScreen({super.key, required this.videoId});

  final String videoId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('${'video_detail_title'.tr()} · $videoId')),
      body: EmptyState(
        icon: Icons.play_circle_outline,
        message: 'video_detail_empty'.tr(),
      ),
    );
  }
}
