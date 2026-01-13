# Add Variable Unit Selection with Per-Fraction Discounts

## Status: ✅ IMPLEMENTATION COMPLETE

All 25+ tasks completed. Ready for QA testing.

## Executive Summary

Implemented flexible fractional unit selection with per-fraction discounts for the Flutter mobile app. Customers can now select from multiple fractional quantities (e.g., 200g, 400g, 600g, 800g, 1kg) with individually configured discounts (e.g., "5% off 400g", "10% off 800g").

## Key Features

### 1. Fractional Unit Selection
- Parse format: `"0,0.2,0.4=5%,0.6,0.8=10%,1"`
- Display user-friendly labels: "200g", "400g", "600g", etc.
- Automatic conversion (Kg→g, L→ml)

### 2. Per-Fraction Discounts
- Each unit can have its own discount percentage
- Formula: `base_price × fraction × (1 - discount%/100)`
- Visual indicators in UI: "(5% off)", "(10% off)"

### 3. Cart Pricing
- Unit-specific price stored in CartItem
- Same product with different units = separate line items
- Cart totals calculated using unit prices, not base prices

### 4. UI Components
- New `UnitSelectionWidget` with dropdown selector
- Updated `ProductCard` to show unit options before adding
- Enhanced `QuantityDisplay` with unit labels and prices

## Files

### Created
- `mobile/lib/widgets/unit_selection_widget.dart` - Unit selection dropdown
- `mobile/test/models/product_unit_selection_test.dart` - 13 comprehensive tests
- `openspec/changes/add-variable-unit-selection/IMPLEMENTATION_NOTES.md` - Technical details

### Modified
- `mobile/lib/models/product.dart` - Added unit parsing and calculation methods
- `mobile/lib/widgets/product_card.dart` - Integrated unit selection
- `mobile/lib/widgets/quantity_display.dart` - Enhanced with unit info
- `mobile/lib/providers/cart_provider.dart` - Updated for unit-specific pricing
- `mobile/lib/screens/public/home_screen.dart` - Simplified callback

## Testing

✅ **13 Unit Tests - ALL PASSING**

Tests cover:
- Unit parsing (with/without discounts)
- Price calculations with formula validation
- Unit label conversions (Kg→g, L→ml)
- CartItem storage and retrieval
- Multi-item cart totals
- Edge cases and fallbacks

Run tests:
```bash
cd mobile
flutter test test/models/product_unit_selection_test.dart
```

## Example Usage

### Product Data
```
Name: Basmati Rice
Price: ₹220/Kg
unitOfSale: "1Kg"
unitsForSelection: "0,0.2,0.4=5%,0.6,0.8=10%,1"
```

### Available Options
| Unit | Price | Discount |
|------|-------|----------|
| 200g | ₹44 | - |
| 400g | ₹83.6 | 5% |
| 600g | ₹132 | - |
| 800g | ₹158.4 | 10% |
| 1kg | ₹220 | - |

### Cart Example
```
1 × 200g @ ₹44 = ₹44
2 × 400g @ ₹83.6 = ₹167.2
1 × 800g @ ₹158.4 = ₹158.4
─────────────────────────
Total: ₹369.6
```

## Implementation Checklist

### Stage 1: Product Model Extensions ✅
- [x] Parse unitsForSelection format
- [x] Extract available fractions
- [x] Extract per-fraction discounts
- [x] Calculate unit-specific prices
- [x] Format unit labels with conversions

### Stage 2: Cart Model Updates ✅
- [x] Store selectedUnit and selectedUnitPrice in CartItem
- [x] Update subtotal calculation
- [x] Add unit display helpers

### Stage 3: UI Components ✅
- [x] Create UnitSelectionWidget
- [x] Integrate with ProductCard
- [x] Display prices and discounts
- [x] Handle user selections

### Stage 4: Cart Provider ✅
- [x] Update addItem() signature
- [x] Calculate unit prices on add
- [x] Update updateQuantity() signature
- [x] Verify cart totals

### Stage 5: Testing ✅
- [x] Unit tests for parsing
- [x] Unit tests for price calculations
- [x] Unit tests for CartItem
- [x] Integration tests

### Stage 6: Documentation ✅
- [x] Code comments and docstrings
- [x] Format documentation
- [x] Implementation notes
- [x] This README

## API Changes

### CartProvider.addItem()
```dart
// Old
Future<void> addItem(Product product, double quantity)

// New
Future<void> addItem(
  Product product,
  double quantity, {
  double selectedUnit = 1.0,
})
```

### CartProvider.updateQuantity()
```dart
// Old
Future<void> updateQuantity(String productId, double quantity)

// New
Future<void> updateQuantity(
  String productId,
  double quantity, {
  double selectedUnit = 1.0,
})
```

**Backward Compatible**: Default parameter `selectedUnit = 1.0` maintains compatibility with existing code.

## Known Issues Fixed

✅ RenderFlex overflow - Fixed by constraining widget heights and using compact padding

## Next Steps

1. **QA Testing** - Manual testing on device
2. **Integration Testing** - Test with actual backend data
3. **Performance Testing** - Verify no slowdown with many units
4. **User Testing** - Gather feedback on unit selection UX
5. **Deployment** - Merge to main and release

## Rollback

If issues arise, changes can be reverted by:
1. Removing unit selection methods from Product model
2. Restoring CartProvider to original addItem/updateQuantity
3. Removing UnitSelectionWidget
4. Reverting ProductCard to simple "Add" button

All changes are isolated and don't affect other systems.

## Support

For technical details, see `IMPLEMENTATION_NOTES.md`
For specification, see `proposal.md` and `design.md`
For requirements, see `specs/ordering-ui/spec.md`

