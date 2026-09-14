import 'package:flutter_test/flutter_test.dart';
import 'package:quran_plus/core/config/app_config.dart';

void main() {
  test('default API base includes /api on port 4000', () {
    expect(AppConfig.apiBaseUrl, 'http://localhost:4000/api');
  });
}
