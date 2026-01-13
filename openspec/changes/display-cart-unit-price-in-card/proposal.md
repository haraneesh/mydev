# Change: Display Cart Unit and Price in Product Card

## Why
When a product is already in the cart, the product card should display the unit and price that was actually added to the cart, rather than always showing the lowest available unit. This gives users immediate visibility of what they selected without opening the modal.

## What Changes
- Check if product is in cart using CartProvider
- If product in cart, extract the selectedUnit and corresponding price from the cart item
- Display the cart unit and price in the product card instead of the default lowest unit
- If product not in cart, continue showing the lowest unit price (current behavior)

## Impact
- Affected specs: `ordering-ui` (product card display)
- Affected code:
  - `mobile/lib/widgets/product_card.dart` - Update display logic to check cart and show cart values
