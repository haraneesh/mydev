## Implementation Tasks

### 1. UI Component Design
- [ ] 1.1 Create a reusable QuantityDisplay widget showing selected quantity with edit icon
- [ ] 1.2 Design layout: "Qty: [value]" text + dropdown icon + delete icon in a Row
- [ ] 1.3 Add visual styling to match AppColors and theme

### 2. ProductCard Integration
- [ ] 2.1 Replace DropdownButton with QuantityDisplay in product_card.dart
- [ ] 2.2 Add state tracking for dropdown open/close in _ProductCardState
- [ ] 2.3 Implement dropdown opening logic when user taps quantity display
- [ ] 2.4 Ensure dropdown closes after selection but quantity display persists
- [ ] 2.5 Update cart on quantity change (existing CartProvider.updateQuantity call)

### 3. UX Polish
- [ ] 3.1 Ensure quantity text is readable and properly formatted (e.g., "Qty: 1kg")
- [ ] 3.2 Add visual feedback on tap (highlight, color change)
- [ ] 3.3 Verify delete icon is properly aligned and clickable

### 4. Testing
- [ ] 4.1 Test adding product and seeing quantity persist
- [ ] 4.2 Test changing quantity via dropdown
- [ ] 4.3 Test removing product from cart
- [ ] 4.4 Test on both phone and tablet layouts
- [ ] 4.5 Verify no regression in other product card functionality
