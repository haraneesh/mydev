# Change: Add Variable Unit Selection with Fractional Quantities and Discount Support

## Why
Products need flexible quantity selection where customers can purchase fractional amounts based on the product's base unit. For example, a 1Kg product should allow selection of 0.2Kg (200g), 0.4Kg (400g), etc. Additionally, individual fraction selections may have discounts attached, requiring price calculation to account for both the fraction multiplier and the specific discount for that fraction (if any).

## What Changes
- **BREAKING**: Product pricing logic changes to support fractional unit selection
- Add unit selection parser to extract available fractions from `unitsForSelection` field
- Add per-fraction discount percentage extraction from `unitsForSelection` field (format: `0,0.2,0.4=5%,0.6,0.8=10%,1`)
- Implement fractional quantity calculation based on `unitOfSale` (e.g., 0.2 × 1Kg = 200g)
- Update price calculation to apply discounts for qualified quantities
- Modify product card UI to display selectable unit options
- Update cart model to store selected unit/quantity and its corresponding price
- Update cart totals to use unit-specific prices

## Impact
- Affected specs: `ordering-ui` (product selection UI changes)
- Affected code: 
  - `mobile/lib/models/product.dart` - extend Product model
  - `mobile/lib/widgets/product_card.dart` - add unit selection UI
  - `mobile/lib/providers/cart_provider.dart` - update price calculation
  - `mobile/lib/models/product.dart` (CartItem) - store selected unit details
