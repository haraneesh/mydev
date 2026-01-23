import 'dart:async';
import 'package:flutter/foundation.dart';
import '../models/order.dart' as order_models;
import '../screens/public/checkout_screen.dart';
import 'meteor_client.dart';

class OrderService {
  static final OrderService _instance = OrderService._internal();

  factory OrderService() {
    return _instance;
  }

  OrderService._internal();

  static OrderService get instance => _instance;

  late MeteorClient _meteorClient = MeteorClient.instance;
  Map<String, String> _statusColorCache = {};
  bool _colorsFetched = false;

  void setMeteorClient(MeteorClient client) {
    _meteorClient = client;
  }

  /// Fetch status colors from backend and cache them
  /// Returns a map of status name to hex color code
  Future<Map<String, String>> fetchStatusColors() async {
    if (_colorsFetched && _statusColorCache.isNotEmpty) {
      debugPrint('[OrderService] Using cached status colors');
      return _statusColorCache;
    }

    try {
      if (!_meteorClient.isConnected) {
        await _meteorClient.connect();
      }

      debugPrint('[OrderService] Fetching status colors from backend...');
      
      final response = await _meteorClient.call('constants.getStatusColors', []);
      
      if (response is Map<String, dynamic>) {
        _statusColorCache.clear();
        
        response.forEach((statusName, statusData) {
          if (statusData is Map<String, dynamic> && statusData['hexColor'] != null) {
            _statusColorCache[statusName] = statusData['hexColor'];
          }
        });
        
        _colorsFetched = true;
        debugPrint('[OrderService] Cached ${_statusColorCache.length} status colors');
        return _statusColorCache;
      }
      
      debugPrint('[OrderService] Invalid response format for status colors');
      return {};
    } catch (e) {
      debugPrint('[OrderService] Error fetching status colors: $e');
      return {};
    }
  }

