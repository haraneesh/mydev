# Debug Guide: ProductCard Not Updating After Unit Change

## Issue
After updating a product's unit in the cart, the ProductCard UI does not reflect the change.

## Enhanced Debug Logging

Comprehensive debug logging has been added to trace the entire flow:

### 1. UnitSelectionModal (When User Selects Unit)
```
🎯 UNIT SELECTION TAPPED =====================
📍 Product: Rice (ID: 507f1f77bcf1)
📏 Selected unit: 0.8 (displayLabel: 800g)
🛍️ Current cart items: [Rice:0.4]
🛒 Unit Selection - Product ID: 507f1f77bcf1, isInCart: true, selectedUnit: 0.8
🔄 UPDATING UNIT: 0.4 → 0.8
   Old: 400g
   New: 800g
✅ Cart update triggered. Items: [Rice:0.8]
👈 Closing modal...
```

### 2. CartProvider.updateItemUnit() (Updating Cart)
```
🚀 updateItemUnit START: productId=507f1f77bcf1, newSelectedUnit=0.8
🔄 updateItemUnit: Found product at index 0, oldUnit: 0.4, newUnit: 0.8
   ✂️ Removed old item at index 0
   ➕ Added new item: name=Rice, unit=0.8, price=180
✅ updateItemUnit: Cart updated. Items count: 1
   📦 Cart item: Rice: unit=0.8, price=180
   💾 Saved to storage
📢 Calling notifyListeners()...
✅ notifyListeners() completed
🎉 updateItemUnit END
```

### 3. ProductCard.build() (UI Rebuild)
After updateItemUnit completes and notifyListeners() is called, ProductCard should rebuild:

```
🏗️ ProductCard.build() REBUILDING for product: Rice
   📊 CartProvider has 1 items
   🔍 Looking for product ID: 507f1f77bcf1
   📦 Cart product IDs: [507f1f77bcf1]
   ✅ Found in cart! selectedUnit: 0.8, price: 180
   🎨 Display unit formatted as: 800g
```

## Complete Flow Trace

Expected sequence when test scenario runs:

```
Step 1: User adds product with 400g
─────────────────────────────────
🎯 UNIT SELECTION TAPPED =====================
📍 Product: Rice (ID: 507f...)
📏 Selected unit: 0.4 (displayLabel: 400g)
🛍️ Current cart items: []
🛒 Unit Selection - Product ID: 507f..., isInCart: false, selectedUnit: 0.4
➕ Adding new item with unit: 0.4 (400g)
👈 Closing modal...

🏗️ ProductCard.build() REBUILDING for product: Rice
   📊 CartProvider has 1 items
   ✅ Found in cart! selectedUnit: 0.4, price: 88
   🎨 Display unit formatted as: 400g
   ✓ UI shows "400g"

Step 2: User taps Add again and selects 800g
────────────────────────────────────────────
🎯 UNIT SELECTION TAPPED =====================
📍 Product: Rice (ID: 507f...)
📏 Selected unit: 0.8 (displayLabel: 800g)
🛍️ Current cart items: [Rice:0.4]
🛒 Unit Selection - Product ID: 507f..., isInCart: true, selectedUnit: 0.8
🔄 UPDATING UNIT: 0.4 → 0.8
✅ Cart update triggered

🚀 updateItemUnit START: productId=507f..., newSelectedUnit=0.8
   ✂️ Removed old item
   ➕ Added new item: unit=0.8, price=180
📢 Calling notifyListeners()...
✅ notifyListeners() completed
🎉 updateItemUnit END

🏗️ ProductCard.build() REBUILDING for product: Rice  ← THIS SHOULD HAPPEN
   📊 CartProvider has 1 items
   ✅ Found in cart! selectedUnit: 0.8, price: 180
   🎨 Display unit formatted as: 800g
   ✓ UI should show "800g"
```

## Diagnostic Checklist

Run the test scenario and check console output:

### ✅ Step 1: Unit Selection Detected
```
Look for: 🎯 UNIT SELECTION TAPPED
          🛒 Unit Selection - Product ID: [id], isInCart: true
```
**If missing:** Unit selection not being detected. Check modal click handling.

