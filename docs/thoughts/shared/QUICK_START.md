# Suvai App - Quick Start Guide

## Setup

```bash
cd mobile
flutter pub get
flutter run
```

## What You'll See

1. **Splash Screen** - Suvai logo (white background)
2. **HomeScreen** - Products in 2-column grid
3. **Categories** - Filter: All, Biryani, Breakfast
4. **Add to Cart** - Click food icon button
5. **Cart Icon** - Shows item count
6. **Checkout** - Full form with validation
7. **Confirmation** - Order success screen

## Test It

```bash
# All 36 tests
flutter test

# Specific test
flutter test test/unit/screens/home_screen_test.dart

# With coverage
flutter test --coverage
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `lib/main.dart` | App entry point |
| `lib/screens/public/` | All screens |
| `lib/widgets/` | Reusable components |
| `lib/providers/cart_provider.dart` | State management |
| `pubspec.yaml` | Dependencies & splash config |

## Quick Navigation

```
HomeScreen
  └─ Click cart icon → CartScreen
       └─ Click Checkout → CheckoutScreen
            └─ Click Place Order → OrderConfirmationScreen
                 └─ Click Continue → Back to HomeScreen
```

## Current Products

- Biryani (₹250)
- Dosa (₹80)
- Idli (₹60)

All hardcoded in `main.dart` - ready to swap with backend.

## Form Validation

- **Name**: Required
- **Phone**: 10 digits, numeric only
- **Address**: Required

## Build Commands

```bash
flutter build apk --release     # Android
flutter build ios               # iOS
flutter analyze                 # Lint check
```

## Troubleshooting

**Tests failing?**
```bash
flutter clean
flutter pub get
flutter test
```

**App not running?**
```bash
flutter clean
flutter pub get
flutter run
```

**Linting errors?**
```bash
flutter analyze
flutter fix --apply
```

## Next Steps

1. Run the app end-to-end
2. Check test coverage
3. Integrate backend when ready
4. Add real products/images

---

**Status**: ✅ Ready to use. All 36 tests passing.
