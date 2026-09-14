import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final tokenStorageProvider = Provider<TokenStorage>((ref) {
  return TokenStorage();
});

/// Secure JWT placeholder storage (access + refresh).
class TokenStorage {
  TokenStorage({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  final FlutterSecureStorage _storage;

  static const _accessKey = 'qp_access_token';
  static const _refreshKey = 'qp_refresh_token';

  Future<String?> readAccessToken() => _storage.read(key: _accessKey);
  Future<String?> readRefreshToken() => _storage.read(key: _refreshKey);

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _storage.write(key: _accessKey, value: accessToken);
    await _storage.write(key: _refreshKey, value: refreshToken);
  }

  Future<void> clear() async {
    await _storage.delete(key: _accessKey);
    await _storage.delete(key: _refreshKey);
  }
}
