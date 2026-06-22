# Product Order Page Improvements for Mobile and Web

Date: 2026-06-21

## Purpose

Improve the Suvai product ordering page so older and less technical shoppers can find products, add items, adjust quantities, and proceed to checkout with less visual noise and less uncertainty. The current flow works, but mobile product browsing is dense, icon-only navigation is hard to understand, and adding a product immediately expands the card into many quantity options.

This document is intended as input for `ce-plan`.

## Source Material

- Usability test of `http://localhost:3000/` using a mobile-sized viewport and test mobile number `8754486932`.
- Ideation: `docs/ideation/2026-06-21-senior-friendly-order-browsing-ideation.html`
- Search layout exploration: `docs/ideation/2026-06-21-assisted-search-first-layouts.html`
- Product-card layout exploration: `docs/ideation/2026-06-21-compact-added-product-card-layouts.html`

## Current Flow Summary

The home page exposes `ORDER NOW`, which leads into the product ordering experience. The product page currently defaults into a category/product list, shows many category options on mobile, and renders product cards in a dense grid. Each product begins with `Add To Cart`. Once a product is added, the card immediately replaces the button with a quantity selector containing multiple options and a delete control.

The cart review step is understandable, and checkout can be completed by entering a registered mobile number. In the usability test, an order could be placed successfully, but the final success URL ended as `/order/success/undefined`; that bug is related but should be tracked separately from this product-page improvement.

## Problem Statement

For less technical or older shoppers, the product order page asks them to process too much at once:

- Category navigation is prominent and long.
- Search exists, but it behaves like a secondary tool inside the product list.
- Product cards use compact text, many all-caps product names, and dense grid layouts.
- After adding, the expanded quantity controls make the page visually busier right after the user succeeds.
- Icon-only controls can be unclear and are awkward for assistive technology.
- Checkout identity requirements appear late in the flow.

## Goals

1. Make product discovery easier on both mobile and web.
2. Make search a stronger first-class entry point.
3. Keep add-to-cart confirmation clear without expanding product cards by default.
4. Improve navigation clarity and accessible labels.
5. Preserve the existing cart and checkout model.
6. Keep the visual language consistent with the current Suvai app: warm surfaces, Bootstrap patterns, product imagery, and green action emphasis.

## Non-Goals

- Redesigning the payment flow.
- Replacing all category browsing with search.
- Changing product schema or inventory rules unless required for search synonyms.
- Reworking admin product management.
- Fixing `/order/success/undefined`, except to note it as a separate bug.
- Building voice ordering.

## Target Users

Primary:

- Customers age 60+.
- Less technical shoppers using a mobile phone.
- Returning customers who know common grocery names but may not know Suvai's category taxonomy.

Secondary:

- Existing power users who browse by category.
- Desktop/web shoppers placing larger orders.

## Affected Product Areas

Likely affected code areas:

- `imports/ui/components/Orders/ProductsOrderMain/ProductsOrderMain.js`
- `imports/ui/components/Orders/ProductsOrderMobile/ProductsOrderMobile.js`
- `imports/ui/components/Orders/ProductSearch/ProductSearch.js`
- `imports/ui/components/Orders/Product.js`
- `imports/ui/components/Orders/ProductForNonAdmin.js`
- `imports/ui/components/Orders/Product.scss`
- `imports/ui/components/Orders/ProductsOrderMobile/ProductsOrderMobile.scss`
- `imports/ui/components/AuthenticatedNavigation/Menu.js`
- `imports/ui/components/ToolBar/ToolBar.js`
- `imports/ui/components/Cart/CartDetails.js`
- `imports/ui/components/Cart/GetUserPhoneNumber.js`

## Requirements

### R1. Search-First Entry Point

The product order page should present search as a primary action near the top of the experience on mobile and web.

Acceptance criteria:

- The search field is visible without scrolling on the product order page.
- Search copy uses common examples, such as `Search rice, dhal, milk...`.
- Search remains available while browsing categories.
- Empty search state suggests common paths rather than showing only a blank field.
- Existing category browsing remains available.

