## MODIFIED Requirements

### Requirement: Unit Selection Modal
The unit selection modal SHALL display available unit options as selectable rows with prices and discounts. The modal SHALL have a close button positioned as a brown circle that partially overlaps the top-right edge of the modal, with the X icon centered inside. If the product is in the cart, the modal SHALL display a "Remove from Cart" button with orange background color.

#### Scenario: Modal with close button
- **WHEN** the unit selection modal is opened
- **THEN** a brown circular close button appears at the top-right
- **AND** the button partially overlaps the modal boundary
- **AND** clicking the button closes the modal without making changes

#### Scenario: Modal with remove button
- **WHEN** the unit selection modal is opened for a product in cart
- **THEN** a "Remove from Cart" button appears in orange color
- **AND** clicking the button removes the product and closes the modal
