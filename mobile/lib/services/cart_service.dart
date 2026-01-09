import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../models/product.dart';

class CartService {
  static const String _cartKey = 'app_cart';

  Future<List<CartItem>> getCart(Map<String, Product> productsMap) async {
    final prefs = await SharedPreferences.getInstance();
    final cartJson = prefs.getString(_cartKey);
    if (cartJson == null) return [];

    try {
      final List<dynamic> items = jsonDecode(cartJson);
      return items
          .map((item) {
        final productId = item['productId'] as String?;
        if (productId == null) return null;
        final quantity = item['quantity'] as int? ?? 1;
        final product = productsMap[productId];
        if (product == null) return null;
        return CartItem(product: product, quantity: quantity);
      })
          .whereType<CartItem>()
          .toList();
    } catch (e) {
      return [];
    }
  }

  Future<void> saveCart(List<CartItem> items) async {
    final prefs = await SharedPreferences.getInstance();
    final cartJson = jsonEncode(items.map((i) => i.toJson()).toList());
    await prefs.setString(_cartKey, cartJson);
  }

  Future<void> clearCart() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_cartKey);
  }
}
