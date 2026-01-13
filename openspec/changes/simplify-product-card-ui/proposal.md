# Change: Simplify Product Card UI - Remove Controls

## Why
Reduce UI complexity in the product card by removing the dropdown unit selector, quantity increment/decrement controls (+/-), and delete button. The product card will focus solely on displaying product information and the initial "Add" button.

## What Changes
- **BREAKING**: Product card UI no longer shows unit selector dropdown when item is in cart
- Remove unit selection dropdown from cart item display
- Remove +/- buttons for quantity increment/decrement
- Remove delete/dumpster button from product card
- Simplify cart item controls section
- Remove associated helper methods for building cart controls

## Impact
- Affected specs: `ordering-ui` (product selection UI simplification)
- Affected code:
  - `mobile/lib/widgets/product_card.dart` - Remove `_buildCartItemControls()` method and dropdown/quantity controls
  - Cart quantity changes must be managed elsewhere (e.g., dedicated cart screen)
