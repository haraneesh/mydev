# shopping-cart Specification

## ADDED Requirements

### Requirement: Shopping Cart Item Compact Layout
The shopping cart SHALL display product rows with compact vertical spacing to maximize content visibility on the screen.

#### Scenario: Product rows have reduced spacing
- **WHEN** the cart contains multiple products
- **THEN** the vertical gap between product rows SHALL be minimal (8 pixels)
- **AND** the product card internal padding SHALL be compact (8 pixels)

### Requirement: Complete Product Image Display
The shopping cart SHALL display product images in their entirety without cropping or cutting the sides.

#### Scenario: Product image displays completely
- **WHEN** a product image is displayed in the cart
- **THEN** the entire image SHALL be visible within the image container
- **AND** the image SHALL not be cropped or clipped on any side
- **AND** empty space around the image is acceptable to preserve the full image

### Requirement: Quick Edit Button
The shopping cart SHALL provide an Edit button for each product to allow users to modify product details (quantity and unit) directly from the cart view.

#### Scenario: Edit button appears below price
- **WHEN** a product row is displayed in the cart
- **THEN** an Edit button SHALL appear below or near the product price
- **AND** the button SHALL be visually distinct and easily tappable

#### Scenario: Edit button opens product modification modal
- **WHEN** user taps the Edit button
- **THEN** the unit selection modal SHALL open
- **AND** user can modify the product unit/quantity
- **AND** cart is updated with new selections after confirmation
