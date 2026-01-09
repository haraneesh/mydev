import 'package:flutter/foundation.dart';
import '../models/product.dart';
import '../screens/public/checkout_screen.dart';
import '../services/cart_service.dart';
import '../services/order_service.dart';

abstract class CartStorage {
  Future<List<CartItem>> getCart(Map<String, Product> productsMap);
  Future<void> saveCart(List<CartItem> items);
  Future<void> clearCart();
}

class CartProvider extends ChangeNotifier {
  List<CartItem> _items = [];
  final CartStorage _cartStorage;
  final OrderService _orderService;
  final Map<String, Product> _productsMap = {};
  String _lastOrderId = '';

  List<CartItem> get items => _items;

  double get totalAmount =>
      _items.fold(0.0, (sum, item) => sum + item.subtotal);

  int get itemCount =>
      _items.fold(0, (sum, item) => sum + item.quantity);

  String get lastOrderId => _lastOrderId;

  CartProvider({
    CartStorage? cartStorage,
    OrderService? orderService,
  })  : _cartStorage = cartStorage ?? _DefaultCartStorage(),
        _orderService = orderService ?? OrderService();

  Future<void> initializeProducts(List<Product> products) async {
    _productsMap.clear();
    for (final product in products) {
      _productsMap[product.id] = product;
    }
  }

  Future<void> loadCart() async {
    _items = await _cartStorage.getCart(_productsMap);
    notifyListeners();
  }

  Future<void> addItem(Product product, int quantity) async {
    if (quantity <= 0) return;

    final existingIndex = _items.indexWhere((i) => i.product.id == product.id);

    if (existingIndex >= 0) {
      _items[existingIndex].quantity += quantity;
    } else {
      _items.add(CartItem(product: product, quantity: quantity));
    }

    await _cartStorage.saveCart(_items);
    notifyListeners();
  }

  Future<void> removeItem(String productId) async {
    _items.removeWhere((i) => i.product.id == productId);
    await _cartStorage.saveCart(_items);
    notifyListeners();
  }

  Future<void> updateQuantity(String productId, int quantity) async {
    final index = _items.indexWhere((i) => i.product.id == productId);
    if (index >= 0) {
      if (quantity <= 0) {
        _items.removeAt(index);
      } else {
        _items[index].quantity = quantity;
      }
      await _cartStorage.saveCart(_items);
      notifyListeners();
    }
  }

  Future<void> clearCart() async {
    _items = [];
    await _cartStorage.clearCart();
    notifyListeners();
  }

  Future<String> placeOrder(CheckoutData checkoutData) async {
    if (_items.isEmpty) {
      throw Exception('Cart is empty');
    }

    try {
      debugPrint(
        'Placing order: ${checkoutData.name}, ${checkoutData.phone}, ${checkoutData.address}',
      );

      final orderId = await _orderService.submitOrder(checkoutData);

      await _cartStorage.clearCart();
      _items = [];
      _lastOrderId = orderId;
      notifyListeners();

      return orderId;
    } catch (e) {
      debugPrint('Error placing order: $e');
      rethrow;
    }
  }
}

class _DefaultCartStorage implements CartStorage {
  final CartService _cartService = CartService();

  @override
  Future<List<CartItem>> getCart(Map<String, Product> productsMap) {
    return _cartService.getCart(productsMap);
  }

  @override
  Future<void> saveCart(List<CartItem> items) {
    return _cartService.saveCart(items);
  }

  @override
  Future<void> clearCart() {
    return _cartService.clearCart();
  }
}
