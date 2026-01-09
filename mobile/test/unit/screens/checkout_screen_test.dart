import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:suvai/models/product.dart';
import 'package:suvai/providers/cart_provider.dart';
import 'package:suvai/screens/public/checkout_screen.dart';
import '../../test_helpers/cart_storage_nullable.dart';

void main() {
  group('CheckoutScreen', () {
    late CartProvider cartProvider;
    late Product mockProduct;

    setUp(() async {
      mockProduct = Product(
        id: '1',
        name: 'Biryani',
        description: 'Hyderabadi biryani',
        price: 250.0,
        category: 'Biryani',
        subcategory: 'Rice',
        imageUrl: '',
      );

      cartProvider = CartProvider(cartStorage: CartStorageNullable());
      await cartProvider.initializeProducts([mockProduct]);
      await cartProvider.addItem(mockProduct, 2);
    });

    testWidgets('displays checkout form', (WidgetTester tester) async {
      await tester.pumpWidget(
        ChangeNotifierProvider.value(
          value: cartProvider,
          child: const MaterialApp(
            home: CheckoutScreen(),
          ),
        ),
      );

      expect(find.text('Checkout'), findsOneWidget);
      expect(find.byType(TextField), findsWidgets);
    });

    testWidgets('displays order summary', (WidgetTester tester) async {
      await tester.pumpWidget(
        ChangeNotifierProvider.value(
          value: cartProvider,
          child: const MaterialApp(
            home: CheckoutScreen(),
          ),
        ),
      );

      expect(find.text('Order Summary'), findsOneWidget);
      expect(find.text('₹500'), findsOneWidget);
    });

    testWidgets('requires phone number', (WidgetTester tester) async {
      await tester.pumpWidget(
        ChangeNotifierProvider.value(
          value: cartProvider,
          child: const MaterialApp(
            home: CheckoutScreen(),
          ),
        ),
      );

      await tester.tap(find.byType(ElevatedButton));
      await tester.pumpAndSettle();

      expect(find.text('Phone number is required'), findsOneWidget);
    });

    testWidgets('requires delivery address', (WidgetTester tester) async {
      await tester.pumpWidget(
        ChangeNotifierProvider.value(
          value: cartProvider,
          child: const MaterialApp(
            home: CheckoutScreen(),
          ),
        ),
      );

      final phoneField = find.byType(TextField).first;
      await tester.enterText(phoneField, '9999999999');

      await tester.tap(find.byType(ElevatedButton));
      await tester.pumpAndSettle();

      expect(find.text('Delivery address is required'), findsOneWidget);
    });

    testWidgets('validates phone number format', (WidgetTester tester) async {
      await tester.pumpWidget(
        ChangeNotifierProvider.value(
          value: cartProvider,
          child: const MaterialApp(
            home: CheckoutScreen(),
          ),
        ),
      );

      final phoneField = find.byType(TextField).first;
      await tester.enterText(phoneField, '123');

      await tester.tap(find.byType(ElevatedButton));
      await tester.pumpAndSettle();

      expect(find.text('Phone number must be 10 digits'), findsOneWidget);
    });

    testWidgets('submits form with valid data', (WidgetTester tester) async {
      var submitCalled = false;

      await tester.pumpWidget(
        ChangeNotifierProvider.value(
          value: cartProvider,
          child: MaterialApp(
            home: CheckoutScreen(
              onOrderPlaced: (_) => submitCalled = true,
            ),
          ),
        ),
      );

      final fields = find.byType(TextField);
      await tester.enterText(fields.at(0), 'John Doe');
      await tester.enterText(fields.at(1), '9999999999');
      await tester.enterText(fields.at(2), '123 Main St');

      await tester.tap(find.byType(ElevatedButton));
      await tester.pumpAndSettle();

      expect(submitCalled, true);
    });
  });
}
