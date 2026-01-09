import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:suvai/models/product.dart';
import 'package:suvai/providers/cart_provider.dart';
import 'package:suvai/widgets/product_card.dart';
import '../../test_helpers/cart_storage_nullable.dart';

void main() {
  group('ProductCard', () {
    late Product mockProduct;

    setUp(() {
      mockProduct = Product(
        id: '1',
        name: 'Biryani',
        description: 'Hyderabadi biryani',
        price: 250.0,
        category: 'Biryani',
        subcategory: 'Rice',
        imageUrl: '',
      );
    });

    testWidgets('displays product name', (WidgetTester tester) async {
      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider(
              create: (_) => CartProvider(cartStorage: CartStorageNullable()),
            ),
          ],
          child: MaterialApp(
            theme: ThemeData.light(),
            home: Scaffold(
              body: ProductCard(product: mockProduct),
            ),
          ),
        ),
      );

      expect(find.text('Biryani'), findsOneWidget);
    });

    testWidgets('displays product price', (WidgetTester tester) async {
      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider(
              create: (_) => CartProvider(cartStorage: CartStorageNullable()),
            ),
          ],
          child: MaterialApp(
            theme: ThemeData.light(),
            home: Scaffold(
              body: ProductCard(product: mockProduct),
            ),
          ),
        ),
      );

      expect(find.text('₹250'), findsOneWidget);
    });

    testWidgets('displays product description', (WidgetTester tester) async {
      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider(
              create: (_) => CartProvider(cartStorage: CartStorageNullable()),
            ),
          ],
          child: MaterialApp(
            theme: ThemeData.light(),
            home: Scaffold(
              body: ProductCard(product: mockProduct),
            ),
          ),
        ),
      );

      expect(find.text('Hyderabadi biryani'), findsOneWidget);
    });

    testWidgets('calls onAddToCart when add button is tapped',
        (WidgetTester tester) async {
      var addToCartCalled = false;

      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider(
              create: (_) => CartProvider(cartStorage: CartStorageNullable()),
            ),
          ],
          child: MaterialApp(
            theme: ThemeData.light(),
            home: Scaffold(
              body: ProductCard(
                product: mockProduct,
                onAddToCart: () => addToCartCalled = true,
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.byIcon(Icons.add_circle));
      await tester.pumpAndSettle();

      expect(addToCartCalled, true);
    });
  });
}
