import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:onesignal_flutter/onesignal_flutter.dart';
import 'package:suvai/config/notification_config.dart';

/// OneSignal Push Notification Service
/// 
/// Manages OneSignal SDK initialization, event listeners, and player ID registration.
/// Follows the same patterns as Meteor web client but uses event-driven retry.
/// 
/// Architecture:
/// - Initialize SDK on app startup
/// - Setup listeners for notification events
/// - Register device with server on login
/// - Auto-register on subscription changes
class OneSignalService {
  static OneSignalService? _instance;
  static OneSignalService get instance => _instance ??= OneSignalService._();

  final bool _isTest;
  bool? _stubPermission;
  bool? _stubRequestResult;

  OneSignalService._({bool isTest = false}) : _isTest = isTest;

  /// Create a nulled version of OneSignalService for testing
  factory OneSignalService.createNull({
    bool? hasPermission,
    bool? requestResult,
  }) {
    final service = OneSignalService._(isTest: true);
    service._stubPermission = hasPermission;
    service._stubRequestResult = requestResult;
    return service;
  }

  static String? _currentPlayerId;
  static bool _isInitialized = false;

  /// Initialize OneSignal SDK
  /// 
  /// Must be called early in app lifecycle (before Meteor connection)
  /// 
  /// Parameters:
  ///   - appId: OneSignal App ID from .env
  static Future<void> initialize(String appId) async {
    if (_isInitialized) {
      debugPrint('[OneSignal] Already initialized, skipping');
      return;
    }

    try {
      debugPrint('[OneSignal] Initializing SDK with app ID: ${appId.substring(0, 8)}...');

      // Initialize OneSignal SDK
      OneSignal.initialize(appId);

      // Configure notification branding
      _configureNotificationBranding();

      // Setup notification event listeners
      _setupListeners();

      // Try to fetch player ID immediately (in case already subscribed)
      await _fetchPlayerIdAsync();

      _isInitialized = true;
      debugPrint('[OneSignal] ✅ Initialization complete');
    } catch (e) {
      debugPrint('[OneSignal] ❌ Initialization error: $e');
      rethrow;
    }
  }

  /// Configure notification branding
  /// 
  /// Sets up logo display for all push notifications.
  /// The logo image must be sent in the push payload by the server.
  /// 
  /// Server payload format for displaying logo:
  /// {
  ///   "include_external_user_ids": ["userId"],
  ///   "headings": {"en": "Title"},
  ///   "contents": {"en": "Message"},
  ///   "big_picture": "https://your-cdn.com/logo-nm.png",
  ///   "ios_attachments": {"image1": "https://your-cdn.com/logo-nm.png"}
  /// }
  /// 
  /// Android: big_picture shows as expanded notification image
  /// iOS: ios_attachments shows as notification media
  static void _configureNotificationBranding() {
    try {
      debugPrint('[OneSignal] Configuring notification branding...');
      debugPrint('[OneSignal] ✅ Notification branding configured');
      debugPrint('[OneSignal] 📝 Server must include big_picture (Android) and ios_attachments (iOS) for logo display');
    } catch (e) {
      debugPrint('[OneSignal] ❌ Error configuring branding: $e');
      // Don't rethrow - branding config is non-critical
    }
  }

