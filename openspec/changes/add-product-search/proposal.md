# Change: Add Product Search Functionality

## Why
Users need to quickly find products by name instead of manually scrolling through categories. A search feature improves discoverability and user experience, allowing customers to locate specific items (e.g., "Kullakar Rice", "Bansi Wheat") directly.

## What Changes
- Add a search bar widget at the top of the product listing area with placeholder "Search for products..."
- Implement search filtering to match product names/descriptions against user input
- Add clear (X) button to reset search results
- Reuse existing product subscription from ProductService (no backend changes)
- Design search bar similar to provided screenshot: text field with dark red clear button

## Impact
- Affected specs: `ordering-ui` (extends product browsing capability)
- Affected code: 
  - `mobile/lib/screens/public/home_screen.dart` - Add search bar and filter logic
  - `mobile/lib/services/product_service.dart` - Add client-side search method
  - `mobile/lib/widgets/` - New SearchBar widget (optional, can be inline)
