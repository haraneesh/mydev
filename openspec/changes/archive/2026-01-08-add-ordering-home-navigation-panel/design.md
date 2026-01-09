# Design: Ordering Home Navigation Panel

## Context
The HomeScreen currently displays category filters as a horizontal scrollable FilterChip bar. The mobile order page in the Meteor client (ProductsOrderMobile) implements a vertical sidebar navigation with category icons and text. This design doc outlines how to adapt that pattern for the Flutter HomeScreen.

## Goals / Non-Goals

### Goals
- Provide a left-side vertical category navigation panel for easier browsing
- Create a consistent UI pattern matching the Meteor mobile order page
- Maintain responsive design for phones, tablets, and larger screens
- Reduce the need for horizontal scrolling of categories
- Keep state management simple using existing HomeScreen state

### Non-Goals
- Change the product grid layout or product card design
- Add category icons in this iteration (can be added later)
- Replace the drawer menu (different purposes)
- Modify the cart or checkout flows

## Decisions

### Decision 1: Widget Architecture
**What**: Create a separate `CategorySidebar` widget that manages category display and selection.

**Why**: Separation of concerns makes the code more maintainable and testable. HomeScreen becomes simpler, and CategorySidebar can be reused elsewhere if needed.

**Alternatives considered**:
- Inline the sidebar directly in HomeScreen's build method → Less reusable, harder to test
- Use a custom ListTile for each category → More boilerplate, less control over styling

### Decision 2: Responsive Design
**What**: Use a breakpoint-based approach where:
- Tablets/larger (width >= 600): Sidebar always visible on the left
- Mobile phones (width < 600): Sidebar hidden by default, accessible via drawer or collapsible expansion

**Why**: Mobile phones have limited horizontal space; a full sidebar would crowd the product grid. Larger screens benefit from the persistent sidebar.

**Alternatives considered**:
- Always show sidebar collapsed → Not discoverable enough
- Only use sidebar on tablets → Misses the benefit on larger phones

### Decision 3: Selection Highlight
**What**: Use a colored left border and/or background color change for the selected category.

**Why**: Clear visual feedback matching common UI patterns. Matches the Meteor implementation approach.

**Alternatives considered**:
- Icon checkmark → Doesn't work as well in a text-only list
- Font weight/color change only → Less obvious, may be missed

### Decision 4: State Management
**What**: Keep category selection in HomeScreen's setState, pass the selected category and onChange callback to CategorySidebar.

**Why**: Minimal changes to existing state management. No need for additional providers or complex state solutions.

**Alternatives considered**:
- Use a separate provider for category selection → Adds complexity without clear benefit
- Use callbacks only → Same approach, just different naming

## Risks / Trade-offs

- **Risk**: Sidebar layout may break on very small screens
  - **Mitigation**: Use MediaQuery breakpoints; default to drawer on phones < 360px
  
- **Risk**: Categories list could be very long, making sidebar overflow
  - **Mitigation**: Add scrolling to the sidebar with fixed height, or use a shrink-wrap approach
  
- **Risk**: Inconsistent behavior between responsive states
  - **Mitigation**: Test thoroughly on multiple screen sizes during QA

## Implementation Approach

1. **Create CategorySidebar widget** (`mobile/lib/widgets/category_sidebar.dart`)
   - Props: `categories` (List<String>), `selectedCategory` (String), `onCategorySelected` (Function)
   - Returns a Column with vertical category list

2. **Update HomeScreen layout** 
   - Wrap the main content in a Row when on tablet/larger
   - Use LayoutBuilder to detect screen size
   - Pass selectedCategory and selection callback to CategorySidebar

3. **Mobile responsiveness**
   - On phones: Use a drawer approach with the existing drawer, or collapse the sidebar
   - On tablets+: Show sidebar alongside product grid

4. **Styling**
   - Use AppColors.primary for active category
   - Use ListTile or custom Container for category items
   - Add smooth transitions for selection changes

## Migration Plan

- Phase 1: Create CategorySidebar widget in isolation
- Phase 2: Integrate with HomeScreen on tablet+ screens
- Phase 3: Add mobile responsiveness (drawer/collapse behavior)
- Phase 4: Testing and refinement
- Phase 5: Remove/deprecate the horizontal FilterChip bar

## Open Questions

- Should category icons be displayed in the sidebar? (Deferred for v2)
- Should the sidebar be sticky/scrollable independently? (Yes, recommended)
- Should we show category counts? (Deferred for v2)
- What is the target minimum width for showing sidebar? (600px breakpoint chosen)
