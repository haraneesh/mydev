# Implementation Tasks: Simplify Product Card UI

## 1. Code Removal - ProductCard Widget
- [x] 1.1 Remove `_buildCartItemControls()` method (lines 232-347)
- [x] 1.2 Remove unit selector dropdown code from cart item display
- [x] 1.3 Remove quantity increment/decrement (+/-) buttons
- [x] 1.4 Remove delete/dumpster button from cart controls
- [x] 1.5 Simplify Row 2 to show only "Add" button for all items

## 2. Code Cleanup
- [x] 2.1 Remove unused imports (collection/collection.dart)
- [x] 2.2 Remove helper methods that are no longer used (_parseUnitSelection, _formatUnitWithDiscount)
- [x] 2.3 Remove `_selectedUnit` state variable
- [x] 2.4 Remove cart sync logic (`_syncSelectedUnitFromCart`)

## 3. Testing & Verification
- [x] 3.1 Verify product card displays "Add" button for all products
- [x] 3.2 Flutter analyze shows no issues after removal
- [x] 3.3 Code compiles without errors

## 4. Documentation
- [x] 4.1 Code comments updated to reflect simplified UI
