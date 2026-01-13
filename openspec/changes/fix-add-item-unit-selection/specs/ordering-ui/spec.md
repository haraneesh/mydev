## MODIFIED Requirements

### Requirement: Add Product to Cart
When a user selects a unit from the unit selection modal, the product SHALL be added to the cart with the correct quantity (1.0) and the selected unit as a named parameter. The cart SHALL store the unit-specific price for accurate total calculations.

#### Scenario: Add product with unit selection
- **WHEN** a user selects a unit from the modal
- **THEN** the product is added to cart with quantity=1.0
- **AND** the selectedUnit is correctly set to the chosen unit fraction
- **AND** the selectedUnitPrice is calculated and stored correctly
