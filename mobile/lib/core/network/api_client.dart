import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/app_config.dart';
import '../storage/token_storage.dart';
import 'api_exception.dart';

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(ref.watch(tokenStorageProvider));
});

/// Dio client with Bearer auth and one-shot refresh-on-401.
///
/// [AppConfig.apiBaseUrl] already includes `/api`, so call paths like
/// `/auth/login`, `/surahs`, `/users/me`.
class ApiClient {
  ApiClient(this._tokenStorage) {
    _dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.apiBaseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      ),
    );
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _tokenStorage.readAccessToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode != 401 ||
              error.requestOptions.extra['retried'] == true ||
              _isAuthPath(error.requestOptions.path)) {
            return handler.next(error);
          }
          try {
            final refreshed = await _tryRefresh();
            if (!refreshed) {
              await _tokenStorage.clear();
              return handler.next(error);
            }
            final req = error.requestOptions;
            req.extra['retried'] = true;
            final token = await _tokenStorage.readAccessToken();
            if (token != null) {
              req.headers['Authorization'] = 'Bearer $token';
            }
            final response = await _dio.fetch(req);
            return handler.resolve(response);
          } catch (_) {
            await _tokenStorage.clear();
            return handler.next(error);
          }
        },
      ),
    );
  }

  late final Dio _dio;
  final TokenStorage _tokenStorage;
  bool _refreshing = false;

  Dio get dio => _dio;

  bool _isAuthPath(String path) {
    return path.contains('/auth/login') ||
        path.contains('/auth/register') ||
        path.contains('/auth/refresh') ||
        path.contains('/auth/logout') ||
        path.contains('/auth/forgot-password') ||
        path.contains('/auth/reset-password');
  }

  Future<bool> _tryRefresh() async {
    if (_refreshing) return false;
    _refreshing = true;
    try {
      final refresh = await _tokenStorage.readRefreshToken();
      if (refresh == null || refresh.isEmpty) return false;

      // Separate Dio so refresh does not re-enter the interceptor loop.
      final bare = Dio(
        BaseOptions(
          baseUrl: AppConfig.apiBaseUrl,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        ),
      );
      final res = await bare.post<Map<String, dynamic>>(
        '/auth/refresh',
        data: {'refreshToken': refresh},
      );
      final data = res.data;
      if (data == null) return false;
      final access = data['accessToken']?.toString();
      final newRefresh = data['refreshToken']?.toString();
      if (access == null ||
          access.isEmpty ||
          newRefresh == null ||
          newRefresh.isEmpty) {
        return false;
      }
      await _tokenStorage.saveTokens(
        accessToken: access,
        refreshToken: newRefresh,
      );
      return true;
    } catch (_) {
      return false;
    } finally {
      _refreshing = false;
    }
  }

  /// Expose NestJS message parsing for repositories/UI.
  static String errorMessage(Object error, {String fallback = 'Request failed'}) =>
      apiErrorMessage(error, fallback: fallback);
}
