import 'package:flutter_test/flutter_test.dart';
import 'package:suvai/models/product.dart';
import 'package:suvai/providers/cart_provider.dart';

class InMemoryCartStorage implements CartStorage {
  final Map<String, CartItem> _cart = {};

  @override
  Future<List<CartItem>> getCart(Map<String, Product> productsMap) async {
    return _cart.values.toList();
  }

  @override
  Future<void> saveCart(List<CartItem> items) async {
    _cart.clear();
    for (final item in items) {
      _cart[item.product.id] = item;
    }
  }

  @override
  Future<void> clearCart() async {
    _cart.clear();
  }
}

void main() {
  late CartProvider cartProvider;
  late InMemoryCartStorage mockStorage;

  setUp(() {
    mockStorage = InMemoryCartStorage();
    cartProvider = CartProvider(cartStorage: mockStorage);
  });

  group('CartProvider', () {
    test('starts with empty items', () {
      expect(cartProvider.items, isEmpty);
    });

    test('calculates total amount as zero when empty', () {
      expect(cartProvider.totalAmount, 0.0);
    });

    test('calculates item count as zero when empty', () {
      expect(cartProvider.itemCount, 0);
    });

    test('adds item to cart', () async {
      final product = Product(
        id: '1',
        name: 'Sambar',
        description: 'Curry',
        price: 50.0,
        category: 'Curries',
        subcategory: 'Veg',
        imageUrl: '',
      );

      await cartProvider.addItem(product, 2);

      expect(cartProvider.items.length, 1);
      expect(cartProvider.items[0].product.id, '1');
      expect(cartProvider.items[0].quantity, 2);
    });

    test('increases quantity when adding existing product', () async {
      final product = Product(
        id: '1',
        name: 'Sambar',
        description: 'Curry',
        price: 50.0,
        category: 'Curries',
        subcategory: 'Veg',
        imageUrl: '',
      );

      await cartProvider.addItem(product, 1);
      await cartProvider.addItem(product, 2);

      expect(cartProvider.items.length, 1);
      expect(cartProvider.items[0].quantity, 3);
    });

    test('calculates total amount correctly', () async {
      final product1 = Product(
        id: '1',
        name: 'Sambar',
        description: '',
        price: 50.0,
        category: 'Curries',
        subcategory: 'Veg',
        imageUrl: '',
      );

      final product2 = Product(
        id: '2',
        name: 'Idly',
        description: '',
        price: 30.0,
        category: 'Breakfast',
        subcategory: 'Rice',
        imageUrl: '',
      );

      await cartProvider.addItem(product1, 2);
      await cartProvider.addItem(product2, 1);

      expect(cartProvider.totalAmount, 130.0);
    });

    test('calculates item count correctly', () async {
      final product = Product(
        id: '1',
        name: 'Sambar',
        description: '',
        price: 50.0,
        category: 'Curries',
        subcategory: 'Veg',
        imageUrl: '',
      );

      await cartProvider.addItem(product, 2);

      expect(cartProvider.itemCount, 2);
    });

    test('removes item from cart', () async {
      final product = Product(
        id: '1',
        name: 'Sambar',
        description: '',
        price: 50.0,
        category: 'Curries',
        subcategory: 'Veg',
        imageUrl: '',
      );

      await cartProvider.addItem(product, 1);
      await cartProvider.removeItem('1');

      expect(cartProvider.items, isEmpty);
    });

    test('updates quantity of existing item', () async {
      final product = Product(
        id: '1',
        name: 'Sambar',
        description: '',
        price: 50.0,
        category: 'Curries',
        subcategory: 'Veg',
        imageUrl: '',
      );

      await cartProvider.addItem(product, 1);
      await cartProvider.updateQuantity('1', 5);

      expect(cartProvider.items[0].quantity, 5);
    });

    test('removes item when quantity set to zero', () async {
      final product = Product(
        id: '1',
        name: 'Sambar',
        description: '',
        price: 50.0,
        category: 'Curries',
        subcategory: 'Veg',
        imageUrl: '',
      );

      await cartProvider.addItem(product, 1);
      await cartProvider.updateQuantity('1', 0);

      expect(cartProvider.items, isEmpty);
    });

    test('removes item when quantity set to negative', () async {
      final product = Product(
        id: '1',
        name: 'Sambar',
        description: '',
        price: 50.0,
        category: 'Curries',
        subcategory: 'Veg',
        imageUrl: '',
      );

      await cartProvider.addItem(product, 1);
      await cartProvider.updateQuantity('1', -1);

      expect(cartProvider.items, isEmpty);
    });

    test('clears all items from cart', () async {
      final product1 = Product(
        id: '1',
        name: 'Sambar',
        description: '',
        price: 50.0,
        category: 'Curries',
        subcategory: 'Veg',
        imageUrl: '',
      );

      final product2 = Product(
        id: '2',
        name: 'Idly',
        description: '',
        price: 30.0,
        category: 'Breakfast',
        subcategory: 'Rice',
        imageUrl: '',
      );

      await cartProvider.addItem(product1, 1);
      await cartProvider.addItem(product2, 2);
      await cartProvider.clearCart();

      expect(cartProvider.items, isEmpty);
      expect(cartProvider.totalAmount, 0.0);
    });

    test('does not add item with zero quantity', () async {
      final product = Product(
        id: '1',
        name: 'Sambar',
        description: '',
        price: 50.0,
        category: 'Curries',
        subcategory: 'Veg',
        imageUrl: '',
      );

      await cartProvider.addItem(product, 0);

      expect(cartProvider.items, isEmpty);
    });

    test('does not add item with negative quantity', () async {
      final product = Product(
        id: '1',
        name: 'Sambar',
        description: '',
        price: 50.0,
        category: 'Curries',
        subcategory: 'Veg',
        imageUrl: '',
      );

      await cartProvider.addItem(product, -5);

      expect(cartProvider.items, isEmpty);
    });

    test('initializes products map', () async {
      final products = [
        Product(
          id: '1',
          name: 'Sambar',
          description: '',
          price: 50.0,
          category: 'Curries',
          subcategory: 'Veg',
          imageUrl: '',
        ),
        Product(
          id: '2',
          name: 'Idly',
          description: '',
          price: 30.0,
          category: 'Breakfast',
          subcategory: 'Rice',
          imageUrl: '',
        ),
      ];

      await cartProvider.initializeProducts(products);

      expect(cartProvider.items, isEmpty);
    });

    test('notifies listeners on item added', () async {
      final product = Product(
        id: '1',
        name: 'Sambar',
        description: '',
        price: 50.0,
        category: 'Curries',
        subcategory: 'Veg',
        imageUrl: '',
      );

      var notifyCount = 0;
      cartProvider.addListener(() {
        notifyCount++;
      });

      await cartProvider.addItem(product, 1);

      expect(notifyCount, 1);
    });

    test('notifies listeners on item removed', () async {
      final product = Product(
        id: '1',
        name: 'Sambar',
        description: '',
        price: 50.0,
        category: 'Curries',
        subcategory: 'Veg',
        imageUrl: '',
      );

      await cartProvider.addItem(product, 1);

      var notifyCount = 0;
      cartProvider.addListener(() {
        notifyCount++;
      });

      await cartProvider.removeItem('1');

      expect(notifyCount, 1);
    });

    test('notifies listeners on quantity updated', () async {
      final product = Product(
        id: '1',
        name: 'Sambar',
        description: '',
        price: 50.0,
        category: 'Curries',
        subcategory: 'Veg',
        imageUrl: '',
      );

      await cartProvider.addItem(product, 1);

      var notifyCount = 0;
      cartProvider.addListener(() {
        notifyCount++;
      });

      await cartProvider.updateQuantity('1', 5);

      expect(notifyCount, 1);
    });

    test('notifies listeners on cart cleared', () async {
      final product = Product(
        id: '1',
        name: 'Sambar',
        description: '',
        price: 50.0,
        category: 'Curries',
        subcategory: 'Veg',
        imageUrl: '',
      );

      await cartProvider.addItem(product, 1);

      var notifyCount = 0;
      cartProvider.addListener(() {
        notifyCount++;
      });

      await cartProvider.clearCart();

      expect(notifyCount, 1);
    });
  });
}
