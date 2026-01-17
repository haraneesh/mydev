import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Notification Configuration
/// 
/// Manages image URLs for OneSignal notifications
class NotificationConfig {
  /// Get the logo URL for notifications
  /// 
  /// Supports multiple environments:
  /// - Development: Local server URL
  /// - Staging: Staging CDN URL
  /// - Production: Production CDN URL
  /// 
  /// Configuration via .env file:
  /// NOTIFICATION_LOGO_URL=https://your-cdn.com/logo-nm.png
  static String getLogoUrl() {
    // Try to get from environment first
    final envUrl = dotenv.env['NOTIFICATION_LOGO_URL'];
    if (envUrl != null && envUrl.isNotEmpty) {
      return envUrl;
    }

    // Fallback defaults based on environment
    const String env = String.fromEnvironment('FLUTTER_ENV', defaultValue: 'development');
    
    switch (env) {
      case 'production':
        return 'https://cdn.yourdomain.com/logo-nm.png';
      case 'staging':
        return 'https://staging-cdn.yourdomain.com/logo-nm.png';
      case 'development':
      default:
        // For development, you can:
        // 1. Use localhost if running a local server: http://localhost:3000/logo-nm.png
        // 2. Use your dev CDN: https://dev-cdn.yourdomain.com/logo-nm.png
        // 3. Use a public file hosting: https://example-public-bucket.s3.amazonaws.com/logo-nm.png
        return 'https://dev-cdn.yourdomain.com/logo-nm.png';
    }
  }

  /// Get the logo URL at runtime (updated if .env changes)
  static String getLogoUrlDynamic() => getLogoUrl();
}
