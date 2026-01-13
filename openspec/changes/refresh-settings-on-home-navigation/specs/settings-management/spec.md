## ADDED Requirements

### Requirement: Settings Refresh on Home Navigation
The system SHALL reload Meteor settings from the server every time the user navigates to the home page to ensure fresh configuration data is always available.

#### Scenario: User navigates to home page
- **WHEN** the user navigates to the home page
- **THEN** the settings cache is cleared and fresh settings are fetched from the server
- **AND** the home page displays a loading indicator until settings are loaded
- **AND** the home page renders with the fresh settings once loaded

#### Scenario: Settings refresh fails
- **WHEN** the settings refresh fails during home page navigation
- **THEN** the system falls back to previously cached settings or mock defaults
- **AND** an error message is optionally displayed to the user
- **AND** the home page remains usable with fallback data
