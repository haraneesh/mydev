# Quick Reference: Testing Cart Unit Update

## One-Minute Test

```bash
# 1. Terminal 1: Run app
flutter run -v

# 2. Terminal 2: Watch logs
flutter logs

# 3. In app:
# - Add product, select 400g
# - Tap "Add" again
# - Select 800g
# - Check: Product card shows "800g"
```

## What to Look For in Console

### ✅ Success Pattern
```
🎯 UNIT SELECTION TAPPED
🛒 Unit Selection - isInCart: true
🔄 UPDATING UNIT: 0.4 → 0.8
🚀 updateItemUnit START
📢 Calling notifyListeners()
✅ notifyListeners() completed
🏗️ ProductCard.build() REBUILDING for product: Rice
   ✅ Found in cart! selectedUnit: 0.8
   🎨 Display unit formatted as: 800g
```

### ❌ Problem Pattern 1: Not Detected as In-Cart
```
🛒 Unit Selection - isInCart: false  ← WRONG!
➕ Adding new item  ← Adding duplicate
```

### ❌ Problem Pattern 2: Cart Updated but UI Doesn't Rebuild
```
📢 Calling notifyListeners()
✅ notifyListeners() completed
🏗️ ProductCard.build() REBUILDING  ← MISSING!
```

### ❌ Problem Pattern 3: UI Rebuilds but Doesn't Find Item
```
🏗️ ProductCard.build() REBUILDING
   ⭕ NOT in cart, using default unit: 0.4  ← WRONG!
   🎨 Display unit formatted as: 400g  ← Old unit!
```

## Expected Console Output (Full Trace)

### First Add (400g)
```
🎯 UNIT SELECTION TAPPED
📍 Product: Rice (ID: abc123)
📏 Selected unit: 0.4
🛒 isInCart: false
➕ Adding new item with unit: 0.4
👈 Closing modal...

🏗️ ProductCard.build() REBUILDING for product: Rice
   ✅ Found in cart! selectedUnit: 0.4
   🎨 Display unit formatted as: 400g
```

### Update to 800g
```
🎯 UNIT SELECTION TAPPED
📍 Product: Rice (ID: abc123)
📏 Selected unit: 0.8
🛍️ Current cart items: [Rice:0.4]
🛒 isInCart: true  ← KEY INDICATOR
🔄 UPDATING UNIT: 0.4 → 0.8

🚀 updateItemUnit START
   ✂️ Removed old item
   ➕ Added new item: unit=0.8
📢 Calling notifyListeners()  ← KEY INDICATOR
✅ notifyListeners() completed
🎉 updateItemUnit END

🏗️ ProductCard.build() REBUILDING  ← KEY INDICATOR
   ✅ Found in cart! selectedUnit: 0.8  ← KEY INDICATOR
   🎨 Display unit formatted as: 800g
```

## Files Modified

```
mobile/lib/
  ├── providers/cart_provider.dart
  │   └── updateItemUnit() - ADDED LOGGING
  ├── widgets/unit_selection_modal.dart
  │   └── Unit selection logic - ADDED LOGGING
  └── widgets/product_card.dart
      └── build() method - ADDED LOGGING
```

## Debug Files

```
openspec/changes/update-cart-unit-on-selection/
  ├── DEBUG_UI_UPDATE.md ← READ THIS IF UI DOESN'T UPDATE
  ├── DEBUG_GUIDE.md
  ├── TESTING_INSTRUCTIONS.md
  └── TEST_CHECKLIST.md
```

## Dart Analysis

```bash
cd mobile
dart analyze lib/providers/cart_provider.dart \
           lib/widgets/unit_selection_modal.dart \
           lib/widgets/product_card.dart
# Expected: No issues found!
```

## Key Indicators

| Indicator | Good | Bad |
|-----------|------|-----|
| isInCart when product in cart | true | false |
| notifyListeners called | ✅ appears | ❌ missing |
| ProductCard rebuilds | 🏗️ appears | ❌ missing |
| Cart item found | ✅ Found | ⭕ NOT found |
| Unit displays | 800g | 400g |
| Duplicate items | None | 2 items |

## Common Issues

| Issue | Solution |
|-------|----------|
| isInCart: false | Product ID mismatch, check IDs in logs |
| notifyListeners missing | Async operation incomplete, check await |
| ProductCard not rebuilding | Consumer<CartProvider> not working |
| Unit doesn't update in UI | Display logic broken, check _convertToDisplayUnit |

## Next Steps

1. **Run test** with console visible
2. **Check console logs** against success pattern
3. **If issue found**, open DEBUG_UI_UPDATE.md
4. **Isolate problem** using log patterns
5. **Report** which step fails

## Sanity Checks

- [ ] Dart analysis passes
- [ ] App starts without crashes
- [ ] Product card displays correctly initially
- [ ] "Add" button works
- [ ] Modal opens when clicked
- [ ] Unit selection works for new products
- [ ] Console shows detailed logs

Good luck! 🚀
