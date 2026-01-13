import 'package:flutter/foundation.dart';

class Product {
  final String id;
  final String name;
  final String description;
  final double price; // Base price per unit of sale
  final String category;
  final String subcategory;
  final String imageUrl;
  final int minOrderQuantity;
  
  /// Base unit of sale for fractional calculations.
  /// Format: "{number}{unit}" e.g., "1Kg", "1L", "10pieces"
  /// Used with unitsForSelection to calculate fractional quantities.
  final String? unitOfSale;
  
  /// Available fractional units with optional per-fraction discounts.
  /// Format: "{fraction},{fraction=discount%},{fraction},..."
  /// Example: "0,0.2,0.4=5%,0.6,0.8=10%,1"
  /// Meaning:
  ///   - 0.2 = 20% of unitOfSale (e.g., 200g if unitOfSale is 1Kg) - no discount
  ///   - 0.4 = 40% of unitOfSale (e.g., 400g if unitOfSale is 1Kg) - 5% discount
  ///   - 0.6 = 60% of unitOfSale (e.g., 600g if unitOfSale is 1Kg) - no discount
  ///   - 0.8 = 80% of unitOfSale (e.g., 800g if unitOfSale is 1Kg) - 10% discount
  ///   - 1 = full unitOfSale (e.g., 1Kg if unitOfSale is 1Kg) - no discount
  /// 
  /// Price calculation: base_price × fraction × (1 - discount%/100)
  /// Examples:
  ///   - 0.4 with 5% discount: 220 × 0.4 × 0.95 = 83.6
  ///   - 0.8 with 10% discount: 220 × 0.8 × 0.90 = 158.4
  ///   - 0.2 with no discount: 220 × 0.2 = 44
  final String? unitsForSelection;
  
  /// Cached parsed units with discounts (memoized)
  late final Map<double, double?> _memoizedUnitsWithDiscounts = parseUnitsWithDiscounts();
  
  final int maxUnitsAvailableToOrder; // Maximum units that can be ordered
  final int totQuantityOrdered; // Total quantity already ordered
  final int previousOrdQty; // Previous order quantity

  Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.category,
    required this.subcategory,
    required this.imageUrl,
    this.minOrderQuantity = 1,
    this.unitOfSale,
    this.unitsForSelection,
    this.maxUnitsAvailableToOrder = 0,
    this.totQuantityOrdered = 0,
    this.previousOrdQty = 0,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    // The 'type' field from Meteor is the primary category indicator
    // (e.g., 'Vegetables', 'Fruits', 'Greens')
    // The 'category' field is secondary and rarely used
    final category = json['type'] ?? json['category'] ?? '';
    
    // Handle unitOfSale - can be null or empty
    final unitOfSale = json['unitOfSale'] as String?;
    
    // Handle unitsForSelection - ensure it's never null
    final unitsForSelectionRaw = json['unitsForSelection'];
    final unitsForSelection = (unitsForSelectionRaw is String && unitsForSelectionRaw.isNotEmpty)
        ? unitsForSelectionRaw
        : '0,1,2,3,4,5,6,7,8,9,10';
    
