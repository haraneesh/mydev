## MODIFIED Requirements

### Requirement: Unit Selection for Cart Items
When a user selects a unit for a product that is already in the cart, the system SHALL update the existing cart item's unit (where selectedUnit IS the quantity) rather than adding a duplicate item.

#### Scenario: Update existing cart item unit
- **WHEN** a product is already in the cart with a selected unit (e.g., 500g)
- **AND** the user taps the Add button and selects a different unit from the unit selection modal (e.g., 1kg)
- **THEN** the existing cart item's selected unit SHALL be replaced with the newly selected unit (1kg)
- **AND** the item's unit price SHALL be recalculated based on the new unit
- **AND** the quantity field SHALL be set to 1.0 (selectedUnit IS the quantity)
- **AND** the product card SHALL immediately display the new unit (e.g., "1kg")
- **AND** the modal SHALL close automatically

#### Scenario: Add new item when not in cart
- **WHEN** a product is not already in the cart
- **AND** the user selects a unit from the unit selection modal
- **THEN** a new cart item SHALL be created with the selected unit
- **AND** the modal SHALL close
- **AND** the cart button SHALL display in the "in cart" state

#### Scenario: Unit selection modal for cart products
- **WHEN** a product is already in the cart and the user opens the unit selection modal
- **THEN** the "Remove from Cart" button SHALL be displayed at the bottom of the modal
- **AND** selecting a new unit SHALL trigger an update (replacing the old unit) instead of adding a new item
- **AND** removing from cart SHALL delete the item entirely
