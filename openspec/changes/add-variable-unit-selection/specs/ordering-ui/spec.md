## ADDED Requirements

### Requirement: Fractional Unit Selection
The ordering UI SHALL allow customers to select fractional quantities of products based on the product's base unit of sale. Available fractions are specified in the product's `unitsForSelection` field. Unit selection is presented via a modal dialog triggered from a small "Add" button on the product card.

#### Scenario: Product card displays Add button
- **WHEN** a user views a product with unitsForSelection
- **THEN** the product card SHALL display the product image (centered), name, and default unit price
- **AND** a small "Add" button SHALL be positioned in the bottom-right corner of the product image
- **AND** the button SHALL be visually distinct (icon or text "Add")

#### Scenario: Unit selection modal opens
- **WHEN** a user clicks the "Add" button on a product card
- **THEN** a modal/popup dialog SHALL open displaying all available unit options
- **AND** each option SHALL be displayed as a selectable row containing: unit label (e.g., "200g"), calculated price, and optional discount label

#### Scenario: User selects a fractional unit from modal
- **WHEN** a user taps a row in the unit selection modal
- **THEN** the product SHALL be added to cart with quantity 1 and unit price = base_price × fraction
- **AND** the modal SHALL close
- **AND** the product card SHALL update to display the selected unit and its unit-specific price in the top row

#### Scenario: Updated price display after selection
- **WHEN** a product is added to cart with unit selection (e.g., "200g")
- **THEN** the product card top row SHALL display "200g" and "₹44"
- **AND** the product card bottom row SHALL display "1 × 200g" with +/- quantity buttons and delete button

#### Scenario: Fractional quantity with multiple items
- **WHEN** a user selects "200g" and then adds the same product again with "400g"
- **THEN** the cart SHALL display two separate line items:
  - 1 × 200g @ price_for_200g
  - 1 × 400g @ price_for_400g
- **AND** cart total SHALL be the sum of both unit prices

#### Scenario: Visual transition indicates unit selection on product card
- **WHEN** a user selects a unit from the modal and the modal closes
- **THEN** the product card SHALL display a visual indication (e.g., highlight, subtle animation, or background color change) to indicate the selection was successful
- **AND** the product card top row SHALL update to show the selected unit and price
- **AND** the visual transition SHALL persist until the user navigates away or selects a different unit

### Requirement: Per-Fraction Discounts
The system SHALL apply discounts to individual fraction selections when specified in the product's `unitsForSelection` field (format: "0.2,0.4=5%,0.8=10%,1").

#### Scenario: Specific fractions have discounts
- **WHEN** a product has unitsForSelection = "0,0.2,0.4=5%,0.6,0.8=10%,1"
- **THEN** the "400g" option (fraction 0.4) SHALL display "(5% off)" label
- **AND** the "800g" option (fraction 0.8) SHALL display "(10% off)" label
- **AND** other options SHALL have no discount label

#### Scenario: Discount calculation for specific fraction
- **WHEN** the base price is 220 and user selects "400g" with 5% discount
- **THEN** the unit price SHALL be calculated as: 220 × 0.4 × (1 - 5/100) = 83.6

#### Scenario: Another fraction with different discount
- **WHEN** the base price is 220 and user selects "800g" with 10% discount
- **THEN** the unit price SHALL be calculated as: 220 × 0.8 × (1 - 10/100) = 158.4

#### Scenario: Fractions without discounts use base calculation
- **WHEN** a product has discounts on some fractions but not others
- **THEN** fractions without discounts (e.g., 0.2, 0.6, 1.0) SHALL use: base_price × fraction (no discount)

#### Scenario: Discount display in cart
- **WHEN** a user adds a discounted unit selection (e.g., "400g" with 5% off) to cart
- **THEN** the cart SHALL show the discounted price
- **AND** cart total SHALL reflect the discount

### Requirement: Unit Label Formatting
The system SHALL display quantities in user-friendly units derived from the product's base unit of sale.

#### Scenario: Display conversion for gram quantities
- **WHEN** unitOfSale = "1Kg" and fraction = 0.2
- **THEN** the product card SHALL display "200g" instead of "0.2Kg"

#### Scenario: Display conversion for milliliter quantities
- **WHEN** unitOfSale = "1L" and fraction = 0.5
- **THEN** the product card SHALL display "500ml" instead of "0.5L"

