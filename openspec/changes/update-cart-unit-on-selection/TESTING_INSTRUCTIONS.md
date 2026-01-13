# Testing Instructions: Cart Unit Update Feature

## Quick Start

### 1. Run the App with Logging Enabled
```bash
flutter run -v
```

### 2. Open Flutter Logs
In a separate terminal:
```bash
flutter logs
```

### 3. Test the Feature

**First Add:**
- Find a product with multiple unit options (e.g., Rice: 400g, 800g, 1kg)
- Tap the "Add" button
- Select "400g" from the modal
- **Check console:** Should see logs starting with `➕ addItem`

**Update Unit:**
- Tap the "Add" button again on the same product
- Select "800g" from the modal
- **Check console:** Should see logs starting with `🛒 Unit Selection` and `🔄 Updating`
- **Check UI:** Product card should immediately show "800g"

## Key Verification Points

### Console Output Signs of Success
✅ When adding first time:
```
➕ addItem: [Product Name], selectedUnit: 0.4, quantity: 1.0
   Adding new cart item
✅ addItem complete. Cart now has 1 items
```

✅ When updating unit:
```
🛒 Unit Selection - Product ID: [id], isInCart: true, selectedUnit: 0.8
🔄 Updating cart unit from 0.4 to 0.8
🔄 updateItemUnit: Found product at index 0, oldUnit: 0.4, newUnit: 0.8
✅ updateItemUnit: Cart updated. Items count: 1
   - [Product Name]: unit=0.8, price=[amount]
✅ Cart updated. New items: [[Product Name]:0.8]
```

### Console Output Signs of Problems
❌ If you see `isInCart: false` when product is in cart:
- Problem: Product not being detected in cart
- Check: Product ID matching, CartProvider state

❌ If you see duplicate products:
- Problem: updateItemUnit not being called
- Check: Console logs, isInCart detection

❌ If you see `Product [id] not found in cart`:
- Problem: Product removed before update completed
- Check: Cart state, timing of operations

## Manual UI Verification Checklist

- [ ] Product card shows correct unit when added
- [ ] Product card updates immediately when unit changed
- [ ] No duplicate products appear in cart
- [ ] Cart button color reflects "in cart" state
- [ ] "Remove from Cart" button appears when expected
- [ ] Modal closes after selection
- [ ] No crashes or freezing

## Automated Testing (if you write tests)

```dart
// Example test structure:
test('Update cart unit when product already in cart', () async {
  // 1. Add product with 400g
  await cartProvider.addItem(product, 1.0, selectedUnit: 0.4);
  expect(cartProvider.items.length, 1);
  expect(cartProvider.items[0].selectedUnit, 0.4);
  
  // 2. Update unit to 800g
  await cartProvider.updateItemUnit(product.id, 0.8);
  expect(cartProvider.items.length, 1);
  expect(cartProvider.items[0].selectedUnit, 0.8);
});
```

## Troubleshooting

### Scenario: Unit doesn't update in cart
1. Check console logs - look for error messages
2. Verify product IDs match exactly
3. Ensure CartProvider is initialized with products
4. Restart app completely (flutter clean, flutter run)

### Scenario: Product card doesn't update
1. Check if Consumer<CartProvider> is watching correctly
2. Verify notifyListeners() was called in updateItemUnit()
3. Check if cart items list actually changed

### Scenario: Duplicate products appear
1. Check console for "isInCart: true"
2. Verify updateItemUnit() is being called (check logs)
3. If addItem() is being called instead, the condition is wrong

## Performance Checklist

- [ ] Unit update happens instantly (no noticeable delay)
- [ ] No lag when opening modal
- [ ] Smooth UI update after selection
- [ ] Cart storage saves successfully
- [ ] No memory leaks (app doesn't slow down after many actions)

## Final Sign-Off

Only mark as complete when:
- [ ] All console logs match expected patterns
- [ ] Product card updates immediately
- [ ] Cart shows only 1 item after unit change
- [ ] Test checklist scenarios pass
- [ ] No console errors or warnings
