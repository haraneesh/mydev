import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user.dart';
import '../models/auth_state.dart';
import 'meteor_client.dart';
import 'onesignal_service.dart';

class AuthService {
  final MeteorClient meteorClient;
  final FlutterSecureStorage secureStorage;

  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'auth_user';

  String? _authToken;

  AuthService({
    required this.meteorClient,
    FlutterSecureStorage? secureStorage,
  }) : secureStorage = secureStorage ?? const FlutterSecureStorage();

  String? get authToken => _authToken;

  @visibleForTesting
  set setAuthToken(String? value) => _authToken = value;



  Future<void> signup({
    required String phone,
    required String password,
    required String firstName,
    required String lastName,
    required String email,
    required String deliveryAddress,
    required String deliveryPincode,
    String? eatingHealthyMeaning,
  }) async {
    if (phone.isEmpty) throw AuthException('Phone is required');
    if (password.isEmpty) throw AuthException('Password is required');
    if (!_isValidPhone(phone)) throw AuthException('Phone must be 10 digits');
    if (password.length < 6) throw AuthException('Password must be at least 6 characters');
    if (firstName.isEmpty) throw AuthException('First name is required');
    if (lastName.isEmpty) throw AuthException('Last name is required');
    if (email.isEmpty) throw AuthException('Email is required');
    if (deliveryAddress.isEmpty) throw AuthException('Delivery address is required');
    if (deliveryPincode.isEmpty) throw AuthException('Delivery pincode is required');

    try {
      if (!meteorClient.isConnected) {
        await meteorClient.connect();
      }

      // Call users.signUp with complete user profile
      final signupResponse = await meteorClient.call('users.signUp', [
        {
          'username': phone,
          'email': email,
          'password': password,
          'profile': {
            'name': {
              'first': firstName,
              'last': lastName,
            },
            'whMobilePhone': phone,
            'deliveryAddress': deliveryAddress,
            'deliveryPincode': deliveryPincode,
            if (eatingHealthyMeaning != null && eatingHealthyMeaning.isNotEmpty)
              'eatingHealthyMeaning': eatingHealthyMeaning,
          },
        }
      ]);

      if (signupResponse['error'] != null) {
        throw AuthException(signupResponse['error'] as String);
      }

      // After successful signup, automatically log the user in
      await login(phone, password);
    } catch (e) {
      if (e is AuthException) rethrow;
      
      // Provide user-friendly error messages for common network issues
      final errorString = e.toString().toLowerCase();
      if (errorString.contains('timeout')) {
        throw AuthException('Connection timed out. Please check your internet connection and try again.');
      } else if (errorString.contains('connection') || errorString.contains('refused')) {
        throw AuthException('Unable to connect to server. Please check your internet connection.');
      }
      
      throw AuthException('Signup failed. Please try again.');
    }
  }

  Future<void> login(String phone, String password) async {
    if (phone.isEmpty) throw AuthException('Phone is required');
    if (password.isEmpty) throw AuthException('Password is required');
    if (!_isValidPhone(phone)) throw AuthException('Phone must be 10 digits');

    try {
      if (!meteorClient.isConnected) {
        await meteorClient.connect();
      }

      final response = await meteorClient.call('auth.login', [
        {'phone': phone, 'password': password}
      ]);

      if (response['error'] != null) {
        throw AuthException(response['error'] as String);
      }

      final token = response['token'] as String?;
      final userId = response['userId'] as String?;
      if (token == null || token.isEmpty) {
        throw AuthException('No token received');
      }
      if (userId == null || userId.isEmpty) {
        throw AuthException('No user ID received');
      }

      _authToken = token;
      meteorClient.setAuth(token, userId);
      await secureStorage.write(key: _tokenKey, value: token);

      // Register OneSignal player ID with server
      await _registerOneSignalPlayerId(userId);
    } catch (e) {
      if (e is AuthException) rethrow;
      
      // Provide user-friendly error messages for common network issues
      final errorString = e.toString().toLowerCase();
      if (errorString.contains('timeout')) {
        throw AuthException('Connection timed out. Please check your internet connection and try again.');
      } else if (errorString.contains('connection') || errorString.contains('refused')) {
        throw AuthException('Unable to connect to server. Please check your internet connection.');
      }
      
      throw AuthException('Login failed. Please try again.');
    }
  }

  Future<User> getCurrentUser() async {
    if (_authToken == null || _authToken!.isEmpty) {
      throw AuthException('No authentication token available');
    }

    try {
      final response = await meteorClient.call('auth.getCurrentUser', [_authToken]);

      if (response['error'] != null) {
        throw AuthException(
          response['error'] as String,
          code: response['code'] as String?,
        );
      }

      final userData = response['user'] as Map<String, dynamic>?;
      if (userData == null) {
        throw AuthException('Failed to fetch user data');
      }

      final user = User.fromJson(userData);
      await _cacheUser(user);
      return user;
    } catch (e) {
      if (e is AuthException) rethrow;
      throw AuthException('Failed to fetch user: $e');
    }
  }

  Future<void> logout() async {
    try {
      if (_authToken != null) {
        await meteorClient.call('auth.logout', []);
      }
    } catch (e) {
      // Continue with logout even if server call fails
    } finally {
      _authToken = null;
      meteorClient.clearAuth();
      await secureStorage.delete(key: _tokenKey);
      await secureStorage.delete(key: _userKey);
    }
  }

