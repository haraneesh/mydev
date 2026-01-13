## MODIFIED Requirements

### Requirement: Add to Cart with Quantity Selection
The system SHALL allow users to add products to cart with a selected quantity, and display the selected quantity persistently in the product card.

#### Scenario: User adds product with default quantity
- **WHEN** user clicks the "Add" button on a product not in cart
- **THEN** the product is added to cart with the default (first available) quantity
- **AND** the "Add" button is replaced with a quantity display (e.g., "Qty: 1kg") and delete icon
- **AND** the quantity display remains visible with the selected value

#### Scenario: User changes product quantity
- **WHEN** the product is in cart and user taps the quantity display
- **THEN** a dropdown menu opens showing available quantity options
- **AND** the current quantity is highlighted or selected in the dropdown
- **WHEN** user selects a new quantity from the dropdown
- **THEN** the dropdown closes and the quantity display updates to show the new value
- **AND** the quantity display remains visible (does not revert to "Add" button)
- **AND** the product quantity in cart is updated

#### Scenario: User removes product from cart
- **WHEN** user clicks the delete icon next to the quantity display
- **THEN** the product is removed from cart
- **AND** the quantity display and delete icon are replaced with the "Add" button
