import 'package:suvai/models/product.dart';
import 'package:suvai/providers/cart_provider.dart';

class CartStorageNullable implements CartStorage {
  @override
  Future<List<CartItem>> getCart(Map<String, Product> productsMap) async {
    return [];
  }

  @override
  Future<void> saveCart(List<CartItem> items) async {}

  @override
  Future<void> clearCart() async {}
}
