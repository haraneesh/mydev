## ADDED Requirements

### Requirement: Product Search Bar
The system SHALL provide a search bar that allows users to search for products by name or description in real-time. The search bar SHALL be displayed above the product grid and below the product list update timestamp.

#### Scenario: Search bar displays with correct styling
- **WHEN** the HomeScreen is loaded
- **THEN** a search bar SHALL be visible with a text input field
- **AND** the placeholder text SHALL display "Search for 'Kullakar Rice' or 'Bansi Wheat"
- **AND** a dark red clear (X) button SHALL appear on the right side of the input field
- **AND** the styling SHALL match the provided screenshot design

#### Scenario: User enters search text
- **WHEN** a user types text into the search bar
- **THEN** the product grid SHALL update in real-time to show only products matching the search query
- **AND** matching SHALL be case-insensitive
- **AND** matching SHALL check both product name and description fields

#### Scenario: User clears search
- **WHEN** a user taps the clear (X) button
- **THEN** the search field SHALL be cleared
- **AND** the product grid SHALL display all products again (respecting current category filter)

#### Scenario: Search works with category filter
- **WHEN** a user has selected a specific category and then enters a search query
- **THEN** the product grid SHALL display only products that match BOTH the category AND the search query
- **AND** the search shall be scoped to the selected category

#### Scenario: Empty search results
- **WHEN** a user enters a search query that matches no products
- **THEN** the product grid SHALL display no products
- **AND** a message MAY be shown indicating no results found

### Requirement: Search History is Not Persisted
The search query SHALL NOT be persisted across app sessions. When the user navigates away from HomeScreen or closes the app, the search state SHALL be reset.

#### Scenario: Search state resets on navigation
- **WHEN** a user performs a search and then navigates to another screen (e.g., Cart)
- **THEN** the search bar SHALL be cleared when returning to HomeScreen
- **AND** all products SHALL be displayed again (respecting default category)
