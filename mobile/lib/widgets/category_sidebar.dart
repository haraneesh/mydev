import 'package:flutter/material.dart';
import '../config/theme.dart';

/// CategorySidebar displays a vertical list of product categories.
/// 
/// The user can tap on a category to select it and trigger filtering.
/// The currently selected category is visually highlighted with smooth animations.
class CategorySidebar extends StatefulWidget {
  /// List of category names to display
  final List<String> categories;
  
  /// Currently selected category name
  final String selectedCategory;
  
  /// Callback when a category is selected
  final Function(String) onCategorySelected;
  
  /// Optional width for the sidebar (defaults to 150)
  final double width;
  
  /// Optional background color (defaults to white)
  final Color backgroundColor;

  const CategorySidebar({
    required this.categories,
    required this.selectedCategory,
    required this.onCategorySelected,
    this.width = 150,
    this.backgroundColor = Colors.white,
    super.key,
  });

  @override
  State<CategorySidebar> createState() => _CategorySidebarState();
}

class _CategorySidebarState extends State<CategorySidebar> {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: widget.width,
      color: widget.backgroundColor,
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            for (int index = 0; index < widget.categories.length; index++)
              _buildCategoryItem(
                context,
                widget.categories[index],
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
    String category,
    int index,
  ) {
    final isSelected = widget.selectedCategory == category;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => widget.onCategorySelected(category),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(
            horizontal: 12,
            vertical: 12,
          ),
          decoration: BoxDecoration(
            border: Border(
              left: BorderSide(
                color: isSelected ? AppColors.primary : Colors.transparent,
                width: 4,
              ),
              bottom: BorderSide(
                color: AppColors.border,
                width: 0.5,
              ),
            ),
            color: isSelected
                ? AppColors.primary.withOpacity(0.1)
                : Colors.transparent,
          ),
          child: SizedBox(
            width: double.infinity,
            child: AnimatedDefaultTextStyle(
              duration: const Duration(milliseconds: 200),
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: isSelected
                        ? AppColors.primary
                        : AppColors.textPrimary,
                    fontWeight:
                        isSelected ? FontWeight.w600 : FontWeight.normal,
                  ) ??
                  const TextStyle(),
              child: Text(
                category,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
