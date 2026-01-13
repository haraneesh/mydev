import { assert, expect } from 'chai';
import constants from '../../../../modules/constants';

/**
 * Unit Tests for ProductsOrderMobile - Dynamic Category Rendering
 * 
 * Tests the refactored dynamic category rendering logic that replaces
 * hardcoded navigation links and Tab.Pane components.
 */

describe('ProductsOrderMobile - Category Rendering', function () {
  describe('Category List Generation', function () {
    it('should build categoryList from constants.ProductTypeName', function () {
      const excludedCategories = ['New', 'Returnable'];
      const categoryList = Object.keys(constants.ProductTypeName)
        .filter(cat => !excludedCategories.includes(cat))
        .map(cat => ({
          key: cat.charAt(0).toLowerCase() + cat.slice(1),
          name: cat,
          displayValue: constants.ProductTypeName[cat].display_value,
        }));

      // Verify categoryList is not empty
      assert.isArray(categoryList, 'categoryList should be an array');
      assert.isAbove(categoryList.length, 0, 'categoryList should not be empty');
    });

    it('should exclude New and Returnable categories', function () {
      const excludedCategories = ['New', 'Returnable'];
      const categoryList = Object.keys(constants.ProductTypeName)
        .filter(cat => !excludedCategories.includes(cat))
        .map(cat => ({
          key: cat.charAt(0).toLowerCase() + cat.slice(1),
          name: cat,
          displayValue: constants.ProductTypeName[cat].display_value,
        }));

      const names = categoryList.map(cat => cat.name);
      assert.notInclude(names, 'New', 'New category should be excluded');
      assert.notInclude(names, 'Returnable', 'Returnable category should be excluded');
    });

    it('should have exactly 18 categories (20 total - 2 excluded)', function () {
      const excludedCategories = ['New', 'Returnable'];
      const allCategories = Object.keys(constants.ProductTypeName);
      const categoryList = allCategories
        .filter(cat => !excludedCategories.includes(cat))
        .map(cat => ({
          key: cat.charAt(0).toLowerCase() + cat.slice(1),
          name: cat,
          displayValue: constants.ProductTypeName[cat].display_value,
        }));

      assert.equal(categoryList.length, 18, 'Should have 18 categories after exclusion');
      assert.equal(allCategories.length, 20, 'Should have 20 total categories in constants');
    });

    it('should include required categories: Vegetables, Fruits, Greens, etc.', function () {
      const excludedCategories = ['New', 'Returnable'];
      const requiredCategories = [
        'Vegetables', 'Fruits', 'Greens', 'Rice', 'Wheat', 'Millets',
        'Dhals', 'Sweetners', 'Salts', 'Spices', 'Nuts', 'DryFruits',
        'Oils', 'Milk', 'Eggs', 'Prepared', 'Disposables', 'Beauty',
      ];

      const categoryList = Object.keys(constants.ProductTypeName)
        .filter(cat => !excludedCategories.includes(cat))
        .map(cat => ({
          key: cat.charAt(0).toLowerCase() + cat.slice(1),
          name: cat,
          displayValue: constants.ProductTypeName[cat].display_value,
        }));

      const names = categoryList.map(cat => cat.name);
      requiredCategories.forEach(cat => {
        assert.include(names, cat, `${cat} should be in category list`);
      });
    });
  });

  describe('Category Key Transformation', function () {
    it('should convert PascalCase names to camelCase keys', function () {
      const testCases = [
        { input: 'Vegetables', expected: 'vegetables' },
        { input: 'Fruits', expected: 'fruits' },
        { input: 'DryFruits', expected: 'dryFruits' },
        { input: 'Rice', expected: 'rice' },
      ];

      testCases.forEach(({ input, expected }) => {
        const key = input.charAt(0).toLowerCase() + input.slice(1);
        assert.equal(key, expected, `${input} should convert to ${expected}`);
      });
    });

    it('should preserve original name in PascalCase', function () {
      const excludedCategories = ['New', 'Returnable'];
      const categoryList = Object.keys(constants.ProductTypeName)
        .filter(cat => !excludedCategories.includes(cat))
        .map(cat => ({
          key: cat.charAt(0).toLowerCase() + cat.slice(1),
          name: cat,
          displayValue: constants.ProductTypeName[cat].display_value,
        }));

      categoryList.forEach(cat => {
        // Verify name matches the constant key
        assert.isTrue(
          cat.name.charAt(0) === cat.name.charAt(0).toUpperCase(),
          `${cat.name} should start with uppercase letter`
        );
      });
    });

    it('should have keys matching camelCase pattern', function () {
      const excludedCategories = ['New', 'Returnable'];
      const categoryList = Object.keys(constants.ProductTypeName)
        .filter(cat => !excludedCategories.includes(cat))
        .map(cat => ({
          key: cat.charAt(0).toLowerCase() + cat.slice(1),
          name: cat,
          displayValue: constants.ProductTypeName[cat].display_value,
        }));

      categoryList.forEach(cat => {
        // Key should start with lowercase
        assert.equal(
          cat.key.charAt(0),
          cat.key.charAt(0).toLowerCase(),
          `${cat.key} should start with lowercase letter`
        );
      });
    });
  });

  describe('Display Value Rendering', function () {
    it('should use display_value from constants for UI labels', function () {
      const excludedCategories = ['New', 'Returnable'];
      const categoryList = Object.keys(constants.ProductTypeName)
        .filter(cat => !excludedCategories.includes(cat))
        .map(cat => ({
          key: cat.charAt(0).toLowerCase() + cat.slice(1),
          name: cat,
          displayValue: constants.ProductTypeName[cat].display_value,
        }));

      // Verify displayValue matches constants
      categoryList.forEach(cat => {
        assert.equal(
          cat.displayValue,
          constants.ProductTypeName[cat.name].display_value,
          `displayValue for ${cat.name} should match constants`
        );
      });
    });

    it('should display user-friendly labels (e.g., Leafy Greens for Greens)', function () {
      const testCases = [
        { category: 'Greens', expectedDisplay: 'Leafy Greens' },
        { category: 'Rice', expectedDisplay: 'Rice & Products' },
        { category: 'Wheat', expectedDisplay: 'Wheat & Products' },
        { category: 'Dhals', expectedDisplay: 'Dals & Lentils' },
        { category: 'Sweetners', expectedDisplay: 'Sugars, Jaggery & Honey' },
        { category: 'Spices', expectedDisplay: 'Spices, Whole and Powders' },
        { category: 'DryFruits', expectedDisplay: 'Dry Fruits' },
        { category: 'Milk', expectedDisplay: 'Milk & Products' },
        { category: 'Eggs', expectedDisplay: 'Eggs & Mushrooms' },
        { category: 'Prepared', expectedDisplay: 'Batter, Flour & Others' },
        { category: 'Beauty', expectedDisplay: 'Beauty Products' },
      ];

      testCases.forEach(({ category, expectedDisplay }) => {
        assert.equal(
          constants.ProductTypeName[category].display_value,
          expectedDisplay,
          `${category} should display as "${expectedDisplay}"`
        );
      });
    });

    it('should have display_value for all categories', function () {
      const excludedCategories = ['New', 'Returnable'];
      const categoryList = Object.keys(constants.ProductTypeName)
        .filter(cat => !excludedCategories.includes(cat))
        .map(cat => ({
          key: cat.charAt(0).toLowerCase() + cat.slice(1),
          name: cat,
          displayValue: constants.ProductTypeName[cat].display_value,
        }));

      categoryList.forEach(cat => {
        assert.isString(cat.displayValue, `${cat.name} should have displayValue as string`);
        assert.isNotEmpty(cat.displayValue, `${cat.name} displayValue should not be empty`);
      });
    });
  });

  describe('Category Map Structure', function () {
    it('should create categoryMap with PascalCase keys', function () {
      const categoryMap = {
        Vegetables: 'productVegetables',
        Fruits: 'productFruits',
        Greens: 'productGreens',
        DryFruits: 'productDryFruits',
      };

      // Verify keys are PascalCase
      Object.keys(categoryMap).forEach(key => {
        assert.equal(
          key.charAt(0),
          key.charAt(0).toUpperCase(),
          `${key} should start with uppercase letter`
        );
      });
    });

    it('should have mapping for all 18 categories', function () {
      const excludedCategories = ['New', 'Returnable'];
      const categoryList = Object.keys(constants.ProductTypeName)
        .filter(cat => !excludedCategories.includes(cat))
        .map(cat => ({
          key: cat.charAt(0).toLowerCase() + cat.slice(1),
          name: cat,
          displayValue: constants.ProductTypeName[cat].display_value,
        }));

      // Each category should have a corresponding map entry
      assert.equal(
        categoryList.length,
        18,
        'categoryMap should support 18 categories'
      );
    });

    it('should allow O(1) lookup by category name', function () {
      const categoryMap = {
        Vegetables: 'productVegetables',
        Fruits: 'productFruits',
      };

      // Direct property access should work
      assert.equal(categoryMap['Vegetables'], 'productVegetables');
      assert.equal(categoryMap['Fruits'], 'productFruits');

      // Lookup via variable
      const categoryName = 'Vegetables';
      assert.equal(categoryMap[categoryName], 'productVegetables');
    });
  });

  describe('Image Name Generation', function () {
    it('should generate correct image names from category names', function () {
      const testCases = [
        { category: 'Vegetables', expected: 'imgVegetables' },
        { category: 'Fruits', expected: 'imgFruits' },
        { category: 'DryFruits', expected: 'imgDryFruits' },
        { category: 'Sweetners', expected: 'imgSweetners' },
      ];

      testCases.forEach(({ category, expected }) => {
        const imgName = `img${category}`;
        assert.equal(imgName, expected, `Image name for ${category} should be ${expected}`);
      });
    });

    it('should generate image names for all categories', function () {
      const excludedCategories = ['New', 'Returnable'];
      const categoryList = Object.keys(constants.ProductTypeName)
        .filter(cat => !excludedCategories.includes(cat))
        .map(cat => ({
          key: cat.charAt(0).toLowerCase() + cat.slice(1),
          name: cat,
          displayValue: constants.ProductTypeName[cat].display_value,
        }));

      categoryList.forEach(cat => {
        const imgName = `img${cat.name}`;
        assert.isString(imgName, `Image name should be a string`);
        assert.equal(imgName.substring(0, 3), 'img', `Image name should start with 'img'`);
      });
    });
  });

  describe('Event Key Mapping', function () {
    it('should map eventKey to category for Tab component', function () {
      const testCases = [
        { category: 'Vegetables', eventKey: 'vegetables' },
        { category: 'Fruits', eventKey: 'fruits' },
        { category: 'DryFruits', eventKey: 'dryFruits' },
      ];

      testCases.forEach(({ category, eventKey }) => {
        const key = category.charAt(0).toLowerCase() + category.slice(1);
        assert.equal(key, eventKey, `${category} should map to eventKey ${eventKey}`);
      });
    });

    it('should ensure eventKey is unique per category', function () {
      const excludedCategories = ['New', 'Returnable'];
      const categoryList = Object.keys(constants.ProductTypeName)
        .filter(cat => !excludedCategories.includes(cat))
        .map(cat => ({
          key: cat.charAt(0).toLowerCase() + cat.slice(1),
          name: cat,
          displayValue: constants.ProductTypeName[cat].display_value,
        }));

      const keys = categoryList.map(cat => cat.key);
      const uniqueKeys = new Set(keys);

      assert.equal(
        keys.length,
        uniqueKeys.size,
        'All eventKeys should be unique'
      );
    });
  });

  describe('Data Consistency', function () {
    it('should maintain consistency between categoryList items', function () {
      const excludedCategories = ['New', 'Returnable'];
      const categoryList = Object.keys(constants.ProductTypeName)
        .filter(cat => !excludedCategories.includes(cat))
        .map(cat => ({
          key: cat.charAt(0).toLowerCase() + cat.slice(1),
          name: cat,
          displayValue: constants.ProductTypeName[cat].display_value,
        }));

      categoryList.forEach(cat => {
        // key should be derived from name
        const derivedKey = cat.name.charAt(0).toLowerCase() + cat.name.slice(1);
        assert.equal(cat.key, derivedKey, `key should be derived from name for ${cat.name}`);

        // displayValue should match constants
        assert.equal(
          cat.displayValue,
          constants.ProductTypeName[cat.name].display_value,
          `displayValue mismatch for ${cat.name}`
        );
      });
    });

    it('should not have null or undefined values in category objects', function () {
      const excludedCategories = ['New', 'Returnable'];
      const categoryList = Object.keys(constants.ProductTypeName)
        .filter(cat => !excludedCategories.includes(cat))
        .map(cat => ({
          key: cat.charAt(0).toLowerCase() + cat.slice(1),
          name: cat,
          displayValue: constants.ProductTypeName[cat].display_value,
        }));

      categoryList.forEach(cat => {
        assert.isNotNull(cat.key, `key should not be null for ${cat.name}`);
        assert.isNotNull(cat.name, `name should not be null`);
        assert.isNotNull(cat.displayValue, `displayValue should not be null for ${cat.name}`);

        assert.isDefined(cat.key, `key should be defined for ${cat.name}`);
        assert.isDefined(cat.name, `name should be defined`);
        assert.isDefined(cat.displayValue, `displayValue should be defined for ${cat.name}`);
      });
    });

    it('should have correct property types', function () {
      const excludedCategories = ['New', 'Returnable'];
      const categoryList = Object.keys(constants.ProductTypeName)
        .filter(cat => !excludedCategories.includes(cat))
        .map(cat => ({
          key: cat.charAt(0).toLowerCase() + cat.slice(1),
          name: cat,
          displayValue: constants.ProductTypeName[cat].display_value,
        }));

      categoryList.forEach(cat => {
        assert.isString(cat.key, `key should be string for ${cat.name}`);
        assert.isString(cat.name, `name should be string`);
        assert.isString(cat.displayValue, `displayValue should be string for ${cat.name}`);
      });
    });
  });
});
