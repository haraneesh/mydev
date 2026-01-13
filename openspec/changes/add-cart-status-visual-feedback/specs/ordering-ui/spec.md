## MODIFIED Requirements

### Requirement: Product Card Display
Product cards SHALL display a product image, name, price, and action button for adding to cart. The product card background SHALL always be white. The Add button color SHALL change based on cart status: brown (primary color) when product is not in cart, green success color when the product is in the cart. The button color change provides visual feedback to users indicating their selection.

#### Scenario: Product card not in cart
- **WHEN** a product is not in the cart
- **THEN** the product card background is white
- **AND** the Add button displays in brown (primary) color

#### Scenario: Product card added to cart
- **WHEN** a user selects a unit from the modal and the product is added to cart
- **THEN** the product card background remains white
- **AND** the Add button color immediately changes to green success color
- **AND** the cart is updated with product details, selected unit, and corresponding price

#### Scenario: Product removed from cart
- **WHEN** a product is removed from the cart
- **THEN** the Add button color reverts to brown (primary)
