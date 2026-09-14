import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/forgot_password_screen.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/register_screen.dart';
import '../../features/chats/presentation/chats_screen.dart';
import '../../features/downloads/presentation/downloads_screen.dart';
import '../../features/favorites/presentation/favorites_screen.dart';
import '../../features/home/presentation/home_screen.dart';
import '../../features/onboarding/presentation/onboarding_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/quran/presentation/audio_player_shell.dart';
import '../../features/quran/presentation/surah_list_screen.dart';
import '../../features/quran/presentation/surah_reader_screen.dart';
import '../../features/search/presentation/search_screen.dart';
import '../../features/settings/presentation/settings_screen.dart';
import '../../features/shell/presentation/main_shell.dart';
import '../../features/splash/presentation/splash_screen.dart';
import '../../features/video/presentation/video_detail_screen.dart';
import '../../features/video/presentation/video_list_screen.dart';

final _rootKey = GlobalKey<NavigatorState>();

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    navigatorKey: _rootKey,
    initialLocation: '/splash',
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/forgot',
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return MainShell(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/home',
                builder: (context, state) => const HomeScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/quran',
                builder: (context, state) => const SurahListScreen(),
                routes: [
                  GoRoute(
                    path: ':surahId',
                    builder: (context, state) => SurahReaderScreen(
                      surahId: state.pathParameters['surahId']!,
                    ),
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/video',
                builder: (context, state) => const VideoListScreen(),
                routes: [
                  GoRoute(
                    path: ':videoId',
                    builder: (context, state) => VideoDetailScreen(
                      videoId: state.pathParameters['videoId']!,
                    ),
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/chats',
                builder: (context, state) => const ChatsScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/profile',
                builder: (context, state) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),
      GoRoute(
        path: '/settings',
        builder: (context, state) => const SettingsScreen(),
      ),
      GoRoute(
        path: '/favorites',
        builder: (context, state) => const FavoritesScreen(),
      ),
      GoRoute(
        path: '/downloads',
        builder: (context, state) => const DownloadsScreen(),
      ),
      GoRoute(
        path: '/search',
        builder: (context, state) => const SearchScreen(),
      ),
      GoRoute(
        path: '/audio',
        builder: (context, state) => const AudioPlayerShell(),
      ),
    ],
  );
});
