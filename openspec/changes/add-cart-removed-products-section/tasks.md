# Implementation Tasks

## 1. Data Model & State Management
- [ ] 1.1 Add `removedItems` list to CartProvider
- [ ] 1.2 Create method `removeItem(productId)` in CartProvider
- [ ] 1.3 Create method `restoreItem(cartItem)` in CartProvider
- [ ] 1.4 Update `addItem()` to restore removed items if they exist

## 2. Unit Selection Modal Updates
- [ ] 2.1 Ensure remove button callback properly calls CartProvider.removeItem()
- [ ] 2.2 Test modal removes product correctly

## 3. Cart Screen UI Updates
- [ ] 3.1 Modify cart screen to group items into "active" and "removed" categories
- [ ] 3.2 Add "Removed" category header below active products
- [ ] 3.3 Update Edit button functionality to restore products when unit is selected
- [ ] 3.4 Apply visual styling to removed products section

## 4. Testing
- [ ] 4.1 Test removing a product displays it in "Removed" section
- [ ] 4.2 Test restoring a product moves it back to active section
- [ ] 4.3 Test "Removed" section only displays when items exist
- [ ] 4.4 Test cart totals exclude removed items
