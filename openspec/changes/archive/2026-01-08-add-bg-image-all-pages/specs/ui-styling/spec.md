## ADDED Requirements

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
