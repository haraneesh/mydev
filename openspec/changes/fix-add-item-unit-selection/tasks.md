# Implementation Tasks: Fix Add Item Unit Selection

## 1. Fix ProductCard addItem Call
- [x] 1.1 Updated addItem call to pass quantity (1.0) as second parameter
- [x] 1.2 Pass selectedUnit as named parameter

## 2. Fix CartItem Initialization with Fallback
- [x] 2.1 Changed selectedUnitPrice from required to optional parameter
- [x] 2.2 Used `late final` with initialization in constructor body
- [x] 2.3 Added fallback logic: if no price or price is 0, calculate from product
- [x] 2.4 Handles legacy cart data from SharedPreferences without selectedUnitPrice
- [x] 2.5 Added _effectiveUnitPrice helper for defensive calculations
- [x] 2.6 Updated subtotal to use _effectiveUnitPrice

## 3. Update CartProvider
- [x] 3.1 Updated addItem to pass selectedUnitPrice (can be null)
- [x] 3.2 CartItem constructor will calculate price if null or 0

## 4. Testing & Verification
- [x] 4.1 Flutter analyze shows no errors
- [x] 4.2 Code compiles successfully
- [x] 4.3 Resolves null type error in CartItem.selectedUnitPrice
- [x] 4.4 CartItem.toJson() safely serializes selectedUnitPrice
- [x] 4.5 Handles legacy cart data gracefully

## 5. Documentation
- [x] 5.1 Code fix documented with fallback strategy
