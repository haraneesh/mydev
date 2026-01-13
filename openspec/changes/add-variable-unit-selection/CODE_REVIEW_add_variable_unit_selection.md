# Code Review: Add Variable Unit Selection Feature

**Reviewed**: `changes/add-variable-unit-selection` implementation  
**Scope**: Flutter mobile app + Meteor 3.x backend integration  
**Date**: 2026-01-10

---

## Executive Summary

The feature implementation demonstrates **solid fundamentals** in state management and business logic separation, with proper null-safety and type-safety in the Product model. However, there are **critical architectural concerns** around stateful widget anti-patterns, missing error boundaries, and incomplete Meteor DDP data flow validation. The code prioritizes functionality over testability and introduces tight coupling between UI and business logic that will impede future maintenance. **Priority**: Address state mutation in `_ProductCardState` and add retry/error handling in order submission before production.

---

## 🚨 Critical Fixes

### 1. **STATE MUTATION IN BUILD METHOD** (HIGH SEVERITY)
**File**: `mobile/lib/widgets/product_card.dart:166-168`

```dart
// 🔴 PROBLEMATIC: Mutating state during build
if (isInCart && _selectedUnit == null) {
  _selectedUnit = cartItem.selectedUnit;  // ← setState triggered inside build!
}
```

**Issues**:
- State is being mutated during `build()`, which is called multiple times per frame
- When `_selectedUnit` is assigned inside the `Consumer` builder, it triggers rebuild, creating a potential infinite loop or race condition
- Violates Flutter's reactive principle: UI should be deterministic based on state, not mutated within build

**Impact**: Memory leaks, erratic UI updates, failed assertions in debug mode.

**Proposed Fix**:
```dart
@override
void initState() {
  super.initState();
  _settingsService = SettingsService();
  _loadImageUrl();
  // Pre-fetch from cart on init
  WidgetsBinding.instance.addPostFrameCallback((_) {
    _syncSelectedUnitFromCart();
  });
}

void _syncSelectedUnitFromCart() {
  final cartProvider = context.read<CartProvider>();
  final cartItem = cartProvider.items.firstWhereOrNull(
    (item) => item.product.id == widget.product.id,
  );
  if (cartItem != null && _selectedUnit == null) {
    setState(() => _selectedUnit = cartItem.selectedUnit);
  }
}

// In Consumer builder (no state mutation):
final cartItem = cartProvider.items.firstWhereOrNull(
  (item) => item.product.id == widget.product.id,
);
final displayUnit = _selectedUnit ?? cartItem?.selectedUnit ?? lowestUnit;
```

---

### 2. **DUPLICATE PARSING LOGIC** (MEDIUM SEVERITY)
**Files**: `mobile/lib/models/product.dart` + `mobile/lib/widgets/product_card.dart`

The parsing of `unitsForSelection` is implemented in **two places**:
- `Product.parseUnitsWithDiscounts()` (authoritative)
- `ProductCard._parseUnitSelection()` (duplicate)

**Issues**:
- Maintenance burden: discrepancies between parsers will cause silent bugs
- `ProductCard` version doesn't filter out zero fractions correctly
- No shared parsing utilities

**Proposed Fix**:
```dart
// In Product model - make parsing utilities public
class Product {
  /// Parses a single unit entry: "0.4" or "0.4=5%"
  static Map<String, dynamic> parseUnitEntry(String entry) {
    final trimmed = entry.trim();
    if (trimmed.isEmpty) return {'value': 0.0, 'discount': null};
    
    if (trimmed.contains('=')) {
      final parts = trimmed.split('=');
      final value = double.tryParse(parts[0].trim()) ?? 0.0;
      final discountStr = parts[1].trim().replaceAll('%', '');
      final discount = double.tryParse(discountStr);
      return {'value': value, 'discount': discount};
    }
    final value = double.tryParse(trimmed) ?? 0.0;
    return {'value': value, 'discount': null};
  }
}

// In ProductCard - use shared parser
Map<String, dynamic> _parseUnitSelection(String entry) {
  return Product.parseUnitEntry(entry);
}
```

---

