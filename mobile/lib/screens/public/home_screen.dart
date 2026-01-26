import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../config/product_constants.dart';
import '../../models/product.dart';
import '../../providers/cart_provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/product_service.dart';
import '../../services/settings_service.dart';
import '../../widgets/product_card.dart';
import '../../widgets/app_bar_with_logo.dart';
import '../../widgets/background_widget.dart';
import '../../widgets/category_sidebar.dart';
import '../../widgets/app_menu_drawer.dart';
import 'cart_screen.dart';
import 'user_profile_screen.dart';
import '../../services/onesignal_service.dart';
import '../../widgets/notification_requirement_dialog.dart';

class HomeScreen extends StatefulWidget {
  final List<Product>? initialProducts;

  const HomeScreen({
    this.initialProducts,
    super.key,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with WidgetsBindingObserver {
  late String selectedCategory;
  late List<dynamic> categories;
  late List<Product> products;
  late ProductService productService;
  late SettingsService settingsService;
  bool isLoading = false;
  bool isInitialLoad = true;
  String? errorMessage;
  DateTime? productListUpdatedAt;
  bool isRefreshingSettings = false;
  late TextEditingController _searchController;
  String searchQuery = ''; // Track search input

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();
    selectedCategory = 'All';
    products = widget.initialProducts ?? [];
    productService = ProductService();
    settingsService = SettingsService();
    
    // Register as WidgetsBindingObserver to detect app lifecycle changes
    WidgetsBinding.instance.addObserver(this);
    
    // Clear settings cache to ensure fresh settings are loaded
    // This ensures we always get the latest settings from Meteor server
    settingsService.clearCache();
    
    // Initialize with all displayable product categories (excluding New, Returnable)
    categories = ['All', ...ProductConstants.getAllCategories()];
    
    if (widget.initialProducts != null) {
      _initializeDefaultCategory();
      // Set isInitialLoad to false since products are already available
      isInitialLoad = false;
    } else {
      _initializeProducts();
    }

    // Check for notification permission on app load
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkNotificationPermission();
    });
  }

