# Implementation Tasks

## 1. Backend Cart Provider
- [x] 1.1 Add `updateItemUnit()` method to CartProvider to update an existing cart item's selected unit and price
- [x] 1.2 Ensure the method preserves the quantity when updating the unit

## 2. Unit Selection Modal
- [x] 2.1 Modify UnitSelectionModal to check if product is already in cart
- [x] 2.2 When product is in cart and user selects a unit, call `updateItemUnit()` instead of `addItem()`
- [x] 2.3 Close modal after cart update
- [x] 2.4 Test with products already in cart

## 3. Testing
- [x] 3.1 Test selecting new unit for product not in cart (should add as new item)
- [x] 3.2 Test selecting new unit for product already in cart (should update existing item)
- [x] 3.3 Test quantity preservation when updating unit
- [x] 3.4 Test that cart button shows correct state after update
