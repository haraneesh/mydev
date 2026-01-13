# Change: Change Add Button to Oblong Shape

## Why
Improve the visual appearance of the Add button by changing it from a square/circular shape to an oblong (pill-shaped) button. This provides better visual proportion and makes the button more recognizable as an actionable element.

## What Changes
- Change Add button from 28x28px square to oblong dimensions (e.g., 40x24px)
- Adjust padding and text size to fit oblong shape
- Add border radius to create pill-shaped appearance

## Impact
- Affected specs: `ordering-ui` (product card UI styling)
- Affected code:
  - `mobile/lib/widgets/product_card.dart` - Modify Add button dimensions and styling
