# Change: Move Add Button to Image Overlay

## Why
Optimize product card layout by positioning the Add button as an overlay on top of the product image instead of below it. This reduces vertical space usage and makes the button more visually integrated with the product visual.

## What Changes
- Reposition Add button from Row 2 (below image and product info) to overlay on product image
- Add button should appear in a fixed position on the image (e.g., bottom-right corner)
- Maintain button styling and functionality

## Impact
- Affected specs: `ordering-ui` (product card layout)
- Affected code:
  - `mobile/lib/widgets/product_card.dart` - Move Add button to image stack overlay
