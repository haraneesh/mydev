# Change: Style Modal Close Button with Overlap

## Why
Make the modal close button more visually distinct and sophisticated by styling it as a brown circle that partially overlaps the modal edge. This creates a polished UI element that clearly separates the close action from the modal content.

## What Changes
- Change close button from icon-only to a filled circular button
- Set background color to brown (AppColors.primary)
- Increase button size to create visual prominence
- Position button so it partially overlaps the modal boundary
- Adjust modal padding/layout to accommodate the overlapping button
- Keep the X icon but center it in the circle

## Impact
- Affected specs: `ordering-ui` (modal styling)
- Affected code:
  - `mobile/lib/widgets/unit_selection_modal.dart` - Restyle close button and modal layout
