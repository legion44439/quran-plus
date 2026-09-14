import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/storage/token_storage.dart';
import '../domain/auth_state.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(
    ref.watch(apiClientProvider),
    ref.watch(tokenStorageProvider),
  );
});

final authStateProvider =
    StateNotifierProvider<AuthController, AuthState>((ref) {
  return AuthController(ref.watch(authRepositoryProvider));
});

class AuthRepository {
  AuthRepository(this._api, this._tokens);

  final ApiClient _api;
  final TokenStorage _tokens;

  Future<AuthState> restore() async {
    final access = await _tokens.readAccessToken();
    if (access == null || access.isEmpty) {
      return const AuthState(status: AuthStatus.unknown);
    }
    try {
      return await _fetchMe();
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) {
        final ok = await _refreshTokens();
        if (ok) {
          try {
            return await _fetchMe();
          } catch (_) {
            await _tokens.clear();
            return const AuthState(status: AuthStatus.unknown);
          }
        }
        await _tokens.clear();
        return const AuthState(status: AuthStatus.unknown);
      }
      // Offline with stored token — stay unknown so splash can continue.
      return const AuthState(status: AuthStatus.unknown);
    } catch (_) {
      return const AuthState(status: AuthStatus.unknown);
    }
  }

  Future<AuthState> login({
    required String email,
    required String password,
  }) async {
    try {
      final res = await _api.dio.post<Map<String, dynamic>>(
        '/auth/login',
        data: {'email': email, 'password': password},
      );
      await _persistTokens(res.data);
      // Login user payload has no displayName — prefer /users/me.
      try {
        return await _fetchMe();
      } catch (_) {
        return _userFromAuthResponse(res.data, fallbackEmail: email);
      }
    } on DioException catch (e) {
      throw ApiException.fromDio(e, fallback: 'Login failed');
    }
  }

  Future<AuthState> register({
    required String name,
    required String email,
    required String password,
  }) async {
    try {
      final body = <String, dynamic>{
        'email': email,
        'password': password,
      };
      if (name.isNotEmpty) body['displayName'] = name;
      final res = await _api.dio.post<Map<String, dynamic>>(
        '/auth/register',
        data: body,
      );
      await _persistTokens(res.data);
      try {
        return await _fetchMe();
      } catch (_) {
        return _userFromAuthResponse(
          res.data,
          fallbackEmail: email,
          fallbackName: name,
        );
      }
    } on DioException catch (e) {
      throw ApiException.fromDio(e, fallback: 'Registration failed');
    }
  }

  Future<AuthState> enterGuest() async {
    await _tokens.clear();
    return const AuthState(status: AuthStatus.guest);
  }

  Future<void> logout() async {
    final refresh = await _tokens.readRefreshToken();
    try {
      if (refresh != null && refresh.isNotEmpty) {
        await _api.dio.post(
          '/auth/logout',
          data: {'refreshToken': refresh},
        );
      }
    } catch (_) {
      // Still clear local tokens even if revoke fails.
    }
    await _tokens.clear();
  }

  /// POST /auth/forgot-password { email }.
  /// Returns message; in non-prod backend may also include resetToken.
  Future<ForgotPasswordResult> forgotPassword(String email) async {
    try {
      final res = await _api.dio.post<Map<String, dynamic>>(
        '/auth/forgot-password',
        data: {'email': email},
      );
      final data = res.data ?? {};
      return ForgotPasswordResult(
        message: data['message']?.toString() ?? 'ok',
        resetToken: data['resetToken']?.toString(),
      );
    } on DioException catch (e) {
      throw ApiException.fromDio(e, fallback: 'Forgot password failed');
    }
  }

  /// POST /auth/reset-password { token, newPassword }.
  Future<void> resetPassword({
    required String token,
    required String password,
  }) async {
    try {
      await _api.dio.post(
        '/auth/reset-password',
        data: {'token': token, 'newPassword': password},
      );
    } on DioException catch (e) {
      throw ApiException.fromDio(e, fallback: 'Reset password failed');
    }
  }

  Future<AuthState> _fetchMe() async {
    final res = await _api.dio.get<Map<String, dynamic>>('/users/me');
    final data = res.data ?? {};
    final email = data['email']?.toString() ?? '';
    final displayName = data['displayName']?.toString();
    final role = data['role']?.toString();
    return AuthState(
      status: AuthStatus.authenticated,
      email: email,
      displayName: (displayName != null && displayName.isNotEmpty)
          ? displayName
          : (email.contains('@') ? email.split('@').first : email),
      role: role,
    );
  }

  Future<bool> _refreshTokens() async {
    final refresh = await _tokens.readRefreshToken();
    if (refresh == null || refresh.isEmpty) return false;
    try {
      final res = await _api.dio.post<Map<String, dynamic>>(
        '/auth/refresh',
        data: {'refreshToken': refresh},
      );
      await _persistTokens(res.data);
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<void> _persistTokens(Map<String, dynamic>? data) async {
    if (data == null) {
      throw ApiException('Invalid auth response');
    }
    final access = data['accessToken']?.toString();
    final refresh = data['refreshToken']?.toString();
    if (access == null ||
        access.isEmpty ||
        refresh == null ||
        refresh.isEmpty) {
      throw ApiException('Invalid auth response');
    }
    await _tokens.saveTokens(accessToken: access, refreshToken: refresh);
  }

  AuthState _userFromAuthResponse(
    Map<String, dynamic>? data, {
    required String fallbackEmail,
    String? fallbackName,
  }) {
    final user = data?['user'];
    String email = fallbackEmail;
    String? displayName = fallbackName;
    String? role;
    if (user is Map) {
      email = user['email']?.toString() ?? email;
      final dn = user['displayName']?.toString();
      if (dn != null && dn.isNotEmpty) displayName = dn;
      role = user['role']?.toString();
    }
    displayName ??= email.contains('@') ? email.split('@').first : email;
    return AuthState(
      status: AuthStatus.authenticated,
      email: email,
      displayName: displayName,
      role: role,
    );
  }
}

class AuthController extends StateNotifier<AuthState> {
  AuthController(this._repo) : super(const AuthState()) {
    _restore();
  }

  final AuthRepository _repo;

  Future<void> _restore() async {
    state = await _repo.restore();
  }

  Future<void> login(String email, String password) async {
    state = await _repo.login(email: email, password: password);
  }

  Future<void> register(String name, String email, String password) async {
    state = await _repo.register(name: name, email: email, password: password);
  }

  Future<void> enterGuest() async {
    state = await _repo.enterGuest();
  }

  Future<void> logout() async {
    await _repo.logout();
    state = const AuthState(status: AuthStatus.unknown);
  }

  Future<ForgotPasswordResult> forgotPassword(String email) =>
      _repo.forgotPassword(email);

  Future<void> resetPassword({
    required String token,
    required String password,
  }) =>
      _repo.resetPassword(token: token, password: password);
}

class ForgotPasswordResult {
  const ForgotPasswordResult({required this.message, this.resetToken});

  final String message;
  final String? resetToken;
}
