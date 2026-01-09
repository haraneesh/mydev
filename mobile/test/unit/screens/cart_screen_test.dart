import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:suvai/models/product.dart';
import 'package:suvai/providers/cart_provider.dart';
import 'package:suvai/screens/public/cart_screen.dart';
import '../../test_helpers/cart_storage_nullable.dart';

void main() {
  group('CartScreen', () {
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
    });

    testWidgets('displays cart items', (WidgetTester tester) async {
      await cartProvider.addItem(mockProduct, 2);

      await tester.pumpWidget(
        ChangeNotifierProvider.value(
          value: cartProvider,
          child: const MaterialApp(
            home: CartScreen(),
          ),
        ),
      );

      expect(find.text('Biryani'), findsOneWidget);
      expect(find.text('2'), findsWidgets);
    });

    testWidgets('shows empty cart message when no items', (WidgetTester tester) async {
      await tester.pumpWidget(
        ChangeNotifierProvider.value(
          value: cartProvider,
          child: const MaterialApp(
            home: CartScreen(),
          ),
        ),
      );

      expect(find.text('Your cart is empty'), findsOneWidget);
    });

    testWidgets('displays total amount', (WidgetTester tester) async {
      await cartProvider.addItem(mockProduct, 2);

      await tester.pumpWidget(
        ChangeNotifierProvider.value(
          value: cartProvider,
          child: const MaterialApp(
            home: CartScreen(),
          ),
        ),
      );

      expect(find.text('500'), findsOneWidget);
    });

    testWidgets('can remove item from cart', (WidgetTester tester) async {
      await cartProvider.addItem(mockProduct, 2);

      await tester.pumpWidget(
        ChangeNotifierProvider.value(
          value: cartProvider,
          child: const MaterialApp(
            home: CartScreen(),
          ),
        ),
      );

      expect(find.text('Biryani'), findsOneWidget);

      await tester.tap(find.byIcon(Icons.delete));
      await tester.pumpAndSettle();

      expect(find.text('Biryani'), findsNothing);
    });
  });
}
