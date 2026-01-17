import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/foundation.dart';
import 'dart:convert';
import '../models/product.dart';

class CartService {
  static const String _cartKey = 'app_cart_v3'; // v3: added selectedUnit and selectedUnitPrice fields
  static const String _oldCartKeyV2 = 'app_cart_v2'; // Old key for migration

  Future<List<CartItem>> getCart(Map<String, Product> productsMap) async {
     final prefs = await SharedPreferences.getInstance();
     
     // Migrate from v2 to v3: clear old v2 data
     await prefs.remove(_oldCartKeyV2);
     
     final cartJson = prefs.getString(_cartKey);
     if (cartJson == null) return [];
  
     try {
       final List<dynamic> items = jsonDecode(cartJson);
       return items
           .map((item) {
         final productId = item['productId'] as String?;
         if (productId == null) return null;
         
         final quantityValue = item['quantity'];
         // Handle both int (legacy) and double quantities
         double quantity = 1.0;
         if (quantityValue is int) {
           quantity = quantityValue.toDouble();
         } else if (quantityValue is double) {
           quantity = quantityValue;
         } else {
           quantity = 1.0;
         }
         
         // Handle selectedUnit (new field for fractional selection)
         final selectedUnitValue = item['selectedUnit'];
         double selectedUnit = 1.0;
         if (selectedUnitValue is int) {
           selectedUnit = selectedUnitValue.toDouble();
         } else if (selectedUnitValue is double) {
           selectedUnit = selectedUnitValue;
         } else {
           selectedUnit = 1.0;
         }
         
         // Handle selectedUnitPrice (new field for unit-specific pricing)
         final selectedUnitPriceValue = item['selectedUnitPrice'];
         double selectedUnitPrice = 0.0;
         if (selectedUnitPriceValue is int) {
           selectedUnitPrice = selectedUnitPriceValue.toDouble();
         } else if (selectedUnitPriceValue is double) {
           selectedUnitPrice = selectedUnitPriceValue;
         } else {
           selectedUnitPrice = 0.0;
         }
         
         final product = productsMap[productId];
         if (product == null) return null;
         
         return CartItem(
           product: product, 
           quantity: quantity,
           selectedUnit: selectedUnit > 0 ? selectedUnit : 1.0,
           selectedUnitPrice: selectedUnitPrice >= 0 ? selectedUnitPrice : 0.0,
         );
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
