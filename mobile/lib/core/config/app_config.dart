/// App configuration. Override API base URL at build/run time:
/// `flutter run --dart-define=API_BASE_URL=http://10.0.2.2:4000/api`
///
/// Default includes the NestJS global prefix `/api`. Paths are then
/// `/auth/login`, `/surahs`, etc. — do NOT prefix paths with `/api` again.
class AppConfig {
  AppConfig._();

  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:4000/api',
  );

  static const String appName = 'Quran Plus';
}
