---
title: "fix: Hide empty order categories"
type: fix
date: 2026-06-22
---

# fix: Hide empty order categories

## Summary

Hide product categories from the mobile order sidebar when their product group is empty. The order page should only show categories that can lead to products, and it should fall back to the first visible category when the configured default category is empty.

## Problem Frame

The mobile order UI currently renders every category entry in the left sidebar and every matching tab pane, even when the selected product group has no products. Users can land on a category like Protein rich and see only the empty-category message, which makes the menu feel broken and wastes the narrow browsing surface.

## Requirements

- R1. Categories with zero products must not appear in the mobile category sidebar.
- R2. Hidden empty categories must not have reachable empty tab panes during normal browsing.
- R3. The default active category must resolve to the configured default only when that category has products; otherwise it must use the first visible category.
- R4. Deep links or route-provided category selections for empty categories must no-op or fall back without showing a blank/empty category pane.
- R5. Existing product grouping behavior, including New Arrivals, Protein rich, Gut health, Chennai special produce filtering, and subcategory tabs, must remain unchanged for categories that have products.
- R6. If no visible category remains, the page must show one general availability message rather than an empty sidebar with empty panes.

## Key Technical Decisions

- **Filter after grouping, not during grouping:** `displayProductsByType` should keep returning the same product-group arrays so existing cart, basket, metadata, and curated-category tests remain stable. Visibility belongs at the order-page presentation layer.
- **Use one category definition list for nav and panes:** `ProductsOrderMobile` should derive both the sidebar links and `Tab.Pane` content from the same ordered category config. This prevents a sidebar item from existing without matching content, or a pane existing without a link.
- **Preserve category order:** The visible list should keep the current order: New Arrivals, curated health categories, then product-type categories. Filtering should remove empty entries without re-sorting the rest.
- **Keep the defensive empty-category renderer:** `displayProductsWithCategories` can retain its empty fallback for direct calls or unexpected states, but normal tab rendering should avoid calling it for empty groups.

## Acceptance Examples

- AE1. Given Protein rich has zero products and New Arrivals has products, when the order page loads, then Protein rich is absent from the left sidebar and New Arrivals can open normally.
- AE2. Given the configured default category is empty, when the order page loads, then the first category with products is selected.
- AE3. Given Rice has products and Gut health has none, when a user browses the sidebar, then Rice appears and Gut health does not.
- AE4. Given all category product groups are empty, when the order page renders, then the user sees one overall no-products message instead of a list of empty categories.

## Implementation Units

### U1. Define visible order category metadata

- **Goal:** Create a single ordered category metadata source that pairs each mobile category with its event key, display label, image name, and product-group key.
- **Requirements:** R1, R3, R5
- **Dependencies:** None
- **Files:**
  - `imports/ui/components/Orders/ProductsOrderCommon/ProductsOrderCommon.js`
  - `tests/product-curated-categories.test.js`
- **Approach:** Add a pure helper near the existing order grouping helpers that accepts `productGroups` and returns the visible category definitions by filtering entries whose group arrays have length greater than zero. Keep category metadata declarative so future category additions update one list instead of duplicating sidebar and pane changes.
- **Patterns to follow:** Existing category names and display values in `imports/modules/constants.js`; existing group arrays returned by `displayProductsByType`.
- **Test scenarios:**
  - With only a Dhals product group populated, the helper returns only the Dals & Lentils category from the standard product categories.
  - With a product tagged as Protein rich and typed as Dhals, the helper returns both Protein rich and Dals & Lentils because curated shelves are additive.
  - With empty `productProteinRich` and populated `productGutHealth`, the helper excludes Protein rich and includes Gut health.
  - With special produce hidden outside Chennai, the helper excludes New Arrivals and the base produce category when their arrays are empty after grouping.
- **Verification:** The helper returns no entries for empty groups and preserves the current category order for visible groups.

### U2. Render mobile sidebar and panes from visible categories

- **Goal:** Make `ProductsOrderMobile` render only category links and tab panes that have visible category metadata.
- **Requirements:** R1, R2, R5, R6
- **Dependencies:** U1
- **Files:**
  - `imports/ui/components/Orders/ProductsOrderMobile/ProductsOrderMobile.js`
  - `imports/ui/components/Orders/ProductsOrderMobile/ProductsOrderMobile.scss`
- **Approach:** Replace the hardcoded sidebar links and matching hardcoded panes with maps over the visible category definitions. Keep `returnSideBarNavLink` and `displayProductsWithCategories` as rendering helpers, but feed them from the same filtered list. If the visible list is empty, render one full-width empty-state message in the content column and omit category navigation.
- **Patterns to follow:** Current `returnSideBarNavLink` shape, current `Tab.Pane` use, and existing `displayProductsWithCategories` subcategory grouping.
- **Test scenarios:**
  - With one visible category, the sidebar renders one nav item and the content area renders one matching pane.
  - With an empty category between two populated categories, the empty category is absent while the surrounding categories keep their relative order.
  - With no visible categories, no sidebar category items render and a single general message is shown.
- **Verification:** There is no normal UI path where clicking a sidebar category opens the old empty-category message.

### U3. Keep selection and deep-link behavior safe

- **Goal:** Prevent hidden categories from becoming the active tab through default settings, route params, or stale deep links.
- **Requirements:** R3, R4, R5
- **Dependencies:** U1, U2
- **Files:**
  - `imports/ui/components/Orders/ProductsOrderMobile/ProductsOrderMobile.js`
  - `tests/product-curated-categories.test.js`
- **Approach:** Resolve the `Tab.Container` default key from the visible category list. If `Meteor.settings.public.PRODUCT_ORDER.PAGE_TO_OPEN_DEFAULT` is absent from the visible keys, use the first visible key. Update route-driven category selection so it only attempts to click or scroll to categories present in the visible list.
- **Patterns to follow:** Existing `goToCategoryAndSubCategory` guard that exits when the category tab element is missing.
- **Test scenarios:**
  - When the configured default is visible, it remains the default active category.
  - When the configured default is hidden, the first visible category becomes active.
  - When a route-provided category is hidden, the page does not show a hidden category pane and does not throw while scrolling.
  - When a route-provided category and subcategory are visible, the existing subcategory scroll behavior still works.
- **Verification:** Hidden categories cannot be selected through page load, sidebar browsing, or route-provided category params.

## Scope Boundaries

- This plan does not change how products are assigned to groups.
- This plan does not change product availability rules, Chennai-specific hiding, curated category tagging, or search results.
- This plan does not remove the defensive empty renderer from `displayProductsWithCategories`; it only removes normal navigation to empty groups.

## Sources & Research

- `imports/ui/components/Orders/ProductsOrderMobile/ProductsOrderMobile.js` currently hardcodes sidebar links and tab panes separately.
- `imports/ui/components/Orders/ProductsOrderCommon/ProductsOrderCommon.js` already centralizes grouping into arrays like `productSpecials`, `productProteinRich`, and product-type groups.
- `tests/product-curated-categories.test.js` already covers curated category grouping and is the natural place to add pure helper coverage for category visibility.
