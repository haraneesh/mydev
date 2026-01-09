import 'package:flutter_test/flutter_test.dart';
import 'package:suvai/services/product_service.dart';
import '../../test_helpers/mock_meteor_client.dart';

void main() {
  group('ProductService', () {
    late ProductService productService;

    setUp(() {
      productService = ProductService(meteorClient: MockMeteorClient());
    });

    testWidgets('connects to server', (WidgetTester tester) async {
      expect(productService.isConnected, false);
      
      await productService.connect();
      
      expect(productService.isConnected, true);
    });

    testWidgets('fetches all products when connected', (WidgetTester tester) async {
      await productService.connect();
      
      final products = await productService.fetchProducts();
      
      expect(products.isNotEmpty, true);
      expect(products.length, greaterThan(0));
    });

    testWidgets('fetches products by category', (WidgetTester tester) async {
      await productService.connect();
      
      final biryaniProducts = await productService.fetchProducts(category: 'Biryani');
      
      expect(biryaniProducts.isNotEmpty, true);
      expect(biryaniProducts.every((p) => p.category == 'Biryani'), true);
    });

    testWidgets('fetches all products when category is All', (WidgetTester tester) async {
      await productService.connect();
      
      final allProducts = await productService.fetchProducts(category: 'All');
      final filtered = await productService.fetchProducts();
      
      expect(allProducts.length, equals(filtered.length));
    });

    testWidgets('filters breakfast products', (WidgetTester tester) async {
      await productService.connect();
      
      final breakfastProducts = await productService.fetchProducts(category: 'Breakfast');
      
      expect(breakfastProducts.isNotEmpty, true);
      expect(breakfastProducts.every((p) => p.category == 'Breakfast'), true);
    });

    testWidgets('throws error when not connected', (WidgetTester tester) async {
      expect(
        () => productService.fetchProducts(),
        throwsException,
      );
    });

    testWidgets('fetches product by ID', (WidgetTester tester) async {
      await productService.connect();
      
      final product = await productService.fetchProductById('1');
      
      expect(product, isNotNull);
      expect(product!.id, equals('1'));
      expect(product.name, equals('Hyderabadi Biryani'));
    });

    testWidgets('throws error for non-existent product ID', (WidgetTester tester) async {
      await productService.connect();
      
      expect(
        () => productService.fetchProductById('nonexistent'),
        throwsException,
      );
    });

    testWidgets('fetches categories', (WidgetTester tester) async {
      await productService.connect();
      
      final categories = await productService.fetchCategories();
      
      expect(categories.isNotEmpty, true);
      expect(categories.first, equals('All'));
      expect(categories.contains('Biryani'), true);
      expect(categories.contains('Breakfast'), true);
    });

    testWidgets('categories are sorted', (WidgetTester tester) async {
      await productService.connect();
      
      final categories = await productService.fetchCategories();
      final sorted = [...categories];
      sorted.sort();
      
      expect(categories, equals(sorted));
    });

    testWidgets('disconnects from server', (WidgetTester tester) async {
      await productService.connect();
      expect(productService.isConnected, true);
      
      await productService.disconnect();
      
      expect(productService.isConnected, false);
    });
  });
}
