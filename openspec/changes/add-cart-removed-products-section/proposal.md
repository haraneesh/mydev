# Change: Add Cart Removed Products Section

## Why
Users need the ability to remove products from the cart during unit selection, and restore them later. Currently, removed products are lost. This change provides a "Removed" category in the cart to track removed items and allow restoration.

## What Changes
- When a user clicks the Edit button on a cart item and removes the product from the unit selector, the product moves to a new "Removed" section instead of being deleted
- The "Removed" section appears as a distinct category below active products in the cart
- Removed products can be restored by clicking Edit and selecting a unit
- The cart UI now tracks removed product state separately from active items

## Impact
- **Affected specs**: ordering-ui (cart management capability)
- **Affected code**: 
  - `mobile/lib/screens/public/cart_screen.dart` (UI grouping and display)
  - `mobile/lib/providers/cart_provider.dart` (state management for removed items)
  - `mobile/lib/widgets/unit_selection_modal.dart` (remove product callback)
