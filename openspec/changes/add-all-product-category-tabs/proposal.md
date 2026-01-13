# Change: Add All Product Category Tabs to Order Page

## Why
Currently, the order page navigation panel does not display all available product categories as tabs. This limits user discoverability and forces navigation through a limited set of categories. By exposing all categories (except "New" and "Returnable") as horizontal tabs, users can more easily browse and switch between product categories.

## What Changes
- The left navigation panel on the order page SHALL display all supported product categories as clickable tabs
- Categories SHALL use their `display_value` field as the UI label (e.g., "Leafy Greens" for Greens category)
- The `name` field from `ProductTypeName` constant SHALL be used to match products from MongoDB
- "New" and "Returnable" categories SHALL be excluded from the tab display
- Each tab SHALL be selectable and filter the product grid to show only products from that category
- The selected category tab SHALL remain visually highlighted to indicate current selection

## Impact
- Affected specs: `ordering-ui`
- Affected code: 
  - `imports/modules/constants.js` (product category definitions)
  - Client-side component rendering the order page navigation (location TBD)
  - Product filtering logic to match MongoDB `name` field with tab selection
