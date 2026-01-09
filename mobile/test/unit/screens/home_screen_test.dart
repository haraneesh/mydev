import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:suvai/models/product.dart';
import 'package:suvai/providers/cart_provider.dart';
import 'package:suvai/screens/public/home_screen.dart';
import '../../test_helpers/cart_storage_nullable.dart';

void main() {
  group('HomeScreen', () {
    late List<Product> mockProducts;

    setUp(() {
      mockProducts = [
        Product(
          id: '1',
          name: 'Hyderabadi Biryani',
          description: 'Authentic Hyderabadi biryani with basmati rice',
          price: 250.0,
          category: 'Biryani',
          subcategory: 'Rice',
          imageUrl: '',
        ),
        Product(
          id: '3',
          name: 'Masala Dosa',
          description: 'Crispy dosa with potato masala filling',
          price: 80.0,
          category: 'Breakfast',
          subcategory: 'South Indian',
          imageUrl: '',
        ),
        Product(
          id: '5',
          name: 'Steamed Idli',
          description: 'Soft and fluffy steamed idli (3 pieces)',
          price: 60.0,
          category: 'Breakfast',
          subcategory: 'South Indian',
          imageUrl: '',
        ),
      ];
    });

    testWidgets('displays list of products', (WidgetTester tester) async {
      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider(
              create: (_) => CartProvider(cartStorage: CartStorageNullable()),
            ),
          ],
          child: MaterialApp(
            theme: ThemeData.light(),
            home: HomeScreen(initialProducts: mockProducts),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Hyderabadi Biryani'), findsOneWidget);
      expect(find.text('Masala Dosa'), findsOneWidget);
      expect(find.text('Steamed Idli'), findsOneWidget);
    });

    testWidgets('displays unique categories', (WidgetTester tester) async {
      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider(
              create: (_) => CartProvider(cartStorage: CartStorageNullable()),
            ),
          ],
          child: MaterialApp(
            theme: ThemeData.light(),
            home: HomeScreen(initialProducts: mockProducts),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('All'), findsOneWidget);
      expect(find.text('Biryani'), findsOneWidget);
      expect(find.text('Breakfast'), findsOneWidget);
    });

    testWidgets('filters products by category', (WidgetTester tester) async {
      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider(
              create: (_) => CartProvider(cartStorage: CartStorageNullable()),
            ),
          ],
          child: MaterialApp(
            theme: ThemeData.light(),
            home: HomeScreen(initialProducts: mockProducts),
          ),
        ),
      );

      await tester.pumpAndSettle();

      await tester.tap(find.text('Breakfast'));
      await tester.pumpAndSettle();

      expect(find.text('Masala Dosa'), findsOneWidget);
      expect(find.text('Steamed Idli'), findsOneWidget);
      expect(find.text('Hyderabadi Biryani'), findsNothing);
    });

    testWidgets('shows all products when All category selected',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider(
              create: (_) => CartProvider(cartStorage: CartStorageNullable()),
            ),
          ],
          child: MaterialApp(
            theme: ThemeData.light(),
            home: HomeScreen(initialProducts: mockProducts),
          ),
        ),
      );

      await tester.pumpAndSettle();

      await tester.tap(find.text('Breakfast'));
      await tester.pumpAndSettle();

      await tester.tap(find.text('All'));
      await tester.pumpAndSettle();

      expect(find.text('Hyderabadi Biryani'), findsOneWidget);
      expect(find.text('Masala Dosa'), findsOneWidget);
      expect(find.text('Steamed Idli'), findsOneWidget);
    });

    testWidgets('displays empty state when no products match filter',
        (WidgetTester tester) async {
      final emptyProducts = <Product>[];

      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider(
              create: (_) => CartProvider(cartStorage: CartStorageNullable()),
            ),
          ],
          child: MaterialApp(
            theme: ThemeData.light(),
            home: HomeScreen(initialProducts: emptyProducts),
          ),
        ),
      );

      expect(find.text('No products available'), findsOneWidget);
    });
  });
}
