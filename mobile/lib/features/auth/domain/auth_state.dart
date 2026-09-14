/// Статус сессии: unknown (старт/офлайн), guest (чтение без аккаунта),
/// authenticated. Guest — read-only: чаты/compose закрыты через [canCompose].
enum AuthStatus { unknown, guest, authenticated }

/// Состояние auth для UI и роутинга (имя/email/role после /users/me).
class AuthState {
  const AuthState({
    this.status = AuthStatus.unknown,
    this.email,
    this.displayName,
    this.role,
  });

  final AuthStatus status;
  final String? email;
  final String? displayName;
  final String? role;

  bool get isGuest => status == AuthStatus.guest;
  bool get isAuthenticated => status == AuthStatus.authenticated;
  bool get canCompose => isAuthenticated;

  AuthState copyWith({
    AuthStatus? status,
    String? email,
    String? displayName,
    String? role,
  }) {
    return AuthState(
      status: status ?? this.status,
      email: email ?? this.email,
      displayName: displayName ?? this.displayName,
      role: role ?? this.role,
    );
  }
}