### ✅ Step 2: Cart Update Triggered
```
Look for: 🚀 updateItemUnit START
          ✅ updateItemUnit: Cart updated. Items count: 1
```
**If missing:** updateItemUnit not being called. Check if isInCart check is working.

### ✅ Step 3: notifyListeners Called
```
Look for: 📢 Calling notifyListeners()...
          ✅ notifyListeners() completed
```
**If missing:** Cart was not updated, or async operation failed.

### ✅ Step 4: ProductCard Rebuilds
```
Look for: 🏗️ ProductCard.build() REBUILDING for product: Rice
          ✅ Found in cart! selectedUnit: 0.8, price: 180
```
**If missing:** ProductCard did not rebuild. Consumer may not be working.

### ✅ Step 5: Display Updates
```
Look for: 🎨 Display unit formatted as: 800g
          In UI: Product card shows "800g"
```
**If missing:** Display logic broken. Check _convertToDisplayUnit().

## Possible Issues and Solutions

### Issue 1: ProductCard Not Rebuilding
**Symptoms:**
- Steps 1-3 show OK, but ProductCard logs don't appear
- UI doesn't update

**Causes:**
1. Consumer<CartProvider> not watching correctly
2. notifyListeners() timing issue
3. Provider package version issue

**Solutions:**
- Check ProductCard line 75: `Consumer<CartProvider>` present?
- Verify notifyListeners() is called synchronously
- `flutter pub get` to update dependencies

### Issue 2: Product ID Mismatch
**Symptoms:**
```
🔍 Looking for product ID: 507f111...
📦 Cart product IDs: [507f222...]  ← Different ID!
⭕ NOT in cart
```

**Cause:** Product object in ProductCard has different ID than cart item

**Solution:**
1. Check product.id consistency
2. Verify IDs from API/backend
3. Add logging to Product creation

### Issue 3: notifyListeners Not Called
**Symptoms:**
- updateItemUnit logs show ✅ but no "Calling notifyListeners()" message
- Async operation may not have completed

**Solution:**
- Check if `await _cartStorage.saveCart()` is blocking
- Verify CartStorage implementation
- Check for exceptions in async chain

### Issue 4: Cart Item Not Found
**Symptoms:**
```
🛒 Unit Selection - Product ID: 507f..., isInCart: false
```
When product is clearly in cart.

**Cause:**
- isInCart check is failing
- Product ID changed
- Cart was cleared

**Solution:**
- Add explicit logging of product IDs before/after save
- Check if cart persistence is working
- Verify product.id stability

## Testing the Fix

### Quick Debug Test
1. Run: `flutter run -v`
2. Open logs: `flutter logs`
3. Add product with 400g
4. Check logs for:
   ```
   ✅ addItem complete
   ```
5. Tap Add, select 800g
6. Check logs for:
   ```
   🚀 updateItemUnit START
   📢 Calling notifyListeners()
   🏗️ ProductCard.build() REBUILDING
   ✅ Found in cart! selectedUnit: 0.8
   🎨 Display unit formatted as: 800g
   ```
7. Check UI: Product card should show "800g"

### Full Test Scenario
1. Add product (400g) - verify displayed
2. Change to 800g - verify update in logs
3. Change to 1kg - verify another update
4. Go to another product - return to Rice - verify unit persisted
5. Close and reopen app - verify unit persisted

## Log Reading Tips

- 🎯 = User action (unit selected)
- 🚀 = Function start
- 🎉 = Function complete
- 📢 = Critical operation (notifyListeners)
- 🏗️ = UI rebuild
- ❌ = Error or unexpected state

## Console Output Recording

To save logs for analysis:
```bash
# Start logging to file
flutter logs > cart_update_debug.log 2>&1

# Run test scenario
# (Add product, change unit, etc.)

# Stop logging (Ctrl+C)

# Search logs
grep "ProductCard.build()" cart_update_debug.log
grep "updateItemUnit" cart_update_debug.log
grep "notifyListeners" cart_update_debug.log
```

## If Issue Persists

After reviewing all logs:
1. Check if ProductCard.build() appears at all
2. If not: Consumer<CartProvider> not receiving notification
3. If yes but unit not updated: Product ID mismatch
4. Check ProductCard line 78-88 logic

Let me know the console output and I can help narrow down the exact issue!
