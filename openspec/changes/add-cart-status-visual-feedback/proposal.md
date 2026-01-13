# Change: Add Cart Status Visual Feedback

## Why
Provide visual feedback to users indicating which products have been added to the cart. When a unit is selected and a product is added to the cart, the Add button should change to green (success color) to show the product is now in the cart, making it easier for users to track their selections.

## What Changes
- Update cart with product details, unit selected, and corresponding price when unit is selected from modal (verify existing functionality)
- Change Add button color from primary (brown) to green success color for products already in cart
- Keep product card background always white
- Use the same success color (`0xFF519716`) used in success alerts throughout the app
- Visual feedback should be immediate after unit selection

## Impact
- Affected specs: `ordering-ui` (product card visual feedback)
- Affected code:
  - `mobile/lib/widgets/product_card.dart` - Update Add button color based on cart state
  - `mobile/lib/providers/cart_provider.dart` - Verify cart update logic
