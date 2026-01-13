import 'package:flutter/foundation.dart';
import 'meteor_client.dart';

/// Service for accessing Meteor public settings
class SettingsService {
  late MeteorClient _meteorClient;
  Map<String, dynamic>? _cachedSettings;

  SettingsService({MeteorClient? meteorClient}) {
    _meteorClient = meteorClient ?? MeteorClient(serverUrl: 'http://10.0.2.2:3000');
  }

  void setMeteorClient(MeteorClient client) {
    _meteorClient = client;
    _cachedSettings = null;
  }

  /// Fetches public settings from the Meteor server
  /// Settings are cached after the first fetch to avoid repeated requests
  Future<Map<String, dynamic>> getPublicSettings() async {
    if (_cachedSettings != null) {
      debugPrint('Returning cached settings');
      return _cachedSettings!;
    }

    try {
      debugPrint('Fetching public settings from Meteor server');
      
      // Attempt to call the Meteor method to get public settings
      try {
        debugPrint('🔌 Attempting to call Meteor method: getPublicSettings');
        
        // Ensure MeteorClient is connected before calling methods
        if (!_meteorClient.isConnected) {
          debugPrint('📡 MeteorClient not connected, attempting to connect...');
          await _meteorClient.connect();
          debugPrint('✅ MeteorClient connected');
        }
        
        final result = await _meteorClient.call('getPublicSettings', []);
        if (result is Map<String, dynamic>) {
          _cachedSettings = result;
          debugPrint('✅ Settings loaded from Meteor server');
          debugPrint('   Product_Images: ${_cachedSettings!['Product_Images'] ?? "NOT SET"}');
          debugPrint('   Product_Images_Version: ${_cachedSettings!['Product_Images_Version'] ?? "NOT SET"}');
          return _cachedSettings!;
        }
      } catch (methodError) {
        debugPrint('⚠️ Meteor method call failed: $methodError');
        debugPrint('   This could mean: MeteorClient not connected, method not registered, or network error');
      }
      
      // Fallback: Return mock settings
      debugPrint('⚠️ Using mock settings as fallback (not from Meteor server)');
      debugPrint('   This fallback will be used if Meteor method call fails');
      _cachedSettings = _generateMockSettings();
      debugPrint('   Fallback Product_Images: ${_cachedSettings!['Product_Images']}');
      
      debugPrint('Settings loaded: $_cachedSettings');
      return _cachedSettings!;
    } catch (e) {
      debugPrint('Error fetching settings: $e');
      return _generateMockSettings();
    }
  }

  /// Gets the minimum cart order amount from settings
  /// Reads from CART_ORDER.MINIMUM_ORDER_AMT in Meteor settings
  /// Falls back to 1000 if not configured
  Future<double> getMinimumOrderAmount() async {
    try {
      final settings = await getPublicSettings();
      
      // Navigate through CART_ORDER -> MINIMUM_ORDER_AMT
      final cartOrderConfig = settings['CART_ORDER'] as Map<String, dynamic>?;
      if (cartOrderConfig != null) {
        final minimumAmount = cartOrderConfig['MINIMUM_ORDER_AMT'];
        if (minimumAmount != null) {
          final amount = (minimumAmount is int) ? minimumAmount.toDouble() : minimumAmount as double;
          debugPrint('Using minimum order amount from settings: $amount');
          return amount;
        }
      }
      
      debugPrint('MINIMUM_ORDER_AMT not configured, using fallback: 1000.0');
      return 1000.0;
    } catch (e) {
      debugPrint('Error getting minimum order amount: $e');
      return 1000.0;
    }
  }

  /// Gets the minimum cart order message from settings
  /// Reads from CART_ORDER.MINIMUMCART_ORDER_MSG in Meteor settings
  /// Falls back to default message if not configured
  Future<String> getMinimumOrderMessage() async {
    try {
      final settings = await getPublicSettings();
      
      // Navigate through CART_ORDER -> MINIMUMCART_ORDER_MSG
      final cartOrderConfig = settings['CART_ORDER'] as Map<String, dynamic>?;
      if (cartOrderConfig != null) {
        final message = cartOrderConfig['MINIMUMCART_ORDER_MSG'] as String?;
        if (message != null && message.isNotEmpty) {
          debugPrint('Using minimum order message from settings');
          return message;
        }
      }
      
      const defaultMessage = 'Due to an increase in delivery costs, a delivery charge will apply to orders with a total value of less than Rs 1000.';
      debugPrint('MINIMUMCART_ORDER_MSG not configured, using default message');
      return defaultMessage;
    } catch (e) {
      debugPrint('Error getting minimum order message: $e');
      return 'Due to an increase in delivery costs, a delivery charge will apply to orders with a total value of less than Rs 1000.';
    }
  }

  /// Gets the default category to open on the home page
  /// Reads from PRODUCT_ORDER.PAGE_TO_OPEN_DEFAULT in Meteor settings
  /// Falls back to 'All' if not configured
  Future<String> getDefaultCategory() async {
    try {
      final settings = await getPublicSettings();
      
      // Navigate through PRODUCT_ORDER -> PAGE_TO_OPEN_DEFAULT
      final productOrderConfig = settings['PRODUCT_ORDER'] as Map<String, dynamic>?;
      if (productOrderConfig != null) {
        final defaultCategory = productOrderConfig['PAGE_TO_OPEN_DEFAULT'] as String?;
        if (defaultCategory != null && defaultCategory.isNotEmpty) {
          debugPrint('Using default category from settings: $defaultCategory');
          return defaultCategory;
        }
      }
      
      debugPrint('PAGE_TO_OPEN_DEFAULT not configured, using fallback: All');
      return 'All';
    } catch (e) {
      debugPrint('Error getting default category: $e');
      return 'All';
    }
  }