### 3. **MISSING ERROR HANDLING IN ORDER SUBMISSION** (MEDIUM SEVERITY)
**File**: `mobile/lib/services/order_service.dart:53`

```dart
// 🔴 PROBLEMATIC: No retry, no timeout, assumes success
final response = await _meteorClient.call('orders.create', [orderPayload]);
```

**Issues**:
- No timeout: network request hangs indefinitely on slow/lost connection
- No retry logic for transient failures (DDP disconnects, Meteor server restart)
- `itemsData` mapping missing `selectedUnit` and `selectedUnitPrice` (!!!)
  - Server receives incomplete order data
  - Cart subtotals will be incorrect

**Proposed Fix**:
```dart
Future<String> submitOrder(CheckoutData data) async {
  const maxRetries = 3;
  const timeoutDuration = Duration(seconds: 30);
  
  for (int attempt = 0; attempt < maxRetries; attempt++) {
    try {
      _validateInput(data);
      
      if (!_meteorClient.isConnected) {
        await _meteorClient.connect();
      }
      
      final itemsData = data.items.map((item) => {
        'productId': item.product.id,
        'productName': item.product.name,
        'quantity': item.quantity,
        'selectedUnit': item.selectedUnit,           // ← ADD THIS
        'selectedUnitPrice': item.selectedUnitPrice, // ← ADD THIS
        'subtotal': item.subtotal,
      }).toList();
      
      final orderPayload = {
        'name': data.name,
        'phone': data.phone,
        'address': data.address,
        'items': itemsData,
        'totalAmount': data.totalAmount,
      };
      
      final response = await _meteorClient
          .call('orders.create', [orderPayload])
          .timeout(timeoutDuration);
      
      final orderId = response['orderId'] as String?;
      if (orderId == null || orderId.isEmpty) {
        throw Exception('Invalid response: missing orderId');
      }
      
      return orderId;
    } on TimeoutException {
      if (attempt < maxRetries - 1) {
        debugPrint('Order submission timeout (attempt ${attempt + 1}/$maxRetries), retrying...');
        await Future.delayed(Duration(seconds: 2 << attempt)); // exponential backoff
      } else {
        throw Exception('Order submission failed after $maxRetries attempts');
      }
    } catch (e) {
      if (attempt == maxRetries - 1) rethrow;
      await Future.delayed(Duration(seconds: 2 << attempt));
    }
  }
}
```

---

### 4. **UNSAFE CART QUANTITY DROPDOWN UPDATE** (MEDIUM SEVERITY)
**File**: `mobile/lib/widgets/product_card.dart:232-241`

```dart
// 🔴 PROBLEMATIC: DropdownButton value doesn't match selected item unit
DropdownButton<double>(
  value: cartItem.quantity.toDouble(),  // ← value is QUANTITY, not UNIT
  isExpanded: true,
  items: dropdownItems,  // ← items are UNITS (fractions)
  onChanged: (newQuantity) {
    cartProvider.updateQuantity(widget.product.id, newQuantity);
  },
),
```

