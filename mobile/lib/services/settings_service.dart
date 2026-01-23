import 'package:flutter/foundation.dart';
import 'meteor_client.dart';

/// Service for accessing Meteor public settings
class SettingsService {
  static final SettingsService _instance = SettingsService._internal();

  factory SettingsService() {
    return _instance;
  }

  SettingsService._internal();

  static SettingsService get instance => _instance;

  late MeteorClient _meteorClient = MeteorClient.instance;
  Map<String, dynamic>? _cachedSettings;

  void setMeteorClient(MeteorClient client) {
    _meteorClient = client;
    _cachedSettings = null;
  }

  /// Fetches public settings from the Meteor server
  /// Settings are cached after the first fetch to avoid repeated requests
  Future<Map<String, dynamic>> getPublicSettings() async {
    if (_cachedSettings != null) {
      return _cachedSettings!;
    }

    try {
      
      // Attempt to call the Meteor method to get public settings
      try {
        
        // Ensure MeteorClient is connected before calling methods
        if (!_meteorClient.isConnected) {
          await _meteorClient.connect();
        }
        
        final result = await _meteorClient.call('getPublicSettings', []);
        if (result is Map<String, dynamic>) {
          _cachedSettings = result;
          return _cachedSettings!;
        }
      } catch (methodError) {
      }
      
      // Fallback: Return mock settings
      _cachedSettings = _generateMockSettings();
      
      return _cachedSettings!;
    } catch (e) {
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
          return amount;
        }
      }
      
      return 1000.0;
    } catch (e) {
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
          return message;
        }
      }
      
      const defaultMessage = 'Due to an increase in delivery costs, a delivery charge will apply to orders with a total value of less than ₹1000.';
      return defaultMessage;
    } catch (e) {
      return 'Due to an increase in delivery costs, a delivery charge will apply to orders with a total value of less than ₹1000.';
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
          return defaultCategory;
        }
      }
      
      return 'All';
    } catch (e) {
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
        return productImagesUrl;
      }
      
      return '';
    } catch (e) {
      return '';
    }
  }

  /// Gets the product images version query parameter from settings
  /// Reads from Product_Images_Version in Meteor settings
  /// Falls back to empty string if not configured
  Future<String> getProductImagesVersion() async {
    try {
      final settings = await getPublicSettings();
      final productImagesVersion = settings['Product_Images_Version'] as String?;
      
      if (productImagesVersion != null && productImagesVersion.isNotEmpty) {
        return productImagesVersion;
      }
      
      return '';
    } catch (e) {
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
      var baseUrl = await getProductImagesUrl();
      
      final version = await getProductImagesVersion();
      
      if (baseUrl.isEmpty) {
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
      
      
      // Build URL with version query parameter if available
      String imageUrl;
      if (version.isNotEmpty) {
        imageUrl = '$baseUrl/$cleanImageName?$version';
      } else {
        imageUrl = '$baseUrl/$cleanImageName';
      }
      
      return imageUrl;
    } catch (e) {
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
        'MINIMUMCART_ORDER_MSG': 'Due to an increase in delivery costs, a delivery charge will apply to orders with a total value of less than ₹1000.',
      },
      'PayTM': {
        'merchantId': 'TESTING123',
        'hostName': 'securegw-stage.paytm.in',
        'callbackUrl': 'https://example.com/callback',
        'websiteName': 'DEFAULT',
      },
      'Product_Images': 'https://storage.googleapis.com/suvai_images_20/',
      'Product_Images_Version': 'v999999',
    };
  }

  /// Clears the cached settings, forcing a fresh fetch on next call
  void clearCache() {
    _cachedSettings = null;
  }

  /// Refreshes settings from the server by clearing cache and fetching fresh data
  /// This ensures the latest settings are always retrieved
  Future<Map<String, dynamic>> refreshSettings() async {
    clearCache();
    return await getPublicSettings();
  }
}
