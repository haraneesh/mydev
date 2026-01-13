# Debugging Guide: Unit Selection Cart Update

## Issue
When a product is already in the cart and user selects a different unit, the cart should be updated with the new unit, but the behavior is not working.

## Debugging Steps

### Step 1: Check Console Logs
Run the app and open the Flutter console. When you perform the following actions:
1. Add product with 400g selected
2. Click Add button again
3. Select 800g from modal

You should see the following debug output:

```
🛒 Unit Selection - Product ID: [product-id], isInCart: true, selectedUnit: 0.8
🔄 Updating cart unit from 0.4 to 0.8
🔄 updateItemUnit: Found product at index 0, oldUnit: 0.4, newUnit: 0.8
✅ updateItemUnit: Cart updated. Items count: 1
   - [Product Name]: unit=0.8, price=[calculated-price]
✅ Cart updated. New items: [[Product Name]:0.8]
```

### Step 2: Verify Cart State After Update

**Expected Behavior:**
- Cart should have exactly 1 item (not 2)
- Item's selectedUnit should be 0.8 (not 0.4)
- Item's price should be recalculated for 0.8 unit

**Check in code:**
```dart
// This should show 1 item
print(cartProvider.items.length); // Should be 1

// Check the unit
print(cartProvider.items[0].selectedUnit); // Should be 0.8

// Check the price
print(cartProvider.items[0].selectedUnitPrice); // Should be recalculated
```

### Step 3: Verify Product Card Display

**Expected:**
- Product card should show "800g" (or equivalent display unit)
- The displayed unit comes from: `cartItem.selectedUnit`

**Check:**
1. Look at ProductCard widget (lines 86-96)
2. It reads: `displayUnit = cartItem.selectedUnit`
3. This is converted to display format via `_convertToDisplayUnit()`

### Step 4: Common Issues

#### Issue 1: "isInCart: false" when it should be "true"
**Cause:** CartProvider not being passed correctly to UnitSelectionModal

**Solution:**
- Make sure UnitSelectionModal is wrapped in Consumer<CartProvider> OR
- Use `Provider.of<CartProvider>()` like the code does

#### Issue 2: Product ID mismatch
**Debug log will show:**
```
❌ updateItemUnit: Product [id] not found in cart (cart items: [different-ids])
```

**Cause:** Product IDs don't match between:
- The product in UnitSelectionModal
- The product in cart

**Solution:**
- Check that `product.id` matches cart item's `product.id`
- Look for typos or inconsistent ID mapping

#### Issue 3: updateItemUnit not called at all
**Debug log will show:**
```
🛒 Unit Selection - Product ID: [id], isInCart: false, selectedUnit: 0.8
➕ Adding new item with unit: 0.8
```

**Cause:** `cartProvider.items.any()` check is returning false

**Solution:**
- Verify cart provider is getting latest state
- Check if notifyListeners() was called in addItem()

### Step 5: Test Scenarios

**Scenario 1: Adding product first time**
```
Expected logs:
➕ addItem: [Product], selectedUnit: 0.4, quantity: 1.0
   Adding new cart item
✅ addItem complete. Cart now has 1 items
```

**Scenario 2: Changing unit while in cart**
```
Expected logs:
🛒 Unit Selection - Product ID: [id], isInCart: true, selectedUnit: 0.8
🔄 Updating cart unit from 0.4 to 0.8
✅ updateItemUnit: Cart updated. Items count: 1
```

**Scenario 3: Removing and re-adding**
```
Expected logs after removing:
Cart items: []

Then after adding again:
➕ addItem: [Product], selectedUnit: 0.8, quantity: 1.0
```

## Key Code Locations

1. **Unit Selection Logic:** `lib/widgets/unit_selection_modal.dart` (lines 63-79)
2. **Update Method:** `lib/providers/cart_provider.dart` (lines 110-150)
3. **Product Display:** `lib/widgets/product_card.dart` (lines 86-96)

## How to Verify Fix

1. Run the app
2. Go to home screen
3. Add a product with unit 400g
4. Check console: Should see `✅ addItem complete. Cart now has 1 items`
5. Click Add button on same product
6. Select 800g from modal
7. Check console: Should see `✅ updateItemUnit: Cart updated. Items count: 1`
8. Product card should now display the new unit (800g)

## Performance Note

- `notifyListeners()` is called after cart update, which triggers UI rebuild
- Product card watches the cart via `Consumer<CartProvider>`
- UI should update immediately after unit selection
