# Implementation Tasks: Add Variable Unit Selection

## 1. Product Model Extensions
- [x] 1.1 Add helper method to parse unitsForSelection format (parseUnitsWithDiscounts)
- [x] 1.2 Add method to extract available fractions from unitsForSelection (getAvailableUnits)
- [x] 1.3 Add method to extract discount percentage (getDiscountPercentage)
- [x] 1.4 Add method to calculate final price for a given unit selection (calculateUnitPrice)
- [x] 1.5 Add method to format display label for a unit (formatUnitLabel)

## 2. Cart Model Updates
- [x] 2.1 Extend CartItem to store selectedUnit (fraction) and selectedUnitPrice
- [x] 2.2 Update CartItem.subtotal to use selectedUnitPrice instead of base product price
- [x] 2.3 Add getters for formatted unit display (formattedUnit, unitDiscount)

## 3. UI: Product Card Selection with Modal
- [x] 3.1 Create unit selection modal widget (UnitSelectionModal) to display options as rows
- [x] 3.2 Update ProductCard to show small Add button in bottom-right corner of image
- [x] 3.3 Modal displays unit options as selectable rows with price and discount labels
- [x] 3.4 Handle user selection from modal and add product to cart with selectedUnit
- [x] 3.5 Update ProductCard to display quantity and unit-specific price after selection

## 4. Cart Provider Updates
- [x] 4.1 Update addItem() to accept selectedUnit parameter
- [x] 4.2 Calculate unit-specific price when adding item to cart
- [x] 4.3 Update updateQuantity() to preserve selected unit and use its price
- [x] 4.4 Verify cart totals use unit-specific prices

## 5. Testing
- [x] 5.1 Unit test parsing of unitsForSelection format with discount (product_unit_selection_test.dart)
- [x] 5.2 Unit test price calculation with fractional quantities and discounts
- [x] 5.3 Unit test CartItem subtotal calculation with selected unit price
- [x] 5.4 Integration test: full flow from product selection to cart total

## 6. Documentation
- [x] 6.1 Document unitsForSelection format in Product model comments
- [x] 6.2 Document discount percentage format and calculation logic
- [x] 6.3 Update code comments for new price calculation methods

## Implementation Summary

### Changed Files
- `mobile/lib/models/product.dart` - Added parsing and calculation methods, extended CartItem model
- `mobile/lib/widgets/product_card.dart` - Refactored to use modal for unit selection (Add button on image) + inline +/- controls
- `mobile/lib/widgets/unit_selection_modal.dart` - New modal widget for unit selection (created)
- `mobile/lib/providers/cart_provider.dart` - Updated addItem() and updateQuantity() signatures
- `mobile/lib/screens/public/home_screen.dart` - Simplified onAddToCart callback

### Test Coverage
- Created `mobile/test/models/product_unit_selection_test.dart` with 13 comprehensive tests
- All tests passing: parsing, pricing, unit formatting, cart calculations

### Key Features Implemented
1. Per-fraction discount support (each fraction can have its own discount percentage)
2. Automatic unit label conversion (Kg→g, L→ml) based on fraction
3. Unit-specific price storage in CartItem to preserve pricing
4. Modal-based unit selection triggered by Add button on product image
5. Unit options displayed as selectable rows with price and discount labels
6. ProductCard updates to show quantity and unit-specific price after selection
7. Visual discount indicators in UI (e.g., "5% off")
8. Separate cart line items for different unit selections of same product
