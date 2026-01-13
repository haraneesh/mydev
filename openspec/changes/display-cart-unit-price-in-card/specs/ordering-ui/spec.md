## MODIFIED Requirements

### Requirement: Product Card Display
Product cards SHALL display a product image, name, price, and action button for adding to cart. The unit and price displayed SHALL reflect the product's status: if the product is in the cart, display the selected unit and price from the cart; otherwise, display the lowest available unit and its price.

#### Scenario: Product not in cart
- **WHEN** a product is not in the cart
- **THEN** the product card displays the lowest available unit
- **AND** displays the price for that lowest unit

#### Scenario: Product in cart
- **WHEN** a product is already in the cart
- **THEN** the product card displays the unit that was added to the cart
- **AND** displays the price for that selected unit
- **AND** the Add button displays in green color
