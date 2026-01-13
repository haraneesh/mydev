# Implementation Tasks: Display Cart Unit and Price in Product Card

## 1. Check Cart Status in ProductCard
- [x] 1.1 Used Consumer<CartProvider> to check if product is in cart
- [x] 1.2 Extract cartItem using .firstOrNull() pattern
- [x] 1.3 Get selectedUnit and selectedUnitPrice from cartItem

## 2. Update Display Logic
- [x] 2.1 If product in cart, use cart's selectedUnit for display
- [x] 2.2 If product in cart, use cart's selectedUnitPrice for display
- [x] 2.3 If product not in cart, use lowest unit (current behavior)
- [x] 2.4 Format unit label correctly using _convertToDisplayUnit()

## 3. Testing & Verification
- [x] 3.1 Flutter analyze shows no errors
- [x] 3.2 Code compiles successfully
- [x] 3.3 Product card shows cart unit when in cart
- [x] 3.4 Product card shows lowest unit when not in cart

## 4. Documentation
- [x] 4.1 Code comments explain cart-aware display logic
