# Suvai App - Testing Checklist

## Automated Tests (36 total)

Run all tests:
```bash
cd mobile
flutter test
```

| Phase | Component | Tests | Status |
|-------|-----------|-------|--------|
| 1 | CartProvider | 19 | ✅ |
| 1 | Product Models | 13 | ✅ |
| 2 | HomeScreen | 5 | ✅ |
| 2 | ProductCard | 4 | ✅ |
| 2 | CartScreen | 4 | ✅ |
| 2 | QuantitySelector | 5 | ✅ |
| 2 | OrderFooter | 5 | ✅ |
| 3 | CheckoutScreen | 6 | ✅ |
| 3 | OrderConfirmation | 7 | ✅ |

---

## Manual Testing Checklist

### Splash Screen
- [ ] App launches with splash screen
- [ ] Shows Suvai logo on white background
- [ ] Displays for ~1 second
- [ ] Transitions smoothly to HomeScreen

### HomeScreen
- [ ] See products in 2-column grid
- [ ] All 3 products visible (Biryani, Dosa, Idli)
- [ ] Category chips appear (All, Biryani, Breakfast)
- [ ] Cart icon shows in AppBar
- [ ] Cart badge shows 0 initially

### Category Filtering
- [ ] Tap "Biryani" → Only Biryani shows
- [ ] Tap "Breakfast" → Dosa and Idli show
- [ ] Tap "All" → All products show
- [ ] Filter chips remain selected

### Add to Cart
- [ ] Click + button on Biryani
- [ ] Snackbar shows "Biryani added to cart"
- [ ] Cart badge updates to 1
- [ ] Price correct (₹250)
- [ ] Can add multiple items

### Cart Icon Navigation
- [ ] Tap cart icon → CartScreen opens
- [ ] Back button returns to HomeScreen
- [ ] Cart state persists

### CartScreen Display
- [ ] All added items visible with details
- [ ] Item names, prices, and quantities show
- [ ] Subtotal calculated correctly
- [ ] Total amount correct
- [ ] Empty cart message shows if no items

### Quantity Management
- [ ] Tap [+] → Quantity increases
- [ ] Tap [-] → Quantity decreases
- [ ] Can't decrease below 1
- [ ] Total updates immediately
- [ ] Subtotal updates per item

### Delete from Cart
- [ ] Tap trash icon → Item removed
- [ ] Total updates immediately
- [ ] Empty cart message appears if last item deleted

### OrderFooter
- [ ] Shows correct item count
- [ ] Shows singular/plural correctly (1 item vs 2 items)
- [ ] Shows total amount
- [ ] Checkout button present and clickable

### Checkout Navigation
- [ ] Tap Checkout → CheckoutScreen opens
- [ ] Order summary visible
- [ ] Form fields present (Name, Phone, Address)

### Form Validation

#### Name Field
- [ ] Required field (can't leave empty)
- [ ] Error message shows: "Name is required"
- [ ] Accepts any text

#### Phone Field
- [ ] Required field
- [ ] Only accepts digits
- [ ] Must be exactly 10 digits
- [ ] Error: "Phone number must be 10 digits"
- [ ] Examples:
  - [ ] Invalid: "123" → Error
  - [ ] Invalid: "abcdefghij" → Error
  - [ ] Valid: "9876543210" → Pass

#### Address Field
- [ ] Required field
- [ ] Multi-line text area
- [ ] Error message shows: "Delivery address is required"
- [ ] Accepts multi-line input

### Form Submission
- [ ] Leave fields empty → Can't submit
- [ ] Invalid phone → Can't submit
- [ ] Valid data → Shows loading spinner
- [ ] Loading spinner visible during submission
- [ ] Successful submission → OrderConfirmationScreen

### OrderConfirmationScreen
- [ ] Green checkmark icon visible
- [ ] "Order Confirmed" message shows
- [ ] Order ID displayed (ORD-xxxxx format)
- [ ] Customer name shown
- [ ] Total amount shown
- [ ] Delivery timeline information visible
- [ ] "Continue Shopping" button present

### Continue Shopping
- [ ] Tap button → HomeScreen appears
- [ ] Cart cleared (0 items)
- [ ] Can add new products

### Data Persistence
- [ ] Add items to cart
- [ ] Close app completely
- [ ] Reopen app
- [ ] Cart items still there

### Navigation Path
- [ ] HomeScreen → CartScreen → CheckoutScreen → ConfirmationScreen → HomeScreen
- [ ] All transitions smooth
- [ ] Back buttons work (when applicable)
- [ ] No lost state

### Error Handling
- [ ] Invalid form data shows errors
- [ ] Errors don't crash app
- [ ] Can correct and retry

### Edge Cases
- [ ] Empty cart → Shows message
- [ ] Very long product name → Truncates with ellipsis
- [ ] Quantity 1 → [-] button disabled
- [ ] Large order total → Displays correctly

---

## Performance Testing

### Responsiveness
- [ ] Category filter smooth (no lag)
- [ ] Product grid scrolls smoothly
- [ ] Cart updates in <100ms
- [ ] Form validation instant

### Memory
- [ ] No crashes with multiple add/remove
- [ ] App doesn't freeze
- [ ] Smooth animations

### Persistence
- [ ] Cart survives app close
- [ ] Cart survives phone restart
- [ ] No data corruption

---

## UI/UX Testing

### Visual Consistency
- [ ] All screens use consistent theme
- [ ] Colors match Suvai branding
- [ ] Typography consistent
- [ ] Spacing balanced

### User Feedback
- [ ] Snackbars appear for actions
- [ ] Error messages clear
- [ ] Loading states visible
- [ ] Success confirmations obvious

### Navigation Clarity
- [ ] Path from home to confirmation clear
- [ ] Back navigation intuitive
- [ ] All interactive elements obvious

---

## Accessibility Testing

### Text
- [ ] All text readable
- [ ] Contrast adequate
- [ ] No important info in images only

### Interaction
- [ ] All buttons easily tappable
- [ ] Form fields obvious
- [ ] Error messages prominent

---

## Device Testing

Test on different devices if possible:
- [ ] Phone (portrait)
- [ ] Phone (landscape)
- [ ] Tablet
- [ ] Different screen sizes

---

## Test Completion

Once all manual tests pass:
- [ ] Run automated tests: `flutter test`
- [ ] Check linting: `flutter analyze`
- [ ] Build APK: `flutter build apk --release`
- [ ] Document any issues found

---

## Test Report Template

```
Date: ________________
Tester: ________________
Device: ________________
OS Version: ________________

Issues Found: ☐ None  ☐ Minor  ☐ Major

Details:
_________________________________
_________________________________

Recommendations:
_________________________________
_________________________________

Status: ☐ PASS  ☐ FAIL
```

---

## Known Working State

✅ All 36 automated tests passing  
✅ 0 linting errors  
✅ Splash screen working  
✅ Navigation complete  
✅ Form validation working  
✅ Cart persistence working  

---

## Next: Backend Testing

Once Meteor backend integrated:
- [ ] Test real product fetch
- [ ] Test order submission to backend
- [ ] Test error handling for network issues
- [ ] Test authentication flow
