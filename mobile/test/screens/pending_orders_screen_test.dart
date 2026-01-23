import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:mydev/models/order.dart';
import 'package:mydev/screens/public/pending_orders_screen.dart';
import 'package:mydev/providers/cart_provider.dart';
import 'package:mydev/services/order_service.dart';
import 'package:mydev/services/meteor_client.dart';

void main() {
  group('PendingOrdersScreen', () {
    late MockOrderService mockOrderService;
    late MockCartProvider mockCartProvider;

    setUp(() {
      mockOrderService = MockOrderService();
      mockCartProvider = MockCartProvider(mockOrderService);
    });

    testWidgets('displays loading indicator while fetching orders',
        (WidgetTester tester) async {
      mockOrderService.setPendingOrdersFuture(
        Future.delayed(const Duration(seconds: 1), () => []),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<CartProvider>.value(
            value: mockCartProvider,
            child: const PendingOrdersScreen(),
          ),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('displays empty state when no pending orders exist',
        (WidgetTester tester) async {
      mockOrderService.setPendingOrdersFuture(Future.value([]));

      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<CartProvider>.value(
            value: mockCartProvider,
            child: const PendingOrdersScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('No Pending Orders'), findsOneWidget);
      expect(find.text('You have no pending orders.'), findsOneWidget);
    });

    testWidgets('displays pending orders list', (WidgetTester tester) async {
      final orders = [
        Order(
          id: 'ORD001',
          products: [],
          totalBillAmount: 250.00,
          orderStatus: OrderStatus.pending,
          createdAt: DateTime(2026, 1, 17),
          customerDetails: CustomerDetails(
            id: 'CUST001',
            name: 'Test User',
            email: 'test@example.com',
            mobilePhone: 9999999999,
            deliveryAddress: 'Test Address',
            role: 'customer',
          ),
          deliveryPincode: '12345',
        ),
      ];

      mockOrderService.setPendingOrdersFuture(Future.value(orders));

      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<CartProvider>.value(
            value: mockCartProvider,
            child: const PendingOrdersScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.byType(PendingOrderCard), findsOneWidget);
      expect(find.text('₹250.00'), findsOneWidget);
    });

    testWidgets('displays error state with retry button on error',
        (WidgetTester tester) async {
      mockOrderService.setPendingOrdersFuture(
        Future.error(Exception('Test error')),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<CartProvider>.value(
            value: mockCartProvider,
            child: const PendingOrdersScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Error Loading Orders'), findsOneWidget);
      expect(find.byType(ElevatedButton), findsOneWidget);
    });
  });
}

class MockOrderService extends OrderService {
  late Future<List<Order>> _pendingOrdersFuture;

  void setPendingOrdersFuture(Future<List<Order>> future) {
    _pendingOrdersFuture = future;
  }

  @override
  Future<List<Order>> fetchPendingOrders() => _pendingOrdersFuture;
}

class MockCartProvider extends CartProvider {
  MockCartProvider(OrderService orderService)
      : super(orderService: orderService);
}