  Future<String?> restoreToken() async {
    try {
      _authToken = await secureStorage.read(key: _tokenKey);
      if (_authToken != null) {
        meteorClient.setAuth(_authToken!, 'restored-user');
        
        try {
          await getCurrentUser();
          return _authToken;
        } catch (e) {
          debugPrint('[Auth] Restored token is invalid, clearing: $e');
          _authToken = null;
          meteorClient.clearAuth();
          await secureStorage.delete(key: _tokenKey);
          return null;
        }
      }
      return _authToken;
    } catch (e) {
      throw AuthException('Failed to restore token: $e');
    }
  }

  Future<User?> restoreUser() async {
    try {
      final userJson = await secureStorage.read(key: _userKey);
      if (userJson == null) return null;

      // Parse the stored user JSON
      // Note: This is a simple implementation. Consider using json_serializable for production
      return null; // Will implement properly when we add json support
    } catch (e) {
      throw AuthException('Failed to restore user: $e');
    }
  }

  Future<void> _cacheUser(User user) async {
    try {
      // Store user JSON in secure storage
      // Note: This is a simple implementation. Consider using json_serializable for production
    } catch (e) {
      // Continue even if caching fails
    }
  }

  Future<User> updateUserProfile({
    required String emailAddress,
    String? salutation,
    String? firstName,
    String? lastName,
    String? whMobilePhone,
    String? deliveryAddress,
    String? deliveryPincode,
    String? dietPreference,
    String? packingPreference,
    String? productUpdatePreference,
    bool? clearCartAfterOrder,
    String? newPassword,
  }) async {
    if (_authToken == null || _authToken!.isEmpty) {
      throw AuthException('No authentication token available');
    }

    try {
      if (!meteorClient.isConnected) {
        await meteorClient.connect();
      }

      final profileData = {
        'emailAddress': emailAddress,
        'profile': {
          if (salutation != null) 'salutation': salutation,
          'name': {
            if (firstName != null) 'first': firstName,
            if (lastName != null) 'last': lastName,
          },
          if (whMobilePhone != null) 'whMobilePhone': whMobilePhone,
          if (deliveryAddress != null) 'deliveryAddress': deliveryAddress,
          if (deliveryPincode != null) 'deliveryPincode': deliveryPincode,
        },
        'settings': {
          if (dietPreference != null) 'dietPreference': dietPreference,
          if (packingPreference != null) 'packingPreference': packingPreference,
          if (productUpdatePreference != null) 'productUpdatePreference': productUpdatePreference,
          if (clearCartAfterOrder != null) 'clearCartAfterOrder': clearCartAfterOrder,
        },
      };

      if (newPassword != null && newPassword.isNotEmpty) {
        profileData['password'] = newPassword;
      }

      final response = await meteorClient.call('users.editUserProfile', [profileData]);

      if (response['error'] != null) {
        throw AuthException(response['error'] as String);
      }

      // Fetch and return updated user
      return await getCurrentUser();
    } catch (e) {
      if (e is AuthException) rethrow;
      throw AuthException('Failed to update profile: $e');
    }
  }

  bool _isValidPhone(String phone) {
    if (phone.length != 10) return false;
    return RegExp(r'^[0-9]{10}$').hasMatch(phone);
  }

  /// Register OneSignal player ID with the server
  /// 
  /// This integrates with OneSignalService to:
  /// 1. Set external user ID for cross-device tracking
  /// 2. Register device player ID with backend
  /// 3. Enable push notifications for this user
  Future<void> _registerOneSignalPlayerId(String userId) async {
    try {
      debugPrint('[Auth] Registering OneSignal player ID for user: $userId');

      // Set external user ID for cross-device tracking
      await OneSignalService.instance.setExternalUserId(userId);

      // Request push permission and wait for it
      final hasPermission = await OneSignalService.instance.requestPermission();
      debugPrint('[Auth] Push permission result: $hasPermission');

      // Wait a bit for player ID to be assigned after permission
      await Future.delayed(const Duration(milliseconds: 1000));
      
      // Try to fetch player ID synchronously
      var playerId = OneSignalService.instance.getPlayerId();
      
      // If not available, wait for it (up to 4 more seconds)
      if (playerId == null || playerId.isEmpty) {
        debugPrint('[Auth] Player ID not immediately available, waiting...');
        playerId = await OneSignalService.instance.waitForPlayerId(timeout: const Duration(seconds: 4));
        debugPrint('[Auth] Waited for player ID, result: ${playerId != null ? playerId.substring(0, 8) + '...' : 'null'}');
      } else {
        debugPrint('[Auth] Player ID immediately available: ${playerId.substring(0, 8)}...');
      }

      if (playerId == null || playerId.isEmpty) {
        debugPrint(
          '[Auth] ⚠️ Player ID not available yet. '
          'Will be registered on next subscription change.',
        );
        return;
      }

      // Store player ID in backend
      try {
        await meteorClient.call('addPlayerId', [
          {
            'playerId': playerId,
            'deviceType': _getDeviceType(),
          }
        ]);
        debugPrint('[Auth] ✅ OneSignal player ID registered: ${playerId.substring(0, 8)}...');
      } catch (e) {
        debugPrint('[Auth] ⚠️ Error registering player ID with backend: $e');
        // Don't fail login if registration fails
      }
    } catch (e) {
      debugPrint('[Auth] ⚠️ Error in OneSignal setup: $e');
      // Don't fail login if OneSignal setup fails
    }
  }

  /// Get device type string
  String _getDeviceType() {
    // TODO: Use package:device_info_plus to get actual platform
    // For now, return 'mobile' as placeholder
    return 'mobile';
  }
}
