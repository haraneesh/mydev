# Test Execution Guide

## Quick Start

### 1. Run Unit Tests
```bash
npm test
```

Expected output:
```
ProductsOrderMobile - Category Rendering
  Category List Generation
    ✓ should build categoryList from constants.ProductTypeName
    ✓ should exclude New and Returnable categories
    ✓ should have exactly 18 categories (20 total - 2 excluded)
    ✓ should include required categories: Vegetables, Fruits, Greens, etc.
  
  [31 total tests] ✓ All passed
```

### 2. Run Integration Tests (Full App)
```bash
npm run test-app
```

Expected output:
```
ProductsOrderMobile - Integration Tests
  Category Navigation Flow
    ✓ should build complete category navigation structure
    ✓ should support tab switching via eventKey matching
    ...
  
  [27 total tests] ✓ All passed
```

### 3. Watch Mode (For Development)
```bash
TEST_WATCH=1 npm run test-app
```

Tests will re-run whenever files change.

## Detailed Test Execution

### Run Only Category Rendering Tests
```bash
npm test -- --grep "Category List Generation"
```

### Run Only Integration Tests
```bash
npm test -- --grep "Integration Tests"
```

### Run Tests for Specific Category
```bash
npm test -- --grep "Vegetables|Fruits|Greens"
```

### Run Tests with Verbose Output
```bash
npm test -- --reporter spec
```

### Run Tests with JSON Output (for CI/CD)
```bash
npm test -- --reporter json > test-results.json
```

## Test Results Interpretation

### ✓ Passing Test
```
✓ should build categoryList from constants.ProductTypeName
```
Test passed successfully. The feature works as expected.

### ✗ Failing Test
```
✗ should exclude New and Returnable categories
  Error: expected [ 'New', 'Returnable', 'Vegetables' ] to not include 'New'
```
Test failed. Exclusion logic not working. Need to debug and fix.

### ⏭ Skipped Test
```
- should test edge case with slow network
```
Test marked to skip (usually with `.skip`). Run later when ready.

### ⏱ Timeout
```
✗ should load default category on mount
  Error: Timeout of 2000ms exceeded
```
Test took too long. May indicate performance issue or missing mock data.

## Common Test Failures and Solutions

### Failure 1: "New category should be excluded"
**Cause**: Exclusion filter not working  
**Solution**: Check that `excludedCategories` array includes 'New' and 'Returnable'

```javascript
const excludedCategories = ['New', 'Returnable']; // ✓ Correct
```

### Failure 2: "should have 18 categories"
**Cause**: Incorrect category count  
**Solution**: Verify constants.ProductTypeName has 20 items (after 2 exclusions = 18)

```bash
# Check in Node console:
Object.keys(constants.ProductTypeName).length // Should be 20
```

### Failure 3: "displayValue mismatch"
**Cause**: Display value doesn't match constants  
**Solution**: Ensure category names and constants keys match exactly (case-sensitive)

```javascript
// ✓ Correct
displayValue: constants.ProductTypeName[cat.name].display_value

// ✗ Wrong
displayValue: constants.ProductTypeName[cat.key].display_value // key is camelCase!
```

### Failure 4: "key should be camelCase"
**Cause**: Key transformation logic broken  
**Solution**: Verify key generation converts first letter to lowercase

```javascript
// ✓ Correct
const key = cat.charAt(0).toLowerCase() + cat.slice(1);

// ✗ Wrong
const key = cat.toLowerCase(); // Makes entire string lowercase!
```

## Test Data

### Sample Category Object
```javascript
{
  key: 'vegetables',           // camelCase for eventKey
  name: 'Vegetables',          // PascalCase original
  displayValue: 'Vegetables'   // User-friendly label
}
```

### Sample Product Array
```javascript
[
  { _id: '1', type: 'Vegetables', name: 'Potato' },
  { _id: '2', type: 'Vegetables', name: 'Tomato' },
  { _id: '3', type: 'Vegetables', name: 'Onion' }
]
```

### Sample Category Map
```javascript
{
  Vegetables: [productObj1, productObj2, ...],
  Fruits: [productObj3, productObj4, ...],
  // ... 16 more categories
}
```

## Continuous Integration (CI/CD)

### GitHub Actions Example
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```

### GitLab CI Example
```yaml
test:
  image: node:18
  script:
    - npm install
    - npm test
