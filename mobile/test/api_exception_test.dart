import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:quran_plus/core/network/api_exception.dart';

void main() {
  group('apiErrorMessage', () {
    test('parses NestJS string message', () {
      final err = DioException(
        requestOptions: RequestOptions(path: '/auth/login'),
        response: Response(
          requestOptions: RequestOptions(path: '/auth/login'),
          statusCode: 401,
          data: {'message': 'Invalid credentials', 'statusCode': 401},
        ),
        type: DioExceptionType.badResponse,
      );
      expect(apiErrorMessage(err), 'Invalid credentials');
    });

    test('parses NestJS array message', () {
      final err = DioException(
        requestOptions: RequestOptions(path: '/auth/register'),
        response: Response(
          requestOptions: RequestOptions(path: '/auth/register'),
          statusCode: 400,
          data: {
            'message': [
              'email must be an email',
              'password must contain at least one letter and one number',
            ],
            'statusCode': 400,
          },
        ),
        type: DioExceptionType.badResponse,
      );
      final msg = apiErrorMessage(err);
      expect(msg.contains('email must be an email'), isTrue);
      expect(msg.contains('password must contain'), isTrue);
    });

    test('ApiException.fromDio keeps statusCode', () {
      final err = DioException(
        requestOptions: RequestOptions(path: '/x'),
        response: Response(
          requestOptions: RequestOptions(path: '/x'),
          statusCode: 501,
          data: {'message': 'Not implemented'},
        ),
        type: DioExceptionType.badResponse,
      );
      final ex = ApiException.fromDio(err);
      expect(ex.statusCode, 501);
      expect(ex.message, 'Not implemented');
    });
  });
}
