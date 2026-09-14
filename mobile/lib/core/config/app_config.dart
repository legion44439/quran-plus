/// Конфиг приложения. Базовый URL API переопределяется при сборке:
/// `flutter run --dart-define=API_BASE_URL=http://10.0.2.2:4000/api`
///
/// По умолчанию `http://localhost:4000/api` — уже с NestJS-префиксом `/api`.
/// Пути в Dio: `/auth/login`, `/surahs`… — НЕ добавлять `/api` ещё раз.
class AppConfig {
  AppConfig._();

  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:4000/api',
  );

  static const String appName = 'Quran Plus';
}
