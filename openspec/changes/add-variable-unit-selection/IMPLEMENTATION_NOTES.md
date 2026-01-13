# Implementation Notes: Variable Unit Selection with Per-Fraction Discounts

## Overview
Successfully implemented fractional unit selection with per-fraction discount support for Flutter mobile app.

## What Was Built

### 1. Product Model Enhancements
**File**: `mobile/lib/models/product.dart`

**New Methods**:
- `parseUnitsWithDiscounts()` → `Map<double, double?>`
  - Parses "0,0.2,0.4=5%,0.6,0.8=10%,1" format
  - Returns fraction → optional discount percentage map
  - Filters out fraction = 0 (placeholder)

- `getAvailableUnits()` → `List<double>`
  - Returns selectable fractions in ascending order
  - Example: [0.2, 0.4, 0.6, 0.8, 1.0]

- `getDiscountPercentage(double fraction)` → `double?`
  - Returns discount for specific fraction or null
  - Example: 0.4 → 5.0, 0.2 → null

- `calculateUnitPrice(double fraction)` → `double`
  - Formula: `base_price × fraction × (1 - discount%/100)`
  - Example: 220 × 0.4 × 0.95 = 83.6

- `formatUnitLabel(double fraction)` → `String`
  - Converts fraction + unitOfSale to user-friendly label
  - Examples:
    - 0.2 × "1Kg" → "200g"
    - 1.0 × "1Kg" → "1kg"
    - 0.5 × "1L" → "500ml"
    - 1.0 × "1L" → "1l"

### 2. CartItem Model Extensions
**File**: `mobile/lib/models/product.dart`

**New Fields**:
- `selectedUnit: double` - The fraction selected (e.g., 0.4)
- `selectedUnitPrice: double` - Pre-calculated price with discount

**Updated Methods**:
- `subtotal` getter now uses `selectedUnitPrice × quantity`
- Added `formattedUnit` getter (returns formatted label)
- Added `unitDiscount` getter (returns discount % if any)

**Why Store Price in CartItem**?
- Product base price might change after user adds to cart
- Immutable pricing ensures user's purchase agreement is preserved
- Each unit selection can have different discount

### 3. UnitSelectionWidget
**File**: `mobile/lib/widgets/unit_selection_widget.dart` (NEW)

**Features**:
- Dropdown selector showing all available units
- Displays unit label (e.g., "200g") and price for each option
- Shows discount badge (e.g., "5%") for discounted units
- "Add" button passes selectedUnit to cart
- Compact design fits within ProductCard

**Layout**:
- DropdownButton (40px max height, isDense)
- Price displayed in currency format (₹)
- Discount shown as percentage badge
- "Add" button (32px height, compact styling)

### 4. ProductCard Updates
**File**: `mobile/lib/widgets/product_card.dart`

**Changes**:
- Replaced simple "Add" button with UnitSelectionWidget
- Users now select unit before adding to cart
- Shows snackbar with unit info when added
- Handles multiple quantities of same product with different units separately

**Key Logic**:
- If product not in cart: show UnitSelectionWidget
- If product in cart: show QuantityDisplay with unit info

### 5. CartProvider Updates
**File**: `mobile/lib/providers/cart_provider.dart`

**Method Changes**:
```dart
// Old signature
addItem(Product product, double quantity)

// New signature
addItem(Product product, double quantity, {double selectedUnit = 1.0})

// Old signature
updateQuantity(String productId, double quantity)

// New signature
updateQuantity(String productId, double quantity, {double selectedUnit = 1.0})
```

**Logic**:
- Cart items identified by: `product.id + selectedUnit`
- Same product with different units = different cart items
- Unit-specific price calculated on add
- Price preserved even if product base price changes later

### 6. QuantityDisplay Widget Updates
**File**: `mobile/lib/widgets/quantity_display.dart`

**New Parameters**:
- `unitLabel` - Optional formatted unit (e.g., "200g")
- `unitPrice` - Pre-calculated unit-specific price

**Display Format**:
- Old: "Qty: 200g"
- New: "Qty: 2 × 200g"

### 7. Test Suite
**File**: `mobile/test/models/product_unit_selection_test.dart` (NEW)

**Test Coverage** (13 tests, 100% passing):
1. Parsing unitsForSelection format with mixed discounts
2. Extracting available fractions in correct order
3. Discount percentage lookup per fraction
4. Unit price calculation with formula validation
5. Unit label formatting (Kg→g, L→ml conversions)
6. Handling products without discounts
7. CartItem unit and price storage
8. CartItem subtotal calculation with unit price
9. CartItem formatted unit display
10. CartItem discount getter
11. CartItem subtotal fallback logic
12. Different unit labels for different base units
13. Complex multi-item cart totals

**Test Examples**:
```dart
// Price calculation test
expect(product.calculateUnitPrice(0.4), closeTo(83.6, 0.01)); // 220×0.4×0.95

// Unit label test
expect(product.formatUnitLabel(0.2), '200g'); // 0.2×1Kg

// Cart total test
cartTotal = 44 + 83.6 + 158.4 // ₹286
```

## Implementation Details

