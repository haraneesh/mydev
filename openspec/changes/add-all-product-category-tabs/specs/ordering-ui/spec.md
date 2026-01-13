## MODIFIED Requirements

### Requirement: Navigation Panel Category Display
The ordering home page SHALL display a left-side navigation panel that allows users to browse and filter products by category. The navigation panel SHALL present all available product categories (excluding "New" and "Returnable") as clickable tabs, with the currently selected category visually distinguished. Categories SHALL be labeled with their `display_value` field, and product filtering SHALL use the `name` field to match MongoDB documents.

#### Scenario: All product categories displayed as tabs
- **WHEN** the HomeScreen is loaded
- **THEN** the navigation panel SHALL display all available product categories except "New" and "Returnable" as clickable tabs
- **AND** each category tab SHALL be labeled with its `display_value` (e.g., "Leafy Greens" for the Greens category)
- **AND** category tabs SHALL include: Vegetables, Fruits, Greens, Rice, Wheat, Millets, Dhals, Sweetners, Salts, Spices, Nuts, DryFruits, Oils, Milk, Eggs, Prepared, Disposables, Beauty

#### Scenario: Tab selection filters products by name field
- **WHEN** a user taps on a category tab in the navigation panel
- **THEN** the product grid SHALL immediately update to show only products from the selected category
- **AND** products SHALL be matched using the category's `name` field (the value returned from MongoDB)
- **AND** the selected category tab SHALL be visually highlighted in the navigation panel

#### Scenario: Default category selection on load
- **WHEN** the HomeScreen is initially loaded
- **THEN** the category value set in the Meteor setting "PRODUCT_ORDER".PAGE_TO_OPEN_DEFAULT SHALL be selected by default
- **AND** the navigation panel SHALL display the selected category's tab as highlighted
- **AND** the product grid SHALL initially display only products from the default selected category

#### Scenario: Excluded categories are not displayed
- **WHEN** the HomeScreen navigation panel is rendered
- **THEN** the "New" category tab SHALL NOT be displayed
- **AND** the "Returnable" category tab SHALL NOT be displayed

#### Scenario: Selected tab remains in sync with product grid
- **WHEN** a user selects a category tab and then scrolls through the product grid
- **THEN** the selected category tab SHALL remain highlighted in the navigation panel
- **AND** the product grid SHALL continue displaying only products from the selected category

#### Scenario: Tab selection and category switching
- **WHEN** a user selects a different category tab
- **THEN** the navigation panel SHALL immediately update to show the new selection as highlighted
- **AND** the product grid SHALL update to show products from the newly selected category
- **AND** products SHALL be filtered using the new category's `name` field
