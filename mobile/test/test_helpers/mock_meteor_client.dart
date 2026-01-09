import 'dart:async';
import 'package:suvai/services/meteor_client.dart';

class MockMeteorClient extends MeteorClient {
  bool shouldFailCall = false;
  String? failureMessage;

  MockMeteorClient() : super(serverUrl: 'http://10.0.2.2:3000');

  @override
  Future<void> connect() async {
    isConnectedInternal = true;
  }

  @override
  Future<void> disconnect() async {
    isConnectedInternal = false;
  }

  @override
  Future<void> subscribe(String name, {Map<String, dynamic>? params}) async {
    final id = DateTime.now().millisecondsSinceEpoch.toString();
    final readyCompleter = Completer<void>();
    subscriptions[id] = <String, dynamic>{
      'name': name,
      'params': params,
      'ready': readyCompleter,
    };
    
    if (name == 'products.list') {
      _mockProducts();
    } else if (name == 'orders.one') {
      _mockOrder();
    }
    
    readyCompleter.complete();
  }

  @override
  Future<Map<String, dynamic>> call(
    String method,
    List<dynamic> params,
  ) async {
    if (shouldFailCall) {
      throw Exception(failureMessage ?? 'Mock call failed');
    }

    if (method == 'orders.create' && params.isNotEmpty) {
      return {
        'orderId': 'order_${DateTime.now().millisecondsSinceEpoch}',
        'success': true,
      };
    }

    return {};
  }

  void _mockProducts() {
    collections['products'] = {
      '1': {
        '_id': '1',
        'name': 'Hyderabadi Biryani',
        'description': 'Authentic Hyderabadi biryani with basmati rice',
        'price': 250.0,
        'category': 'Biryani',
        'subcategory': 'Rice',
        'imageUrl': '',
        'minOrderQuantity': 1,
      },
      '2': {
        '_id': '2',
        'name': 'Chicken Biryani',
        'description': 'Tender chicken pieces in aromatic rice',
        'price': 280.0,
        'category': 'Biryani',
        'subcategory': 'Rice',
        'imageUrl': '',
        'minOrderQuantity': 1,
      },
      '3': {
        '_id': '3',
        'name': 'Masala Dosa',
        'description': 'Crispy dosa with potato masala filling',
        'price': 80.0,
        'category': 'Breakfast',
        'subcategory': 'South Indian',
        'imageUrl': '',
        'minOrderQuantity': 1,
      },
    };
  }

  void _mockOrder() {
    collections['Orders'] = {
      'order_123': {
        '_id': 'order_123',
        'name': 'John Doe',
        'phone': '9876543210',
        'address': '123 Main St',
        'items': [
          {'productId': '1', 'quantity': 2, 'price': 250.0},
        ],
        'totalAmount': 500.0,
        'status': 'placed',
        'createdAt': DateTime.now().toIso8601String(),
      },
    };
  }
}
