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

  Future<List<Product>> fetchProducts({
    String? category,
    bool availableOnly = true,
  }) async {
    if (!_isConnected) {
      throw Exception('Not connected to Meteor server');
    }

    try {
      debugPrint(
        'Fetching products from Meteor: category=$category, availableOnly=$availableOnly',
      );

      final params = <String, dynamic>{};
      if (category != null && category.isNotEmpty && category != 'All') {
        params['category'] = category;
      }
      if (availableOnly) {
        params['availableOnly'] = true;
      }

      debugPrint('Subscribing to products.list');
      await _meteorClient.subscribe('products.list');
      
      await Future.delayed(Duration(milliseconds: 500));
      
      final documents = _meteorClient.getCollectionDocuments('Products');
      debugPrint('Received ${documents.length} products from Meteor server');
      
      if (documents.isEmpty) {
        debugPrint('⚠️ No products from server, using mock data as fallback');
        debugPrint('Available collections: ${_meteorClient.collections.keys.toList()}');
        return _generateMockProducts();
      }

      debugPrint('✅ Using ${documents.length} real products from Meteor server');
      final products = documents
          .map((doc) => Product.fromJson(doc))
          .toList();
      
      if (category != null && category.isNotEmpty && category != 'All') {
        return products.where((p) => p.category == category).toList();
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
}
