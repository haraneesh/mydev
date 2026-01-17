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
      await _meteorClient.connect();
      _isConnected = true;
    } catch (e) {
      _isConnected = false;
      rethrow;
    }
  }

  Future<void> disconnect() async {
    try {
      await _meteorClient.disconnect();
      _isConnected = false;
    } catch (e) {
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
      // Subscribe to the active product list (same as Meteor web client)
      await _meteorClient.subscribe('productOrderList.view');
      
      await Future.delayed(Duration(milliseconds: 500));
      
      // Get ProductLists from local collection
      final productListDocs = _meteorClient.getCollectionDocuments('ProductLists');
      
      if (productListDocs.isEmpty) {
        throw Exception('No products available today. Please check back later.');
      }

      // Get the first ProductList (typically the only one for today)
      final activeProductList = productListDocs.first;
      
      // Debug: Log all fields in the ProductList

      // Extract and store the updatedAt timestamp
      // Meteor sends dates as EJSON format: {"$date": milliseconds}
      final updatedAt = activeProductList['updatedAt'];
      if (updatedAt is DateTime) {
        lastProductListUpdatedAt = updatedAt;
      } else if (updatedAt is Map<String, dynamic> && updatedAt.containsKey('\$date')) {
        try {
          final milliseconds = updatedAt['\$date'];
          if (milliseconds is int) {
            lastProductListUpdatedAt = DateTime.fromMillisecondsSinceEpoch(milliseconds);
          }
        } catch (e) {
        }
      } else if (updatedAt is String) {
        try {
          lastProductListUpdatedAt = DateTime.parse(updatedAt);
        } catch (e) {
        }
      } else {
      }

      // Extract products array from ProductList
      final productsList = activeProductList['products'] as List<dynamic>? ?? [];
      
      final products = productsList
          .cast<Map<String, dynamic>>()
          .map((doc) => Product.fromJson(doc))
          .toList();
      
      // Filter by category if specified
      if (category != null && category.isNotEmpty && category != 'All') {
        final filtered = products.where((p) => p.category == category).toList();
        return filtered;
      }

      return products;
    } catch (e) {
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
      
      final products = _generateMockProducts();
      return products.firstWhere(
        (p) => p.id == productId,
        orElse: () => throw Exception('Product not found'),
      );
    } catch (e) {
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

    final results = products.where((product) {
      final nameMatch = product.name.toLowerCase().contains(lowerQuery);
      final descriptionMatch = product.description?.toLowerCase().contains(lowerQuery) ?? false;
      return nameMatch || descriptionMatch;
    }).toList();

    return results;
  }
}
