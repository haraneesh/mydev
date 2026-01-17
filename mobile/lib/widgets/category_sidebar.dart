import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../config/product_constants.dart';

/// Category to icon mapping
const Map<String, String> categoryIconMap = {
  'All': 'imgAll.png',
  'Vegetables': 'imgVegetables.png',
  'Fruits': 'imgFruits.png',
  'Greens': 'imgGreens.png',
  'Rice': 'imgRice.png',
  'Wheat': 'imgWheat.png',
  'Millets': 'imgMillets.png',
  'Dhals': 'imgDhals.png',
  'Sweetners': 'imgSweetners.png',
  'Salts': 'imgSalts.png',
  'Spices': 'imgSpices.png',
  'Nuts': 'imgNuts.png',
  'DryFruits': 'imgDryFruits.png',
  'Oils': 'imgOils.png',
  'Milk': 'imgMilk.png',
  'Eggs': 'imgEggs.png',
  'Prepared': 'imgPrepared.png',
  'Disposables': 'imgDisposables.png',
  'Beauty': 'imgBeauty.png',
};

/// CategorySidebar displays a vertical list of product categories.
/// 
/// The user can tap on a category to select it and trigger filtering.
/// The currently selected category is visually highlighted with smooth animations.
/// Only categories with at least one product are displayed.
/// 
/// Supports two input modes:
/// 1. Simple string categories (for backward compatibility)
/// 2. CategoryDisplayItem objects (recommended - includes display_value)
class CategorySidebar extends StatefulWidget {
  /// List of category names or CategoryDisplayItem objects to display
  final List<dynamic> categories;
  
  /// Currently selected category name (the internal 'name' field, not display_value)
  final String selectedCategory;
  
  /// Callback when a category is selected (passes the internal 'name' value)
  final Function(String) onCategorySelected;
  
  /// Optional width for the sidebar (defaults to 150)
  final double width;
  
  /// Optional background color (defaults to white)
  final Color backgroundColor;
  
  /// Optional list of products to filter categories (only show categories with products)
  final List<dynamic>? products;

  const CategorySidebar({
    required this.categories,
    required this.selectedCategory,
    required this.onCategorySelected,
    this.width = 150,
    this.backgroundColor = Colors.white,
    this.products,
    super.key,
  });

  @override
  State<CategorySidebar> createState() => _CategorySidebarState();
}

class _CategorySidebarState extends State<CategorySidebar> {
  /// Get set of category names that have at least one product with availableToOrder=true
  Set<String> _getCategoriesWithProducts() {
    if (widget.products == null || widget.products!.isEmpty) {
      return {}; // Return empty set if no products provided
    }
    
    final categoriesWithProducts = <String>{};
    
    for (final product in widget.products!) {
      // Extract category and availableToOrder from product
      String? category;
      bool? availableToOrder;
      
      if (product is Map<String, dynamic>) {
        // If product is a Map
        category = product['category'] ?? product['type'];
        availableToOrder = product['availableToOrder'] as bool?;
      } else if (product.runtimeType.toString().contains('Product')) {
        // If product is a Product object, access via reflection
        try {
          category = product.category;
          availableToOrder = product.availableToOrder;
        } catch (e) {
          // Fallback if reflection fails
          continue;
        }
      }
      
      // Only add category if it has a product with availableToOrder=true
      if (category != null && category.isNotEmpty && (availableToOrder ?? true)) {
        categoriesWithProducts.add(category);
      }
    }
    
    return categoriesWithProducts;
  }
  
  @override
  Widget build(BuildContext context) {
    final categoriesWithProducts = _getCategoriesWithProducts();
    final filteredCategories = widget.products == null 
        ? widget.categories // Show all if no products provided
        : widget.categories.where((category) {
            String categoryName;
            if (category is CategoryDisplayItem) {
              categoryName = category.name;
            } else {
              categoryName = category.toString();
            }
            // Always include 'All' category, filter others
            return categoryName == 'All' || categoriesWithProducts.contains(categoryName);
          }).toList();

    return Container(
      width: widget.width,
      color: widget.backgroundColor,
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            for (int index = 0; index < filteredCategories.length; index++)
              _buildCategoryItem(
                context,
                filteredCategories[index],
                index,
              ),
          ],
        ),
      ),
    );
  }

  /// Builds an individual category list item with smooth animations
  Widget _buildCategoryItem(
    BuildContext context,
    dynamic categoryData,
    int index,
  ) {
    // Support both string and CategoryDisplayItem formats
    String categoryName;
    String displayText;

    if (categoryData is CategoryDisplayItem) {
      categoryName = categoryData.name;
      displayText = categoryData.displayValue;
    } else {
      categoryName = categoryData.toString();
      displayText = categoryName;
    }

    final isSelected = widget.selectedCategory == categoryName;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => widget.onCategorySelected(categoryName),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(
            horizontal: 12,
            vertical: 12,
          ),
          decoration: BoxDecoration(
            color: isSelected
                ? AppColors.primary.withOpacity(0.1)
                : Colors.transparent,
          ),
          child: SizedBox(
            width: double.infinity,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Icon
                SizedBox(
                  height: 48,
                  width: 48,
                  child: _buildCategoryIcon(categoryName),
                ),
                const SizedBox(height: 4),
                // Text
                AnimatedDefaultTextStyle(
                  duration: const Duration(milliseconds: 200),
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: isSelected
                            ? AppColors.primary
                            : AppColors.textPrimary,
                        fontWeight:
                            isSelected ? FontWeight.w600 : FontWeight.normal,
                      ) ??
                      const TextStyle(),
                  child: Text(
                    displayText,
                    maxLines: 2,
                    textAlign: TextAlign.center,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  /// Builds the icon widget for a category
  Widget _buildCategoryIcon(String categoryName) {
    // Get the icon filename from the category map
    final iconFileName = categoryIconMap[categoryName];
    
    if (iconFileName == null) {
      // Fallback if category not found in map
      return Icon(
        Icons.category,
        color: widget.selectedCategory == categoryName
            ? AppColors.primary
            : Colors.grey,
        size: 24,
      );
    }
    
    return Center(
      child: Image.asset(
        'assets/icons/$iconFileName',
        width: 48,
        height: 48,
        fit: BoxFit.contain,
        isAntiAlias: false,
        filterQuality: FilterQuality.none,
        color: widget.selectedCategory == categoryName
            ? AppColors.primary
            : Colors.grey,
        errorBuilder: (context, error, stackTrace) {
          // Fallback if image asset not found
          return Icon(
            Icons.category,
            color: widget.selectedCategory == categoryName
                ? AppColors.primary
                : Colors.grey,
            size: 40,
          );
        },
      ),
    );
  }
}
