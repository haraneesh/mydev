---
title: "feat: Align Cart Details Page With Desktop Mockup"
type: feat
date: 2026-06-24
execution: code
---

# feat: Align Cart Details Page With Desktop Mockup

## Summary

Refine the cart details checkout page to match the attached desktop mockup: a structured cart shell, product list on the left, sticky order summary on the right, and screenshot-matched colors, spacing, titles, and type scale. The work should build on the current partial two-column implementation and preserve cart behavior.

---

## Problem Frame

The existing cart page has already moved toward a two-column desktop layout, but it still carries old table/card conventions such as the `Name / Value` header, centered cart title treatment, and summary content assembled from legacy footer/comment layouts. The target mockup presents the checkout page as a desktop review surface: product editing remains spacious on the left while payment-critical totals, delivery warning, packing note, and submit action stay grouped on the right.

---

## Requirements

**Page Structure**

- R1. The desktop cart view must render a top cart details header with the circular `S` mark, `Cart Details` title, `Review quantities before ordering` subtitle, and right-aligned `+ ADD ITEMS` and `CLEAR CART` buttons.
- R2. The desktop body must use a left product column and a right order summary panel separated by a vertical divider, with spacing and panel backgrounds matching the mockup.
- R3. The layout must stack cleanly on tablet and mobile without horizontal overflow or overlapping quantity controls.

**Product Review**

- R4. Product categories must render as uppercase green section labels without the old `Name / Value` table header.
- R5. Active products must show large product names on the left, price on the right, quantity selector beneath the price, and row dividers matching the mockup rhythm.
- R6. Removed products must appear under a beige `REMOVED FROM CART` band with struck-through names and zero-price controls.

**Order Summary**

- R7. The order summary panel must show `Order Summary`, active item count, removed item count, subtotal, low-order delivery alert when applicable, `NOTE FOR PACKING TEAM`, note textarea, total, and the green `PLACE ORDER ->` button.
- R8. The summary values must continue to reflect existing cart state and settings, including deleted products, minimum-cart warning behavior, order update mode, and order submission disabled/waiting state.

**Behavior Preservation**

- R9. Existing add items, clear cart, quantity change, packing note, order update, place order, returnable item, admin on-behalf, and notification permission flows must keep working.
- R10. No order calculation, server API, payment, or cart persistence logic should change as part of this visual alignment.

---

## Key Technical Decisions

- **Keep presentation local to the cart page:** Add cart-specific classes and small component variants rather than changing global Bootstrap or product ordering styles. This reduces regression risk across the order entry page.
- **Use existing cart state as the summary source:** Derive active count, removed count, subtotal, and total from the same values already passed through `CartDetails` and `ListProducts`; do not introduce a parallel cart model.
- **Prefer component shape over CSS fighting legacy markup:** Where `OrderFooter`, `OrderComment`, or `ListProducts` markup blocks the mockup, introduce summary/list-specific props or wrapper components instead of relying on brittle descendant overrides.
- **Preserve the custom quantity selector:** The selector already supports the checkout and removed-product states. The implementation should restyle and position it, not replace its behavior.
- **Desktop fidelity first, responsive safety second:** The user supplied a desktop target. Mobile should remain usable and stacked, but pixel-level matching is only required for the desktop breakpoint.

---

## Implementation Units

### U1. Reshape the cart page shell and header

- **Goal:** Match the mockup's top cart shell: left identity mark and copy, right action buttons, and a white bordered page frame.
- **Requirements:** R1, R2, R9
- **Dependencies:** None
- **Files:**
  - Modify: `imports/ui/components/Cart/CartDetails.js`
  - Modify: `imports/ui/components/Orders/Product.scss`
- **Approach:** Replace the current centered cart-details header with a header layout that has a compact identity cluster and action cluster. Keep `handleAddItems` and `clearCart` wired to the existing buttons, but adjust button variants/classes so styling can match the green outline and brown filled actions in the screenshot.
- **Patterns to follow:** Existing `CartDetails` state and handler wiring; current `cartDetailsPage`, `cartDetailsTwoColumn`, and `cartDetailsActions` class pattern.
- **Test scenarios:**
  - Happy path: with active cart items, the header shows the `S` mark, `Cart Details`, subtitle, add-items action, and clear-cart action.
  - Behavior preservation: clicking add items still navigates to item selection, and clear cart still triggers the existing confirmation and clearing flow.
  - Responsive: at mobile width, title copy and actions wrap or stack without clipping.
- **Verification:** Browser screenshot at desktop width visually matches header color, spacing, title size, and button treatment from the mockup.

### U2. Convert product review rows to the mockup layout

- **Goal:** Remove the legacy table feel and render the product review as sectioned rows with mockup-matched typography and spacing.
- **Requirements:** R3, R4, R5, R6, R9
- **Dependencies:** U1
- **Files:**
  - Modify: `imports/ui/components/Cart/CartCommon.js`
  - Modify: `imports/ui/components/Orders/ProductForNonAdmin.js`
  - Modify: `imports/ui/components/Orders/Product.scss`
- **Approach:** Add a cart-review mode to `ListProducts` and product rows so the cart page can hide the `Name / Value` header, render category labels as green uppercase labels, and style rows with wide left names and right-aligned price/quantity controls. Treat removed products as their own section with the beige band and struck-through zero-value rows shown in the screenshot.
- **Patterns to follow:** `displayProductsByType` for product grouping, `displayWithDivider` for category output, and the checkout branch of `ProductForNonAdmin`.
- **Test scenarios:**
  - Happy path: a cart with vegetables and millet products renders category labels, product rows, prices, and quantity selectors in the mockup arrangement.
  - Removed state: products with `removedDuringCheckout` render under `REMOVED FROM CART`, have struck-through names, show `Rs. 0.00`, and retain the selector control.
  - Edge case: an unavailable product section, if present, remains distinguishable and does not inherit the removed-product label.
  - Returnables: a product with associated returnables still exposes the returnable checkbox and price without breaking row alignment.
