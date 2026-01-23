import 'package:flutter/foundation.dart';
import 'settings_service.dart';

/// Service for managing Paytm configuration
/// 
/// Fetches and caches Paytm settings from Meteor at runtime
class PaytmConfigService {
  static final PaytmConfigService _instance = PaytmConfigService._internal();

  factory PaytmConfigService() {
    return _instance;
  }

  PaytmConfigService._internal();

  static PaytmConfigService get instance => _instance;

  final _settingsService = SettingsService.instance;
  Map<String, dynamic>? _cachedConfig;
  bool _isFetching = false;

  /// Fetch Paytm configuration from Meteor settings
  /// 
  /// Caches result after first fetch to minimize network calls
  Future<Map<String, dynamic>> fetchPaytmConfig() async {
    // Return cached config if available
    if (_cachedConfig != null) {
      return _cachedConfig!;
    }

    // Prevent multiple concurrent fetches
    if (_isFetching) {
      // Wait a bit for the first fetch to complete
      await Future.delayed(const Duration(milliseconds: 500));
      if (_cachedConfig != null) {
        return _cachedConfig!;
      }
    }

    _isFetching = true;

    try {
      // Fetch from SettingsService which calls getPublicSettings()
      final settings = await _settingsService.getPublicSettings();

      // Extract Paytm configuration
      _cachedConfig = {
        'merchantId': settings['PayTM']?['merchantId'] ?? '',
        'hostName': settings['PayTM']?['hostName'] ?? '',
        'callbackUrl': settings['PayTM']?['callbackUrl'] ?? '',
        'websiteName': settings['PayTM']?['websiteName'] ?? '',
      };

      if (kDebugMode) {
        print('Paytm config loaded: $_cachedConfig');
      }

      return _cachedConfig!;
    } catch (e) {
      if (kDebugMode) {
        print('Error fetching Paytm config: $e');
      }

      // Return mock settings for testing/fallback
      _cachedConfig = {
        'merchantId': 'TESTING123',
        'hostName': 'securegw-stage.paytm.in',
        'callbackUrl': 'https://example.com/callback',
        'websiteName': 'DEFAULT',
        'isMock': true,
      };

      return _cachedConfig!;
    } finally {
      _isFetching = false;
    }
  }

  /// Validate that all required Paytm settings are present
  /// 
  /// Returns true if configuration is valid and usable
  bool validateConfiguration(Map<String, dynamic> config) {
    final required = ['merchantId', 'hostName'];
    
    for (final key in required) {
      final value = config[key];
      if (value == null || (value is String && value.isEmpty)) {
        if (kDebugMode) {
          print('Missing required Paytm setting: $key');
        }
        return false;
      }
    }

    return true;
  }

  /// Clear cached configuration
  /// 
  /// Use to force reload from server on next access
  void clearCache() {
    _cachedConfig = null;
  }

  /// Get specific Paytm setting
  /// 
  /// Returns null if not found
  String? getSetting(String key) {
    if (_cachedConfig == null) {
      return null;
    }
    return _cachedConfig![key]?.toString();
  }

  /// Check if using mock configuration (for testing)
  bool get isMockConfig => _cachedConfig?['isMock'] == true;

  /// Get merchant ID
  String? get merchantId => getSetting('merchantId');

  /// Get host name
  String? get hostName => getSetting('hostName');

  /// Get callback URL
  String? get callbackUrl => getSetting('callbackUrl');

  /// Get website name
  String? get websiteName => getSetting('websiteName');
}
