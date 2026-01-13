# Design: Variable Unit Selection with Fractional Quantities and Discounts

## Context
Products in the system have a base unit of sale (e.g., "1Kg") and available fractional selections with optional per-fraction discounts (e.g., "0,0.2,0.4=5%,0.6,0.8=10%,1"). A discount value after the `=` sign applies specifically to that fraction only.

Example:
- Product: Rice, Unit of Sale: 1Kg, Price: 220
- unitsForSelection: "0,0.2,0.4=5%,0.6,0.8=10%,1"
- Available selections:
  - 0.2Kg (200g): 220 × 0.2 = 44 (no discount)
  - 0.4Kg (400g): 220 × 0.4 × (1 - 5/100) = 220 × 0.4 × 0.95 = 83.6 (5% discount)
  - 0.6Kg (600g): 220 × 0.6 = 132 (no discount)
  - 0.8Kg (800g): 220 × 0.8 × (1 - 10/100) = 220 × 0.8 × 0.9 = 158.4 (10% discount)
  - 1Kg: 220 × 1 = 220 (no discount)

## Goals
- Enable customers to select fractional quantities with accurate pricing
- Apply quantity-specific discounts (e.g., full unit discounts)
- Display friendly quantity labels (e.g., "200g" instead of "0.2Kg")
- Ensure cart totals are calculated correctly based on unit-specific prices

## Non-Goals
- Complex discount matrices (discounts are simple per-fraction attachments)
- Dynamic UI layout changes (standard product card with dropdown/chip selector)
- Server-side discount application (calculations done client-side)

## Decisions

### Decision: Per-Fraction Discounts
Each fraction in unitsForSelection can have its own optional discount. Discounts are attached directly to the fraction using `=` notation (e.g., "0.4=5%").

**Rationale**: Allows fine-grained promotional control. Business can offer different discounts for different bulk sizes.

**Alternatives Considered**:
- Single discount for full unit only: Less flexible, doesn't match actual business requirement
- Tiered discount matrix: Would require additional data structure (complexity)

### Decision: Unit Display Format
Display quantities using the most appropriate unit (g, Kg, etc.) derived from the base unitOfSale.

**Examples**:
- unitOfSale="1Kg", fraction=0.2 → displays as "200g"
- unitOfSale="1L", fraction=0.5 → displays as "500ml"
- unitOfSale="10pieces", fraction=0.5 → displays as "5pieces"

**Rationale**: User-friendly without requiring additional configuration.

### Decision: CartItem Extended with Unit Details
Store selectedUnit (fraction) and selectedUnitPrice directly in CartItem to preserve pricing information independent of current Product data.

**Rationale**: Product base price might change after user adds to cart. Storing unit-specific price ensures consistent cart totals.

### Decision: unitsForSelection Parsing Logic
Parser must handle:
- Comma-separated items, each being either a fraction or a fraction with optional discount
- Optional discount suffix after `=` sign with `%` symbol
- Format: "0,0.2,0.4=5%,0.6,0.8=10%,1" (mixed discounts) or "0,0.2,0.4,0.6" (no discounts)

**Example Parsing**:
- Input: "0,0.2,0.4=5%,0.6,0.8=10%,1"
- Parsed items:
  - 0 (no discount)
  - 0.2 (no discount)
  - 0.4 with 5% discount
  - 0.6 (no discount)
  - 0.8 with 10% discount
  - 1.0 (no discount)

## Data Model Changes

### Product Extensions
```
unitsForSelection format: "0,0.2,0.4=5%,0.6,0.8=10%,1"

New Helper Methods:
- List<double> getAvailableUnits() → [0, 0.2, 0.4, 0.6, 0.8, 1.0]
- double? getDiscountPercentage(double fraction) → 5.0 (if fraction=0.4), 10.0 (if fraction=0.8), null (otherwise)
- String formatUnitLabel(double fraction) → "200g" (for unitOfSale="1Kg", fraction=0.2)
- double calculateUnitPrice(double fraction) → price accounting for per-fraction discount if applicable
```

### CartItem Extensions
```
Add fields:
- selectedUnit: double (the fraction selected, e.g., 0.2)
- selectedUnitPrice: double (pre-calculated price for this unit)

Update getter:
- subtotal: returns selectedUnitPrice × quantity (not base price × quantity)
```

## Risks & Trade-offs

### Risk: Price Consistency
**Risk**: Base product price changes after user adds to cart; stored unit-specific price becomes outdated.
**Mitigation**: Unit-specific price is immutable once added to cart (matches user's purchase agreement at that moment). If price changes, new selections use new price.

### Risk: Discount Logic Complexity
**Risk**: Multiple fractions with different discounts could confuse users.
**Mitigation**: UI should display discount labels (e.g., "(5% off)") explicitly for fractions that have discounts, next to the price.

### Risk: Unit Label Generation
**Risk**: Converting "1Kg" × 0.2 to "200g" requires logic for unit conversion (Kg→g, L→ml, etc.).
**Mitigation**: Simple heuristic approach: divide by fraction and apply standard conversions. Falls back to "0.2 × unitOfSale" if conversion unknown.

## Migration Plan
No existing cart data to migrate (new feature). Product schema already has unitsForSelection field populated.

## Open Questions
- Should 0 fraction be displayed as an option? (Currently included in format but unclear if selectable)
  - **Assumption**: 0 is a placeholder; only fractions > 0 are selectable
- Are fractions always in ascending order in unitsForSelection? (Assumed yes for simplicity)
  - **Assumption**: Yes, backend ensures fractions are sorted
