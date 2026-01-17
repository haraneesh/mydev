import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../models/product.dart';
import '../../providers/cart_provider.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/unit_selection_modal.dart';
import '../../widgets/order_footer.dart';
import '../../widgets/app_bar_with_logo.dart';
import '../../widgets/background_widget.dart';
import '../../services/settings_service.dart';
import '../../services/product_service.dart';
import 'home_screen.dart';
import 'user_profile_screen.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  late SettingsService _settingsService;
  late ProductService _productService;
  final Map<String, String> _imageUrlCache = {};
  double _minimumOrderAmount = 1000.0;
  String _minimumOrderMessage = 'Due to an increase in delivery costs, a delivery charge will apply to orders with a total value of less than Rs 1000.';
  List<Product> _currentProductList = [];
  bool _isLoadingProductList = false;

  @override
  void initState() {
    super.initState();
    _settingsService = SettingsService();
    _productService = ProductService();
    _loadSettings();
    _loadProductList();
  }

  @override
  void dispose() {
    super.dispose();
  }

  Future<void> _commitRemovedItemsAndNavigate(VoidCallback onNavigate) async {
    final cartProvider = context.read<CartProvider>();
    await cartProvider.commitRemovedItems();
    if (mounted) {
      onNavigate();
    }
  }

  Future<void> _loadSettings() async {
    try {
      final minAmount = await _settingsService.getMinimumOrderAmount();
      final message = await _settingsService.getMinimumOrderMessage();
      
      setState(() {
        _minimumOrderAmount = minAmount;
        _minimumOrderMessage = message;
      });
    } catch (e) {
    }
  }

  Future<void> _loadProductList() async {
    if (_isLoadingProductList) return;
    
    try {
      setState(() => _isLoadingProductList = true);
      
      if (!_productService.isConnected) {
        await _productService.connect();
      }
      
      final products = await _productService.fetchProducts();
      
      if (mounted) {
        setState(() {
          _currentProductList = products;
        });
        
        // Update cart provider with current product availability
        final cartProvider = context.read<CartProvider>();
        cartProvider.updateProductAvailability(products);
      }
      
    } catch (e) {
      // Continue without availability data if fetch fails
    } finally {
      if (mounted) {
        setState(() => _isLoadingProductList = false);
      }
    }
  }

  Future<String> buildProductImageUrl(String imageName) async {
    if (_imageUrlCache.containsKey(imageName)) {
      return _imageUrlCache[imageName]!;
    }

    try {
      final completeUrl = await _settingsService.buildProductImageUrl(imageName);
      _imageUrlCache[imageName] = completeUrl;
      return completeUrl;
    } catch (e) {
      return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    return BackgroundWidget(
      child: WillPopScope(
        onWillPop: () async {
          // Commit removed items when navigating away
          if (mounted) {
            final cartProvider = context.read<CartProvider>();
            await cartProvider.commitRemovedItems();
          }
          return true;
        },
        child: Scaffold(
          extendBodyBehindAppBar: false,
          appBar: AppBarWithLogo(
          showLeading: true,
          leading: Builder(
            builder: (context) => IconButton(
              icon: const Icon(Icons.menu),
              onPressed: () => Scaffold.of(context).openDrawer(),
            ),
          ),
        ),
      drawer: Drawer(
        backgroundColor: Colors.white,
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            DrawerHeader(
              decoration: const BoxDecoration(color: AppColors.primary),
              child: Consumer<AuthProvider>(
                builder: (context, authProvider, _) {
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Text(
                        'Suvai',
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        authProvider.currentUser?.phone ?? 'Guest',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.white,
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
            ListTile(
              leading: const Icon(Icons.home),
              title: const Text('Home'),
              onTap: () {
                Navigator.pop(context);
                _commitRemovedItemsAndNavigate(() {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (_) => const HomeScreen()),
                  );
                });
              },
            ),
            ListTile(
              leading: const Icon(Icons.shopping_cart),
              title: const Text('Cart'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.person),
              title: const Text('Profile'),
              onTap: () {
                Navigator.pop(context);
                _commitRemovedItemsAndNavigate(() {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const UserProfileScreen()),
                  );
                });
              },
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.logout),
              title: const Text('Logout'),
              onTap: () async {
                Navigator.pop(context);
                final authProvider = context.read<AuthProvider>();
                await authProvider.logout();
              },
            ),
          ],
        ),
      ),
      body: Consumer<CartProvider>(
        builder: (context, cartProvider, child) {
          if (cartProvider.items.isEmpty && cartProvider.removedItems.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.shopping_cart_outlined, size: 64, color: Colors.brown[500]),
                  const SizedBox(height: 16),
                  Text(
                    'Your cart is empty',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Add some products to get started',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.brown[500]),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                    ),
                    onPressed: () {
                      _commitRemovedItemsAndNavigate(() {
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(builder: (_) => const HomeScreen()),
                        );
                      });
                    },
                    child: Text(
                      'CONTINUE SHOPPING',
                      style: getButtonTextStyle(),
                    ),
                  ),
                ],
              ),
            );
          }

          // Separate items by availability status
           final availability = _currentProductList.isNotEmpty
               ? cartProvider.separateItemsByAvailability(_currentProductList)
               : {'available': cartProvider.items, 'unavailable': <CartItem>[]};
           
           final availableItems = availability['available'] as List<CartItem>;
           final unavailableItems = availability['unavailable'] as List<CartItem>;

           // Group available items by category
           final grouped = <String, List<dynamic>>{};
           final categoryOrder = <String>[];

           for (final item in availableItems) {
             final category = item.product.category;
             if (!grouped.containsKey(category)) {
               grouped[category] = [];
               categoryOrder.add(category);
             }
             grouped[category]!.add(item);
           }

           // Add removed items as a separate category if any exist
           if (cartProvider.removedItems.isNotEmpty) {
             grouped['Removed'] = cartProvider.removedItems;
             categoryOrder.add('Removed');
           }

           // Add unavailable items as a separate category if any exist (at the end)
           if (unavailableItems.isNotEmpty) {
             grouped['Not available to order'] = unavailableItems;
             categoryOrder.add('Not available to order');
           }

          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  'Shopping Cart',
                  style: Theme.of(context).textTheme.displaySmall,
                ),
              ),
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: categoryOrder.length + categoryOrder.fold<int>(0, (sum, cat) => sum + grouped[cat]!.length),
                  itemBuilder: (context, index) {
                    // Flatten the grouped items
                    var currentIndex = 0;
                    for (final category in categoryOrder) {
                      // Category header
                      if (currentIndex == index) {
                        final isRemoved = category == 'Removed';
                        final isUnavailable = category == 'Not available to order';
                        return Padding(
                          padding: const EdgeInsets.only(top: 12, bottom: 8),
                          child: Text(
                            category,
                            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                              fontWeight: FontWeight.w700,
                              color: isRemoved ? Colors.grey[600] : (isUnavailable ? Colors.brown[400] : AppColors.primary),
                            ),
                          ),
                        );
                      }
                      currentIndex++;

                      // Items in this category
                      for (final item in grouped[category]!) {
                        if (currentIndex == index) {
                          final isRemoved = category == 'Removed';
                          final isUnavailable = category == 'Not available to order';
                          return Card(
                            elevation: 0,
                            color: isRemoved || isUnavailable ? Colors.grey[100] : Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(6),
                              side: BorderSide(
                                color: isRemoved || isUnavailable ? Colors.grey[300]! : AppColors.border,
                                width: 1,
                              ),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(8),
                              child: Opacity(
                                opacity: isRemoved || isUnavailable ? 0.6 : 1.0,
                                child: Row(
                                  children: [
                                    // Product Image
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(6),
                                      child: Container(
                                        width: 70,
                                        height: 70,
                                        color: Colors.white,
                                        child: FutureBuilder<String>(
                                          future: buildProductImageUrl(
                                            item.product.imageUrl.isEmpty ? 'blank.jpg' : item.product.imageUrl,
                                          ),
                                          builder: (context, snapshot) {
                                            if (snapshot.connectionState == ConnectionState.waiting) {
                                              return Center(
                                                child: CircularProgressIndicator(
                                                  valueColor: AlwaysStoppedAnimation<Color>(Colors.grey[400]!),
                                                ),
                                              );
                                            }
                                            if (snapshot.hasData && snapshot.data!.isNotEmpty) {
                                              return Image.network(
                                                snapshot.data!,
                                                fit: BoxFit.contain,
                                                errorBuilder: (_, __, ___) => const Icon(Icons.image, color: Colors.grey),
                                              );
                                            }
                                            return const Icon(Icons.image, color: Colors.grey);
                                          },
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    // Product Info
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            item.product.name,
                                            style: Theme.of(context).textTheme.bodyLarge,
                                            maxLines: 2,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            'Unit: ${item.formattedUnit}',
                                            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                              color: AppColors.info,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    // Price and Edit Button (hidden for removed and unavailable items)
                                     if (!isRemoved && !isUnavailable)
                                       Column(
                                         crossAxisAlignment: CrossAxisAlignment.end,
                                         children: [
                                           Text(
                                             '₹${item.subtotal.toStringAsFixed(0)}',
                                             style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                               fontWeight: FontWeight.w700,
                                               color: AppColors.primary,
                                             ),
                                           ),
                                           const SizedBox(height: 4),
                                           SizedBox(
                                             height: 28,
                                             child: ElevatedButton(
                                               onPressed: () {
                                                 final provider = context.read<CartProvider>();
                                                 showDialog(
                                                   context: context,
                                                   builder: (dialogContext) => UnitSelectionModal(
                                                     product: item.product,
                                                     onUnitSelected: (selectedUnit) {
                                                       provider.addItem(
                                                         item.product,
                                                         item.quantity,
                                                         selectedUnit: selectedUnit,
                                                       );
                                                     },
                                                   ),
                                                 );
                                               },
                                               style: ElevatedButton.styleFrom(
                                                 backgroundColor: AppColors.info,
                                                 foregroundColor: Colors.white,
                                                 padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
                                                 minimumSize: const Size(0, 28),
                                               ),
                                               child: Text(
                                                 'EDIT',
                                                 style: getButtonTextStyle(),
                                               ),
                                             ),
                                           ),
                                         ],
                                       ),
                                     // Empty space for unavailable items
                                     if (isUnavailable)
                                       const SizedBox.shrink(),
                                     // Restore button for removed items
                                     if (isRemoved)
                                       SizedBox(
                                         height: 28,
                                         child: ElevatedButton(
                                           onPressed: () {
                                             final provider = context.read<CartProvider>();
                                             showDialog(
                                               context: context,
                                               builder: (dialogContext) => UnitSelectionModal(
                                                 product: item.product,
                                                 onUnitSelected: (selectedUnit) {
                                                   provider.addItem(
                                                     item.product,
                                                     item.quantity,
                                                     selectedUnit: selectedUnit,
                                                   );
                                                 },
                                               ),
                                             );
                                           },
                                           style: ElevatedButton.styleFrom(
                                             backgroundColor: AppColors.info,
                                             foregroundColor: Colors.white,
                                             padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
                                             minimumSize: const Size(0, 28),
                                           ),
                                           child: Text(
                                             'RESTORE',
                                             style: getButtonTextStyle(),
                                           ),
                                         ),
                                       ),
                                     ],
                                ),
                              ),
                            ),
                          );
                        }
                        currentIndex++;
                      }
                    }
                    return const SizedBox.shrink();
                  },
                ),
              ),
              // Minimum order amount threshold
              if (cartProvider.totalAmount < _minimumOrderAmount)
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.brown[50],
                    border: Border.all(color: Colors.brown[300]!, width: 1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    _minimumOrderMessage,
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.brown[800],
                    ),
                  ),
                ),
              OrderFooter(
                totalAmount: cartProvider.totalAmount,
                itemCount: cartProvider.itemCount,
                context: context,
              ),
              ],
              );
              },
              ),
              ),
              ),
              );
              }
              }
