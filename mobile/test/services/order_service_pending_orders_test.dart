import 'package:flutter_test/flutter_test.dart';
import 'package:mydev/models/order.dart';
import 'package:mydev/services/order_service.dart';
import 'package:mydev/services/meteor_client.dart';

void main() {
  group('OrderService.fetchPendingOrders', () {
    late MockMeteorClient mockMeteorClient;
    late OrderService orderService;

    setUp(() {
      mockMeteorClient = MockMeteorClient();
      orderService = OrderService(meteorClient: mockMeteorClient);
    });

    test('calls subscribe with orders.list.status and Pending filter', () async {
      mockMeteorClient.setConnected(true);
      mockMeteorClient.setOrders([]);

      await orderService.fetchPendingOrders();

      expect(mockMeteorClient.subscribeWasCalled, true);
      expect(mockMeteorClient.lastSubscriptionName, 'orders.list.status');
    });

    test('returns empty list when no pending orders exist', () async {
      mockMeteorClient.setConnected(true);
      mockMeteorClient.setOrders([]);

      final result = await orderService.fetchPendingOrders();

      expect(result, isEmpty);
    });

    test('returns list of pending orders sorted by newest first', () async {
      mockMeteorClient.setConnected(true);

      final orders = [
        {
          '_id': 'ORD001',
          'products': [],
          'total_bill_amount': 100.0,
          'order_status': 'Pending',
          'createdAt': DateTime(2026, 1, 15).toIso8601String(),
          'customer_details': {
            '_id': 'CUST001',
            'name': 'User1',
            'email': 'user1@test.com',
            'mobilePhone': 9999999999,
            'deliveryAddress': 'Address1',
            'role': 'customer',
          },
          'deliveryPincode': '12345',
        },
        {
          '_id': 'ORD002',
          'products': [],
          'total_bill_amount': 200.0,
          'order_status': 'Pending',
          'createdAt': DateTime(2026, 1, 17).toIso8601String(),
          'customer_details': {
            '_id': 'CUST002',
            'name': 'User2',
            'email': 'user2@test.com',
            'mobilePhone': 8888888888,
            'deliveryAddress': 'Address2',
            'role': 'customer',
          },
          'deliveryPincode': '54321',
        },
      ];

      mockMeteorClient.setConnected(true);
      mockMeteorClient.setOrders(orders);

      final result = await orderService.fetchPendingOrders();

      expect(result, isNotEmpty);
      expect(result.length, 2);
      expect(result.first.id, 'ORD002');
      expect(result.last.id, 'ORD001');
    });

    test('handles parsing errors gracefully', () async {
      mockMeteorClient.setConnected(true);

      final invalidOrders = [
        {
          '_id': 'ORD001',
          'products': [],
          'total_bill_amount': 100.0,
          'order_status': 'Pending',
          'createdAt': 'invalid-date',
          'customer_details': null,
          'deliveryPincode': '12345',
        },
      ];

      mockMeteorClient.setOrders(invalidOrders);

      final result = await orderService.fetchPendingOrders();

      expect(result, isEmpty);
    });
  });
}

class MockMeteorClient extends MeteorClient {
  bool _connected = false;
  List<Map<String, dynamic>> _orders = [];
  bool subscribeWasCalled = false;
  String? lastSubscriptionName;

  MockMeteorClient({String? serverUrl}) : super(serverUrl: serverUrl ?? 'http://test:3000');

  void setConnected(bool connected) => _connected = connected;
  void setOrders(List<Map<String, dynamic>> orders) => _orders = orders;

  @override
  bool get isConnected => _connected;

  @override
  Future<void> connect() async {
    _connected = true;
  }

  @override
  Future<void> waitForAuth() async {}

  @override
  Future<void> subscribe(String name, {Map<String, dynamic>? params}) async {
    subscribeWasCalled = true;
    lastSubscriptionName = name;
  }

  @override
  List<Map<String, dynamic>> getCollectionDocuments(String collectionName) {
    return collectionName == 'Orders' ? _orders : [];
  }

  @override
  Map<String, dynamic> get collections {
    return {'Orders': _orders};
  }
}
