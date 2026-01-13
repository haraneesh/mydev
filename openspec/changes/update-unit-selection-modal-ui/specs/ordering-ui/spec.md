## MODIFIED Requirements

### Requirement: Unit Selection Modal
The unit selection modal SHALL display available unit options as selectable rows with prices and discounts. The modal SHALL have a close button in the top-right corner displayed as a circular X icon. If the product is in the cart, the modal SHALL display a "Remove from Cart" button with orange background color. Clicking the X button or "Remove from Cart" button SHALL close the modal.

#### Scenario: Modal with product not in cart
- **WHEN** the unit selection modal is opened for a product not in cart
- **THEN** the modal displays unit options
- **AND** an X close button appears in the top-right corner
- **AND** no "Remove from Cart" button is shown

#### Scenario: Modal with product in cart
- **WHEN** the unit selection modal is opened for a product already in cart
- **THEN** the modal displays unit options
- **AND** an X close button appears in the top-right corner
- **AND** a "Remove from Cart" button appears in orange color

#### Scenario: Remove from cart
- **WHEN** the "Remove from Cart" button is clicked
- **THEN** the product is removed from the cart
- **AND** the modal closes immediately

#### Scenario: Close modal
- **WHEN** the X button is clicked
- **THEN** the modal closes without making any changes
