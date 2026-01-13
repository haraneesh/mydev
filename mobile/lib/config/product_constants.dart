/// Product type constants matching the Meteor ProductTypeName definitions.
/// 
/// Each entry contains:
/// - name: The MongoDB field value used for filtering (PascalCase)
/// - display_value: The user-friendly UI label for the category
class ProductTypeConstant {
  final String name;
  final String displayValue;

  const ProductTypeConstant({
    required this.name,
    required this.displayValue,
  });
}

class ProductConstants {
  /// All available product categories with their metadata
  /// Names and display values match the Meteor ProductTypeName constant
  static const Map<String, ProductTypeConstant> productTypeName = {
    'Vegetables': ProductTypeConstant(
      name: 'Vegetables',
      displayValue: 'Vegetables',
    ),
    'Fruits': ProductTypeConstant(
      name: 'Fruits',
      displayValue: 'Fruits',
    ),
    'Greens': ProductTypeConstant(
      name: 'Greens',
      displayValue: 'Leafy Greens',
    ),
    'Rice': ProductTypeConstant(
      name: 'Rice',
      displayValue: 'Rice & Products',
    ),
    'Wheat': ProductTypeConstant(
      name: 'Wheat',
      displayValue: 'Wheat & Products',
    ),
    'Millets': ProductTypeConstant(
      name: 'Millets',
      displayValue: 'Millets & Products',
    ),
    'Dhals': ProductTypeConstant(
      name: 'Dhals',
      displayValue: 'Dals & Lentils',
    ),
    'Sweetners': ProductTypeConstant(
      name: 'Sweetners',
      displayValue: 'Sugars, Jaggery & Honey',
    ),
    'Salts': ProductTypeConstant(
      name: 'Salts',
      displayValue: 'Salts',
    ),
    'Spices': ProductTypeConstant(
      name: 'Spices',
      displayValue: 'Spices, Whole and Powders',
    ),
    'Nuts': ProductTypeConstant(
      name: 'Nuts',
      displayValue: 'Nuts',
    ),
    'DryFruits': ProductTypeConstant(
      name: 'DryFruits',
      displayValue: 'Dry Fruits',
    ),
    'Oils': ProductTypeConstant(
      name: 'Oils',
      displayValue: 'Oils',
    ),
    'Milk': ProductTypeConstant(
      name: 'Milk',
      displayValue: 'Milk & Products',
    ),
    'Eggs': ProductTypeConstant(
      name: 'Eggs',
      displayValue: 'Eggs & Mushrooms',
    ),
    'Prepared': ProductTypeConstant(
      name: 'Prepared',
      displayValue: 'Batter, Flour & Others',
    ),
    'Disposables': ProductTypeConstant(
      name: 'Disposables',
      displayValue: 'Disposables',
    ),
    'Beauty': ProductTypeConstant(
      name: 'Beauty',
      displayValue: 'Beauty Products',
    ),
  };

  /// Categories to exclude from navigation display
  static const List<String> excludedCategories = ['New', 'Returnable'];

  /// Get all displayable categories (excluding New and Returnable)
  static List<CategoryDisplayItem> getAllCategories() {
    return productTypeName.entries
        .where((entry) => !excludedCategories.contains(entry.key))
        .map((entry) => CategoryDisplayItem(
          name: entry.value.name,
          displayValue: entry.value.displayValue,
        ))
        .toList();
  }
}

/// Represents a category with both internal name and user-facing display value
class CategoryDisplayItem {
  final String name;      // Used for MongoDB filtering
  final String displayValue;  // Used for UI display

  const CategoryDisplayItem({
    required this.name,
    required this.displayValue,
  });

  @override
  String toString() => displayValue;
}