**Issues**:
- `value` is quantity (e.g., 2.0), but `items` contain units (e.g., 0.2, 0.4)
- Dropdown will not display correct selection (value doesn't exist in items)
- `updateQuantity()` is called with a unit value, not quantity
- Multiple cart items with same product but different units will clobber each other

**Proposed Fix**:
```dart
// Separate quantity and unit selection
Row(
  mainAxisAlignment: MainAxisAlignment.spaceBetween,
  children: [
    // Unit selector dropdown
    Expanded(
      flex: 2,
      child: DropdownButton<double>(
        value: cartItem.selectedUnit,  // ← Use UNIT, not quantity
        isExpanded: true,
        isDense: true,
        items: dropdownItems,
        onChanged: (newUnit) {
          if (newUnit != null && newUnit != cartItem.selectedUnit) {
            // Changing unit: remove old entry and add new one
            cartProvider.removeItemByUnitAndProduct(
              widget.product.id,
              cartItem.selectedUnit,
            );
            cartProvider.addItem(widget.product, 1, selectedUnit: newUnit);
          }
        },
      ),
    ),
    const SizedBox(width: 8),
    // Quantity selector
    Expanded(
      flex: 1,
      child: TextField(
        keyboardType: TextInputType.number,
        initialValue: cartItem.quantity.toInt().toString(),
        onChanged: (value) {
          final qty = int.tryParse(value) ?? 1;
          cartProvider.updateQuantity(
            widget.product.id,
            qty.toDouble(),
            selectedUnit: cartItem.selectedUnit,
          );
        },
      ),
    ),
    const SizedBox(width: 8),
    // Delete button
    SizedBox(
      width: 28,
      height: 28,
      child: IconButton(
        icon: const Icon(Icons.delete_outline),
        onPressed: () => cartProvider.removeItemByUnitAndProduct(
          widget.product.id,
          cartItem.selectedUnit,
        ),
      ),
    ),
  ],
)
```

---

## 🏗️ Architectural Refactoring

### A. Extract Parsing Logic into a Dedicated Service

**Current Issue**: Parsing `unitsForSelection` happens in multiple places (Product model, ProductCard widget). This violates DRY.

**Proposed Solution**:
```dart
// services/unit_parser_service.dart
class UnitParserService {
  /// Parses "0,0.2,0.4=5%,0.8=10%,1" into structured data
  static UnitSelectionData parse(String unitsForSelection) {
    final units = <UnitOption>[];
    for (final entry in unitsForSelection.split(',')) {
      final parsed = _parseEntry(entry.trim());
      if (parsed != null && parsed.fraction > 0) {
        units.add(parsed);
      }
    }
    return UnitSelectionData(units);
  }
  
  static UnitOption? _parseEntry(String entry) {
    if (entry.isEmpty) return null;
    
    final hasDiscount = entry.contains('=');
    final (fractionStr, discountStr) = hasDiscount
        ? entry.split('=').cast<String>().fold(
              ('', ''),
              (acc, val) => acc.$1.isEmpty ? (val.trim(), '') : (acc.$1, val.trim()),
            )
        : (entry, '');
    
    final fraction = double.tryParse(fractionStr);
    if (fraction == null) return null;
    
    final discount = discountStr.isEmpty
        ? null
        : double.tryParse(discountStr.replaceAll('%', ''));
    
    return UnitOption(fraction: fraction, discountPercent: discount);
  }
}

class UnitSelectionData {
  final List<UnitOption> units;
  UnitSelectionData(this.units);
  
  List<double> get fractions => units.map((u) => u.fraction).toList();
}

class UnitOption {
  final double fraction;
  final double? discountPercent;
  
  UnitOption({required this.fraction, this.discountPercent});
  
  bool hasDiscount() => discountPercent != null && discountPercent! > 0;
}
```

**Usage in Product model**:
```dart
class Product {
  List<double> getAvailableUnits() {
    final data = UnitParserService.parse(safeUnitsForSelection);
    return data.fractions..sort();
  }
  
  double? getDiscountPercentage(double fraction) {
    final data = UnitParserService.parse(safeUnitsForSelection);
    return data.units
        .firstWhereOrNull((u) => u.fraction == fraction)
        ?.discountPercent;
  }
}
```

---

### B. Introduce a Dedicated Cart Item Repository

**Current Issue**: ProductCard directly manipulates `CartProvider.addItem()` with hardcoded unit logic. Cart operations are scattered across widgets.

**Proposed Solution**:
```dart
// repositories/cart_repository.dart
class CartRepository {
  final CartProvider _provider;
  
  /// Adds or increments item with unit selection
  /// Returns true if added, false if quantity incremented
  Future<bool> addOrIncrement(
    Product product,
    double quantity, {
    required double selectedUnit,
  }) async {
    final existing = _provider.items.firstWhereOrNull(
      (i) => i.product.id == product.id && i.selectedUnit == selectedUnit,
    );
    
    if (existing != null) {
      await _provider.updateQuantity(
        product.id,
        existing.quantity + quantity,
        selectedUnit: selectedUnit,
      );
      return false;
    }
    
    await _provider.addItem(product, quantity, selectedUnit: selectedUnit);
    return true;
  }
  
  /// Removes item by product ID and selected unit
  Future<void> removeByUnit(String productId, double unit) async {
    final index = _provider.items.indexWhere(
      (i) => i.product.id == productId && i.selectedUnit == unit,
    );
    if (index >= 0) {
      _provider._items.removeAt(index);
      await _provider._cartStorage.saveCart(_provider._items);
      _provider.notifyListeners();
    }
  }
}
```

**Usage in ProductCard**:
```dart
class _ProductCardState extends State<ProductCard> {
  late CartRepository _cartRepository;
  
  void _handleUnitSelected(double unit) {
    final cartRepo = CartRepository(context.read<CartProvider>());
    cartRepo.addOrIncrement(widget.product, 1, selectedUnit: unit);
    setState(() => _selectedUnit = unit);
    widget.onAddToCart?.call();
  }
}
```

---

### C. Move Unit Formatting to a Dedicated Formatter Service

**Current Issue**: Unit label formatting (`_convertToDisplayUnit`) is duplicated in ProductCard and Product.

**Proposed Solution**:
```dart
// services/unit_formatter_service.dart
class UnitFormatterService {
  static String formatLabel(double fraction, String? baseUnitOfSale) {
    if (baseUnitOfSale == null || baseUnitOfSale.isEmpty) {
      return '${fraction.toStringAsFixed(1)}x';
    }
    
    final parsed = _parseUnitOfSale(baseUnitOfSale);
    final quantity = parsed['quantity'] as double;
    final unit = parsed['unit'] as String;
    final calculatedValue = quantity * fraction;
    
    switch (unit.toLowerCase()) {
      case 'kg':
        return _formatKg(calculatedValue);
      case 'l':
        return _formatLiter(calculatedValue);
      case 'pieces':
        return '${calculatedValue.toInt()}pieces';
      default:
        return '${calculatedValue.toStringAsFixed(2)}$unit';
    }
  }
  
  static String _formatKg(double value) {
    if (value < 1.0) {
      return '${(value * 1000).toInt()}g';
    }
    return value == value.toInt()
        ? '${value.toInt()}kg'
        : '${value.toStringAsFixed(2)}kg';
  }
  
  static String _formatLiter(double value) {
    if (value < 1.0) {
      return '${(value * 1000).toInt()}ml';
    }
    return value == value.toInt()
        ? '${value.toInt()}l'
        : '${value.toStringAsFixed(2)}l';
  }
  
  static Map<String, dynamic> _parseUnitOfSale(String unitOfSaleStr) {
    final regex = RegExp(r'^([\d.]+)\s*(.+)$');
    final match = regex.firstMatch(unitOfSaleStr.trim());
    if (match != null) {
      return {
        'quantity': double.tryParse(match.group(1) ?? '1') ?? 1.0,
        'unit': (match.group(2) ?? 'kg').toLowerCase(),
      };
    }
    return {'quantity': 1.0, 'unit': 'kg'};
  }
}

// Usage in Product model
String formatUnitLabel(double fraction) {
  return UnitFormatterService.formatLabel(fraction, unitOfSale);
}
```

---

## 🧹 Cleanliness Checklist

### Naming Conventions
- ✅ **Good**: `selectedUnit`, `selectedUnitPrice` (descriptive, unambiguous)
- ✅ **Good**: `parseUnitsWithDiscounts()` (clear action verb)
- ⚠️ **Inconsistent**: `_selectedUnit` (private) vs `selectedUnit` (public) - consider making consistent
- ⚠️ **Poor**: `_convertToDisplayUnit()` - prefer `formatUnitLabel()` (matches Product method)

### Dead Code & Unused Imports
- ⚠️ `mobile/lib/widgets/product_card.dart:272-282` - `_parseUnitsForSelection()` wraps `product.getAvailableUnits()` unnecessarily
  - **Fix**: Remove wrapper, call directly: `widget.product.getAvailableUnits()`

- ⚠️ `mobile/lib/models/product.dart:1` - Import `package:flutter/foundation.dart` only used for `debugPrint()`
  - **Fix**: Move `debugPrint` calls to logging service, remove import

### Spacing & Formatting
- ⚠️ `product_card.dart:111-119` - Inconsistent indentation (4 spaces vs 2 spaces)
- ⚠️ `product_card.dart:256-269` - Deeply nested closing brackets, hard to read
  - **Refactor**: Extract column children into separate methods

### Type Safety Issues
- ✅ **Good**: Safe null-coalescing in `Product.fromJson()`: `json['price'] as num?`
- ⚠️ **Mediocre**: `CartItem.fromJson()` throws `UnimplementedError` instead of providing factory
  - **Fix**: Implement proper deserialization or remove the method signature

---

## Performance & Memory

### Subscription & Disposal
- ✅ **Good**: CartService uses local SharedPreferences (no memory leak from Meteor subscriptions)
- ✅ **Good**: UnitSelectionModal is a StatelessWidget (no lifecycle issues)
- ⚠️ **Concern**: `ProductCard` creates `SettingsService()` fresh in `initState()`
  - **Fix**: Inject via Provider or make singleton

### Caching
- ✅ **Good**: `_imageUrl` is cached in state
- ⚠️ **Missed Optimization**: `Product.parseUnitsWithDiscounts()` is called multiple times per build
  - **Fix**: Memoize with `late final` or pass as parameter:
  ```dart
  late final _unitsWithDiscounts = parseUnitsWithDiscounts();
  
  List<double> getAvailableUnits() => _unitsWithDiscounts.keys.toList()..sort();
  double? getDiscountPercentage(double fraction) => _unitsWithDiscounts[fraction];
  ```

---

## Security Review

### Client-Side Secrets
- ✅ **Good**: No API keys or secrets hardcoded
- ✅ **Good**: `OrderService._validateInput()` performs basic validation
- ⚠️ **Concern**: Phone validation is weak (only checks length + digits)
  - **Fix**: Add proper regex or use a validation library

### Meteor Method Validation
- ⚠️ **CRITICAL**: Server-side `orders.create` method must validate **all** fields
  - Ensure server checks: `selectedUnit`, `selectedUnitPrice`, and recalculates pricing server-side
  - **Never trust client-side calculations** for financial data

**Server-side pseudocode (Meteor)**:
```javascript
Meteor.methods({
  'orders.create'(orderPayload) {
    check(this.userId, String);
    check(orderPayload, {
      name: String,
      phone: String,
      address: String,
      items: [{
        productId: String,
        quantity: Number,
        selectedUnit: Number,
        // DO NOT accept selectedUnitPrice from client
      }],
      totalAmount: Number,
    });
    
    // Recalculate prices server-side
    let calculatedTotal = 0;
    for (const item of orderPayload.items) {
      const product = Products.findOne(item.productId);
      const unitPrice = product.calculateUnitPrice(item.selectedUnit);
      const itemSubtotal = unitPrice * item.quantity;
      calculatedTotal += itemSubtotal;
      
      // Verify client's total matches
      if (Math.abs(calculatedTotal - orderPayload.totalAmount) > 0.01) {
        throw new Meteor.Error('INVALID_TOTAL', 'Order total mismatch');
      }
    }
    
    return Orders.insert({ ...orderPayload, createdAt: new Date() });
  }
});
```

---

## Before/After Examples

### Example 1: State Mutation in Build

**❌ BEFORE (Problematic)**:
```dart
Consumer<CartProvider>(
  builder: (context, cartProvider, _) {
    final isInCart = cartProvider.items.any((item) => item.product.id == widget.product.id);
    
    if (isInCart && _selectedUnit == null) {
      _selectedUnit = cartItem.selectedUnit;  // ← Mutates state in build!
    }
    // ...
  },
)
```

**✅ AFTER (Correct)**:
```dart
@override
void initState() {
  super.initState();
  WidgetsBinding.instance.addPostFrameCallback((_) {
    _syncSelectedUnitFromCart();
  });
}

void _syncSelectedUnitFromCart() {
  final cartProvider = context.read<CartProvider>();
  final cartItem = cartProvider.items.firstWhereOrNull(
    (item) => item.product.id == widget.product.id,
  );
  if (cartItem != null && _selectedUnit == null) {
    setState(() => _selectedUnit = cartItem.selectedUnit);
  }
}

// In build method: no mutation
final displayUnit = _selectedUnit ?? 
  (isInCart ? cartItem.selectedUnit : lowestUnit);
```

---

### Example 2: Incomplete Order Data

**❌ BEFORE (Missing Fields)**:
```dart
final itemsData = cartItems
    .map((item) => {
          'productId': item.product.id,
          'productName': item.product.name,
          'quantity': item.quantity,
          'price': item.product.price,
          'subtotal': item.subtotal,
        })
    .toList();
```

**✅ AFTER (Complete Data)**:
```dart
final itemsData = cartItems
    .map((item) => {
          'productId': item.product.id,
          'productName': item.product.name,
          'quantity': item.quantity,
          'selectedUnit': item.selectedUnit,           // ← Added
          'selectedUnitPrice': item.selectedUnitPrice, // ← Added
          'subtotal': item.subtotal,
          'basePrice': item.product.price,            // ← For reference
        })
    .toList();
```

---

### Example 3: Dropdown Unit vs Quantity Confusion

**❌ BEFORE (Type Mismatch)**:
```dart
DropdownButton<double>(
  value: cartItem.quantity.toDouble(),  // quantity (e.g., 2.0)
  items: dropdownItems,  // units (0.2, 0.4, etc.)
  onChanged: (newQuantity) {
    cartProvider.updateQuantity(widget.product.id, newQuantity);  // ← Passes unit as quantity!
  },
)
```

**✅ AFTER (Clear Separation)**:
```dart
// Separate UI for unit and quantity
Column(
  children: [
    // Unit selector
    DropdownButton<double>(
      value: cartItem.selectedUnit,  // ← Use unit
      items: dropdownItems.where((item) => item.value != cartItem.selectedUnit).toList(),
      onChanged: (newUnit) {
        if (newUnit != null) {
          // Change unit: replace item
          cartProvider.removeItem(widget.product.id, cartItem.selectedUnit);
          cartProvider.addItem(widget.product, 1, selectedUnit: newUnit);
        }
      },
    ),
    // Quantity input
    TextField(
      initialValue: cartItem.quantity.toInt().toString(),
      onChanged: (value) {
        final qty = int.tryParse(value) ?? 1;
        cartProvider.updateQuantity(
          widget.product.id,
          qty.toDouble(),
          selectedUnit: cartItem.selectedUnit,  // ← Pass unit explicitly
        );
      },
    ),
  ],
)
```

---

## Summary of Priority Actions

| Priority | Issue | File | Action |
|----------|-------|------|--------|
| 🔴 CRITICAL | State mutation in build | `product_card.dart:166-168` | Move state sync to `initState()` with `addPostFrameCallback` |
| 🔴 CRITICAL | Missing order data fields | `order_service.dart:33-40` | Add `selectedUnit`, `selectedUnitPrice` to itemsData |
| 🔴 CRITICAL | Unit/Quantity dropdown confusion | `product_card.dart:232-241` | Separate unit selector from quantity control |
| 🟡 HIGH | No retry/timeout on order submit | `order_service.dart:53` | Add exponential backoff + timeout handling |
| 🟡 HIGH | Duplicate parsing logic | `product_card.dart` + `product.dart` | Extract to `UnitParserService` |
| 🟠 MEDIUM | SettingsService instantiation | `product_card.dart:32` | Inject as singleton or Provider |
| 🟠 MEDIUM | No memoization of parsed units | `product.dart` | Add `late final` cache for `parseUnitsWithDiscounts()` |

---

## Recommendations for Next Sprint

1. **Add comprehensive unit tests** for `Product.calculateUnitPrice()` with various discount combinations
2. **Integration test**: Cart flow from product selection → checkout → order submission with network simulation
3. **Implement proper error boundaries** with retry UI (SnackBar + Retry button)
4. **Consider migrating to Riverpod** for better testability and less boilerplate than Provider
5. **Add server-side Meteor methods** for unit calculation (never trust client-side pricing)
6. **Security audit**: Validate `orders.create` method recalculates totals server-side