### R2. Assisted Search Suggestions

Search should help users find products even when they are unsure of spelling, product taxonomy, or exact product names.

Acceptance criteria:

- Typing at least a few characters shows matching products.
- Search results show product name, unit, price, and category.
- If no exact match exists, the UI offers close suggestions or category fallbacks.
- The no-results message is helpful and plain-language.
- Search results allow adding products directly to cart.

Potential examples:

- `thinai` suggests Thinai products and the Millets category.
- `kambu avale` suggests `KAMBU AVAL / BAJRA FLAKES`.
- `bajra` can find Kambu/Bajra products.

### R3. Guided Category Alternatives

Mobile users should not have to start by interpreting the full category list.

Acceptance criteria:

- The mobile order page offers a short set of common entry points near search.
- Common entry points may include Fresh vegetables, Rice & staples, Protein rich, Gut health, Dals, Milk, or Breakfast.
- The complete category list is still reachable through `All categories` or equivalent.
- Existing direct category URLs continue to work.

### R4. Compact Added Product State

After adding a product, the product card should confirm the add without immediately expanding into all quantity choices.

Acceptance criteria:

- Tapping `Add To Cart` changes the card into a compact selected state.
- The compact state clearly shows the selected quantity, for example `In cart · 150 g`.
- The compact state includes a clear but quiet `Edit quantity` action.
- The compact state includes a remove action that does not appear as a large destructive button by default.
- The compact state avoids stacked full-width secondary/destructive buttons inside the product card.
- Product cards do not grow substantially taller after a simple add.
- The cart count and total update after add.

### R5. Explicit Quantity Edit State

Quantity options should appear only when the shopper chooses to edit quantity.

Acceptance criteria:

- Tapping `Change` opens a local quantity editor for that product.
- The editor displays valid quantities from `unitsForSelection`.
- The current selection is visually marked.
- The shopper can confirm with `Done` or `Update cart`.
- The shopper can cancel or close without losing the current selected quantity.
- Returnable packaging choices, when applicable, remain supported.

### R6. Mobile Layout Usability

The mobile product order page should reduce visual density and improve tap confidence.

Acceptance criteria:

- Primary buttons and quantity controls meet comfortable touch sizing.
- Product cards preserve readable product names and prices.
- Selected product state is visually distinct but not visually loud.
- Sticky cart summary or checkout affordance remains visible after products are added.
- Category navigation does not consume excessive horizontal space on small screens.

### R7. Web Layout Usability

The web product order page should support efficient larger-screen ordering while staying visually calmer than the current expanded-card behavior.

Acceptance criteria:

- Product grid supports compact selected cards.
- Quantity editing stays local to the selected product, not a global modal unless planning determines a modal is preferable.
- A cart summary panel or prominent cart summary remains visible on desktop.
- Category navigation remains usable for power users.
- Search and category browsing work together rather than competing.

### R8. Accessible Icon Labels

Header, toolbar, cart, menu, remove, and quantity controls should have clear accessible names.

Acceptance criteria:

- Icon-only buttons have `aria-label` or visible text.
- Cart count changes are understandable to screen readers.
- Remove/delete controls include the product name in their accessible label where possible.
- Focus states are visible for keyboard users.
- The accessible text output should not read as concatenated icon names such as `personlocal_mallmenu`.

### R9. Checkout Readiness Message

The product order and cart pages should tell shoppers what they need to complete checkout before they press the final order button.

Acceptance criteria:

- Non-authenticated users see a short message such as `You can place your order with your registered mobile number.`
- New users are pointed toward sign up without blocking browsing.
- Authenticated users see who they are ordering as.
- The message does not look like an error.

### R10. Preserve Existing Ordering Behavior

The improvements should not break current cart, product grouping, category routing, or checkout behavior.

Acceptance criteria:

