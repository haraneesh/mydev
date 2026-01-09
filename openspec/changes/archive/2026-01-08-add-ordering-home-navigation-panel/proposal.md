# Change: Add Navigation Panel to Ordering Home Page

## Why
The current HomeScreen displays category filters as a horizontal scrollable bar at the top. Adding a left navigation panel with category list (following the pattern from the mobile order page in the Meteor client application) will:
- Provide more prominent category visibility and accessibility
- Enable easier navigation between categories without scrolling horizontally
- Create a consistent UI pattern matching the existing mobile ordering interface
- Improve the overall information architecture and user flow

## What Changes
- Add a left-side navigation panel to the HomeScreen that displays all available categories in a vertical list
- The navigation panel SHALL display category names one below the other
- Selecting a category in the navigation panel SHALL filter the product grid to show only products from that category
- The currently selected category SHALL be visually highlighted in the navigation panel
- The layout SHALL adapt to smaller screens by either collapsing the panel or using a drawer pattern
- Remove or demote the existing horizontal category filter bar in favor of the left panel

## Impact
- Affected specs: new `ordering-ui` capability
- Affected code: `mobile/lib/screens/public/home_screen.dart`, new widget for `category-sidebar.dart`
- User-facing change to the ordering home page layout
- Requires responsive design considerations for mobile/tablet breakpoints