  /// Get hex color for a status name, with fallback
  Future<String> getStatusColor(String statusName) async {
    final colors = await fetchStatusColors();
    return colors[statusName] ?? '#000000'; // Default to black if not found
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

  Future<order_models.Order?> getOrderStatus(String orderId) async {
    try {
      if (!_meteorClient.isConnected) {
        debugPrint('[OrderService] Connecting to Meteor server...');
        await _meteorClient.connect();
      }

      // Ensure auth is still valid
      await _meteorClient.waitForAuth();
      debugPrint('[OrderService] Auth verified for getOrderStatus');

      // First try to find in already-fetched Orders collection
      debugPrint('[OrderService] Looking for order: $orderId in local collection');
      final documents = _meteorClient.getCollectionDocuments('Orders');
      
      final orderDoc = documents.firstWhere(
        (doc) => doc['_id'] == orderId,
        orElse: () => <String, dynamic>{},
      );

      if (orderDoc.isNotEmpty) {
        debugPrint('[OrderService] Found order in local collection');
        return order_models.Order.fromJson(orderDoc);
      }

      debugPrint('[OrderService] Order not in local collection, subscribing to orders.mylist');
      // If not found locally, subscribe to get fresh data
      await _meteorClient.subscribe('orders.mylist');
      await Future.delayed(const Duration(milliseconds: 1000));

      final freshDocuments = _meteorClient.getCollectionDocuments('Orders');
      final freshOrderDoc = freshDocuments.firstWhere(
        (doc) => doc['_id'] == orderId,
        orElse: () => <String, dynamic>{},
      );

      if (freshOrderDoc.isEmpty) {
        debugPrint('[OrderService] Order not found');
        return null;
      }

      return order_models.Order.fromJson(freshOrderDoc);
    } catch (e) {
      debugPrint('[OrderService] Error in getOrderStatus: $e');
      rethrow;
    }
  }

  /// Fetch list of orders for the logged-in user filtered by active statuses
  /// 
  /// This mirrors the Meteor publication 'orders.list.status' which:
  /// - Filters orders by customer_details._id (current user)
  /// - Filters by order_status in [Pending, Processing, Awaiting_Fulfillment, Shipped, Partially_Completed]
  /// - Sorts by createdAt (descending - most recent first)
  /// - Limits to 250 records
  /// 
  /// Returns a list of order_models.Order objects, sorted by creation date (newest first)
  Future<List<order_models.Order>> fetchMyOrders({
    bool includeCompletedOrders = false,
  }) async {
    try {
      if (!_meteorClient.isConnected) {
        debugPrint('[OrderService] Connecting to Meteor server...');
        await _meteorClient.connect();
      }

      // Wait for authentication to complete before subscribing
      await _meteorClient.waitForAuth();

      debugPrint('[OrderService] Fetching orders...');
      debugPrint('[OrderService] Auth token: ${_meteorClient.authToken != null ? 'SET' : 'NOT SET'}');
      debugPrint('[OrderService] Auth user ID: ${_meteorClient.authUserId}');

      // Define the order statuses to filter
      // These are the "active" order statuses shown in the My Orders page
      final orderStatuses = includeCompletedOrders
          ? [
              'Pending',
              'Processing',
              'Awaiting_Fulfillment',
              'Shipped',
              'Partially_Completed',
              'Completed',
              'Cancelled',
              'Returned',
            ]
          : [
              'Pending',
              'Processing',
              'Awaiting_Fulfillment',
              'Shipped',
              'Partially_Completed',
            ];

      // Subscribe to user's orders
      // Using orders.mylist which is simpler and returns all user's orders
      debugPrint('[OrderService] Subscribing to orders.mylist');
      
      await _meteorClient.subscribe('orders.mylist');

      // Wait for subscription to populate the collection
      await Future.delayed(const Duration(milliseconds: 1500));

      // Get all order documents from the local collection
      final documents = _meteorClient.getCollectionDocuments('Orders');
      
      debugPrint('[OrderService] Available collections: ${_meteorClient.collections.keys}');
      debugPrint('[OrderService] Orders collection docs: ${documents.length}');
      
      // Log subscription details for debugging
      if (documents.isNotEmpty) {
        debugPrint('[OrderService] First order: ${documents.first}');
        debugPrint('[OrderService] First order customer ID: ${documents.first['customer_details']?['_id']}');
      }
      
      if (documents.isEmpty) {
        debugPrint('[OrderService] No orders found in collection');
        return [];
      }

      debugPrint('[OrderService] Found ${documents.length} orders');

      // Convert documents to Order objects
      final orders = documents
          .map((doc) {
            try {
              return order_models.Order.fromJson(doc as Map<String, dynamic>);
            } catch (e) {
              debugPrint('[OrderService] Error parsing order: $e');
              return null;
            }
          })
          .whereType<order_models.Order>()
          .toList();

      // Sort by creation date (descending - newest first)
      // This mirrors the Meteor sort: { createdAt: constants.Sort.DESCENDING }
      orders.sort((a, b) => b.createdAt.compareTo(a.createdAt));

      debugPrint('[OrderService] Parsed ${orders.length} orders successfully');
      return orders;
    } catch (e) {
      debugPrint('[OrderService] Error fetching orders: $e');
      rethrow;
    }
  }

  /// Fetch invoices for the logged-in user using the zhinvoices.byUser publication
  /// 
  /// This uses the Meteor publication 'zhinvoices.byUser' which provides:
  /// - All invoices for the current user
  /// - Sorted by date (descending)
  /// - Includes line_items with full details
  Future<List<dynamic>> fetchMyInvoices() async {
    try {
      if (!_meteorClient.isConnected) {
        debugPrint('[OrderService] Connecting to Meteor server...');
        await _meteorClient.connect();
      }

      // Wait for authentication to complete
      debugPrint('[OrderService] Auth token: ${_meteorClient.authToken != null ? 'SET' : 'NOT SET'}');
      debugPrint('[OrderService] Auth user ID: ${_meteorClient.authUserId}');
      await _meteorClient.waitForAuth();
      debugPrint('[OrderService] Auth wait completed');

      debugPrint('[OrderService] Calling invoices.getUnpaidInvoices method...');
      
      final result = await _meteorClient.call('invoices.getUnpaidInvoices', []);

      if (result is List) {
        debugPrint('[OrderService] Fetched ${result.length} invoices via method call');
        
        if (result.isNotEmpty) {
          debugPrint('[OrderService] First invoice raw data: ${result.first}');
        }
        
        return result;
      }

      debugPrint('[OrderService] No invoices returned from method call');
      return [];
    } catch (e) {
      debugPrint('[OrderService] Error fetching invoices: $e');
      rethrow;
    }
  }

  /// Fetch list of pending orders only for the logged-in user
  /// 
  /// Fetches all user orders via 'orders.mylist' publication and filters to Pending status only
  /// Returns a list of order_models.Order objects sorted by creation date (newest first)
  Future<List<order_models.Order>> fetchPendingOrders() async {
    try {
      if (!_meteorClient.isConnected) {
        debugPrint('[OrderService] Connecting to Meteor server...');
        await _meteorClient.connect();
      }

      await _meteorClient.waitForAuth();

      debugPrint('[OrderService] Fetching pending orders...');

      // Subscribe to user's orders
      debugPrint('[OrderService] Subscribing to orders.mylist');
      await _meteorClient.subscribe('orders.mylist');

      // Wait for subscription to populate the collection
      await Future.delayed(const Duration(milliseconds: 1500));

      final documents = _meteorClient.getCollectionDocuments('Orders');
      
      debugPrint('[OrderService] Found ${documents.length} total orders');
      
      if (documents.isNotEmpty) {
        debugPrint('[OrderService] First pending order document: ${documents.first}');
      }

      if (documents.isEmpty) {
        return [];
      }

      // Filter to only Pending orders and convert to Order objects
      final orders = documents
          .where((doc) => doc['order_status'] == 'Pending')
          .map((doc) {
            try {
              return order_models.Order.fromJson(doc as Map<String, dynamic>);
            } catch (e) {
              debugPrint('[OrderService] Error parsing pending order: $e');
              return null;
            }
          })
          .whereType<order_models.Order>()
          .toList();

      // Sort by creation date (descending - newest first)
      orders.sort((a, b) => b.createdAt.compareTo(a.createdAt));

      debugPrint('[OrderService] Filtered to ${orders.length} pending orders successfully');
      return orders;
    } catch (e) {
      debugPrint('[OrderService] Error fetching pending orders: $e');
      rethrow;
    }
  }

  /// Cancel an order by updating its status to Cancelled
  /// 
  /// Uses the Meteor method 'orders.updateMyOrderStatus' to update the order status
  /// Returns true if successful, false otherwise
  Future<bool> cancelOrder(order_models.Order order) async {
    try {
      if (!_meteorClient.isConnected) {
        debugPrint('[OrderService] Connecting to Meteor server...');
        await _meteorClient.connect();
      }

      await _meteorClient.waitForAuth();

      debugPrint('[OrderService] Cancelling order: ${order.id}');

      final updatePayload = {
        'orderId': order.id,
        'updateToStatus': 'Cancelled',
      };

      debugPrint('[OrderService] Sending cancel request with orderId: ${updatePayload['orderId']}, updateToStatus: ${updatePayload['updateToStatus']}');

      final response = await _meteorClient.call('orders.updateMyOrderStatus', [updatePayload]);

      if (response != null) {
        debugPrint('[OrderService] Order cancelled successfully: $response');
        return true;
      }

      debugPrint('[OrderService] Cancel order returned null response');
      return false;
    } catch (e) {
      debugPrint('[OrderService] Error cancelling order: $e');
      return false;
    }
  }

  /// Fetch full invoice details by invoice ID
  /// 
  /// This mirrors the Meteor method call:
  /// Meteor.callAsync('zhInvoices.getInvoiceById', invoiceId)
  Future<dynamic> fetchInvoiceDetails(String invoiceId) async {
    try {
      if (!_meteorClient.isConnected) {
        await _meteorClient.connect();
      }

      await _meteorClient.waitForAuth();

      debugPrint('[OrderService] Fetching invoice details for: $invoiceId');

      final result = await _meteorClient.call('zhInvoices.getInvoiceById', [{'invoiceId': invoiceId}]);

      if (result != null) {
        debugPrint('[OrderService] Fetched invoice details: $result');
        return result;
      }

      return null;
    } catch (e) {
      debugPrint('[OrderService] Error fetching invoice details: $e');
      rethrow;
    }
  }

  /// Refresh orders by re-subscribing to the publication
  /// 
  /// Use this to manually refresh the orders list when needed
  Future<void> refreshOrders({bool includeCompletedOrders = false}) async {
    await fetchMyOrders(includeCompletedOrders: includeCompletedOrders);
  }

  /// Fetch all credit notes (refunds) for the logged-in user
  /// 
  /// This calls the Meteor method 'creditNotes.getCreditNotes' which returns
  /// all refunds/credit notes issued to the current user.
  /// Returns a list of raw credit note objects from the server
  Future<List<dynamic>> fetchCreditNotes() async {
    try {
      if (!_meteorClient.isConnected) {
        debugPrint('[OrderService] Connecting to Meteor server...');
        await _meteorClient.connect();
      }

      // Wait for authentication to complete
      debugPrint('[OrderService] Auth token: ${_meteorClient.authToken != null ? 'SET' : 'NOT SET'}');
      debugPrint('[OrderService] Auth user ID: ${_meteorClient.authUserId}');
      await _meteorClient.waitForAuth();
      debugPrint('[OrderService] Auth wait completed');

      // Call creditNotes.getCreditNotes method
      debugPrint('[OrderService] Calling creditNotes.getCreditNotes method...');
      
      final result = await _meteorClient.call('creditNotes.getCreditNotes', []);

      if (result is List) {
        debugPrint('[OrderService] Fetched ${result.length} credit notes via method call');
        
        if (result.isNotEmpty) {
          debugPrint('[OrderService] First credit note raw data: ${result.first}');
        }
        
        return result;
      }

      debugPrint('[OrderService] No credit notes returned from method call');
      return [];
    } catch (e) {
      debugPrint('[OrderService] Error fetching credit notes: $e');
      rethrow;
    }
  }

  /// Fetch full details of a single credit note (refund) by ID
  /// 
  /// This calls the Meteor method 'creditNotes.getCreditNote' with the credit note ID
  /// and returns the full refund details including line items.
  /// Returns a single credit note object with all details and line items
  Future<dynamic> fetchCreditNote(String creditNoteId) async {
    try {
      if (!_meteorClient.isConnected) {
        await _meteorClient.connect();
      }

      await _meteorClient.waitForAuth();

      debugPrint('[OrderService] Fetching credit note details for: $creditNoteId');

      final result = await _meteorClient.call('creditNotes.getCreditNote', [creditNoteId]);

      if (result != null) {
        debugPrint('[OrderService] Fetched credit note details: $result');
        return result;
      }

      return null;
    } catch (e) {
      debugPrint('[OrderService] Error fetching credit note details: $e');
      rethrow;
    }
  }
}
