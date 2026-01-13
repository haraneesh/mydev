# Change: Fix Add Item Unit Selection Parameter and CartItem Initialization

## Why
Multiple issues cause null type errors when adding/removing items from cart:
1. CartProvider.addItem() call passes selectedUnit as quantity instead of as named parameter
2. Old cart items from SharedPreferences lack selectedUnitPrice field
3. CartItem selectedUnitPrice can be null if not properly initialized or loaded from old data
4. Need to handle legacy cart data gracefully

## What Changes
- Fix cartProvider.addItem() call to pass selectedUnit as named parameter
- Change CartItem.selectedUnitPrice from required to optional with fallback calculation
- Use `late final` for selectedUnitPrice with initialization logic in constructor
- If selectedUnitPrice not provided or is 0, calculate from product.calculateUnitPrice()
- This handles both new items and legacy cart data from SharedPreferences
- Add _effectiveUnitPrice helper for defensive calculations
- Update subtotal to use _effectiveUnitPrice

## Impact
- Affected code:
  - `mobile/lib/widgets/product_card.dart` - Fix addItem call parameter passing
  - `mobile/lib/models/product.dart` - Make CartItem initialization robust with fallback calculation
  - `mobile/lib/providers/cart_provider.dart` - Pass optional selectedUnitPrice
