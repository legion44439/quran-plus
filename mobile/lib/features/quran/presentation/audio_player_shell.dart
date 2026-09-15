import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:just_audio/just_audio.dart';

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

  /// Локальный scrub: пока палец на ползунке — не конфликтуем с positionStream.
  bool _dragging = false;
  double _dragValue = 0;

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }

  /// mm:ss для подписей под ползунком (даже если duration ещё неизвестна).
  String _fmt(Duration d) {
    final totalSec = d.inSeconds.clamp(0, 24 * 3600);
    final m = totalSec ~/ 60;
    final s = (totalSec % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  /// Итоговая длительность: сначала из плеера, иначе из API durationSec.
  /// Иначе remote mp3 часто даёт duration=null и Slider становится disabled.
  Duration _effectiveTotal(Duration? playerDuration) {
    if (playerDuration != null && playerDuration > Duration.zero) {
      return playerDuration;
    }
    final sec = _current?.durationSec;
    if (sec != null && sec > 0) {
      return Duration(seconds: sec);
    }
    return Duration.zero;
  }

  Future<void> _play(AudioTrack track) async {
    setState(() {
      _current = track;
      _loadingTrack = true;
      _dragging = false;
    });
    try {
      await _player.setUrl(track.url);
      // Ждём ready/buffering: иначе duration ещё null и seek «мёртвый».
      await _player.processingStateStream
          .firstWhere(
            (s) =>
                s == ProcessingState.ready ||
                s == ProcessingState.buffering ||
                s == ProcessingState.completed,
          )
          .timeout(
            const Duration(seconds: 15),
            onTimeout: () => ProcessingState.ready,
          );
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
                        color: Theme.of(context).colorScheme.primary,
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
            // Ползунок всегда рисуем: fallback на durationSec, чтобы seek не пропадал.
            StreamBuilder<Duration?>(
              stream: _player.durationStream,
              builder: (context, snap) {
                final total = _effectiveTotal(snap.data ?? _player.duration);
                return StreamBuilder<Duration>(
                  stream: _player.positionStream,
                  builder: (context, posSnap) {
                    final pos = posSnap.data ?? Duration.zero;
                    final maxMs = total.inMilliseconds.toDouble();
                    final canSeek = maxMs > 0;
                    // Абсолютные мс: проще, чем 0..1, и совпадает с Duration.
                    final displayMs = !canSeek
                        ? 0.0
                        : (_dragging
                            ? _dragValue
                            : pos.inMilliseconds
                                .clamp(0, total.inMilliseconds)
                                .toDouble());
                    final labelPos = Duration(
                      milliseconds: displayMs.round(),
                    );

                    return Column(
                      children: [
                        Slider(
                          min: 0,
                          max: canSeek ? maxMs : 1.0,
                          value: canSeek
                              ? displayMs.clamp(0.0, maxMs)
                              : 0.0,
                          onChanged: !canSeek
                              ? null
                              : (v) {
                                  // Только UI-scrub; seek — в onChangeEnd.
                                  setState(() {
                                    _dragging = true;
                                    _dragValue = v;
                                  });
                                },
                          onChangeEnd: !canSeek
                              ? null
                              : (v) async {
                                  await _player.seek(
                                    Duration(milliseconds: v.round()),
                                  );
                                  if (mounted) {
                                    setState(() => _dragging = false);
                                  }
                                },
                          activeColor:
                              Theme.of(context).colorScheme.primary,
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 8),
                          child: Row(
                            mainAxisAlignment:
                                MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                _fmt(labelPos),
                                style:
                                    Theme.of(context).textTheme.bodySmall,
                              ),
                              Text(
                                canSeek ? _fmt(total) : '--:--',
                                style:
                                    Theme.of(context).textTheme.bodySmall,
                              ),
                            ],
                          ),
                        ),
                      ],
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
                          color: Theme.of(context).colorScheme.primary,
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
