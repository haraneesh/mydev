import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

/// OneSignal Configuration Manager
/// 
/// Loads OneSignal App ID from environment variables.
/// APP ID is loaded from .env file to avoid hardcoding secrets.
class OneSignalConfig {
  /// Get OneSignal App ID from environment
  /// 
  /// Throws exception if ONESIGNAL_APP_ID is not set in .env file
  static String getAppId() {
    final appId = dotenv.env['ONESIGNAL_APP_ID'];
    
    if (appId == null || appId.isEmpty) {
      throw Exception(
        'ONESIGNAL_APP_ID not found in environment variables.\n'
        '\n'
        'Setup Instructions:\n'
        '1. Copy .env.example to .env\n'
        '2. Get your app ID from: https://dashboard.onesignal.com\n'
        '3. Navigate to: Settings → Keys & IDs\n'
        '4. Copy "OneSignal App ID" value\n'
        '5. Paste into .env file: ONESIGNAL_APP_ID=<your-app-id>\n'
        '6. Do NOT commit .env to git (it\'s in .gitignore)\n'
      );
    }
    
    return appId;
  }

  /// Validate OneSignal App ID format
  /// 
  /// Format: UUID v4 (e.g., 12345678-1234-1234-1234-123456789abc)
  static bool isValidAppId(String appId) {
    final uuidRegex = RegExp(
      r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
      caseSensitive: false,
    );
    return uuidRegex.hasMatch(appId);
  }

  /// Log configuration status (debug only)
  static void logConfigStatus() {
    if (!kDebugMode) return;
    
    try {
      final appId = getAppId();
      final isValid = isValidAppId(appId);
      
      debugPrint('''
╔════════════════════════════════════════════════════════════╗
║           OneSignal Configuration Status                   ║
╠════════════════════════════════════════════════════════════╣
║ App ID Loaded: ✅                                          ║
║ Format Valid:  ${isValid ? '✅' : '⚠️'}                                         ║
║ App ID: ${appId.substring(0, 8)}...${appId.substring(appId.length - 8)}  ║
╚════════════════════════════════════════════════════════════╝
      ''');
    } catch (e) {
      debugPrint('⚠️ OneSignal Configuration Error: $e');
    }
  }
}
