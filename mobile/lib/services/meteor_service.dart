import 'package:flutter/foundation.dart';

class MeteorService {
  static const String baseUrl = 'http://localhost:3000';

  Future<Map<String, dynamic>> callMethod(
    String methodName,
    List<dynamic> args,
  ) async {
    try {
      debugPrint('Calling Meteor method: $methodName with args: $args');
      throw UnimplementedError(
        'Meteor DDP implementation pending - method: $methodName',
      );
    } catch (e) {
      debugPrint('Meteor method error: $e');
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getPublicSettings() async {
    return callMethod('getPublicSettings', []);
  }

  Future<Map<String, dynamic>> getProducts({
    String? category,
    String? subcategory,
  }) async {
    return callMethod('getProducts', [category, subcategory]);
  }

  Future<Map<String, dynamic>> createOrder(
    Map<String, dynamic> orderData,
  ) async {
    return callMethod('createOrder', [orderData]);
  }
}
