import 'package:flutter/foundation.dart';
import '../models/product.dart';
import 'meteor_client.dart';

class ProductService {
  static const String baseUrl = 'http://10.0.2.2:3000';
  
  late MeteorClient _meteorClient;
  bool _isConnected = false;
  bool get isConnected => _isConnected;

  ProductService({MeteorClient? meteorClient}) {
    _meteorClient = meteorClient ?? MeteorClient(serverUrl: baseUrl);
  }

  Future<void> connect() async {
    try {
      debugPrint('Connecting to Meteor server at $baseUrl');
      await _meteorClient.connect();
      _isConnected = true;
      debugPrint('Connected to Meteor server');
    } catch (e) {
      debugPrint('Error connecting to Meteor: $e');
      _isConnected = false;
      rethrow;
    }
  }

  Future<void> disconnect() async {
    try {
      debugPrint('Disconnecting from Meteor server');
      await _meteorClient.disconnect();
      _isConnected = false;
    } catch (e) {
      debugPrint('Error disconnecting: $e');
      rethrow;
    }
  }

  /// Fetches products from the active ProductList using the same subscription as the Meteor web client.
  /// 
  /// Logic (matching PlaceNewOrder.js):
  /// 1. Subscribe to 'productOrderList.view' - automatically gets active ProductList for today
  /// 2. Fetch ProductLists collection documents
  /// 3. Extract products array from the first (active) ProductList
  /// 4. Filter by category if specified
  /// 
  /// Throws exception if no active ProductList found for today.
  /// Stores the updatedAt timestamp of the last fetched ProductList
  DateTime? lastProductListUpdatedAt;

  Future<List<Product>> fetchProducts({
    String? category,
    bool availableOnly = true,
  }) async {
    if (!_isConnected) {
      throw Exception('Not connected to Meteor server');
    }

    try {
      debugPrint(
        'Fetching products: category=$category, availableOnly=$availableOnly',
      );

      // Subscribe to the active product list (same as Meteor web client)
      debugPrint('Subscribing to productOrderList.view');
      await _meteorClient.subscribe('productOrderList.view');
      
      await Future.delayed(Duration(milliseconds: 500));
      
      // Get ProductLists from local collection
      final productListDocs = _meteorClient.getCollectionDocuments('ProductLists');
      debugPrint('Received ${productListDocs.length} product list(s) from server');
      
      if (productListDocs.isEmpty) {
        debugPrint('⚠️ No active ProductList available');
        throw Exception('No products available today. Please check back later.');
      }

      // Get the first ProductList (typically the only one for today)
      final activeProductList = productListDocs.first;
      debugPrint('✅ Found active ProductList: ${activeProductList['_id']}');
      
      // Debug: Log all fields in the ProductList
      debugPrint('📋 ProductList fields: ${activeProductList.keys.toList()}');
      debugPrint('📋 Full ProductList data: $activeProductList');

      // Extract and store the updatedAt timestamp
      // Meteor sends dates as EJSON format: {"$date": milliseconds}
      final updatedAt = activeProductList['updatedAt'];
      debugPrint('🕐 Raw updatedAt value: $updatedAt (type: ${updatedAt.runtimeType})');
      if (updatedAt is DateTime) {
        lastProductListUpdatedAt = updatedAt;
      } else if (updatedAt is Map<String, dynamic> && updatedAt.containsKey('\$date')) {
        try {
          final milliseconds = updatedAt['\$date'];
          if (milliseconds is int) {
            lastProductListUpdatedAt = DateTime.fromMillisecondsSinceEpoch(milliseconds);
            debugPrint('✅ Parsed updatedAt from EJSON: $lastProductListUpdatedAt');
          }
        } catch (e) {
          debugPrint('⚠️ Could not parse EJSON updatedAt: $updatedAt, Error: $e');
        }
      } else if (updatedAt is String) {
        try {
          lastProductListUpdatedAt = DateTime.parse(updatedAt);
          debugPrint('✅ Parsed updatedAt from ISO8601 string: $lastProductListUpdatedAt');
        } catch (e) {
          debugPrint('⚠️ Could not parse ISO8601 updatedAt: $updatedAt, Error: $e');
        }
      } else {
        debugPrint('⚠️ updatedAt has unexpected type: ${updatedAt.runtimeType}, value: $updatedAt');
      }

      // Extract products array from ProductList
      final productsList = activeProductList['products'] as List<dynamic>? ?? [];
      debugPrint('✅ Found ${productsList.length} products in active ProductList');
      debugPrint('✅ ProductList updatedAt timestamp: $lastProductListUpdatedAt');
      
      final products = productsList
          .cast<Map<String, dynamic>>()
          .map((doc) => Product.fromJson(doc))
          .toList();
      
      // Filter by category if specified
      if (category != null && category.isNotEmpty && category != 'All') {
        final filtered = products.where((p) => p.category == category).toList();
        debugPrint('   Filtered to ${filtered.length} products in category: $category');
        return filtered;
      }

      return products;
    } catch (e) {
      debugPrint('Error fetching products: $e');
      rethrow;
    }
  }

