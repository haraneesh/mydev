---
title: "fix: Align compact product-card action buttons"
type: "fix"
date: "2026-06-21"
origin: "docs/plans/2026-06-21-002-feat-order-page-mobile-web-usability-plan.md"
---

# fix: Align compact product-card action buttons

## Summary

Fix the compact selected product-card action row so `Change` and `Remove` stay inside each product card on narrow mobile grids. The fix should preserve the compact selected state while making button sizing, wrapping, and spacing responsive.

## Problem Frame

The selected-state UI introduced for compact product cards renders two half-width product cards side by side. In the screenshot, each card's `Change` and `Remove` buttons exceed the available card width, causing the action rows from neighboring cards to collide. This undermines the original goal of making the selected state calmer and more confidence-building for mobile shoppers.

## Requirements

- R1. `Change` and `Remove` controls stay visually contained within each selected product card at small mobile widths.
- R2. The selected state remains compact and does not substantially increase card height after adding a product.
- R3. Buttons remain readable, tappable, and keyboard-focusable.
- R4. The quantity edit state, remove action, checkout quantity selector, and slider-view behavior are not regressed.

## Key Technical Decisions

- KTD1. Fix layout in the selected-state action container, not by shrinking product cards globally: the bug is localized to `.selectedProductActions` and mobile card width.
- KTD2. Prefer flexible wrapping or stacked actions at narrow widths over tiny text: older shoppers need readable controls more than a forced one-line button row.
- KTD3. Keep semantic buttons and existing handlers: this is a layout fix, not a state-machine or cart-behavior change.

## Implementation Units

### U1. Constrain Selected-State Action Layout

- **Goal:** Make selected product-card actions fit inside each card on mobile without overlapping adjacent cards.
- **Requirements:** R1, R2, R3.
- **Dependencies:** None.
- **Files:** `imports/ui/components/Orders/Product.scss`, `imports/ui/components/Orders/ProductForNonAdmin.js`.
- **Approach:** Adjust `.selectedProductActions` to use card-contained sizing. Use flexible layout with no fixed Bootstrap margin that can push buttons beyond the card; allow the two actions to wrap or stack under a mobile breakpoint. Keep minimum touch size, but use width constraints such as `flex: 1 1` or full-width stacked buttons when the card is too narrow. Remove or replace `me-2` spacing on the `Change` button if CSS gap owns spacing.
- **Patterns to follow:** Existing selected-state classes in `Product.scss`; Bootstrap `Button` usage in `ProductForNonAdmin.js`.
- **Test scenarios:**
  - On a small mobile viewport with two selected product cards side by side, each card's `Change` and `Remove` buttons stay within its border.
  - Button labels remain readable and do not overlap each other.
  - Keyboard focus outlines remain visible on both actions.
  - Clicking `Change` still opens the local quantity editor.
  - Clicking `Remove` still clears the product from the cart.
- **Verification:** Mobile browser screenshot or visual inspection confirms no overlap at the viewport size shown in the report.

### U2. Preserve Quantity Edit and Checkout Paths

- **Goal:** Confirm the layout fix does not regress edit, remove, checkout, or slider-view behavior.
- **Requirements:** R4.
- **Dependencies:** U1.
- **Files:** `imports/ui/components/Orders/ProductForNonAdmin.js`, `imports/ui/components/Orders/Product.scss`, `tests/product-order-search.test.js`.
- **Approach:** Run the existing Meteor test suite and manually verify the selected-state flow. Add focused browser or component coverage only if the project has a practical harness for rendered card layout; otherwise record a manual screenshot as evidence.
- **Patterns to follow:** Existing Meteor Mocha verification used during the product-order work.
- **Test scenarios:**
  - Selected product enters compact state after add.
  - `Change` opens the quantity selector and `Cancel` returns to compact state.
  - `Done` preserves the selected value and returns to compact state.
  - Checkout rows still render the full quantity selector.
- **Verification:** Existing tests pass, and mobile visual verification shows the action row aligned.

## Scope Boundaries

- Do not redesign the product card, product image sizing, search results, cart footer, or category navigation.
- Do not change cart state behavior or quantity values.
- Do not fix unrelated product-name wrapping unless it directly contributes to the button overlap.

## Sources & Research

- Screenshot report: compact selected cards show `Change` and `Remove` crossing neighboring card boundaries.
- Current selected-state implementation: `imports/ui/components/Orders/ProductForNonAdmin.js`.
- Current selected-state styles: `imports/ui/components/Orders/Product.scss`.
- Origin feature plan: `docs/plans/2026-06-21-002-feat-order-page-mobile-web-usability-plan.md`.