```

## Performance Benchmarking

### Test Execution Time
```bash
# With timing information
npm test -- --reporter tap | grep -E "ok|not ok|# .*ms"
```

Expected times:
- Unit tests: < 500ms
- Integration tests: < 1000ms
- Total: < 2000ms

### Memory Usage
```bash
# Monitor Node memory usage
node --max-old-space-size=512 node_modules/.bin/mocha tests/
```

## Debugging Failed Tests

### Step 1: Run Specific Failing Test
```bash
npm test -- --grep "should exclude New and Returnable"
```

### Step 2: Add Debug Output
Edit the test to log intermediate values:

```javascript
it('should exclude New and Returnable categories', function () {
  const excludedCategories = ['New', 'Returnable'];
  const categoryList = Object.keys(constants.ProductTypeName)
    .filter(cat => !excludedCategories.includes(cat));

  console.log('All categories:', Object.keys(constants.ProductTypeName));
  console.log('Excluded:', excludedCategories);
  console.log('Filtered:', categoryList);

  assert.notInclude(categoryList, 'New');
});
```

Run with output:
```bash
npm test -- --grep "should exclude" 2>&1
```

### Step 3: Use Node Debugger
```bash
node inspect node_modules/.bin/mocha tests/main.test.js
```

Commands:
- `c` = continue
- `n` = next step
- `s` = step into
- `out` = step out
- `watch(expression)` = watch variable
- `quit` = exit

### Step 4: Check Test Isolation
Ensure tests don't depend on each other:

```javascript
describe('Category Tests', () => {
  beforeEach(() => {
    // Reset state before each test
    categoryList = null;
  });

  it('test 1', () => { ... });
  it('test 2', () => { ... }); // Should not depend on test 1
});
```

## Test Coverage Reports

### Generate Coverage Report
```bash
npx nyc npm test
```

### View Coverage in Browser
```bash
npx nyc npm test
open coverage/index.html
```

Expected coverage:
- Statements: > 90%
- Branches: > 85%
- Functions: > 90%
- Lines: > 90%

## Troubleshooting

### Issue: "Cannot find module 'constants'"
**Solution**: Ensure test file has correct import path
```javascript
import constants from '../../../../modules/constants'; // ✓
```

### Issue: "assert is not defined"
**Solution**: Import assert at top of test file
```javascript
import { assert, expect } from 'chai'; // ✓
```

### Issue: Tests hang/timeout
**Solution**: 
- Check for missing async/await
- Increase timeout: `this.timeout(5000)`
- Kill hanging process: `lsof -ti:3000 | xargs kill -9`

### Issue: "Meteor is not defined"
**Solution**: Tests may need to run in Meteor environment
- Use `npm run test-app` instead of `npm test`
- Or mock Meteor object in test setup

## Test Reporting

### Generate HTML Report
```bash
npm test -- --reporter html > test-report.html
open test-report.html
```

### Export Test Results
```bash
npm test -- --reporter json > test-results.json
npm test -- --reporter xml > test-results.xml
```

## Pre-deployment Checklist

- [ ] Run `npm test` - all unit tests pass
- [ ] Run `npm run test-app` - all integration tests pass
- [ ] Check coverage > 90%
- [ ] Manual browser testing completed
- [ ] Mobile device testing completed
- [ ] No console errors or warnings
- [ ] Performance acceptable (< 100ms for tab switch)
- [ ] All 18 categories render correctly
- [ ] "New" and "Returnable" excluded
- [ ] Default category loads correctly

## Test Maintenance

### Add New Test When:
- Adding new feature
- Fixing bug (add regression test)
- Refactoring code
- Improving performance

### Update Tests When:
- Constants change
- Component props change
- Behavior changes
- Categories added/removed

### Example: Adding New Category Test
```javascript
it('should include NewCategory in categoryList', function () {
  const categoryList = Object.keys(constants.ProductTypeName)
    .filter(cat => !excludedCategories.includes(cat));
  
  const names = categoryList.map(cat => cat.name);
  assert.include(names, 'NewCategory');
});
```

## References

- Test Framework: Mocha (https://mochajs.org/)
- Assertions: Chai (https://www.chaijs.com/)
- Project: NammaSuvai (https://github.com/haraneesh/mydev)
- Tests Location: `imports/ui/components/Orders/ProductsOrderMobile/`
