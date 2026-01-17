import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/product.dart';
import '../config/theme.dart';
import '../providers/cart_provider.dart';

/// Unit Selection Modal
/// Displays available unit options as selectable rows in a modal dialog
/// Includes option to remove product from cart if it's already in cart
class UnitSelectionModal extends StatelessWidget {
  final Product product;
  final Function(double selectedUnit) onUnitSelected;
  final Function(String productId)? onRemove;

  const UnitSelectionModal({
    super.key,
    required this.product,
    required this.onUnitSelected,
    this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    final availableUnits = product.getAvailableUnits();

    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
      insetPadding: const EdgeInsets.all(16),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // Modal content column
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Modal header
              Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  '${product.name}',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              Divider(height: 1, color: Colors.grey.shade300),
              // Scrollable list of unit options
              Flexible(
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  child: Scrollbar(
                    child: ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: availableUnits.length,
                      separatorBuilder: (context, index) => Divider(
                        height: 1,
                        color: Colors.grey.shade200,
                      ),
                    itemBuilder: (context, index) {
                    final unit = availableUnits[index];
                    final label = product.formatUnitLabel(unit);
                    final price = product.calculateUnitPrice(unit);
                    final discount = product.getDiscountPercentage(unit);

                    return Material(
                      color: Colors.transparent,
                      child: InkWell(
                        onTap: () {
                          
                          // Check if product is already in cart
                          final cartProvider = Provider.of<CartProvider>(context, listen: false);
                          
                          final isInCart = cartProvider.items.any(
                            (item) => item.product.id == product.id,
                          );
                          
                          
                          if (isInCart) {
                            // Product already in cart - update the unit
                            final currentItem = cartProvider.items.firstWhere((item) => item.product.id == product.id);
                            
                            cartProvider.updateItemUnit(product.id, unit);
                            
                          } else {
                            // Product not in cart - use callback to add it
                            onUnitSelected(unit);
                          }
                          
                          Navigator.of(context).pop();
                        },
                        child: Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 12,
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              // Unit label and discount
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    label,
                                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  if (discount != null && discount > 0)
                                    Text(
                                      '${discount.toStringAsFixed(0)}% off',
                                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                        color: AppColors.accent,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                ],
                              ),
                              // Price section (original and discounted)
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  // Original price with strikethrough (if discount exists)
                                  if (discount != null && discount > 0)
                                    Text(
                                      '₹${(product.price * unit).toStringAsFixed(0)}',
                                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                        decoration: TextDecoration.lineThrough,
                                        color: Colors.grey,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  // Discounted price
                                  Text(
                                    '₹${price.toStringAsFixed(0)}',
                                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                    ),
                  ),
                  ),
                  ),
                  Divider(height: 1, color: Colors.grey.shade300),
                  // Remove from Cart button (if product in cart)
              Consumer<CartProvider>(
                builder: (context, cartProvider, _) {
                  final isInCart = cartProvider.items.any(
                    (item) => item.product.id == product.id,
                  );

                  if (isInCart) {
                    return Padding(
                      padding: const EdgeInsets.all(12),
                      child: SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () {
                            // Move product to removed items
                            cartProvider.moveItemToRemoved(product.id);
                            Navigator.of(context).pop();
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.secondary,
                            foregroundColor: Colors.white,
                          ),
                          child: Text(
                            'REMOVE FROM CART',
                            style: getButtonTextStyle(),
                          ),
                        ),
                      ),
                    );
                  }

                  // No button shown if not in cart
                  return const SizedBox.shrink();
                },
              ),
            ],
          ),
          // Close button at top-right corner
          Positioned(
            top: -12,
            right: -12,
            child: Container(
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                border: Border.all(
                  color: Colors.red,
                  width: 2,
                ),
              ),
              child: IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.of(context).pop(),
                color: Colors.red,
                iconSize: 16,
                padding: EdgeInsets.zero,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
