# ui-styling Specification

## Purpose
TBD - created by archiving change add-bg-image-all-pages. Update Purpose after archive.
## Requirements
### Requirement: Background Image on All Pages
The Flutter application SHALL display bg.jpg as a repeating background image on all pages for consistent visual branding.

#### Scenario: Background appears on home page
- **WHEN** user navigates to the home page
- **THEN** bg.jpg displays as the page background, repeating to fill the entire viewport

#### Scenario: Background appears on all other pages
- **WHEN** user navigates to any page in the application
- **THEN** bg.jpg displays as the background consistently across all pages

#### Scenario: Background tiles correctly on different screen sizes
- **WHEN** the application is viewed on different device sizes or orientations
- **THEN** the background image repeats/tiles appropriately to maintain visual coverage

### Requirement: Global Typography
The application SHALL use a consistent typography system across all screens. The base body font size SHALL be 14px (reduced from 16px) using the Nunito font family, with specific weights and sizes for headings and labels as defined in the theme.

#### Scenario: Body text uses 14px font
- **WHEN** any screen is displayed with standard body text
- **THEN** the text SHALL be rendered at 14px size

### Requirement: Currency Symbols
All monetary amounts displayed in the application SHALL be prefixed with the Indian Rupee symbol (₹) instead of the textual "Rs" or "Rs." designation.

#### Scenario: Currency symbol in UI
- **WHEN** any screen displays a price or monetary value
- **THEN** it SHALL be prefixed with the ₹ symbol
- **AND** there SHALL NOT be a space between the symbol and the amount unless specified by design

