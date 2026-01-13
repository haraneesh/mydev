# Spec Delta: Removed Products Management

## ADDED Requirements

### Requirement: Cart Removed Products Section
The cart SHALL display removed products in a separate "Removed" category, distinct from active cart items. Removed products MAY be restored by selecting a unit in the edit modal.

#### Scenario: Product removal and display
- **WHEN** a user clicks the Edit button on a cart item
- **AND** clicks the remove product button in the unit selector modal
- **THEN** the product SHALL be moved to a "Removed" category in the cart
- **AND** the product SHALL no longer be included in the cart total or item count

#### Scenario: Viewing removed products section
- **WHEN** the cart contains removed products
- **THEN** the cart SHALL display a "Removed" category header below all active product categories
- **AND** removed products SHALL be displayed under the "Removed" category
- **AND** the "Removed" section SHALL NOT display when no items are removed

#### Scenario: Restoring a removed product
- **WHEN** a user clicks Edit on a removed product
- **AND** selects a unit in the unit selector modal
- **THEN** the product SHALL be restored to its active category
- **AND** the product SHALL be included in cart totals and item count again
- **AND** if no other removed items exist, the "Removed" category SHALL no longer display

#### Scenario: Removed products not in cart total
- **WHEN** the cart displays totals and item count
- **THEN** removed products SHALL NOT be included in the total amount calculation
- **AND** removed products SHALL NOT be included in the item count

### Requirement: Edit Modal Remove Button Behavior
The unit selector modal's remove button SHALL properly trigger product removal from the cart.

#### Scenario: Remove button removes product
- **WHEN** a user clicks the remove product button in the unit selector modal
- **THEN** the product SHALL be marked as removed in the cart
- **AND** the modal SHALL close
- **AND** the cart view SHALL refresh to display the updated state
