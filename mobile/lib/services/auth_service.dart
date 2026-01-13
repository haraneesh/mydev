import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user.dart';
import '../models/auth_state.dart';
import 'meteor_client.dart';

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



  Future<void> signup(String phone, String password) async {
    if (phone.isEmpty) throw AuthException('Phone is required');
    if (password.isEmpty) throw AuthException('Password is required');
    if (!_isValidPhone(phone)) throw AuthException('Phone must be 10 digits');
    if (password.length < 4) throw AuthException('Password must be at least 4 characters');

    try {
      if (!meteorClient.isConnected) {
        await meteorClient.connect();
      }

      final response = await meteorClient.call('auth.signup', [
        {'phone': phone, 'password': password}
      ]);

      if (response['error'] != null) {
        throw AuthException(response['error'] as String);
      }
    } catch (e) {
      if (e is AuthException) rethrow;
      throw AuthException('Signup failed: $e');
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
    } catch (e) {
      if (e is AuthException) rethrow;
      throw AuthException('Login failed: $e');
    }
  }

  Future<User> getCurrentUser() async {
    if (_authToken == null || _authToken!.isEmpty) {
      throw AuthException('No authentication token available');
    }

    try {
      final response = await meteorClient.call('auth.getCurrentUser', [_authToken]);

      debugPrint('=== RESPONSE AFTER CALL ===');
      debugPrint('response: $response');
      debugPrint('===========================');

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

      debugPrint('=== RAW USER DATA FROM SERVER ===');
      debugPrint('userData: $userData');
      debugPrint('profile: ${userData['profile']}');
      debugPrint('settings: ${userData['settings']}');
      debugPrint('================================');

      final user = User.fromJson(userData);
      
      debugPrint('=== PARSED USER OBJECT ===');
      debugPrint('firstName: ${user.firstName}');
      debugPrint('lastName: ${user.lastName}');
      debugPrint('email: ${user.email}');
      debugPrint('whMobilePhone: ${user.whMobilePhone}');
      debugPrint('deliveryAddress: ${user.deliveryAddress}');
      debugPrint('deliveryPincode: ${user.deliveryPincode}');
      debugPrint('salutation: ${user.salutation}');
      debugPrint('dietaryPreference: ${user.dietaryPreference}');
      debugPrint('==========================');
      
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
}