#### Scenario: Fallback for non-standard units
- **WHEN** unitOfSale is a non-standard unit (e.g., "10pieces")
- **THEN** the product card SHALL display "5pieces" (fraction × base count)

### Requirement: Cart Price Calculation
The cart system SHALL calculate totals using unit-specific prices, accounting for both fractional multipliers and per-fraction discounts.

#### Scenario: Cart subtotal uses unit price
- **WHEN** a user has 2 items of product at "200g" (unit_price = 44) in cart
- **THEN** the cart line subtotal SHALL be: 2 × 44 = 88 (not 2 × base_price)

#### Scenario: Cart total includes all unit-specific prices with discounts
- **WHEN** cart contains:
  - 1 × 200g of Rice @ 44 (no discount)
  - 1 × 400g of Rice @ 83.6 (5% discount)
  - 1 × 800g of Rice @ 158.4 (10% discount)
- **THEN** cart total SHALL be: 44 + 83.6 + 158.4 = 286

#### Scenario: Same product with different units calculated correctly
- **WHEN** a user adds multiple quantities of the same product with different unit selections
- **THEN** each line item SHALL use its specific unit price
- **AND** the sum of all line items SHALL equal the cart total

## MODIFIED Requirements

### Requirement: Order Home Navigation Panel
The ordering home page SHALL display a left-side navigation panel that allows users to browse and filter products by category. The navigation panel SHALL present categories in a vertical list format, with the currently selected category visually distinguished. Products displayed in the grid SHALL allow selection of fractional quantities based on available unit selections.

#### Scenario: Navigation panel displays all categories
- **WHEN** the HomeScreen is loaded
- **THEN** the navigation panel SHALL display all available product categories in a vertical list
- **AND** each category SHALL be displayed with its full name, one category per row

#### Scenario: User selects a category from navigation panel
- **WHEN** a user taps on a category in the navigation panel
- **THEN** the product grid SHALL immediately update to show only products from the selected category
- **AND** the selected category SHALL be visually highlighted in the navigation panel (e.g., with a distinct background color or border)
- **AND** each product card SHALL display fractional unit options for selection

#### Scenario: Default category selection
- **WHEN** the HomeScreen is initially loaded
- **THEN** the category value set in the following Meteor setting "PRODUCT_ORDER":{ "PAGE_TO_OPEN_DEFAULT": } SHALL be selected by default
- **AND** the navigation panel SHALL display only the products of the selected category in the grid
- **AND** each product SHALL show its available unit selections

#### Scenario: Navigation panel responsiveness on small screens
- **WHEN** the HomeScreen is displayed on a mobile device with limited width
- **THEN** the navigation panel MAY be displayed as a collapsible drawer or reduced in width
- **AND** the panel SHALL not prevent viewing the product grid

#### Scenario: Navigation panel styling
- **WHEN** the navigation panel is displayed
- **THEN** category items SHALL use the application's primary theme colors
- **AND** the active/selected category SHALL have a distinct visual indicator (color change or background highlight)
- **AND** category text SHALL be readable and appropriately sized

#### Scenario: Product cards display Add button with modal for unit selection
- **WHEN** a product has available unit selections in unitsForSelection with optional per-fraction discounts
- **THEN** the product card SHALL display a small "Add" button in the bottom-right corner of the product image
- **AND** clicking the "Add" button SHALL open a modal showing all available unit options in rows
- **AND** each row SHALL show the formatted quantity label, calculated price, and discount percentage (if applicable)
- **AND** tapping a row in the modal SHALL add the product to cart with that unit and its specific price
- **AND** the modal SHALL close and the product card SHALL update to reflect the new quantity and unit-specific price

#### Scenario: Category selection remains active during scrolling
- **WHEN** a user selects a category and then scrolls through the product grid
- **THEN** the selected category SHALL remain highlighted in the navigation panel
- **AND** the product grid SHALL continue displaying only products from the selected category

#### Scenario: Navigation updates when category is changed
- **WHEN** a user selects a different category
- **THEN** the navigation panel SHALL immediately update to show the new selection
- **AND** the product grid SHALL update to show products from the newly selected category
- **AND** all products in the new category SHALL display their respective unit options with discounts
