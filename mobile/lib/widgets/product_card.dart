import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/product.dart';
import '../services/settings_service.dart';
import '../providers/cart_provider.dart';
import '../config/theme.dart';
import './unit_selection_modal.dart';

class ProductCard extends StatefulWidget {
  final Product product;
  final VoidCallback? onAddToCart;

  const ProductCard({
    required this.product,
    this.onAddToCart,
    super.key,
  });

  @override
  State<ProductCard> createState() => _ProductCardState();
}

class _ProductCardState extends State<ProductCard> {
  late SettingsService _settingsService;
  String? _imageUrl;
  bool _isLoadingImage = false;

  @override
  void initState() {
    super.initState();
    _settingsService = SettingsService();
    _loadImageUrl();
  }

  @override
  void didUpdateWidget(ProductCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Reload image if product changed
    if (oldWidget.product.id != widget.product.id) {
      _loadImageUrl();
    }
  }

  Future<void> _loadImageUrl() async {
    setState(() => _isLoadingImage = true);

    try {
      // Use the product's imageUrl if available, otherwise use "blank.jpg" as fallback
      final imageName = widget.product.imageUrl.isEmpty 
          ? 'blank.jpg' 
          : widget.product.imageUrl;
      
      final imageUrl = await _settingsService.buildProductImageUrl(imageName);
      if (mounted) {
        setState(() {
          _imageUrl = imageUrl;
          _isLoadingImage = false;
        });
      }
      debugPrint('🖼️ Loaded image URL for ${widget.product.name}: $_imageUrl (using: $imageName)');
    } catch (e) {
      debugPrint('Error loading image URL: $e');
      if (mounted) {
        setState(() => _isLoadingImage = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Parse unitOfSale
    final unitOfSaleStr = widget.product.unitOfSale ?? '1kg';
    final parsedUnitOfSale = _parseUnitOfSale(unitOfSaleStr);
    
    return Consumer<CartProvider>(
      builder: (context, cartProvider, _) {
        debugPrint('🏗️ ProductCard.build() REBUILDING for product: ${widget.product.name}');
        debugPrint('   📊 CartProvider has ${cartProvider.items.length} items');
        
        // Check if product is in cart and get its cart unit/price
        final cartItem = cartProvider.items
            .where((item) => item.product.id == widget.product.id)
            .firstOrNull;
        
        debugPrint('   🔍 Looking for product ID: ${widget.product.id}');
        debugPrint('   📦 Cart product IDs: ${cartProvider.items.map((i) => i.product.id).toList()}');
        
        // Determine which unit to display
        late double displayUnit;
        late double displayUnitPrice;
        
        if (cartItem != null) {
          // Product is in cart - use its selected unit and price
          displayUnit = cartItem.selectedUnit;
          displayUnitPrice = cartItem.selectedUnitPrice;
          debugPrint('   ✅ Found in cart! selectedUnit: $displayUnit, price: $displayUnitPrice');
        } else {
          // Product not in cart - use lowest unit
          final units = _parseUnitsForSelection();
          final nonZeroUnits = units.where((u) => u > 0).toList();
          displayUnit = nonZeroUnits.isNotEmpty ? nonZeroUnits.first : 1.0;
          displayUnitPrice = widget.product.calculateUnitPrice(displayUnit);
          debugPrint('   ⭕ NOT in cart, using default unit: $displayUnit, price: $displayUnitPrice');
        }
        
        // Format the display unit
        final displayUnitDisplay = _convertToDisplayUnit(displayUnit, parsedUnitOfSale);
        debugPrint('   🎨 Display unit formatted as: $displayUnitDisplay');

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            height: 90,
            width: double.infinity,
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(6),
                  topRight: Radius.circular(6),
                ),
              ),
              child: Stack(
                children: [
                  // Product image
                  _buildImageWidget(),
                  // SALE label (top-right) - if any unit has a discount
                  if (_hasDiscount())
                    Positioned(
                      top: 4,
                      left: 4,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color.fromARGB(255, 250, 125, 5),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                           'SALE',
                           style: Theme.of(context).textTheme.labelSmall?.copyWith(
                             color: Colors.white,
                             fontSize: 10,
                             fontWeight: FontWeight.bold,
                           ),
                         ),
                      ),
                    ),
                  // Add button overlay (bottom-right) - oblong pill shape, green when in cart
                  Positioned(
                    bottom: 0,
                    right: 4,
                    child: Consumer<CartProvider>(
                      builder: (context, cartProvider, _) {
                        // Check if product is in cart for button color
                        final isInCart = cartProvider.items.any(
                          (item) => item.product.id == widget.product.id,
                        );
                        return SizedBox(
                          height: 24,
                          width: 42,
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: isInCart ? AppColors.success : AppColors.primary,
                              padding: EdgeInsets.zero,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            onPressed: () {
                              // Show unit selection modal
                              showDialog(
                                context: context,
                                builder: (context) => UnitSelectionModal(
                                  product: widget.product,
                                  onUnitSelected: (selectedUnit) {
                                    cartProvider.addItem(widget.product, 1.0, selectedUnit: selectedUnit);
                                    widget.onAddToCart?.call();
                                  },
                                ),
                              );
                            },
                            child: const Text(
                              'Add',
                              style: TextStyle(color: Colors.white),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(6),
              ),
              child: Padding(
               padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
              child: Column(
                  mainAxisSize: MainAxisSize.max,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                // Product Name (3 lines max)
                Text(
                   widget.product.name,
                   maxLines: 3,
                   overflow: TextOverflow.ellipsis,
                   style: Theme.of(context).textTheme.labelSmall?.copyWith(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                  ),
                 ),
                 const Spacer(),
                 // Row 1: Units (left) | Price (right)
                  Row(
                   mainAxisAlignment: MainAxisAlignment.spaceBetween,
                   children: [
                     Expanded(
                       child: Text(
                         displayUnitDisplay,
                         maxLines: 1,
                         overflow: TextOverflow.ellipsis,
                         style: Theme.of(context).textTheme.bodySmall?.copyWith(
                           color: AppColors.textSecondary,
                           fontSize: 12,
                         ),
                       ),
                     ),
                     Text(
                       '₹${displayUnitPrice.toStringAsFixed(0)}',
                       style: Theme.of(context).textTheme.bodySmall?.copyWith(
                         fontSize: 12,
                         fontWeight: FontWeight.w600,
                       ),
                     ),
                   ],
                 ),
                ],
                ),
                ),
                ),
                ),
                ],
                ),
                );
                },
                );
                }



  /// Parses the unitsForSelection string into a list of doubles
  /// Handles format: "0,0.5,1,2,3" or with discounts "0,0.2,0.4=5%,0.6,0.8=10%,1"
  /// Only returns fractions > 0
  List<double> _parseUnitsForSelection() {
    try {
      return widget.product.getAvailableUnits();
    } catch (e) {
      debugPrint('Error parsing unitsForSelection: $e');
      return [1.0, 2.0, 3.0, 4.0, 5.0];
    }
  }

  /// Parses unitOfSale string to extract quantity and unit
  /// Example: "1Kg" or "1 Kg" returns {quantity: 1, unit: "kg"}
  Map<String, dynamic> _parseUnitOfSale(String unitOfSaleStr) {
    final trimmed = unitOfSaleStr.trim();
    final regex = RegExp(r'^([\d.]+)\s*(.+)$');
    final match = regex.firstMatch(trimmed);
    
    if (match != null) {
      final quantity = double.tryParse(match.group(1) ?? '1') ?? 1.0;
      final unit = (match.group(2) ?? 'kg').toLowerCase();
      return {'quantity': quantity, 'unit': unit};
    }
    return {'quantity': 1.0, 'unit': 'kg'};
  }

  /// Converts a value in the base unit (e.g., 0.2 * 1kg) to display format
  /// Example: 0.2 * {quantity: 1, unit: "kg"} = 200g
  String _convertToDisplayUnit(double value, Map<String, dynamic> parsedUnitOfSale) {
    final quantity = parsedUnitOfSale['quantity'] as double;
    final unit = parsedUnitOfSale['unit'] as String;
    
    // Calculate actual amount in base unit (e.g., 0.2 * 1kg = 0.2kg = 200g)
    final actualAmount = value * quantity;
    
    // Convert kg to g if needed
    if (unit == 'kg' && actualAmount < 1) {
      final grams = (actualAmount * 1000).toInt();
      return '$grams g';
    }
    
    if (unit == 'kg' && actualAmount == actualAmount.toInt()) {
      return '${actualAmount.toInt()} kg';
    }
    
    if (unit == 'kg') {
      return '$actualAmount kg';
    }
    
    final valueStr = actualAmount % 1 == 0 ? actualAmount.toInt().toString() : actualAmount.toString();
    return '$valueStr $unit';
  }



  /// Checks if any of the available units has a discount
  bool _hasDiscount() {
    try {
      final units = widget.product.getAvailableUnits();
      return units.any((unit) {
        final discount = widget.product.getDiscountPercentage(unit);
        return discount != null && discount > 0;
      });
    } catch (e) {
      debugPrint('Error checking discount: $e');
      return false;
    }
  }

  /// Builds the image widget with proper error handling and loading state
   Widget _buildImageWidget() {
    if (_isLoadingImage) {
      return Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(Colors.grey[400]!),
        ),
      );
    }

    if (_imageUrl == null || _imageUrl!.isEmpty) {
      return Center(
        child: Icon(
          Icons.fastfood,
          size: 48,
          color: Colors.grey[400],
        ),
      );
    }

    return Image.network(
       _imageUrl!,
       fit: BoxFit.contain,
       errorBuilder: (context, error, stackTrace) {
        debugPrint('Error loading image from $_imageUrl: $error');
        return Center(
          child: Icon(
            Icons.broken_image,
            size: 48,
            color: Colors.grey[400],
          ),
        );
      },
      loadingBuilder: (context, child, loadingProgress) {
        if (loadingProgress == null) {
          return child;
        }
        return Center(
          child: CircularProgressIndicator(
            value: loadingProgress.expectedTotalBytes != null
                ? loadingProgress.cumulativeBytesLoaded / loadingProgress.expectedTotalBytes!
                : null,
            valueColor: AlwaysStoppedAnimation<Color>(Colors.grey[400]!),
          ),
        );
      },
    );
  }
}
