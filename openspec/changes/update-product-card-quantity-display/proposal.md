# Change: Update Product Card Quantity Display

## Why
Currently, when a user adds a product to the cart and selects a quantity from the dropdown, the dropdown closes immediately and is replaced by the "Add" button again. This creates a confusing UX where users cannot see the quantity they selected persists. Users need clear visibility of what quantity was added to the cart.

## What Changes
- Replace the collapsing DropdownButton with a persistent quantity display showing the selected value
- Show quantity as text (e.g., "Qty: 1kg") with a dropdown icon to indicate it's editable
- When user taps the quantity display, open a dropdown to change the quantity
- After selection, the quantity display updates and stays visible (dropdown closes but text remains)
- Display delete icon alongside quantity for easy removal from cart

## Impact
- Affected specs: `product-display` (new capability)
- Affected code:
  - `mobile/lib/widgets/product_card.dart` - Update quantity UI and interaction logic
  - `mobile/lib/models/product.dart` - May need helper method for unit formatting
