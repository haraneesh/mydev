## 1. Implementation

### Backend/Service
- [x] 1.1 Add `searchProducts()` method to ProductService for client-side search
  - Added case-insensitive search matching on product name and description
  - Returns filtered list of products matching query

### Frontend - Search Bar Widget
- [x] 1.2 Create SearchBar widget with text field and clear button (or add inline to HomeScreen)
  - Implemented inline TextField with clear button in HomeScreen
- [x] 1.3 Style search bar to match design: placeholder text, dark red clear button
  - Dark red color (#8B3A3A) button with white X icon
  - Placeholder text: "Search for 'Kullakar Rice' or 'Bansi Wheat"
- [x] 1.4 Integrate search bar into HomeScreen above category sidebar
  - Added between product list timestamp and product grid

### Frontend - Search Logic
- [x] 1.5 Add searchQuery state variable to HomeScreen
  - Added `String searchQuery = ''` state variable
- [x] 1.6 Implement search filtering logic that works with category filtering
  - Updated getFilteredProducts() to apply search on top of category filter
- [x] 1.7 Ensure search respects current category selection (can search within category)
  - Search applies after category filtering for scoped results
- [x] 1.8 Handle edge cases: empty search, special characters
  - Trim and lowercase for consistent matching
  - Empty query returns full filtered list

### Testing
- [ ] 1.9 Test search with various product names
- [ ] 1.10 Test clear button functionality
- [ ] 1.11 Test search + category filter together
- [ ] 1.12 Verify no regression in existing category filtering
