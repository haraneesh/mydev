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

  Future<bool> checkPhoneExists(String phone) async {
    try {
      // Ensure connection
      if (!_meteorClient.isConnected) {
        await _meteorClient.connect();
      }

      final response = await _meteorClient
          .call('usersNotLoggedIn.find', [{'mobileNumber': phone}]);

      // Handle different response formats from the meteor server
      // Response could be a List of users or a Map with result data
      if (response is List) {
        // If it's a list, check if it has any users
        return response.isNotEmpty;
      } else if (response is Map<String, dynamic>) {
        // If it's a map, could be empty or contain user data
        // Check for common response structures
        if (response.isEmpty) {
          return false;
        }
        // If the map has data (not empty), user exists
        return true;
      }
      
      return false;
    } catch (e) {
      debugPrint('Error checking phone: $e');
      rethrow;
    }
  }

  Future<String> submitOrder(CheckoutData data, {String? userId}) async {
    const maxRetries = 3;
    const timeoutDuration = Duration(seconds: 30);
    
    for (int attempt = 0; attempt < maxRetries; attempt++) {
      try {
        _validateInput(data);

        if (!_meteorClient.isConnected) {
          await _meteorClient.connect().timeout(
            timeoutDuration,
            onTimeout: () => throw TimeoutException('Connection timeout'),
          );
        }

        final cartItems = data.items;
        final products = cartItems
            .map((item) {
              // Build vendor_details from product, with fallback values
              final vendorDetails = item.product.vendorDetails;
              final vendorDetailsMap = {
                'id': vendorDetails?.id ?? item.product.id,
                'slug': vendorDetails?.slug ?? item.product.id.toLowerCase(),
                'name': vendorDetails?.name ?? item.product.name,
              };
              
              // Determine if product is on sale: true if any unit has a discount
              final hasSaleDiscount = item.product.getAvailableUnits()
                  .any((unit) => item.product.getDiscountPercentage(unit) != null && item.product.getDiscountPercentage(unit)! > 0);
              
             // Send complete product data to match server expectations
              return {
                '_id': item.product.id,
                'sku': item.product.sku,
                'name': item.product.name,
                'unitprice': item.product.price, // Base unit price (server calculates: base_price * quantity)
                'unitOfSale': item.product.unitOfSale ?? '', // Base unit string (e.g., "1 Kg")
                'image_path': item.product.imageUrl ?? '',
                'type': item.product.category,
                'availableToOrder': item.product.availableToOrder,
                'vendor_details': vendorDetailsMap,
                'unitsForSelection': item.product.unitsForSelection ?? '',
                'category': item.product.category,
                'zh_item_id': item.product.zhItemId,
                'maxUnitsAvailableToOrder': item.product.maxUnitsAvailableToOrder ?? 9999,
                'wSaleBaseUnitPrice': item.product.wSaleBaseUnitPrice,
                'availableToOrderWH': item.product.availableToOrder,
                'frequentlyOrdered': false, // Not tracked in Flutter model
                'displayAsSpecial': false, // Not tracked in Flutter model
                'includeReturnables': false, // Not tracked in Flutter model
                'zh_intra_tax_percentage': 0, // Not tracked in Flutter model
                'totQuantityOrdered': item.product.totQuantityOrdered?.toInt() ?? 0,
                'quantity': item.selectedUnit, // The selected unit fraction (e.g., 0.2, 0.4)
                'sale': hasSaleDiscount,
                'quantitySelected': item.selectedUnit, // Redundant but matches server expectations
              };
            })
            .toList();

        final orderPayload = {
          '_id': '', // Empty string for new orders, server will generate ID
          'products': products,
          'loggedInUserId': userId ?? '', // Send empty string if no user ID for guest orders
          'order_status': 'Pending',
          'comments': data.notes ?? '',
          'deliveryPincode': data.address.isNotEmpty ? data.address : 'Deliver',
          'basketId': '',
          'issuesWithPreviousOrder': '',
          'payCashWithThisDelivery': false,
          'collectRecyclablesWithThisDelivery': false,
        };
        
        debugPrint('[OrderService] data.notes: "${data.notes}"');
        debugPrint('[OrderService] comments being sent: "${orderPayload['comments']}"');

        debugPrint('=== CALLING orders.upsert ===');
        debugPrint('Method: orders.upsert');
        debugPrint('Payload Keys: ${orderPayload.keys.join(', ')}');
        debugPrint('Payload: ${_prettyPrintJson(orderPayload)}');
        debugPrint('Products Array Length: ${(orderPayload['products'] as List?)?.length ?? 0}');
        if ((orderPayload['products'] as List?)?.isNotEmpty ?? false) {
          debugPrint('First Product: ${_prettyPrintJson((orderPayload['products'] as List)[0])}');
        }

        final response = await _meteorClient
            .call('orders.upsert', [orderPayload])
            .timeout(
              timeoutDuration,
              onTimeout: () => throw TimeoutException('Order submission timeout'),
            );

        debugPrint('=== RESPONSE FROM SERVER ===');
        debugPrint('Order response from server: ${_prettyPrintJson(response)}');
        debugPrint('Response type: ${response.runtimeType}');

        // Extract orderId from response
        // Server returns orderId as a string directly
        String? orderId;
        
        if (response is String) {
          // Server returned orderId directly as a string
          orderId = response;
        } else if (response is Map<String, dynamic>) {
          // Try to extract orderId from various possible field names (backwards compatibility)
          orderId = response['orderId'] as String? ??
              response['_id'] as String? ??
              response['id'] as String? ??
              response['result'] as String?;
          
          // If response is completely empty, the server may have returned undefined
          // In Meteor, undefined becomes null/empty in the DDP response
          if (orderId == null && response.isEmpty) {
            debugPrint('Warning: Server returned empty response. Order may have been created but orderId not returned.');
            // Generate a temporary orderId based on timestamp as fallback
            // This shouldn't happen after the server fix, but provides graceful degradation
            orderId = 'ORD-${DateTime.now().millisecondsSinceEpoch}';
          }
        }
        
        if (orderId == null || orderId.isEmpty) {
          debugPrint('Error: Could not extract orderId from response: $response');
          throw Exception('Invalid response from server: no orderId. Response: $response');
        }

        debugPrint('Order created successfully with ID: $orderId');
        return orderId;
      } on TimeoutException catch (e) {
        if (attempt < maxRetries - 1) {
          final delay = Duration(seconds: 2 << attempt); // Exponential backoff: 2s, 4s, 8s
          await Future.delayed(delay);
        } else {
          throw Exception('Order submission failed after $maxRetries attempts: $e');
        }
      } catch (e) {
        if (attempt == maxRetries - 1) rethrow;
        
        final delay = Duration(seconds: 2 << attempt);
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

  String _prettyPrintJson(dynamic json) {
    try {
      if (json == null) return 'null';
      if (json is String) return json;
      if (json is num || json is bool) return json.toString();
      
      // For maps and lists, return a readable format
      return json.toString();
    } catch (e) {
      return json.toString();
    }
  }

  Future<Order?> getOrderStatus(String orderId) async {
    try {
      await _meteorClient.subscribe('orders.one', params: {'orderId': orderId});

      await Future.delayed(const Duration(milliseconds: 500));

      final documents = _meteorClient.getCollectionDocuments('Orders');
      if (documents.isEmpty) {
        return null;
      }

      final orderDoc = documents.firstWhere(
        (doc) => doc['_id'] == orderId,
        orElse: () => <String, dynamic>{},
      );

      if (orderDoc.isEmpty) {
        return null;
      }

      return Order.fromJson(orderDoc);
    } catch (e) {
      rethrow;
    }
  }
}
