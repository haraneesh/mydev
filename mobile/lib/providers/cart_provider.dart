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
  final List<CartItem> _removedItems = [];
  final CartStorage _cartStorage;
  final OrderService _orderService;
  final Map<String, Product> _productsMap = {};
  String _lastOrderId = '';

  List<CartItem> get items => _items;

  List<CartItem> get removedItems => _removedItems;

  double get totalAmount =>
      _items.fold(0.0, (sum, item) => sum + item.subtotal);

  int get itemCount =>
      _items.fold(0.0, (sum, item) => sum + item.quantity).toInt();

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

  /// Adds an item to cart with optional unit selection
  /// [selectedUnit] is the fraction (e.g., 0.2, 0.4) - defaults to 1.0 (full unit)
  /// If the product was previously removed, it will be restored from the removed items
  Future<void> addItem(Product product, double quantity, {double selectedUnit = 1.0}) async {
    if (quantity <= 0) return;

    debugPrint('➕ addItem: ${product.name}, selectedUnit: $selectedUnit, quantity: $quantity');

    // Check if product exists in removed items and restore it
    final removedIndex = _removedItems.indexWhere((i) => i.product.id == product.id);
    if (removedIndex >= 0) {
      debugPrint('   Product was removed, restoring it...');
      _removedItems.removeAt(removedIndex);
    }

    // Calculate the unit-specific price
    final unitPrice = product.calculateUnitPrice(selectedUnit);

    // Check if item with same product AND same unit already exists
    final existingIndex = _items.indexWhere((i) => 
      i.product.id == product.id && i.selectedUnit == selectedUnit
    );

    if (existingIndex >= 0) {
      // Increase quantity of existing item
      debugPrint('   Same unit already in cart, increasing quantity from ${_items[existingIndex].quantity} to ${_items[existingIndex].quantity + quantity}');
      _items[existingIndex].quantity += quantity;
    } else {
      // Add new item with this unit selection
      debugPrint('   Adding new cart item');
      _items.add(CartItem(
        product: product,
        quantity: quantity,
        selectedUnit: selectedUnit,
        selectedUnitPrice: unitPrice > 0 ? unitPrice : null,
      ));
    }

    debugPrint('✅ addItem complete. Cart now has ${_items.length} items');
    await _cartStorage.saveCart(_items);
    notifyListeners();
  }

  /// Moves an item from the cart to the removed items section
  /// The item is kept in memory so it can be restored later
  Future<void> moveItemToRemoved(String productId) async {
    final itemIndex = _items.indexWhere((i) => i.product.id == productId);
    if (itemIndex >= 0) {
      debugPrint('🗑️ Moving product to removed: $productId');
      _removedItems.add(_items[itemIndex]);
      _items.removeAt(itemIndex);
      await _cartStorage.saveCart(_items);
      notifyListeners();
    }
  }

  Future<void> removeItem(String productId) async {
    _items.removeWhere((i) => i.product.id == productId);
    await _cartStorage.saveCart(_items);
    notifyListeners();
  }

  /// Removes a specific cart item by product ID and selected unit
  /// Used when changing unit selection or deleting a specific unit variant
  Future<void> removeItemByUnit(String productId, double selectedUnit) async {
    _items.removeWhere((i) => 
      i.product.id == productId && i.selectedUnit == selectedUnit
    );
    await _cartStorage.saveCart(_items);
    notifyListeners();
  }

  /// Updates quantity for a specific cart item (identified by product ID and selected unit)
  Future<void> updateQuantity(String productId, double quantity, {double selectedUnit = 1.0}) async {
    final index = _items.indexWhere((i) => 
      i.product.id == productId && i.selectedUnit == selectedUnit
    );
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

  /// Updates the selected unit for a product already in the cart
  /// Replaces the old unit with the new selected unit (selectedUnit IS the quantity)
  /// If product is not in cart, this method does nothing
  Future<void> updateItemUnit(String productId, double newSelectedUnit) async {
    debugPrint('🚀 updateItemUnit START: productId=$productId, newSelectedUnit=$newSelectedUnit');
    
    // Find the existing cart item for this product
    final existingIndex = _items.indexWhere((i) => i.product.id == productId);
    
    if (existingIndex >= 0) {
      final existingCartItem = _items[existingIndex];
      final product = existingCartItem.product; // Use product from cart item
      final oldUnit = existingCartItem.selectedUnit;
      
      debugPrint('🔄 updateItemUnit: Found product at index $existingIndex, oldUnit: $oldUnit, newUnit: $newSelectedUnit');
      debugPrint('   Product name: ${product.name}, Product ID: ${product.id}');
      
      // Update the item in place (same index)
      // Note: quantity is set to 1.0 because selectedUnit IS the quantity in this app
      final newUnitPrice = product.calculateUnitPrice(newSelectedUnit);
      _items[existingIndex] = CartItem(
        product: product,
        quantity: 1.0,
        selectedUnit: newSelectedUnit,
        selectedUnitPrice: newUnitPrice > 0 ? newUnitPrice : null,
      );
      debugPrint('   ✏️ Updated item at index $existingIndex: unit=$oldUnit → $newSelectedUnit, price=${_items[existingIndex].selectedUnitPrice}');
      
      debugPrint('✅ updateItemUnit: Cart updated. Items count: ${_items.length}');
      for (var item in _items) {
        debugPrint('   📦 Cart item: ${item.product.name}: unit=${item.selectedUnit}, price=${item.selectedUnitPrice}');
      }
      
      await _cartStorage.saveCart(_items);
      debugPrint('   💾 Saved to storage');
      
      debugPrint('📢 Calling notifyListeners()...');
      notifyListeners();
      debugPrint('✅ notifyListeners() completed');
    } else {
      debugPrint('❌ updateItemUnit: Product $productId not found in cart (cart items: ${_items.map((i) => i.product.id).toList()})');
    }
    
    debugPrint('🎉 updateItemUnit END\n');
  }

  Future<void> clearCart() async {
    _items = [];
    _removedItems.clear();
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
      _removedItems.clear();
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
