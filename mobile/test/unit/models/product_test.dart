import 'package:flutter_test/flutter_test.dart';
import 'package:suvai/models/product.dart';

void main() {
  group('Product', () {
    test('creates product with required fields', () {
      final product = Product(
        id: '1',
        name: 'Sambar',
        description: 'South Indian sambar',
        price: 50.0,
        category: 'Curries',
        subcategory: 'Vegetarian',
        imageUrl: 'http://example.com/sambar.jpg',
      );

      expect(product.id, '1');
      expect(product.name, 'Sambar');
      expect(product.price, 50.0);
      expect(product.minOrderQuantity, 1);
    });

    test('fromJson deserializes Meteor response correctly', () {
      final json = {
        '_id': 'prod_1',
        'name': 'Idly',
        'description': 'Steamed rice cake',
        'price': 30.0,
        'category': 'Breakfast',
        'subcategory': 'Rice',
        'imageUrl': 'http://example.com/idly.jpg',
        'minOrderQuantity': 2,
      };

      final product = Product.fromJson(json);

      expect(product.id, 'prod_1');
      expect(product.name, 'Idly');
      expect(product.price, 30.0);
      expect(product.minOrderQuantity, 2);
    });

    test('fromJson handles missing fields with defaults', () {
      final json = {
        '_id': 'prod_2',
        'name': 'Dosa',
      };

      final product = Product.fromJson(json);

      expect(product.id, 'prod_2');
      expect(product.name, 'Dosa');
      expect(product.description, '');
      expect(product.price, 0.0);
      expect(product.minOrderQuantity, 1);
    });

    test('toJson serializes product correctly', () {
      final product = Product(
        id: 'prod_3',
        name: 'Vada',
        description: 'Fried lentil donut',
        price: 20.0,
        category: 'Breakfast',
        subcategory: 'Fried',
        imageUrl: 'http://example.com/vada.jpg',
      );

      final json = product.toJson();

      expect(json['_id'], 'prod_3');
      expect(json['name'], 'Vada');
      expect(json['price'], 20.0);
    });

    test('equality compares by id', () {
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
        id: '1',
        name: 'Different Name',
        description: '',
        price: 100.0,
        category: 'Other',
        subcategory: 'Other',
        imageUrl: '',
      );

      expect(product1, product2);
    });

    test('inequality with different ids', () {
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
        name: 'Sambar',
        description: '',
        price: 50.0,
        category: 'Curries',
        subcategory: 'Veg',
        imageUrl: '',
      );

      expect(product1, isNot(product2));
    });
  });

  group('CartItem', () {
    test('creates cart item with product and quantity', () {
      final product = Product(
        id: '1',
        name: 'Sambar',
        description: '',
        price: 50.0,
        category: 'Curries',
        subcategory: 'Veg',
        imageUrl: '',
      );

      final item = CartItem(product: product, quantity: 2);

      expect(item.product.id, '1');
      expect(item.quantity, 2);
    });

    test('calculates subtotal correctly', () {
      final product = Product(
        id: '1',
        name: 'Sambar',
        description: '',
        price: 50.0,
        category: 'Curries',
        subcategory: 'Veg',
        imageUrl: '',
      );

      final item = CartItem(product: product, quantity: 3);

      expect(item.subtotal, 150.0);
    });

    test('toJson includes product id and quantity', () {
      final product = Product(
        id: 'prod_1',
        name: 'Idly',
        description: '',
        price: 30.0,
        category: 'Breakfast',
        subcategory: 'Rice',
        imageUrl: '',
      );

      final item = CartItem(product: product, quantity: 2);
      final json = item.toJson();

      expect(json['productId'], 'prod_1');
      expect(json['quantity'], 2);
    });

    test('default quantity is 1', () {
      final product = Product(
        id: '1',
        name: 'Sambar',
        description: '',
        price: 50.0,
        category: 'Curries',
        subcategory: 'Veg',
        imageUrl: '',
      );

      final item = CartItem(product: product);

      expect(item.quantity, 1);
    });
  });

  group('Order', () {
    test('creates order with required fields', () {
      final order = Order(
        id: 'order_1',
        items: [],
        totalAmount: 150.0,
        createdAt: DateTime(2024, 1, 1),
      );

      expect(order.id, 'order_1');
      expect(order.totalAmount, 150.0);
      expect(order.status, 'placed');
    });

    test('fromJson deserializes order from Meteor response', () {
      final json = {
        '_id': 'order_1',
        'totalAmount': 250.0,
        'status': 'completed',
        'createdAt': '2024-01-01T10:00:00.000Z',
      };

      final order = Order.fromJson(json);

      expect(order.id, 'order_1');
      expect(order.totalAmount, 250.0);
      expect(order.status, 'completed');
    });

    test('toJson serializes order correctly', () {
      final order = Order(
        id: 'order_1',
        items: [],
        totalAmount: 150.0,
        status: 'pending',
        createdAt: DateTime(2024, 1, 1),
      );

      final json = order.toJson();

      expect(json['_id'], 'order_1');
      expect(json['totalAmount'], 150.0);
      expect(json['status'], 'pending');
    });
  });
}
