import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:mydev/models/order.dart';
import 'package:mydev/screens/public/order_details_screen.dart';
import 'package:mydev/providers/cart_provider.dart';
import 'package:mydev/services/order_service.dart';

void main() {
  group('OrderDetailsScreen', () {
    late MockOrderService mockOrderService;
    late MockCartProvider mockCartProvider;

    setUp(() {
      mockOrderService = MockOrderService();
      mockCartProvider = MockCartProvider(mockOrderService);
    });

    testWidgets('displays loading indicator while fetching order',
        (WidgetTester tester) async {
      mockOrderService.setOrderFuture(
        Future.delayed(const Duration(seconds: 1), () => null),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<CartProvider>.value(
            value: mockCartProvider,
            child: const OrderDetailsScreen(orderId: 'ORD001'),
          ),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('displays error message when order not found',
        (WidgetTester tester) async {
      mockOrderService.setOrderFuture(Future.value(null));

      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<CartProvider>.value(
            value: mockCartProvider,
            child: const OrderDetailsScreen(orderId: 'ORD999'),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Order not found'), findsOneWidget);
    });

    testWidgets('displays order with date, status badge, and edit button',
        (WidgetTester tester) async {
      final order = Order(
        id: 'ORD001',
        products: [
          OrderProduct(
            id: 'PROD001',
            sku: 'SKU001',
            name: 'CHANNA DHAL / KADALAI PARUPU 1 Kg',
            unitPrice: 220.00,
            unitOfSale: '1 Kg',
            quantity: 0.4,
            imagePath: null,
          ),
        ],
        totalBillAmount: 88.00,
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
        comments: 'Clear cart check',
        deliveryPincode: '12345',
      );

      mockOrderService.setOrderFuture(Future.value(order));

      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<CartProvider>.value(
            value: mockCartProvider,
            child: const OrderDetailsScreen(orderId: 'ORD001'),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Saturday, 17 Jan 2026'), findsOneWidget);
      expect(find.text('EDIT ORDER'), findsOneWidget);
      expect(find.text('Order Placed'), findsOneWidget);
    });

    testWidgets('displays itemized products table with name, rate, qty, value',
        (WidgetTester tester) async {
      final order = Order(
        id: 'ORD001',
        products: [
          OrderProduct(
            id: 'PROD001',
            sku: 'SKU001',
            name: 'CHANNA DHAL / KADALAI PARUPU 1 Kg',
            unitPrice: 220.00,
            unitOfSale: 'Kg',
            quantity: 0.4,
            imagePath: null,
          ),
          OrderProduct(
            id: 'PROD002',
            sku: 'SKU002',
            name: 'GREEN MOONG-SPLIT 1Kg',
            unitPrice: 198.00,
            unitOfSale: 'Kg',
            quantity: 0.6,
            imagePath: null,
          ),
        ],
        totalBillAmount: 206.80,
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
        comments: null,
        deliveryPincode: '12345',
      );

      mockOrderService.setOrderFuture(Future.value(order));

      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<CartProvider>.value(
            value: mockCartProvider,
            child: const OrderDetailsScreen(orderId: 'ORD001'),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Name'), findsOneWidget);
      expect(find.text('Rate'), findsOneWidget);
      expect(find.text('Qty'), findsOneWidget);
      expect(find.text('Value'), findsOneWidget);
      expect(find.text('CHANNA DHAL / KADALAI PARUPU 1 Kg'), findsOneWidget);
      expect(find.text('GREEN MOONG-SPLIT 1Kg'), findsOneWidget);
      expect(find.text('₹220.00'), findsWidgets);
    });

    testWidgets('displays packaging notes section when comments exist',
        (WidgetTester tester) async {
      final order = Order(
        id: 'ORD001',
        products: [],
        totalBillAmount: 88.00,
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
        comments: 'Clear cart check',
        deliveryPincode: '12345',
      );

      mockOrderService.setOrderFuture(Future.value(order));

      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<CartProvider>.value(
            value: mockCartProvider,
            child: const OrderDetailsScreen(orderId: 'ORD001'),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Notes for packaging team'), findsOneWidget);
      expect(find.text('Clear cart check'), findsOneWidget);
    });

    testWidgets('displays total amount at bottom', (WidgetTester tester) async {
      final order = Order(
        id: 'ORD001',
        products: [],
        totalBillAmount: 206.80,
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
      );

      mockOrderService.setOrderFuture(Future.value(order));

      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<CartProvider>.value(
            value: mockCartProvider,
            child: const OrderDetailsScreen(orderId: 'ORD001'),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Amount:'), findsOneWidget);
      expect(find.text('₹206.80'), findsOneWidget);
    });
  });
}

class MockOrderService extends OrderService {
  late Future<Order?> _orderFuture;

  void setOrderFuture(Future<Order?> future) {
    _orderFuture = future;
  }

  @override
  Future<Order?> getOrderStatus(String orderId) => _orderFuture;
}

class MockCartProvider extends CartProvider {
  MockCartProvider(OrderService orderService)
      : super(orderService: orderService);
}
