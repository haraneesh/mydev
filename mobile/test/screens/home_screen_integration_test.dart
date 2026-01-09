import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:mydev_mobile/models/product.dart';
import 'package:mydev_mobile/providers/cart_provider.dart';
import 'package:mydev_mobile/providers/auth_provider.dart';
import 'package:mydev_mobile/screens/public/home_screen.dart';

void main() {
  group('HomeScreen Navigation Panel Integration', () {
    late List<Product> mockProducts;

    setUp(() {
      mockProducts = [
        Product(
          id: '1',
          name: 'Tomato',
          category: 'Vegetables',
          price: 10.0,
          description: 'Fresh tomato',
          imageUrl: 'assets/tomato.png',
        ),
        Product(
          id: '2',
          name: 'Carrot',
          category: 'Vegetables',
          price: 8.0,
          description: 'Fresh carrot',
          imageUrl: 'assets/carrot.png',
        ),
        Product(
          id: '3',
          name: 'Apple',
          category: 'Fruits',
          price: 12.0,
          description: 'Fresh apple',
          imageUrl: 'assets/apple.png',
        ),
        Product(
          id: '4',
          name: 'Spinach',
          category: 'Greens',
          price: 15.0,
          description: 'Fresh spinach',
          imageUrl: 'assets/spinach.png',
        ),
      ];
    });

    testWidgets('displays horizontal filter bar on mobile phones',
        (WidgetTester tester) async {
      // Set small screen size (mobile phone)
      tester.binding.window.physicalSizeTestValue = const Size(400, 800);
      addTearDown(tester.binding.window.clearPhysicalSizeTestValue);

      final widget = MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => CartProvider()),
          ChangeNotifierProvider(create: (_) => AuthProvider()),
        ],
        child: MaterialApp(
          home: HomeScreen(initialProducts: mockProducts),
        ),
      );

      await tester.pumpWidget(widget);

      // On mobile (< 600px), should see FilterChip category bar
      expect(find.byType(FilterChip), findsWidgets);
      // Should NOT see CategorySidebar on mobile
      expect(find.byType(CategorySidebar), findsNothing);
    });

    testWidgets('displays sidebar navigation panel on tablets',
        (WidgetTester tester) async {
      // Set tablet screen size
      tester.binding.window.physicalSizeTestValue = const Size(800, 1200);
      addTearDown(tester.binding.window.clearPhysicalSizeTestValue);

      final widget = MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => CartProvider()),
          ChangeNotifierProvider(create: (_) => AuthProvider()),
        ],
        child: MaterialApp(
          home: HomeScreen(initialProducts: mockProducts),
        ),
      );

      await tester.pumpWidget(widget);

      // On tablet (>= 600px), should see CategorySidebar
      expect(find.byType(CategorySidebar), findsOneWidget);
      // Should NOT see FilterChip bar on tablet
      expect(find.byType(FilterChip), findsNothing);
    });

    testWidgets('category selection filters products correctly',
        (WidgetTester tester) async {
      tester.binding.window.physicalSizeTestValue = const Size(800, 1200);
      addTearDown(tester.binding.window.clearPhysicalSizeTestValue);

      final widget = MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => CartProvider()),
          ChangeNotifierProvider(create: (_) => AuthProvider()),
        ],
        child: MaterialApp(
          home: HomeScreen(initialProducts: mockProducts),
        ),
      );

      await tester.pumpWidget(widget);
      await tester.pumpAndSettle();

      // Initially shows all products
      expect(find.byType(ProductCard), findsWidgets);

      // Tap on Vegetables category
      await tester.tap(find.text('Vegetables').first);
      await tester.pumpAndSettle();

      // Should now show only vegetable products
      expect(find.text('Tomato'), findsOneWidget);
      expect(find.text('Carrot'), findsOneWidget);
      // Apple (Fruits) should not be visible
      expect(find.text('Apple'), findsNothing);
    });

    testWidgets('maintains selection state during scrolling',
        (WidgetTester tester) async {
      tester.binding.window.physicalSizeTestValue = const Size(800, 1200);
      addTearDown(tester.binding.window.clearPhysicalSizeTestValue);

      final widget = MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => CartProvider()),
          ChangeNotifierProvider(create: (_) => AuthProvider()),
        ],
        child: MaterialApp(
          home: HomeScreen(initialProducts: mockProducts),
        ),
      );

      await tester.pumpWidget(widget);
      await tester.pumpAndSettle();

      // Select Vegetables
      await tester.tap(find.text('Vegetables').first);
      await tester.pumpAndSettle();

      // Scroll through the grid
      await tester.drag(find.byType(GridView), const Offset(0, -500));
      await tester.pumpAndSettle();

      // Vegetables should still be selected (implicitly verified by products shown)
      expect(find.text('Tomato'), findsOneWidget);
      expect(find.text('Apple'), findsNothing);
    });

    testWidgets('default category is All', (WidgetTester tester) async {
      tester.binding.window.physicalSizeTestValue = const Size(800, 1200);
      addTearDown(tester.binding.window.clearPhysicalSizeTestValue);

      final widget = MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => CartProvider()),
          ChangeNotifierProvider(create: (_) => AuthProvider()),
        ],
        child: MaterialApp(
          home: HomeScreen(initialProducts: mockProducts),
        ),
      );

      await tester.pumpWidget(widget);
      await tester.pumpAndSettle();

      // All products should be visible initially
      expect(find.byType(ProductCard), findsWidgets);
    });
  });
}
