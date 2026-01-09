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
      
      // For now, return mock settings since DDP is not fully implemented
      // In production, this would call: await _meteorClient.call('getPublicSettings', [])
      _cachedSettings = _generateMockSettings();
      
      debugPrint('Settings loaded: $_cachedSettings');
      return _cachedSettings!;
    } catch (e) {
      debugPrint('Error fetching settings: $e');
      return _generateMockSettings();
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
    };
  }

  /// Clears the cached settings, forcing a fresh fetch on next call
  void clearCache() {
    _cachedSettings = null;
    debugPrint('Settings cache cleared');
  }
}