  List<Product> _generateMockProducts() {
    return [
      Product(
        id: '1',
        name: 'Hyderabadi Biryani',
        description: 'Authentic Hyderabadi biryani with basmati rice',
        price: 250.0,
        category: 'Biryani',
        subcategory: 'Rice',
        imageUrl: '',
        minOrderQuantity: 1,
      ),
      Product(
        id: '2',
        name: 'Chicken Biryani',
        description: 'Tender chicken pieces in aromatic rice',
        price: 280.0,
        category: 'Biryani',
        subcategory: 'Rice',
        imageUrl: '',
        minOrderQuantity: 1,
      ),
      Product(
        id: '3',
        name: 'Masala Dosa',
        description: 'Crispy dosa with potato masala filling',
        price: 80.0,
        category: 'Breakfast',
        subcategory: 'South Indian',
        imageUrl: '',
        minOrderQuantity: 1,
      ),
      Product(
        id: '4',
        name: 'Cheese Dosa',
        description: 'Dosa with melted cheese and vegetables',
        price: 100.0,
        category: 'Breakfast',
        subcategory: 'South Indian',
        imageUrl: '',
        minOrderQuantity: 1,
      ),
      Product(
        id: '5',
        name: 'Steamed Idli',
        description: 'Soft and fluffy steamed idli (3 pieces)',
        price: 60.0,
        category: 'Breakfast',
        subcategory: 'South Indian',
        imageUrl: '',
        minOrderQuantity: 1,
      ),
      Product(
        id: '6',
        name: 'Sambar Idli',
        description: 'Idli served with sambar and chutney',
        price: 90.0,
        category: 'Breakfast',
        subcategory: 'South Indian',
        imageUrl: '',
        minOrderQuantity: 1,
      ),
    ];
  }

  Future<Product?> fetchProductById(String productId) async {
    if (!_isConnected) {
      throw Exception('Not connected to Meteor server');
    }

    try {
      debugPrint('Fetching product: $productId');
      
      final products = _generateMockProducts();
      return products.firstWhere(
        (p) => p.id == productId,
        orElse: () => throw Exception('Product not found'),
      );
    } catch (e) {
      debugPrint('Error fetching product by ID: $e');
      rethrow;
    }
  }

  Future<List<String>> fetchCategories() async {
    if (!_isConnected) {
      throw Exception('Not connected to Meteor server');
    }

    try {
      final products = _generateMockProducts();
      final categories = <String>{};
      
      for (final product in products) {
        categories.add(product.category);
      }

      return ['All', ...categories.toList()..sort()];
    } catch (e) {
      debugPrint('Error fetching categories: $e');
      rethrow;
    }
  }

  /// Searches products by name and description (case-insensitive).
  /// Returns a filtered list of products that match the search query.
  /// 
  /// [query] - The search string (will be trimmed and lowercased)
  /// [products] - List of products to search within
  /// 
  /// Returns products where name or description contains the query string.
  List<Product> searchProducts(String query, List<Product> products) {
    if (query.trim().isEmpty) {
      return products;
    }

    final lowerQuery = query.toLowerCase().trim();
    debugPrint('Searching products for: "$lowerQuery"');

    final results = products.where((product) {
      final nameMatch = product.name.toLowerCase().contains(lowerQuery);
      final descriptionMatch = product.description?.toLowerCase().contains(lowerQuery) ?? false;
      return nameMatch || descriptionMatch;
    }).toList();

    debugPrint('Search results: ${results.length} products found');
    return results;
  }
}
