import 'dart:async';
import 'package:flutter/foundation.dart';
import '../models/product.dart';
import '../screens/public/checkout_screen.dart';
import 'meteor_client.dart';

class OrderService {
  late MeteorClient _meteorClient;

  OrderService({MeteorClient? meteorClient}) {
    if (meteorClient != null) {
      _meteorClient = meteorClient;
    }
  }

  void setMeteorClient(MeteorClient client) {
    _meteorClient = client;
  }

  Future<String> submitOrder(CheckoutData data) async {
    const maxRetries = 3;
    const timeoutDuration = Duration(seconds: 30);
    
    for (int attempt = 0; attempt < maxRetries; attempt++) {
      try {
        _validateInput(data);

        debugPrint(
          'Submitting order (attempt ${attempt + 1}/$maxRetries): name=${data.name}, phone=${data.phone}',
        );

        if (!_meteorClient.isConnected) {
          debugPrint('Connecting to Meteor server...');
          await _meteorClient.connect().timeout(
            timeoutDuration,
            onTimeout: () => throw TimeoutException('Connection timeout'),
          );
        }

        final cartItems = data.items;
        final itemsData = cartItems
            .map((item) => {
                  'productId': item.product.id,
                  'productName': item.product.name,
                  'quantity': item.quantity,
                  'selectedUnit': item.selectedUnit,           // Unit-specific pricing
                  'selectedUnitPrice': item.selectedUnitPrice, // Pre-calculated unit price
                  'subtotal': item.subtotal,
                  'basePrice': item.product.price,            // Reference for server validation
                })
            .toList();

        final orderPayload = {
          'name': data.name,
          'phone': data.phone,
          'address': data.address,
          'items': itemsData,
          'totalAmount': data.totalAmount,
        };

        debugPrint('Calling orders.create with payload: ${orderPayload.keys.toList()}');

        final response = await _meteorClient
            .call('orders.create', [orderPayload])
            .timeout(
              timeoutDuration,
              onTimeout: () => throw TimeoutException('Order submission timeout'),
            );

        debugPrint('Order response: ${response.runtimeType}');

        final orderId = response['orderId'] as String?;
        if (orderId == null || orderId.isEmpty) {
          throw Exception('Invalid response from server: no orderId');
        }

        debugPrint('✅ Order created successfully with ID: $orderId');
        return orderId;
      } on TimeoutException catch (e) {
        debugPrint('⏱️ Timeout on attempt ${attempt + 1}/$maxRetries: $e');
        if (attempt < maxRetries - 1) {
          final delay = Duration(seconds: 2 << attempt); // Exponential backoff: 2s, 4s, 8s
          debugPrint('Retrying after ${delay.inSeconds}s...');
          await Future.delayed(delay);
        } else {
          throw Exception('Order submission failed after $maxRetries attempts: $e');
        }
      } catch (e) {
        debugPrint('Error on attempt ${attempt + 1}/$maxRetries: $e');
        if (attempt == maxRetries - 1) rethrow;
        
        final delay = Duration(seconds: 2 << attempt);
        debugPrint('Retrying after ${delay.inSeconds}s...');
        await Future.delayed(delay);
      }
    }
    
    throw Exception('Order submission failed');
  }

  void _validateInput(CheckoutData data) {
    if (data.name.isEmpty) {
      throw ArgumentError('Name is required');
    }

    if (data.phone.isEmpty || data.phone.length != 10) {
      throw ArgumentError('Phone must be 10 digits');
    }

    if (!RegExp(r'^[0-9]+$').hasMatch(data.phone)) {
      throw ArgumentError('Phone must contain only numbers');
    }

    if (data.address.isEmpty) {
      throw ArgumentError('Address is required');
    }

    if (data.items.isEmpty) {
      throw ArgumentError('Cart cannot be empty');
    }

    if (data.totalAmount <= 0) {
      throw ArgumentError('Total amount must be greater than 0');
    }
  }

  Future<Order?> getOrderStatus(String orderId) async {
    try {
      debugPrint('Fetching order status for: $orderId');

      await _meteorClient.subscribe('orders.one', params: {'orderId': orderId});

      await Future.delayed(const Duration(milliseconds: 500));

      final documents = _meteorClient.getCollectionDocuments('Orders');
      if (documents.isEmpty) {
        debugPrint('Order not found: $orderId');
        return null;
      }

      final orderDoc = documents.firstWhere(
        (doc) => doc['_id'] == orderId,
        orElse: () => <String, dynamic>{},
      );

      if (orderDoc.isEmpty) {
        return null;
      }

      debugPrint('Order found: $orderId');
      return Order.fromJson(orderDoc);
    } catch (e) {
      debugPrint('Error fetching order status: $e');
      rethrow;
    }
  }
}