- **Verification:** Desktop screenshot shows no old table header and row dividers/labels match the supplied mockup.

### U3. Build the right-side order summary panel

- **Goal:** Replace the legacy footer/comment composition inside the summary card with a summary panel that matches the screenshot content order and visual weight.
- **Requirements:** R2, R7, R8, R9, R10
- **Dependencies:** U1
- **Files:**
  - Modify: `imports/ui/components/Cart/CartDetails.js`
  - Modify: `imports/ui/components/Cart/CartCommon.js`
  - Modify: `imports/ui/components/Orders/Product.scss`
- **Approach:** Compose a summary-specific panel in `CartDetails` or add summary-mode props to `OrderComment` and `OrderFooter`. The panel should compute and render active item count, removed item count, subtotal, alert, note textarea, total, and submit button in the mockup order. Preserve admin on-behalf fields, payment/update labels, waiting state, cash/recyclable options, and existing submit callback.
- **Patterns to follow:** Existing `availableTotalBillAmount`, `deletedProducts.countOfItems`, `OrderComment`, `OrderFooter`, `isOrderAmountGreaterThanMinimum`, and `Meteor.settings.public.CART_ORDER.MINIMUMCART_ORDER_MSG`.
- **Test scenarios:**
  - Happy path: active count, removed count, subtotal, total, and submit button reflect the cart shown on screen.
  - Minimum order: when total is below Rs 1000, the delivery charge alert appears in the panel with the mockup's tan background and red-brown text.
  - No alert: when total is at or above the configured minimum, the alert is absent and surrounding spacing remains balanced.
  - Order update: when editing an existing order, the submit label and waiting behavior still follow current `orderId` and `isOrderBeingUpdated` logic.
  - Admin path: on-behalf and salesperson fields remain available for admin-required carts without corrupting the summary layout.
- **Verification:** Browser interaction proves note editing and place-order submission still invoke existing handlers, while the summary visually matches heading, rule, alert, textarea, total, and button styling.

### U4. Final responsive polish and regression verification

- **Goal:** Confirm the mockup-aligned desktop view works across common cart states and does not regress the existing order flow.
- **Requirements:** R3, R8, R9, R10
- **Dependencies:** U1, U2, U3
- **Files:**
  - Modify: `imports/ui/components/Orders/Product.scss`
  - Test expectation: no new automated test file is expected unless implementation introduces testable non-visual helpers; this unit is visual and interaction verification.
- **Approach:** Tune breakpoints so desktop uses the two-column split and mobile stacks header, product list, and summary in a usable order. Check button labels, textarea sizing, selector menus, removed rows, alert spacing, and sticky summary behavior.
- **Patterns to follow:** Existing responsive media queries in `Product.scss` and the current cart route behavior.
- **Test scenarios:**
  - Desktop: the page matches the attached mockup at a wide viewport with active products, removed products, and a low-order alert.
  - Mobile: the page stacks without text clipping, selector clipping, or horizontal scroll.
  - Empty redirect: existing redirect behavior for empty carts and updated orders remains unchanged.
  - Regression: the order page product cards and quantity selector outside checkout still render correctly.
- **Verification:** Run the existing test suite and capture desktop/mobile browser screenshots. Also run a whitespace/diff sanity check so the patch is clean.

---

## Scope Boundaries

### In Scope

- Cart details page layout, typography, color, spacing, and summary composition.
- Product row presentation for active, removed, unavailable, and returnable checkout states.
- Responsive treatment for the cart details page.

### Deferred to Follow-Up Work

- New recommendation variants or additional static design exploration beyond the selected two-column desktop version.
- A full mobile redesign beyond preserving usability.
- Broad design-system cleanup for buttons, cards, typography, or form controls outside the cart flow.

### Out of Scope

- Cart pricing calculations, discounts, delivery-fee rules, payment flow, order persistence, and server APIs.
- Copy changes beyond the heading/title labels shown in the mockup.
- Cleanup of unrelated lint warnings in existing files.

---

## Risks & Dependencies

- **Legacy component shape:** `OrderFooter` and `OrderComment` currently render Bootstrap row/column structures that are awkward inside the summary panel. The implementation should use props or summary-specific composition instead of accumulating fragile CSS overrides.
- **Shared product styling:** `Product.scss` also styles the product ordering page. Cart-specific selectors must stay scoped under `.cartDetailsPage` to avoid product-card regressions.
- **Hidden cart states:** Admin on-behalf fields, returnables, unavailable products, and order update mode may not appear in the most common screenshot state but still need preservation.
- **Visual verification dependency:** The closest validation is browser screenshot review because the existing test suite does not appear to include component-level visual assertions for this page.

---

## Sources & Research

- `imports/ui/components/Cart/CartDetails.js` currently owns cart page routing, handlers, two-column shell, summary card, admin fields, alert, and submit flow.
- `imports/ui/components/Cart/CartCommon.js` currently owns `ListProducts`, product grouping, category headers, removed products, unavailable products, `OrderComment`, and `OrderFooter`.
- `imports/ui/components/Orders/ProductForNonAdmin.js` currently owns checkout row markup, quantity selector placement, removed-product strike-through, and returnable handling.
- `imports/ui/components/Orders/Product.scss` currently contains the partial two-column cart styling and shared product/order styling.
- Attached mockup dated 2026-06-24 is the visual source of truth for desktop color, spacing, headings, and font scale.
