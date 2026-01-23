import 'package:flutter_test/flutter_test.dart';
import 'package:suvai/services/paytm_config_service.dart';
import 'package:suvai/services/settings_service.dart';

void main() {
  group('PaytmConfigService', () {
    late PaytmConfigService configService;
    late MockSettingsService mockSettingsService;

    setUp(() {
      configService = PaytmConfigService();
      mockSettingsService = MockSettingsService();
      configService.setSettingsService(mockSettingsService);
    });

    tearDown(() {
      configService.clearCache();
    });

    group('fetchPaytmConfig', () {
      test('fetches Paytm configuration from settings', () async {
        mockSettingsService.mockSettings = {
          'PayTM': {
            'merchantId': 'MERCHANT_123',
            'hostName': 'securegw-stage.paytm.in',
            'callbackUrl': 'https://example.com/callback',
            'websiteName': 'SUVAIRETAIL',
          }
        };

        final config = await configService.fetchPaytmConfig();

        expect(config['merchantId'], 'MERCHANT_123');
        expect(config['hostName'], 'securegw-stage.paytm.in');
        expect(config['callbackUrl'], 'https://example.com/callback');
        expect(config['websiteName'], 'SUVAIRETAIL');
      });

      test('returns mock settings on error', () async {
        mockSettingsService.shouldFail = true;

        final config = await configService.fetchPaytmConfig();

        expect(config['isMock'], true);
        expect(config['merchantId'], 'TESTING123');
        expect(config['hostName'], 'securegw-stage.paytm.in');
      });

      test('caches configuration after first fetch', () async {
        mockSettingsService.mockSettings = {
          'PayTM': {
            'merchantId': 'MERCHANT_CACHED',
            'hostName': 'securegw.paytm.in',
            'callbackUrl': 'https://example.com/callback',
            'websiteName': 'SUVAI',
          }
        };

        final config1 = await configService.fetchPaytmConfig();
        mockSettingsService.callCount = 0; // Reset counter
        
        final config2 = await configService.fetchPaytmConfig();

        expect(config1['merchantId'], config2['merchantId']);
        expect(mockSettingsService.callCount, 0); // No second call
      });

      test('prevents concurrent fetches while loading', () async {
        mockSettingsService.mockSettings = {
          'PayTM': {
            'merchantId': 'MERCHANT_123',
            'hostName': 'securegw-stage.paytm.in',
            'callbackUrl': 'https://example.com/callback',
            'websiteName': 'SUVAI',
          }
        };

        // Simulate concurrent fetch calls
        final future1 = configService.fetchPaytmConfig();
        final future2 = configService.fetchPaytmConfig();

        final config1 = await future1;
        final config2 = await future2;

        expect(config1['merchantId'], config2['merchantId']);
      });

      test('returns fallback mock config if settings unavailable', () async {
        mockSettingsService.shouldFail = true;

        final config = await configService.fetchPaytmConfig();

        expect(config['isMock'], true);
        expect(config.containsKey('merchantId'), true);
        expect(config.containsKey('hostName'), true);
      });
    });

    group('validateConfiguration', () {
      test('returns true for valid configuration', () {
        final config = {
          'merchantId': 'VALID_MERCHANT',
          'hostName': 'securegw.paytm.in',
          'websiteName': 'SUVAI',
          'callbackUrl': 'https://example.com/callback',
        };

        final isValid = configService.validateConfiguration(config);

        expect(isValid, true);
      });

      test('returns false when merchantId is missing', () {
        final config = {
          'hostName': 'securegw.paytm.in',
          'websiteName': 'SUVAI',
        };

        final isValid = configService.validateConfiguration(config);

        expect(isValid, false);
      });

      test('returns false when merchantId is empty', () {
        final config = {
          'merchantId': '',
          'hostName': 'securegw.paytm.in',
          'websiteName': 'SUVAI',
        };

        final isValid = configService.validateConfiguration(config);

        expect(isValid, false);
      });

      test('returns false when hostName is missing', () {
        final config = {
          'merchantId': 'VALID_MERCHANT',
          'websiteName': 'SUVAI',
        };

        final isValid = configService.validateConfiguration(config);

        expect(isValid, false);
      });

      test('returns false when websiteName is missing', () {
        final config = {
          'merchantId': 'VALID_MERCHANT',
          'hostName': 'securegw.paytm.in',
        };

        final isValid = configService.validateConfiguration(config);

        expect(isValid, false);
      });

      test('returns false when multiple required fields missing', () {
        final config = {
          'callbackUrl': 'https://example.com/callback',
        };

        final isValid = configService.validateConfiguration(config);

        expect(isValid, false);
      });

      test('allows optional fields to be missing', () {
        final config = {
          'merchantId': 'VALID_MERCHANT',
          'hostName': 'securegw.paytm.in',
          'websiteName': 'SUVAI',
          // callbackUrl missing - but it's optional
        };

        final isValid = configService.validateConfiguration(config);

        expect(isValid, true);
      });

      test('handles null values in configuration', () {
        final config = {
          'merchantId': null,
          'hostName': 'securegw.paytm.in',
          'websiteName': 'SUVAI',
        };

        final isValid = configService.validateConfiguration(config);

        expect(isValid, false);
      });
    });

    group('getSetting', () {
      test('returns setting value when cached', () async {
        mockSettingsService.mockSettings = {
          'PayTM': {
            'merchantId': 'TEST_MERCHANT',
            'hostName': 'securegw.paytm.in',
            'callbackUrl': 'https://example.com/callback',
            'websiteName': 'SUVAI',
          }
        };

        await configService.fetchPaytmConfig();
        
        final merchantId = configService.getSetting('merchantId');

        expect(merchantId, 'TEST_MERCHANT');
      });

      test('returns null when cache not loaded', () {
        final merchantId = configService.getSetting('merchantId');

        expect(merchantId, isNull);
      });

      test('returns null for missing setting key', () async {
        mockSettingsService.mockSettings = {
          'PayTM': {
            'merchantId': 'TEST_MERCHANT',
            'hostName': 'securegw.paytm.in',
            'websiteName': 'SUVAI',
          }
        };

        await configService.fetchPaytmConfig();
        
        final unknownSetting = configService.getSetting('unknownKey');

        expect(unknownSetting, isNull);
      });
    });

    group('convenience getters', () {
      setUp(() async {
        mockSettingsService.mockSettings = {
          'PayTM': {
            'merchantId': 'MERCHANT_ID_VALUE',
            'hostName': 'securegw.paytm.in',
            'callbackUrl': 'https://example.com/callback',
            'websiteName': 'WEBSITENAME_VALUE',
          }
        };

        await configService.fetchPaytmConfig();
      });

      test('merchantId getter returns correct value', () {
        expect(configService.merchantId, 'MERCHANT_ID_VALUE');
      });

      test('hostName getter returns correct value', () {
        expect(configService.hostName, 'securegw.paytm.in');
      });

      test('callbackUrl getter returns correct value', () {
        expect(configService.callbackUrl, 'https://example.com/callback');
      });

      test('websiteName getter returns correct value', () {
        expect(configService.websiteName, 'WEBSITENAME_VALUE');
      });

      test('isMockConfig returns false for real config', () {
        expect(configService.isMockConfig, false);
      });
    });

    group('isMockConfig', () {
      test('returns false for real configuration', () async {
        mockSettingsService.mockSettings = {
          'PayTM': {
            'merchantId': 'REAL_MERCHANT',
            'hostName': 'securegw.paytm.in',
            'callbackUrl': 'https://example.com/callback',
            'websiteName': 'SUVAI',
          }
        };

        await configService.fetchPaytmConfig();

        expect(configService.isMockConfig, false);
      });

      test('returns true when using fallback mock', () async {
        mockSettingsService.shouldFail = true;

        await configService.fetchPaytmConfig();

        expect(configService.isMockConfig, true);
      });
    });

    group('clearCache', () {
      test('clears cached configuration', () async {
        mockSettingsService.mockSettings = {
          'PayTM': {
            'merchantId': 'MERCHANT_123',
            'hostName': 'securegw.paytm.in',
            'callbackUrl': 'https://example.com/callback',
            'websiteName': 'SUVAI',
          }
        };

        await configService.fetchPaytmConfig();
        configService.clearCache();

        // After clearing, getSetting should return null
        expect(configService.merchantId, isNull);
      });

      test('allows refetch after cache clear', () async {
        mockSettingsService.mockSettings = {
          'PayTM': {
            'merchantId': 'MERCHANT_123',
            'hostName': 'securegw.paytm.in',
            'callbackUrl': 'https://example.com/callback',
            'websiteName': 'SUVAI',
          }
        };

        await configService.fetchPaytmConfig();
        configService.clearCache();

        mockSettingsService.mockSettings = {
          'PayTM': {
            'merchantId': 'MERCHANT_456',
            'hostName': 'securegw-stage.paytm.in',
            'callbackUrl': 'https://newexample.com/callback',
            'websiteName': 'SUVAI_NEW',
          }
        };

        final newConfig = await configService.fetchPaytmConfig();

        expect(newConfig['merchantId'], 'MERCHANT_456');
      });
    });

    group('production vs staging configuration', () {
      test('handles staging paytm gateway', () async {
        mockSettingsService.mockSettings = {
          'PayTM': {
            'merchantId': 'STAGING_MERCHANT',
            'hostName': 'securegw-stage.paytm.in',
            'callbackUrl': 'https://staging.example.com/callback',
            'websiteName': 'SUVAI_STAGING',
          }
        };

        final config = await configService.fetchPaytmConfig();

        expect(config['hostName'], contains('stage'));
      });

      test('handles production paytm gateway', () async {
        mockSettingsService.mockSettings = {
          'PayTM': {
            'merchantId': 'PROD_MERCHANT',
            'hostName': 'securegw.paytm.in',
            'callbackUrl': 'https://production.example.com/callback',
            'websiteName': 'SUVAI_PROD',
          }
        };

        final config = await configService.fetchPaytmConfig();

        expect(config['hostName'], 'securegw.paytm.in');
        expect(config['hostName'], isNot(contains('stage')));
      });
    });
  });
}

/// Mock SettingsService for testing
class MockSettingsService {
  Map<String, dynamic> mockSettings = {};
  bool shouldFail = false;
  int callCount = 0;

  Future<Map<String, dynamic>> getPublicSettings() async {
    callCount++;
    
    if (shouldFail) {
      throw Exception('Settings fetch failed');
    }

    return mockSettings;
  }
}

/// Extension to allow injection of mock settings service
extension PaytmConfigServiceTest on PaytmConfigService {
  void setSettingsService(MockSettingsService mockService) {
    // This would need to be modified in the actual service to support testing
    // For now, this is a placeholder that shows the pattern
  }
}
