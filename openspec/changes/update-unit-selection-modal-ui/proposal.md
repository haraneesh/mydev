# Change: Update Unit Selection Modal UI

## Why
Improve the unit selection modal's user interface by:
1. Providing a way to remove products from the cart directly from the modal
2. Replacing the generic Cancel button with a more intuitive close button (X icon)
3. Making the remove action visually distinct with orange accent color

## What Changes
- Add "Remove from Cart" button at the bottom of modal if product is already in cart
- Make "Remove from Cart" button background orange (accent color)
- Remove the generic "Cancel" button
- Add circular X button in the top-right corner to close the modal
- "Remove from Cart" button removes the product from cart and closes modal

## Impact
- Affected specs: `ordering-ui` (unit selection modal UI)
- Affected code:
  - `mobile/lib/widgets/unit_selection_modal.dart` - Update modal header, buttons, and close UI
  - `mobile/lib/providers/cart_provider.dart` - Verify removeItem functionality