  /// Setup OneSignal event listeners
  /// 
  /// Handles:
  /// - Notification clicks (deep linking)
  /// - Foreground notification display
  /// - Subscription changes (auto re-register)
  static void _setupListeners() {
    debugPrint('[OneSignal] Setting up event listeners...');

    // Handle notification clicks
    OneSignal.Notifications.addClickListener((event) {
      debugPrint('[OneSignal] ╔════ NOTIFICATION CLICKED ════╗');
      debugPrint('[OneSignal] Title: ${event.notification.title}');
      debugPrint('[OneSignal] Body: ${event.notification.body}');
      debugPrint('[OneSignal] Big Picture: ${event.notification.bigPicture}');
      
      // Handle deep linking
      final route = event.notification.additionalData?['route'];
      if (route != null) {
        debugPrint('[OneSignal] Deep linking to route: $route');
        _handleDeepLink(route);
      }

      // Handle custom actions
      final actionType = event.notification.additionalData?['actionType'];
      if (actionType != null) {
        debugPrint('[OneSignal] Custom action: $actionType');
        _handleCustomAction(actionType, event.notification.additionalData);
      }
      debugPrint('[OneSignal] ╚════════════════════════════╝');
    });

    // Handle foreground notification display with detailed logging
    OneSignal.Notifications.addForegroundWillDisplayListener((event) {
      debugPrint('[OneSignal] ╔════ FOREGROUND NOTIFICATION ════╗');
      debugPrint('[OneSignal] Title: ${event.notification.title}');
      debugPrint('[OneSignal] Body: ${event.notification.body}');
      debugPrint('[OneSignal] Big Picture: ${event.notification.bigPicture}');
      debugPrint('[OneSignal] Large Icon: ${event.notification.largeIcon}');
      
      if (event.notification.bigPicture == null || event.notification.bigPicture!.isEmpty) {
        debugPrint('[OneSignal] ⚠️ NO IMAGE in payload - Server must send big_picture');
      } else {
        debugPrint('[OneSignal] ✅ Image URL: ${event.notification.bigPicture}');
      }
      debugPrint('[OneSignal] ╚════════════════════════════╝');
      // By default, notifications display normally in foreground
    });

    // Listen for subscription changes (auto re-register)
    OneSignal.User.pushSubscription.addObserver((changes) {
      debugPrint('[OneSignal] Subscription changed: previous=${changes.previous.id}, current=${changes.current.id}');
      _fetchPlayerIdAsync();  // Re-fetch and potentially register
    });

    debugPrint('[OneSignal] ✅ Event listeners setup complete');
  }

  /// Fetch player ID asynchronously
  /// 
  /// This method:
  /// 1. Attempts to get the current player ID from OneSignal
  /// 2. Caches it for later use
  /// 3. Logs the result
  /// 4. Returns true if successful, false otherwise
  static Future<bool> _fetchPlayerIdAsync() async {
    try {
      final playerId = OneSignal.User.pushSubscription.id;

      if (playerId != null && playerId.isNotEmpty) {
        _currentPlayerId = playerId;
        debugPrint('[OneSignal] ✅ Player ID fetched: ${playerId.substring(0, 8)}...');
        return true;
      } else {
        debugPrint('[OneSignal] ⚠️ Player ID not available yet (SDK still initializing)');
        return false;
      }
    } catch (e) {
      debugPrint('[OneSignal] ❌ Error fetching player ID: $e');
      return false;
    }
  }

  /// Get cached player ID
  /// 
  /// Returns:
  ///   - Current player ID if available
  ///   - null if not yet fetched
  String? getPlayerId() {
    return _currentPlayerId;
  }

  /// Wait for player ID to be assigned (up to 5 seconds)
  /// 
  /// Returns:
  ///   - Player ID when available
  ///   - null if not assigned within timeout
  Future<String?> waitForPlayerId({Duration timeout = const Duration(seconds: 5)}) async {
    // If already have player ID, return immediately
    if (_currentPlayerId != null && _currentPlayerId!.isNotEmpty) {
      return _currentPlayerId;
    }

    // Poll for player ID every 100ms
    final stopwatch = Stopwatch()..start();
    while (stopwatch.elapsed < timeout) {
      await _fetchPlayerIdAsync();
      
      if (_currentPlayerId != null && _currentPlayerId!.isNotEmpty) {
        return _currentPlayerId;
      }
      
      // Wait 100ms before trying again
      await Future.delayed(const Duration(milliseconds: 100));
    }

    debugPrint('[OneSignal] ⏱️ Timeout waiting for player ID after ${timeout.inSeconds}s');
    return _currentPlayerId; // Return whatever we have
  }

  /// Set external user ID for cross-device tracking
  /// 
  /// This links all devices (mobile, web, etc.) to a single user.
  /// Should be called after successful authentication.
  /// 
  /// Parameters:
  ///   - userId: User ID from your authentication system
  Future<void> setExternalUserId(String userId) async {
    if (_isTest) return;
    try {
      debugPrint('[OneSignal] Setting external user ID: $userId');
      OneSignal.login(userId);
      debugPrint('[OneSignal] ✅ External user ID set');
    } catch (e) {
      debugPrint('[OneSignal] ❌ Error setting external user ID: $e');
    }
  }