- Existing products can still be added to cart.
- Existing quantity values from `unitsForSelection` continue to drive available choices.
- Existing cart total calculation continues to work.
- Existing category tabs and subcategory links continue to work.
- Existing basket or edit-order flows are not regressed.

## UX Direction

### Mobile Direction

Recommended mobile experience:

1. Search first.
2. Short common-category shortcuts.
3. Product cards in a stable grid.
4. `Add To Cart` becomes compact `In cart · quantity`.
5. `Edit quantity` opens quantity choices only when requested.
6. Cart summary remains visible after at least one item is selected.

Reference layout:

- `docs/ideation/2026-06-21-assisted-search-first-layouts.html`
- `docs/ideation/2026-06-21-compact-added-product-card-layouts.html`

### Web Direction

Recommended web experience:

1. Category rail remains available.
2. Search is prominent above the product grid.
3. Product grid supports compact selected product state.
4. Cart summary panel remains visible on the right.
5. Quantity editor expands locally only for the product being edited.

Reference layout:

- `docs/ideation/2026-06-21-compact-added-product-card-layouts.html`

## Data and Search Considerations

Search currently matches product names. Planning should evaluate whether additional search data is needed.

Possible enhancements:

- Synonyms such as `bajra` for `kambu`.
- Common spelling variants.
- Category aliases.
- Transliteration support for common Tamil/English product names.
- Search event capture already exists through `search.captureSearchString`; improvements should preserve or extend this signal.

## Accessibility Requirements

The implementation should follow these accessibility expectations:

- Use semantic buttons for all controls.
- Provide accessible names for icon-only actions.
- Announce add-to-cart and cart-count changes through appropriate status messaging.
- Ensure touch targets are comfortable on mobile.
- Maintain visible focus states.
- Keep text contrast readable on warm/tinted backgrounds.

## Analytics and Observability

Consider capturing:

- Search query.
- Search with no exact match.
- Suggested result clicked.
- Product added from search.
- Product added from category browsing.
- Quantity changed after add.
- Product removed after add.
- Checkout started.

These events can help validate whether search-first and compact add states reduce friction.

## Test Scenarios

### Mobile

- Load `/neworder` on a mobile viewport.
- Search for an exact product name and add it.
- Search for a partial product name and add a result.
- Search with a typo and use a suggestion.
- Browse by category and add a product.
- Confirm product card stays compact after add.
- Open quantity editor, choose another quantity, and confirm.
- Remove an added item.
- Continue to cart and place order with a registered mobile number.

### Web

- Load `/neworder` on a desktop viewport.
- Browse categories using the category rail.
- Use search above the grid.
- Add products from both search and category browsing.
- Confirm selected product cards remain compact.
- Confirm cart summary panel updates.
- Edit quantity locally.
- Continue to cart.

### Regression

- Existing direct category URLs still open the requested category/subcategory.
- Product lists with no products still show the existing empty state.
- Products with returnable options still support those choices.
- Admin/shop-owner views are not unintentionally changed.
- Existing saved/edit order flows still work.

## Open Questions for Planning

1. Should compact added state replace the current selected state everywhere, or only for non-admin retail customers?
2. Should quantity editing be inline, a popover, or a bottom sheet on mobile?
3. How much synonym/alias support is needed for the first release of assisted search?
4. Should web get a right-side cart summary panel in the first release, or should that remain a later enhancement?
5. Should an `Easy ordering` mode be user-selectable, or should the improved layout become the default?

## Suggested Planning Shape

The plan should probably split this into independent units:

- Accessible icon/button cleanup.
- Compact added product-card state.
- Quantity edit state.
- Search-first layout changes.
- Assisted search fallback/suggestions.
- Mobile layout polish.
- Web cart summary and grid polish.
- Browser verification and regression tests.

## Success Criteria

The work is successful when a less technical shopper can:

- Understand where to start on the product order page.
- Search or browse without interpreting a long category list first.
- Add a product and feel confident it was added.
- Adjust quantity only when needed.
- See cart progress clearly.
- Reach checkout without surprise about the registered mobile number requirement.