    return Product(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 
             (json['unitprice'] as num?)?.toDouble() ?? 0.0,
      category: category,  // Primary: 'type' from Meteor schema
      subcategory: json['subcategory'] ?? '',
      imageUrl: json['imageUrl'] ?? json['image'] ?? json['image_path'] ?? '',
      minOrderQuantity: json['minOrderQuantity'] ?? 1,
      unitOfSale: unitOfSale,
      unitsForSelection: unitsForSelection,
      maxUnitsAvailableToOrder: (json['maxUnitsAvailableToOrder'] as num?)?.toInt() ?? 0,
      totQuantityOrdered: (json['totQuantityOrdered'] as num?)?.toInt() ?? 0,
      previousOrdQty: (json['previousOrdQty'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
    '_id': id,
    'name': name,
    'description': description,
    'price': price,
    'category': category,
    'subcategory': subcategory,
    'imageUrl': imageUrl,
    'minOrderQuantity': minOrderQuantity,
    'unitOfSale': unitOfSale,
    'unitsForSelection': unitsForSelection,
    'maxUnitsAvailableToOrder': maxUnitsAvailableToOrder,
    'totQuantityOrdered': totQuantityOrdered,
    'previousOrdQty': previousOrdQty,
  };

  /// Returns unitsForSelection safely, ensuring it's never null or empty
  String get safeUnitsForSelection {
    final units = unitsForSelection;
    if (units != null && units.isNotEmpty) {
      return units;
    }
    return '0,1,2,3,4,5,6,7,8,9,10';
  }

  /// Parses unitsForSelection format: "0,0.2,0.4=5%,0.6,0.8=10%,1"
  /// Returns a map of fraction -> discount percentage (or null if no discount)
  /// Only fractions > 0 are included (0 is filtered out as placeholder)
  Map<double, double?> parseUnitsWithDiscounts() {
    final result = <double, double?>{};
    final items = safeUnitsForSelection.split(',');
    
    for (final item in items) {
      final trimmed = item.trim();
      if (trimmed.isEmpty) continue;
      
      double? fraction;
      double? discount;
      
      if (trimmed.contains('=')) {
        // Format: "0.4=5%"
        final parts = trimmed.split('=');
        if (parts.length == 2) {
          fraction = double.tryParse(parts[0].trim());
          final discountStr = parts[1].trim().replaceAll('%', '');
          discount = double.tryParse(discountStr);
        }
      } else {
        // Format: "0.2" (no discount)
        fraction = double.tryParse(trimmed);
      }
      
      // Only include fractions > 0 (0 is a placeholder)
      if (fraction != null && fraction > 0) {
        result[fraction] = discount;
      }
    }
    
    return result;
  }

  /// Returns available fractions > 0 in ascending order (uses memoized cache)
  List<double> getAvailableUnits() {
    try {
      final units = _memoizedUnitsWithDiscounts.keys.toList();
      units.sort();
      return units.isNotEmpty ? units : [1.0];
    } catch (e) {
      debugPrint('Error getting available units: $e');
      return [1.0];
    }
  }

  /// Returns discount percentage for a specific fraction, or null if no discount (uses memoized cache)
  double? getDiscountPercentage(double fraction) {
    return _memoizedUnitsWithDiscounts[fraction];
  }

  /// Calculates the price for a given unit (fraction)
  /// Formula: base_price × fraction × (1 - discount%/100)
  double calculateUnitPrice(double fraction) {
    try {
      final discount = getDiscountPercentage(fraction);
      final discountMultiplier = discount != null ? (1 - discount / 100) : 1.0;
      final result = price * fraction * discountMultiplier;
      return result > 0 ? result : 0.0;
    } catch (e) {
      debugPrint('Error calculating unit price for fraction $fraction: $e');
      return price * fraction;
    }
  }

  /// Formats a unit label from fraction and unitOfSale
  /// Examples:
  ///   unitOfSale="1Kg", fraction=0.2 → "200g"
  ///   unitOfSale="1Kg", fraction=1.0 → "1kg"
  ///   unitOfSale="1L", fraction=0.5 → "500ml"
  ///   unitOfSale="1L", fraction=1.0 → "1l"
  ///   unitOfSale="10pieces", fraction=0.5 → "5pieces"
  String formatUnitLabel(double fraction) {
    try {
      if (unitOfSale == null || unitOfSale!.isEmpty) {
        return '${fraction}x';
      }
      
      // Simple conversion logic for common units
      final unit = unitOfSale!.toLowerCase();
      final baseValue = double.tryParse(unit.replaceAll(RegExp(r'[a-z]'), '')) ?? 1.0;
      final unitType = unit.replaceAll(RegExp(r'[0-9.]'), '').trim();
      
      final calculatedValue = baseValue * fraction;
      
      // Map conversions: For fractions < 1, convert to smaller units
      if (unitType == 'kg') {
        if (calculatedValue < 1.0) {
          return '${(calculatedValue * 1000).toStringAsFixed(0)}g';
        } else if (calculatedValue == calculatedValue.toInt()) {
          return '${calculatedValue.toInt()}kg';
        } else {
          return '${calculatedValue.toStringAsFixed(2)}kg';
        }
      } else if (unitType == 'l') {
        if (calculatedValue < 1.0) {
          return '${(calculatedValue * 1000).toStringAsFixed(0)}ml';
        } else if (calculatedValue == calculatedValue.toInt()) {
          return '${calculatedValue.toInt()}l';
        } else {
          return '${calculatedValue.toStringAsFixed(2)}l';
        }
      } else if (unitType == 'pieces') {
        return '${calculatedValue.toStringAsFixed(0)}pieces';
      } else {
        // Fallback: return calculated value with original unit type
        return '${calculatedValue.toStringAsFixed(2)}$unitType';
      }
      } catch (e) {
      debugPrint('Error formatting unit label for fraction $fraction: $e');
      return '${fraction}x';
      }
      }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Product &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;
}

class CartItem {
  final Product product;
  double quantity;
  final double selectedUnit; // The fraction selected (e.g., 0.2, 0.4)
  late final double selectedUnitPrice; // Pre-calculated price for this unit

  CartItem({
    required this.product,
    this.quantity = 1.0,
    required this.selectedUnit,
    double? selectedUnitPrice,
  }) {
    // If selectedUnitPrice is not provided or is 0, calculate it from the product
    if (selectedUnitPrice != null && selectedUnitPrice > 0) {
      this.selectedUnitPrice = selectedUnitPrice;
    } else {
      // Fallback: calculate from product
      this.selectedUnitPrice = product.calculateUnitPrice(selectedUnit);
    }
  }
  
  /// Ensures selectedUnitPrice is always non-negative
  /// Falls back to recalculating if somehow zero and unit is selected
  double get _effectiveUnitPrice {
    if (selectedUnitPrice > 0) return selectedUnitPrice;
    // Fallback: recalculate from product
    return product.calculateUnitPrice(selectedUnit);
  }

  /// Returns subtotal using the unit-specific price
  /// Falls back to recalculating if selectedUnitPrice is not set
  double get subtotal {
    return _effectiveUnitPrice * quantity;
  }

  /// Returns formatted unit label (e.g., "200g")
  String get formattedUnit => product.formatUnitLabel(selectedUnit);

  /// Returns discount percentage for this unit, or null
  double? get unitDiscount => product.getDiscountPercentage(selectedUnit);

  Map<String, dynamic> toJson() => {
    'productId': product.id,
    'quantity': quantity,
    'selectedUnit': selectedUnit,
    'selectedUnitPrice': selectedUnitPrice,
  };

  factory CartItem.fromJson(Map<String, dynamic> json) {
    throw UnimplementedError(
      'CartItem.fromJson requires Product object - use CartItem constructor directly',
    );
  }
}

class Order {
  final String id;
  final List<CartItem> items;
  final double totalAmount;
  final String status;
  final DateTime createdAt;

  Order({
    required this.id,
    required this.items,
    required this.totalAmount,
    this.status = 'placed',
    required this.createdAt,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['_id'] ?? json['id'] ?? '',
      items: [],
      totalAmount: (json['totalAmount'] as num?)?.toDouble() ?? 0.0,
      status: json['status'] ?? 'placed',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
    '_id': id,
    'items': items.map((i) => i.toJson()).toList(),
    'totalAmount': totalAmount,
    'status': status,
    'createdAt': createdAt.toIso8601String(),
  };
}