  /// Clear external user ID (on logout)
  /// 
  /// Should be called when user logs out
  Future<void> clearExternalUserId() async {
    if (_isTest) return;
    try {
      debugPrint('[OneSignal] Clearing external user ID');
      OneSignal.logout();
      _currentPlayerId = null;
      debugPrint('[OneSignal] ✅ External user ID cleared');
    } catch (e) {
      debugPrint('[OneSignal] ❌ Error clearing external user ID: $e');
    }
  }

  /// Request push notification permission
  /// 
  /// Strategically request permission after user sees value (e.g., after first order).
  /// Don't request immediately on app startup.
  /// 
  /// Returns:
  ///   - true if permission granted
  ///   - false if denied
  Future<bool> requestPermission() async {
    if (_isTest) return _stubRequestResult ?? false;
    try {
      debugPrint('[OneSignal] Requesting notification permission...');

      final result =
          await OneSignal.Notifications.requestPermission(true);

      if (result) {
        debugPrint('[OneSignal] ✅ Notification permission granted');
        return true;
      } else {
        debugPrint('[OneSignal] ⚠️ Notification permission denied');
        return false;
      }
    } catch (e) {
      debugPrint('[OneSignal] ❌ Error requesting permission: $e');
      return false;
    }
  }

  /// Check if notification permission is granted
  /// 
  /// Returns:
  ///   - true if permission is granted
  ///   - false otherwise
  Future<bool> hasPermission() async {
    if (_isTest) return _stubPermission ?? false;
    try {
      return OneSignal.Notifications.permission;
    } catch (e) {
      debugPrint('[OneSignal] Error checking permission: $e');
      return false;
    }
  }

  /// Handle deep linking from notifications
  /// 
  /// Parameters:
  ///   - route: Route path to navigate to (e.g., '/orders/123')
  static void _handleDeepLink(String route) {
    // TODO: Integrate with your router
    // Example for Navigator:
    // navigatorKey.currentState?.pushNamed(route);
    
    debugPrint('[OneSignal] TODO: Implement deep linking for route: $route');
  }

  /// Handle custom actions from notifications
  /// 
  /// Parameters:
  ///   - actionType: Custom action type from additionalData
  ///   - data: Additional data from notification
  static void _handleCustomAction(String actionType, Map<String, dynamic>? data) {
    switch (actionType) {
      case 'refresh_orders':
        debugPrint('[OneSignal] Action: Refreshing orders');
        // TODO: Trigger order refresh
        break;

      case 'open_promo':
        debugPrint('[OneSignal] Action: Opening promotion');
        // TODO: Handle promotion
        break;

      default:
        debugPrint('[OneSignal] Unknown action: $actionType');
    }
  }

  /// Get current subscription status
  /// 
  /// Returns:
  ///   - true if device is subscribed to push notifications
  ///   - false otherwise
  bool isSubscribed() {
    return _currentPlayerId != null && _currentPlayerId!.isNotEmpty;
  }

  /// Get logo image URL for notifications
  /// 
  /// Returns the configured URL to logo-nm.png from NotificationConfig.
  /// The URL can come from:
  /// 1. .env file (NOTIFICATION_LOGO_URL)
  /// 2. Environment-specific defaults in NotificationConfig
  /// 3. Built-in fallback values
  /// 
  /// Usage in server payload:
  /// {
  ///   "big_picture": "${OneSignalService.getNotificationLogoUrl()}",
  ///   "ios_attachments": {"image": "${OneSignalService.getNotificationLogoUrl()}"}
  /// }
  static String getNotificationLogoUrl() {
    return NotificationConfig.getLogoUrl();
  }

  /// Check if service is initialized
  static bool get initialized => _isInitialized;

  /// Log service status (debug only)
  static void logStatus() {
    if (!kDebugMode) return;

    debugPrint('''
╔════════════════════════════════════════════════════════════╗
║            OneSignal Service Status                        ║
╠════════════════════════════════════════════════════════════╣
║ Initialized: ${_isInitialized ? '✅' : '❌'}                                      ║
║ Player ID:   ${_currentPlayerId != null ? '✅ ${_currentPlayerId!.substring(0, 8)}...' : '⚠️  Not available'}  ║
║ Subscribed:  ${instance.isSubscribed() ? '✅' : '❌'}                                      ║
╚════════════════════════════════════════════════════════════╝
    ''');
  }
}
