# Change: Update Cart Unit When Product Already in Cart

## Why
When a product is already in the cart and a user selects a different unit from the unit selection popup, the cart should be updated with the new unit rather than adding a duplicate item. In this application, the selected unit IS the quantity (no separate quantity concept), so changing the unit means changing what the user wants to purchase.

## What Changes
- When a product is already in cart and user selects a new unit from the unit selection modal, update the existing cart item's selected unit and price
- Replace the old unit selection with the new unit selection (selectedUnit is the quantity)
- Close the modal after updating the cart
- Product card automatically reflects the updated unit from the cart item

## Impact
- Affected specs: `ordering-ui` (cart and unit selection behavior)
- Affected code:
  - `mobile/lib/widgets/unit_selection_modal.dart` - Handle cart updates when product already exists
  - `mobile/lib/providers/cart_provider.dart` - Add method to update cart item unit
  - `mobile/lib/widgets/product_card.dart` - Already displays cart item's selectedUnit correctly
