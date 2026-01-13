import 'package:flutter_test/flutter_test.dart';
import 'package:suvai/models/product.dart';
import 'package:suvai/screens/public/checkout_screen.dart';
import 'package:suvai/services/order_service.dart';
import '../../test_helpers/mock_meteor_client.dart';

void main() {
  group('OrderService', () {
    late OrderService orderService;
    late MockMeteorClient mockClient;

    setUp(() {
      mockClient = MockMeteorClient();
      orderService = OrderService();
      orderService.setMeteorClient(mockClient);
    });

    testWidgets('submitOrder returns orderId on success', (WidgetTester tester) async {
      await mockClient.connect();

      final product = Product(
        id: '1',
        name: 'Biryani',
        description: 'Test biryani',
        price: 250.0,
        category: 'Biryani',
        subcategory: 'Rice',
        imageUrl: '',
      );

      final items = [CartItem(product: product, quantity: 2, selectedUnit: 1.0, selectedUnitPrice: product.price)];

      final checkoutData = CheckoutData(
        name: 'John Doe',
        phone: '9876543210',
        address: '123 Main St, City',
        items: items,
        totalAmount: 500.0,
      );

      final orderId = await orderService.submitOrder(checkoutData);

      expect(orderId, isNotEmpty);
      expect(orderId, isA<String>());
    });

    testWidgets('submitOrder validates empty name', (WidgetTester tester) async {
      await mockClient.connect();

      final product = Product(
        id: '1',
        name: 'Biryani',
        description: 'Test',
        price: 250.0,
        category: 'Biryani',
        subcategory: 'Rice',
        imageUrl: '',
      );

      final checkoutData = CheckoutData(
        name: '',
        phone: '9876543210',
        address: '123 Main St',
        items: [CartItem(product: product, quantity: 1, selectedUnit: 1.0, selectedUnitPrice: product.price)],
        totalAmount: 250.0,
      );

      expect(
        () => orderService.submitOrder(checkoutData),
        throwsA(isA<ArgumentError>()),
      );
    });

    testWidgets('submitOrder validates empty phone', (WidgetTester tester) async {
      await mockClient.connect();

      final product = Product(
        id: '1',
        name: 'Biryani',
        description: 'Test',
        price: 250.0,
        category: 'Biryani',
        subcategory: 'Rice',
        imageUrl: '',
      );

      final checkoutData = CheckoutData(
        name: 'John Doe',
        phone: '',
        address: '123 Main St',
        items: [CartItem(product: product, quantity: 1, selectedUnit: 1.0, selectedUnitPrice: product.price)],
        totalAmount: 250.0,
      );

      expect(
        () => orderService.submitOrder(checkoutData),
        throwsA(isA<ArgumentError>()),
      );
    });

    testWidgets('submitOrder validates phone length', (WidgetTester tester) async {
      await mockClient.connect();

      final product = Product(
        id: '1',
        name: 'Biryani',
        description: 'Test',
        price: 250.0,
        category: 'Biryani',
        subcategory: 'Rice',
        imageUrl: '',
      );

      final checkoutData = CheckoutData(
        name: 'John Doe',
        phone: '98765432',
        address: '123 Main St',
        items: [CartItem(product: product, quantity: 1, selectedUnit: 1.0, selectedUnitPrice: product.price)],
        totalAmount: 250.0,
      );

      expect(
        () => orderService.submitOrder(checkoutData),
        throwsA(isA<ArgumentError>()),
      );
    });

    testWidgets('submitOrder validates phone contains only numbers', (WidgetTester tester) async {
      await mockClient.connect();

      final product = Product(
        id: '1',
        name: 'Biryani',
        description: 'Test',
        price: 250.0,
        category: 'Biryani',
        subcategory: 'Rice',
        imageUrl: '',
      );

      final checkoutData = CheckoutData(
        name: 'John Doe',
        phone: '987654321a',
        address: '123 Main St',
        items: [CartItem(product: product, quantity: 1, selectedUnit: 1.0, selectedUnitPrice: product.price)],
        totalAmount: 250.0,
      );

      expect(
        () => orderService.submitOrder(checkoutData),
        throwsA(isA<ArgumentError>()),
      );
    });

    testWidgets('submitOrder validates empty address', (WidgetTester tester) async {
      await mockClient.connect();

      final product = Product(
        id: '1',
        name: 'Biryani',
        description: 'Test',
        price: 250.0,
        category: 'Biryani',
        subcategory: 'Rice',
        imageUrl: '',
      );

      final checkoutData = CheckoutData(
        name: 'John Doe',
        phone: '9876543210',
        address: '',
        items: [CartItem(product: product, quantity: 1, selectedUnit: 1.0, selectedUnitPrice: product.price)],
        totalAmount: 250.0,
      );

      expect(
        () => orderService.submitOrder(checkoutData),
        throwsA(isA<ArgumentError>()),
      );
    });

    testWidgets('submitOrder handles server error', (WidgetTester tester) async {
      await mockClient.connect();
      mockClient.shouldFailCall = true;
      mockClient.failureMessage = 'Server error';

      final product = Product(
        id: '1',
        name: 'Biryani',
        description: 'Test',
        price: 250.0,
        category: 'Biryani',
        subcategory: 'Rice',
        imageUrl: '',
      );

      final checkoutData = CheckoutData(
        name: 'John Doe',
        phone: '9876543210',
        address: '123 Main St',
        items: [CartItem(product: product, quantity: 1, selectedUnit: 1.0, selectedUnitPrice: product.price)],
        totalAmount: 250.0,
      );

      expect(
        () => orderService.submitOrder(checkoutData),
        throwsA(isA<Exception>()),
      );
    });

    testWidgets('getOrderStatus retrieves order when it exists', (WidgetTester tester) async {
      await mockClient.connect();
      await mockClient.subscribe('orders.one');

      final order = await orderService.getOrderStatus('order_123');

      expect(order, isNotNull);
      expect(order?.id, equals('order_123'));
    });

    testWidgets('getOrderStatus returns null when order not found', (WidgetTester tester) async {
      await mockClient.connect();
      await mockClient.subscribe('orders.one');

      final order = await orderService.getOrderStatus('non_existent_order');

      expect(order, isNull);
    });
  });
}
