import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:just_audio/just_audio.dart';

import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/empty_state.dart';
import '../data/quran_repository.dart';

/// Оболочка плеера: список треков с /audio и управление just_audio.
class AudioPlayerShell extends ConsumerStatefulWidget {
  const AudioPlayerShell({super.key});

  @override
  ConsumerState<AudioPlayerShell> createState() => _AudioPlayerShellState();
}

class _AudioPlayerShellState extends ConsumerState<AudioPlayerShell> {
  final AudioPlayer _player = AudioPlayer();
  AudioTrack? _current;
  bool _loadingTrack = false;

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }

  Future<void> _play(AudioTrack track) async {
    setState(() {
      _current = track;
      _loadingTrack = true;
    });
    try {
      await _player.setUrl(track.url);
      await _player.play();
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('audio_play_error'.tr())),
        );
      }
    } finally {
      if (mounted) setState(() => _loadingTrack = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final tracks = ref.watch(audioListProvider);

    return Scaffold(
      appBar: AppBar(title: Text('audio_title'.tr())),
      body: tracks.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => EmptyState(
          icon: Icons.music_off_outlined,
          message: 'audio_empty'.tr(),
        ),
        data: (list) {
          if (list.isEmpty) {
            return EmptyState(
              icon: Icons.music_off_outlined,
              message: 'audio_empty'.tr(),
            );
          }
          return Column(
            children: [
              Expanded(
                child: ListView.builder(
                  itemCount: list.length,
                  itemBuilder: (context, i) {
                    final t = list[i];
                    final selected = _current?.id == t.id;
                    return ListTile(
                      selected: selected,
                      leading: Icon(
                        selected ? Icons.equalizer : Icons.audiotrack,
                        color: AppColors.green,
                      ),
                      title: Text(
                        t.title?.isNotEmpty == true
                            ? t.title!
                            : (t.reciterName ?? 'Track ${i + 1}'),
                      ),
                      subtitle: Text(
                        [
                          if (t.reciterName != null) t.reciterName!,
                          if (t.surahId != null) 'Surah ${t.surahId}',
                        ].join(' · '),
                      ),
                      onTap: () => _play(t),
                    );
                  },
                ),
              ),
              if (_current != null) _buildControls(),
            ],
          );
        },
      ),
    );
  }

  Widget _buildControls() {
    return Material(
      elevation: 8,
      color: Theme.of(context).colorScheme.surface,
      child: Padding(
        padding: const EdgeInsetsDirectional.fromSTEB(16, 12, 16, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              _current!.title ?? _current!.reciterName ?? 'audio_title'.tr(),
              style: Theme.of(context).textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
            StreamBuilder<Duration?>(
              stream: _player.durationStream,
              builder: (context, snap) {
                final total = snap.data ?? Duration.zero;
                return StreamBuilder<Duration>(
                  stream: _player.positionStream,
                  builder: (context, posSnap) {
                    final pos = posSnap.data ?? Duration.zero;
                    final maxMs = total.inMilliseconds.toDouble();
                    final value = maxMs <= 0
                        ? 0.0
                        : pos.inMilliseconds.clamp(0, total.inMilliseconds) /
                            maxMs;
                    return Slider(
                      value: value,
                      onChanged: maxMs <= 0
                          ? null
                          : (v) {
                              _player.seek(
                                Duration(
                                  milliseconds: (v * maxMs).round(),
                                ),
                              );
                            },
                      activeColor: AppColors.green,
                    );
                  },
                );
              },
            ),
            StreamBuilder<PlayerState>(
              stream: _player.playerStateStream,
              builder: (context, snap) {
                final playing = snap.data?.playing ?? false;
                return Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (_loadingTrack)
                      const SizedBox(
                        width: 48,
                        height: 48,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    else
                      IconButton(
                        iconSize: 56,
                        onPressed: () {
                          if (playing) {
                            _player.pause();
                          } else {
                            _player.play();
                          }
                        },
                        icon: Icon(
                          playing
                              ? Icons.pause_circle_filled
                              : Icons.play_circle_filled,
                          color: AppColors.green,
                        ),
                      ),
                    IconButton(
                      iconSize: 36,
                      onPressed: () => _player.stop(),
                      icon: const Icon(Icons.stop),
                    ),
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