### Parsing Logic
Input: `"0,0.2,0.4=5%,0.6,0.8=10%,1"`
Process:
1. Split by comma → ["0", "0.2", "0.4=5%", "0.6", "0.8=10%", "1"]
2. For each item:
   - If contains "=": extract fraction and discount percentage
   - Else: extract fraction only (no discount)
   - Filter out fraction = 0
3. Result: {0.2: null, 0.4: 5.0, 0.6: null, 0.8: 10.0, 1.0: null}

### Price Calculation
Formula: `base_price × fraction × (1 - discount/100)`

Example with base_price = 220:
- 0.2 (no discount): 220 × 0.2 × 1.0 = 44
- 0.4 (5% off): 220 × 0.4 × 0.95 = 83.6
- 0.8 (10% off): 220 × 0.8 × 0.90 = 158.4

### Unit Label Conversion
For "1Kg" unitOfSale:
- Fractions < 1.0 convert to grams: 0.2 → 200g, 0.5 → 500g
- Fractions >= 1.0 use base unit: 1.0 → 1kg, 1.5 → 1.5kg

For "1L" unitOfSale:
- Fractions < 1.0 convert to milliliters: 0.5 → 500ml
- Fractions >= 1.0 use base unit: 1.0 → 1l

### Cart Item Separation
Same product with different units = separate line items

Example:
```
Product: Rice (₹220/Kg)
unitsForSelection: "0,0.2,0.4=5%,0.6,0.8=10%,1"

Cart Items:
1. 1 × 200g @ ₹44 = ₹44
2. 2 × 400g @ ₹83.6 = ₹167.2
3. 1 × 800g @ ₹158.4 = ₹158.4
─────────────────────────────
Total: ₹369.6
```

## Files Modified/Created

### Created
- `mobile/lib/widgets/unit_selection_widget.dart`
- `mobile/test/models/product_unit_selection_test.dart`

### Modified
- `mobile/lib/models/product.dart` (+80 lines, selectedUnit and selectedUnitPrice now required)
- `mobile/lib/widgets/product_card.dart` (refactored: Add button overlay + dynamic price display)
- `mobile/lib/widgets/unit_selection_modal.dart` (NEW: Modal for unit row selection)
- `mobile/lib/providers/cart_provider.dart` (+15 lines, signature changes)
- `mobile/lib/services/cart_service.dart` (v2→v3 migration, safe deserialization)
- `mobile/lib/screens/public/home_screen.dart` (-10 lines, simplified)

## Validation & Testing

✅ All 13 unit tests passing
✅ No compilation errors
✅ Layout properly constrained (modal + inline controls)
✅ Backward compatible (old addItem calls use default selectedUnit=1.0)
✅ Cart persistence fixed (CartService serializes selectedUnit and selectedUnitPrice)
✅ CartItem fields made required to prevent null values
✅ Migration: Old cart cache (v2) cleared when loading v3 format
✅ Comprehensive error handling added:
   - Product.calculateUnitPrice() with fallback
   - Product.getAvailableUnits() with fallback
   - Product.formatUnitLabel() with fallback
   - ProductCard._convertToDisplayUnit() with safe casting
   - ProductCard display values with null-safe access
✅ Full documentation and comments added
✅ Image centered in product card
✅ Dynamic price display updates after modal selection
✅ Build cache cleaned for fresh rebuild

## CartService Migration (v2 → v3)

When this change was deployed, CartService was updated to:
1. **New Storage Key**: `app_cart_v3` (replaces `app_cart_v2`)
2. **Automatic Migration**: On first load, old v2 cart data is automatically cleared
3. **Safe Defaults**: Any missing fields in JSON default to safe values (selectedUnit=1.0, selectedUnitPrice=0.0)
4. **Required Fields**: CartItem now requires selectedUnit and selectedUnitPrice, preventing null issues

This ensures no corrupted data persists and all cart items have valid unit selection information.

## Known Considerations

1. **Unit Label Conversion** - Uses simple heuristic for common units (Kg, L). Unknown units display as fallback format.

2. **Fractional Storage** - CartItem stores `selectedUnitPrice` as immutable. If product base price changes, new selections use new price; existing items preserve their price.

3. **Cart Item Merging** - Same product with SAME unit will merge quantities. Different units remain separate items.

4. **Zero Fraction Filtering** - The "0" in "0,0.2,0.4..." is treated as placeholder and filtered out (not shown as selectable option).

5. **Discount Rounding** - Prices displayed with 2 decimal places. Calculations use full precision.

## Future Enhancements

1. Add quantity input field within UnitSelectionWidget instead of just "Add 1"
2. Support for custom unit conversion mappings (backend config)
3. Tiered discounts (different % based on quantity added)
4. Bundle/package pricing options
5. Inventory tracking per unit/fraction
6. Analytics: track which unit selections are most popular

## Rollback Plan

To revert this change:
1. Restore `mobile/lib/models/product.dart` to remove unit parsing methods
2. Revert `mobile/lib/providers/cart_provider.dart` to original addItem/updateQuantity signatures
3. Delete `mobile/lib/widgets/unit_selection_widget.dart`
4. Restore `mobile/lib/widgets/product_card.dart` to simple "Add" button
5. Restore `mobile/lib/widgets/quantity_display.dart` to original implementation

This is a backward-compatible breaking change for the addItem API.
