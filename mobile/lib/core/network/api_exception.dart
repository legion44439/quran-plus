import 'package:dio/dio.dart';

/// Разбор тела ошибок NestJS (`message` — строка или массив) в текст для UI.
String apiErrorMessage(Object error, {String fallback = 'Request failed'}) {
  if (error is DioException) {
    final data = error.response?.data;
    if (data is Map) {
      final message = data['message'];
      if (message is String && message.isNotEmpty) return message;
      if (message is List && message.isNotEmpty) {
        return message.map((e) => e.toString()).join('\n');
      }
      final errorField = data['error'];
      if (errorField is String && errorField.isNotEmpty) return errorField;
    }
    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.sendTimeout) {
      return 'Connection timeout';
    }
    if (error.type == DioExceptionType.connectionError) {
      return 'Cannot reach server';
    }
    final status = error.response?.statusCode;
    if (status != null) return '$fallback ($status)';
  }
  return error.toString().isEmpty ? fallback : error.toString();
}

/// Исключение API с человекочитаемым message и опциональным statusCode.
class ApiException implements Exception {
  ApiException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => message;

  factory ApiException.fromDio(DioException e, {String fallback = 'Request failed'}) {
    return ApiException(
      apiErrorMessage(e, fallback: fallback),
      statusCode: e.response?.statusCode,
    );
  }
}
