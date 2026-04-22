import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/constants.dart';

class ApiService {
  static final Dio _dio = Dio(BaseOptions(
    baseUrl: Constants.apiBaseUrl,
    connectTimeout: const Duration(seconds: 30),
    receiveTimeout: const Duration(seconds: 30),
    headers: {'Content-Type': 'application/json'},
  ));

  static Future<void> _addAuthHeader() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('accessToken');
    if (token != null) {
      _dio.options.headers['Authorization'] = 'Bearer $token';
    }
  }

  static Future<Response> _handleTokenRefresh(Response response) async {
    // 可在此处理 401 刷新逻辑，简化起见暂不实现
    return response;
  }

  static Future<Map<String, dynamic>> post(
    String endpoint, {
    Map<String, dynamic>? data,
  }) async {
    await _addAuthHeader();
    try {
      final response = await _dio.post(endpoint, data: data);
      return _handleTokenRefresh(response).data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  static Future<Map<String, dynamic>> get(String endpoint) async {
    await _addAuthHeader();
    try {
      final response = await _dio.get(endpoint);
      return _handleTokenRefresh(response).data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  static String _handleError(DioException e) {
    if (e.response?.data != null && e.response?.data['message'] != null) {
      return e.response!.data['message'];
    }
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return 'Connection timeout';
      case DioExceptionType.badResponse:
        return 'Server error: ${e.response?.statusCode}';
      default:
        return 'Network error';
    }
  }

  // Auth endpoints
  static Future<Map<String, dynamic>> login(String email, String password) {
    return post('/auth/login', data: {'email': email, 'password': password});
  }

  static Future<Map<String, dynamic>> register(String email, String password) {
    return post('/auth/register', data: {'email': email, 'password': password});
  }

  // Code endpoints
  static Future<List<dynamic>> getCodes() async {
    final response = await get('/codes');
    return response['data'] ?? [];
  }

  static Future<Map<String, dynamic>> generateCode(Map<String, dynamic> data) {
    return post('/codes/generate', data: data);
  }

  // Scan endpoints
  static Future<Map<String, dynamic>> verifyScan(String code) {
    return post('/scans/verify', data: {'code': code});
  }

  static Future<Map<String, dynamic>> getScanStats({String range = 'week'}) {
    return get('/scans/stats?range=$range');
  }

  static Future<List<dynamic>> getRecentScans({int limit = 20}) {
    return get('/scans/recent?limit=$limit').then((res) => res['data'] ?? []);
  }

  // Analytics
  static Future<Map<String, dynamic>> getAnalytics({String range = 'week'}) {
    return get('/analytics?range=$range');
  }
}