  /// Gets the product images base URL from settings
  /// Reads from Product_Images in Meteor settings
  /// Falls back to empty string if not configured
  Future<String> getProductImagesUrl() async {
    try {
      final settings = await getPublicSettings();
      final productImagesUrl = settings['Product_Images'] as String?;
      if (productImagesUrl != null && productImagesUrl.isNotEmpty) {
        debugPrint('Using product images URL from settings: $productImagesUrl');
        return productImagesUrl;
      }
      
      debugPrint('Product_Images not configured in settings');
      return '';
    } catch (e) {
      debugPrint('Error getting product images URL: $e');
      return '';
    }
  }

  /// Gets the product images version query parameter from settings
  /// Reads from Product_Images_Version in Meteor settings
  /// Falls back to empty string if not configured
  Future<String> getProductImagesVersion() async {
    try {
      final settings = await getPublicSettings();
      debugPrint('🔍 Raw settings object: $settings');
      final productImagesVersion = settings['Product_Images_Version'] as String?;
      debugPrint('📌 Product_Images_Version value from settings: $productImagesVersion (type: ${productImagesVersion.runtimeType})');
      
      if (productImagesVersion != null && productImagesVersion.isNotEmpty) {
        debugPrint('✅ Using product images version from settings: $productImagesVersion');
        return productImagesVersion;
      }
      
      debugPrint('⚠️ Product_Images_Version not configured in settings or is empty');
      return '';
    } catch (e) {
      debugPrint('❌ Error getting product images version: $e');
      return '';
    }
  }

  /// Builds the complete product image URL
  /// Format: Product_Images + "/" + imageName + "?" + Product_Images_Version
  /// Example: https://storage.googleapis.com/suvai_images_20/tomato.jpg?v2
  Future<String> buildProductImageUrl(String imageName) async {
    if (imageName.isEmpty) {
      return '';
    }

    try {
      debugPrint('🖼️ [buildProductImageUrl] Starting URL construction for: $imageName');
      var baseUrl = await getProductImagesUrl();
      debugPrint('🖼️ [buildProductImageUrl] Got baseUrl: $baseUrl');
      
      final version = await getProductImagesVersion();
      debugPrint('🖼️ [buildProductImageUrl] Got version: $version');
      
      if (baseUrl.isEmpty) {
        debugPrint('❌ Cannot build image URL: base URL is empty');
        return '';
      }
      
      // Normalize: remove trailing slashes from baseUrl
      while (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.substring(0, baseUrl.length - 1);
      }
      
      // Normalize: remove leading slashes from imageName
      var cleanImageName = imageName;
      while (cleanImageName.startsWith('/')) {
        cleanImageName = cleanImageName.substring(1);
      }
      
      debugPrint('🔗 [buildProductImageUrl] Building URL with: baseUrl=$baseUrl, imageName=$cleanImageName, version=$version');
      
      // Build URL with version query parameter if available
      String imageUrl;
      if (version.isNotEmpty) {
        imageUrl = '$baseUrl/$cleanImageName?$version';
      } else {
        imageUrl = '$baseUrl/$cleanImageName';
      }
      
      debugPrint('✅ [buildProductImageUrl] Final image URL: $imageUrl');
      return imageUrl;
    } catch (e) {
      debugPrint('❌ [buildProductImageUrl] Error building product image URL: $e');
      return '';
    }
  }

  /// Generates mock settings for development/testing
  /// This matches the expected structure of the actual Meteor settings
  static Map<String, dynamic> _generateMockSettings() {
    return {
      'PRODUCT_ORDER': {
        'PAGE_TO_OPEN_DEFAULT': 'All',
        'ENABLE_FAVORITES': true,
        'ENABLE_REVIEWS': true,
      },
      'PAYMENT': {
        'ENABLED_METHODS': ['CASH', 'ONLINE'],
        'ONLINE_GATEWAY': 'RAZORPAY',
      },
      'DELIVERY': {
        'MIN_ORDER_VALUE': 100,
        'DELIVERY_CHARGE': 50,
      },
      'CART_ORDER': {
        'MINIMUM_ORDER_AMT': 1000,
        'MINIMUMCART_ORDER_MSG': 'Due to an increase in delivery costs, a delivery charge will apply to orders with a total value of less than Rs 1000.',
      },
      'Product_Images': 'https://storage.googleapis.com/suvai_images_20/',
      'Product_Images_Version': 'v999999',
    };
  }

  /// Clears the cached settings, forcing a fresh fetch on next call
  void clearCache() {
    _cachedSettings = null;
    debugPrint('Settings cache cleared');
  }

  /// Refreshes settings from the server by clearing cache and fetching fresh data
  /// This ensures the latest settings are always retrieved
  Future<Map<String, dynamic>> refreshSettings() async {
    debugPrint('🔄 Refreshing settings from server');
    clearCache();
    return await getPublicSettings();
  }
}
