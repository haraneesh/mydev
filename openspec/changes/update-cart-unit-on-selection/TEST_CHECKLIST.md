# Test Checklist: Unit Selection Cart Update

## Pre-Test Setup
- [ ] Clear app cache/data
- [ ] Close and restart the app completely
- [ ] Enable Flutter console logging
- [ ] Open DevTools or run `flutter logs`

## Test Case 1: Add Product with 400g Unit
**Steps:**
1. [ ] Open home screen
2. [ ] Find a product that has multiple unit options (e.g., Rice with 400g, 800g, 1kg)
3. [ ] Tap "Add" button on the product
4. [ ] Unit selection modal opens
5. [ ] Tap "400g" option
6. [ ] Modal closes

**Expected Results:**
- [ ] Console shows: `➕ addItem: [Product Name], selectedUnit: 0.4, quantity: 1.0`
- [ ] Console shows: `✅ addItem complete. Cart now has 1 items`
- [ ] Product card shows "400g" under the product name/price
- [ ] Cart button shows green color (indicates product is in cart)

**Console Log Pattern:**
```
➕ addItem: Rice, selectedUnit: 0.4, quantity: 1.0
   Adding new cart item
✅ addItem complete. Cart now has 1 items
```

---

## Test Case 2: Change Unit to 800g While in Cart
**Steps (Continue from Test Case 1):**
1. [ ] Product still showing with 400g unit
2. [ ] Tap "Add" button again on the same product
3. [ ] Unit selection modal opens (should show "Remove from Cart" button)
4. [ ] Tap "800g" option
5. [ ] Modal closes

**Expected Results:**
- [ ] Console shows: `🛒 Unit Selection - Product ID: [id], isInCart: true, selectedUnit: 0.8`
- [ ] Console shows: `🔄 Updating cart unit from 0.4 to 0.8`
- [ ] Console shows: `✅ updateItemUnit: Cart updated. Items count: 1`
- [ ] Product card IMMEDIATELY updates to show "800g"
- [ ] Cart still shows only 1 item (not 2)
- [ ] No duplicate products in cart

**Console Log Pattern:**
```
🛒 Unit Selection - Product ID: 507f1f77bcf1, isInCart: true, selectedUnit: 0.8
🔄 Updating cart unit from 0.4 to 0.8
🔄 updateItemUnit: Found product at index 0, oldUnit: 0.4, newUnit: 0.8
✅ updateItemUnit: Cart updated. Items count: 1
   - Rice: unit=0.8, price=180
✅ Cart updated. New items: [Rice:0.8]
```

---

## Test Case 3: Change Unit Again to 1kg
**Steps (Continue from Test Case 2):**
1. [ ] Product showing with 800g unit
2. [ ] Tap "Add" button again
3. [ ] Unit selection modal opens
4. [ ] Tap "1kg" option
5. [ ] Modal closes

**Expected Results:**
- [ ] Console shows unit change from 0.8 to 1.0
- [ ] Product card updates to show "1kg"
- [ ] Cart still has 1 item
- [ ] No duplicates

---

## Test Case 4: Remove from Cart and Re-add
**Steps:**
1. [ ] Product showing with 1kg unit in cart
2. [ ] Tap "Add" button
3. [ ] Unit selection modal opens
4. [ ] Tap "Remove from Cart" button
5. [ ] Modal closes
6. [ ] Cart is now empty

**Expected Results:**
- [ ] Console shows: `Cart items: []`
- [ ] Product card shows "Add" button (not in cart state)
- [ ] Cart button shows normal color

**Then:**
1. [ ] Tap "Add" button again
2. [ ] Modal opens
3. [ ] Select "400g"
4. [ ] Modal closes

**Expected Results:**
- [ ] Console shows: `➕ addItem: Rice, selectedUnit: 0.4, quantity: 1.0`
- [ ] Product card shows "400g"
- [ ] Cart has 1 item

---

## Test Case 5: Add Different Products
**Steps:**
1. [ ] Start fresh (empty cart)
2. [ ] Add "Rice" with 400g
3. [ ] Add "Wheat" with 500g
4. [ ] Change "Rice" to 800g

**Expected Results:**
- [ ] Cart shows 2 different products
- [ ] When changing Rice unit, only Rice updates (not Wheat)
- [ ] Console shows correct product IDs in updates
- [ ] Cart items remain: [Rice 800g, Wheat 500g]

---

## Regression Tests

### Test R1: Original Add Behavior (Product Not in Cart)
- [ ] Add a product not currently in cart
- [ ] Should still add as new item (original behavior works)

### Test R2: Same Unit Selection
- [ ] Product in cart with 400g
- [ ] Select 400g again
- [ ] Should not create duplicate, stays as 1 item

### Test R3: Cart Persistence
- [ ] Add product, close and reopen app
- [ ] Cart should persist with correct unit

### Test R4: Checkout
- [ ] Add products with updated units
- [ ] Proceed to checkout
- [ ] Order should reflect correct units

---

## Debug Inspection Checklist

While testing, also verify programmatically:

```dart
// Open Flutter DevTools or use VS Code debugger
// Set breakpoint in CartProvider.updateItemUnit()

// Inspect:
- [ ] _items.length == 1 after unit update
- [ ] _items[0].selectedUnit == new selected unit
- [ ] _items[0].quantity == 1.0
- [ ] _items[0].selectedUnitPrice is calculated correctly
- [ ] notifyListeners() is called
- [ ] _cartStorage.saveCart() is called
```

---

## Summary

**Pass Criteria:**
- [ ] Console shows all expected debug logs
- [ ] Product card updates immediately with new unit
- [ ] Cart shows single item (not duplicates)
- [ ] Unit changes are persisted
- [ ] No crashes or exceptions
- [ ] All regression tests pass

**Fail Criteria:**
- [ ] Console shows isInCart: false when should be true
- [ ] Product card doesn't update after unit change
- [ ] Duplicate items appear in cart
- [ ] Updates don't persist
- [ ] Crashes or exceptions occur