  Future<void> _checkNotificationPermission() async {
    final oneSignalService = OneSignalService.instance;
    final hasPermission = await oneSignalService.hasPermission();
    
    if (!hasPermission && mounted) {
      await NotificationRequirementDialog.show(context, oneSignalService);
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // Refresh settings whenever the app is resumed (brought to foreground)
    // This ensures fresh settings are loaded when returning from other pages or background
    if (state == AppLifecycleState.resumed) {
      _refreshSettings();
    }
  }

  @override
  void dispose() {
    // Unregister the observer when the widget is disposed
    WidgetsBinding.instance.removeObserver(this);
    _searchController.dispose();
    super.dispose();
  }

  /// Refreshes settings from the server
  /// Called when the app is resumed or user navigates back to home page
  Future<void> _refreshSettings() async {
    if (!mounted || isRefreshingSettings) return;
    
    try {
      setState(() => isRefreshingSettings = true);
      
      await settingsService.refreshSettings();
      
      // Reload products to rebuild ProductCards with fresh image URLs
      // This ensures the new Product_Images_Version is applied to all images
      await _initializeProducts();
      
    } catch (e) {
      // Continue with existing settings on error
    } finally {
      if (mounted) {
        setState(() => isRefreshingSettings = false);
      }
    }
  }

  /// Loads the default category from Meteor settings
  /// Falls back to 'All' if Meteor setting is not configured
  Future<void> _initializeDefaultCategory() async {
    try {
      final defaultCategory = await settingsService.getDefaultCategory();
      // Validate the default category exists
      if (defaultCategory.isNotEmpty && 
          (defaultCategory == 'All' || 
           ProductConstants.productTypeName.containsKey(defaultCategory))) {
        if (mounted) {
          setState(() => selectedCategory = defaultCategory);
        }
      }
    } catch (e) {
      // Fall back to 'All' if there's an error
    }
  }

  Future<void> _initializeProducts() async {
    if (isLoading) return;
    
    setState(() => isLoading = true);
    
    try {
      await productService.connect();
      
      final fetchedProducts = await productService.fetchProducts();
      
      // Load default category from settings
      final defaultCategory = await settingsService.getDefaultCategory();
      
      if (mounted) {
        setState(() {
          products = fetchedProducts;
          // Categories always use the product constants (fixed set of categories)
          categories = ['All', ...ProductConstants.getAllCategories()];
          // Use default from settings if it's valid, otherwise default to 'All'
          if (defaultCategory.isNotEmpty && 
              (defaultCategory == 'All' || 
               ProductConstants.productTypeName.containsKey(defaultCategory))) {
            selectedCategory = defaultCategory;
          } else {
            selectedCategory = 'All';
          }
          // Store the product list update timestamp
          productListUpdatedAt = productService.lastProductListUpdatedAt;
          errorMessage = null;
        });
      }
    } catch (e) {
      if (mounted) {
        final errorMsg = e.toString();
        
        // Check if it's the "no products available" message
        if (errorMsg.contains('No products available today')) {
          setState(() {
            errorMessage = 'No products available today. Please check back later.';
          });
          // Don't show SnackBar for "no products" - the white box will display the message
        } else {
          setState(() {
            errorMessage = 'Error loading products: $errorMsg';
          });
          // Show SnackBar only for actual errors
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                errorMessage!,
                textAlign: TextAlign.center,
              ),
              duration: const Duration(seconds: 5),
              backgroundColor: AppColors.accent,
              behavior: SnackBarBehavior.floating,
              margin: const EdgeInsets.all(16),
            ),
          );
        }
      }
    } finally {
      if (mounted) {
        setState(() {
          isLoading = false;
          isInitialLoad = false;
        });
      }
    }
  }

  /// Formats a DateTime to display format: "MM/DD/YYYY, HH:MM:SS AM/PM"
  /// Example: "12/23/2025, 5:15:47 PM"
  String _formatDateTime(DateTime dateTime) {
    final localDateTime = dateTime.toLocal();
    final month = localDateTime.month.toString().padLeft(2, '0');
    final day = localDateTime.day.toString().padLeft(2, '0');
    final year = localDateTime.year;
    
    final hour = localDateTime.hour > 12 
        ? (localDateTime.hour - 12).toString().padLeft(2, '0')
        : (localDateTime.hour == 0 ? 12 : localDateTime.hour).toString().padLeft(2, '0');
    final minute = localDateTime.minute.toString().padLeft(2, '0');
    final second = localDateTime.second.toString().padLeft(2, '0');
    final period = localDateTime.hour >= 12 ? 'PM' : 'AM';
    
    return '$month/$day/$year, $hour:$minute:$second $period';
  }

  /// Filters products by search query or selected category.
  /// Only products with availableToOrder=true are displayed.
  /// 
  /// If search query is present, searches across all products (ignores category filter).
  /// Otherwise, filters by the selected category's 'name' field (used in MongoDB).
  List<Product> getFilteredProducts() {
    // Debug: Log all products and their availableToOrder status
    for (final product in products.take(5)) {
    }
    
    // Filter to only include products available for ordering
    final availableProducts = products
        .where((product) => product.availableToOrder)
        .toList();
    
    
    // If search query is present, search across available products
    if (searchQuery.trim().isNotEmpty) {
      final results = productService.searchProducts(searchQuery, availableProducts);
      return results;
    }
    
    // Otherwise filter by category
    if (selectedCategory == 'All') {
      return availableProducts;
    }
    
    var filtered = availableProducts
        .where((product) => product.category == selectedCategory)
        .toList();
    
    // Debug: Log actual category values in products
    if (filtered.isEmpty) {
      final actualCategories = products.map((p) => p.category).toSet().toList();
    }
    
    return filtered;
  }

  @override
  Widget build(BuildContext context) {
    
    // Show full-page loading indicator during initial load
    if (isInitialLoad || (products.isEmpty && errorMessage == null)) {
      return BackgroundWidget(
        child: Scaffold(
          appBar: AppBarWithLogo(
            showLeading: true,
            leading: Builder(
              builder: (context) => IconButton(
                icon: const Icon(Icons.menu),
                onPressed: () => Scaffold.of(context).openDrawer(),
              ),
            ),
          ),
          body: const Center(
            child: CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(AppColors.secondary),
            ),
          ),
        ),
      );
    }
    

    final filteredProducts = getFilteredProducts();
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;
    final isTablet = screenWidth >= 600;
    
    // Debug logging
    
    // Check if no products are available (error state)
    final hasNoProductsError = errorMessage != null && 
        errorMessage!.contains('No products available');
    
    // Show sidebar only if we have products available
    final showSidebar = categories.isNotEmpty && !hasNoProductsError;
    
    // Debug logging for timestamp display condition

    return BackgroundWidget(
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
          actions: [
            Padding(
              padding: const EdgeInsets.only(right: 8.0),
              child: Consumer<CartProvider>(
                builder: (context, cartProvider, child) {
                  return Stack(
                    alignment: Alignment.center,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.shopping_bag),
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const CartScreen()),
                          );
                        },
                      ),
                      if (cartProvider.itemCount > 0)
                        Positioned(
                          top: 8,
                          right: 2,
                          child: Container(
                            padding: const EdgeInsets.all(2),
                            decoration: BoxDecoration(
                              color: Colors.red,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            constraints: const BoxConstraints(
                              minWidth: 18,
                              minHeight: 18,
                            ),
                            child: Text(
                              '${cartProvider.itemCount}',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ),
                    ],
                  );
                },
              ),
            ),
          ],
        ),
        body: Column(
        children: [
          if (isLoading)
            const LinearProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(AppColors.secondary),
            )
          else
            const SizedBox(height: 0),
          // Display product list last updated timestamp
          if (productListUpdatedAt != null && !hasNoProductsError)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              color: AppColors.primary.withOpacity(0),
              child: Text(
                'Product list last updated: ${_formatDateTime(productListUpdatedAt!)}',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ),
          // Search bar for product search
          if (!hasNoProductsError)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              color: const Color(0xFFfaf4ef),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _searchController,
                      onChanged: (value) {
                        setState(() {
                          searchQuery = value;
                          // When search query is entered, highlight 'All' category
                          if (value.trim().isNotEmpty) {
                            selectedCategory = 'All';
                          }
                        });
                      },
                      decoration: InputDecoration(
                        hintText: "Search for 'Kullakar Rice' or 'Bansi Wheat",
                        hintStyle: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                        filled: true,
                        fillColor: Colors.white,
                        border: OutlineInputBorder(
                          borderRadius: const BorderRadius.only(
                            topLeft: Radius.circular(4),
                            bottomLeft: Radius.circular(4),
                            topRight: Radius.circular(0),
                            bottomRight: Radius.circular(0),
                          ),
                        ),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 11),
                        isDense: true,
                      ),
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                   ),
                    // Clear button with dark red color
                    Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: const Color(0xFF8B3A3A), // Dark red color
                      borderRadius: const BorderRadius.only(
                        topRight: Radius.circular(4),
                        bottomRight: Radius.circular(4),
                        topLeft: Radius.circular(0),
                        bottomLeft: Radius.circular(0),
                      ),
                      border: const Border(
                        top: BorderSide(color: Colors.grey),
                        right: BorderSide(color: Colors.grey),
                        bottom: BorderSide(color: Colors.grey),
                      ),
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.close, color: Colors.white),
                      onPressed: () {
                        _searchController.clear();
                        setState(() => searchQuery = '');
                      },
                      padding: EdgeInsets.zero,
                      iconSize: 20,
                    ),
                  ),
                ],
              ),
            ),
          // Note: Horizontal filter bar removed in favor of always-visible sidebar
          Expanded(
            child: hasNoProductsError
                ? Align(
                    alignment: Alignment.topCenter,
                    child: Container(
                      margin: const EdgeInsets.only(top: 48, left: 24, right: 24),
                      padding: const EdgeInsets.all(32),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.shopping_bag_outlined,
                            size: 64,
                            color: AppColors.primary.withOpacity(0.5),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'No products available today.',
                            style: Theme.of(context)
                                .textTheme
                                .headlineSmall
                                ?.copyWith(
                                  fontWeight: FontWeight.w600,
                                ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Please check back later.',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: AppColors.textSecondary,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  )
                : Row(
                    children: [
                      // Always show sidebar, adjust width based on screen size
                      if (showSidebar)
                        CategorySidebar(
                          categories: categories,
                          selectedCategory: selectedCategory,
                          onCategorySelected: (category) {
                            setState(() {
                              selectedCategory = category;
                              // Clear search when selecting a category other than 'All'
                              if (category != 'All') {
                                _searchController.clear();
                                searchQuery = '';
                              }
                            });
                          },
                          width: isTablet ? 180 : 100,
                          products: products,
                        ),
                      Expanded(
                        child: isLoading
                            ? const Center(
                                child: CircularProgressIndicator(
                                  valueColor: AlwaysStoppedAnimation<Color>(AppColors.secondary),
                                ),
                              )
                            : filteredProducts.isEmpty
                                ? const Center(child: Text('No products available'))
                                : GridView.builder(
                                         padding: const EdgeInsets.fromLTRB(12, 12, 12, 4),
                                         gridDelegate:
                                         const SliverGridDelegateWithFixedCrossAxisCount(
                                       crossAxisCount: 2,
                                       childAspectRatio: 0.75,
                                       crossAxisSpacing: 8,
                                       mainAxisSpacing: 8,
                                     ),
                                    itemCount: filteredProducts.length,
                                    itemBuilder: (context, index) {
                                      final product = filteredProducts[index];
                                      return ProductCard(
                                        product: product,
                                        onAddToCart: () {
                                          // Snackbar handled in ProductCard now
                                        },
                                      );
                                    },
                                  ),
                      ),
                      ],
                    ),
          ),
        ],
      ),
        drawer: const AppMenuDrawer(),
      ),
    );
  }
}
