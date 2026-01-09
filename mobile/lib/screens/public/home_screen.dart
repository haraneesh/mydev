import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../models/product.dart';
import '../../providers/cart_provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/product_service.dart';
import '../../services/settings_service.dart';
import '../../widgets/product_card.dart';
import '../../widgets/app_bar_with_logo.dart';
import '../../widgets/background_widget.dart';
import '../../widgets/category_sidebar.dart';
import 'cart_screen.dart';
import 'user_profile_screen.dart';

class HomeScreen extends StatefulWidget {
  final List<Product>? initialProducts;

  const HomeScreen({
    this.initialProducts,
    super.key,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late String selectedCategory;
  late List<String> categories;
  late List<Product> products;
  late ProductService productService;
  late SettingsService settingsService;
  bool isLoading = false;
  String? errorMessage;

  @override
  void initState() {
    super.initState();
    selectedCategory = 'All';
    products = widget.initialProducts ?? [];
    productService = ProductService();
    settingsService = SettingsService();
    categories = ['All']; // Initialize with default
    
    if (widget.initialProducts != null) {
      categories = _extractCategoriesFromProducts(products);
      _initializeDefaultCategory();
    } else {
      _initializeProducts();
    }
  }

  /// Loads the default category from Meteor settings
  Future<void> _initializeDefaultCategory() async {
    try {
      final defaultCategory = await settingsService.getDefaultCategory();
      if (mounted) {
        setState(() => selectedCategory = defaultCategory);
      }
    } catch (e) {
      debugPrint('Error loading default category: $e');
      // Fall back to 'All' if there's an error
    }
  }

  List<String> _extractCategoriesFromProducts(List<Product> prods) {
    final categorySet = <String>{'All'};
    for (final product in prods) {
      categorySet.add(product.category);
    }
    return categorySet.toList()..sort();
  }

  Future<void> _initializeProducts() async {
    if (isLoading) return;
    
    setState(() => isLoading = true);
    
    try {
      await productService.connect();
      final fetchedProducts = await productService.fetchProducts();
      final fetchedCategories = await productService.fetchCategories();
      
      // Load default category from settings
      final defaultCategory = await settingsService.getDefaultCategory();
      
      if (mounted) {
        setState(() {
          products = fetchedProducts;
          categories = fetchedCategories;
          selectedCategory = defaultCategory;
          errorMessage = null;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          errorMessage = 'Error loading products: ${e.toString()}';
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              errorMessage!,
              textAlign: TextAlign.center,
            ),
            duration: const Duration(seconds: 3),
            backgroundColor: AppColors.accent,
            behavior: SnackBarBehavior.floating,
            margin: const EdgeInsets.all(16),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => isLoading = false);
      }
    }
  }

  List<Product> getFilteredProducts() {
    if (selectedCategory == 'All') {
      return products;
    }
    return products
        .where((product) => product.category == selectedCategory)
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    final filteredProducts = getFilteredProducts();
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;
    final isTablet = screenWidth >= 600;
    
    // Debug logging
    debugPrint('HomeScreen build - Width: $screenWidth, Height: $screenHeight, isTablet: $isTablet');
    debugPrint('HomeScreen build - Categories: $categories, Selected: $selectedCategory');
    
    // Show sidebar on all screen sizes for consistent navigation
    final showSidebar = categories.isNotEmpty;

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
          Consumer<CartProvider>(
            builder: (context, cartProvider, child) {
              return Stack(
                alignment: Alignment.center,
                children: [
                  IconButton(
                    icon: const Icon(Icons.shopping_cart),
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
                      right: 8,
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
          // Note: Horizontal filter bar removed in favor of always-visible sidebar
          Expanded(
            child: Row(
              children: [
                // Always show sidebar, adjust width based on screen size
                if (showSidebar)
                  CategorySidebar(
                    categories: categories,
                    selectedCategory: selectedCategory,
                    onCategorySelected: (category) {
                      setState(() => selectedCategory = category);
                    },
                    width: isTablet ? 180 : 100,
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
                              padding: const EdgeInsets.all(16),
                              gridDelegate:
                                  const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                childAspectRatio: 0.75,
                                crossAxisSpacing: 16,
                                mainAxisSpacing: 16,
                              ),
                              itemCount: filteredProducts.length,
                              itemBuilder: (context, index) {
                                final product = filteredProducts[index];
                                return ProductCard(
                                  product: product,
                                  onAddToCart: () {
                                    context.read<CartProvider>().addItem(product, 1);
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text('${product.name} added to cart'),
                                        duration: const Duration(seconds: 2),
                                        backgroundColor: AppColors.success,
                                      ),
                                    );
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
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.shopping_cart),
              title: const Text('Cart'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const CartScreen()),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.person),
              title: const Text('Profile'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const UserProfileScreen()),
                );
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
          ),
          );
          }
          }
