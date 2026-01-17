import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import '../models/user.dart';
import '../models/auth_state.dart';
import '../services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService;

  User? _currentUser;
  AuthState _authState = AuthState.initial;
  String? _error;

  @visibleForTesting
  set currentUserForTesting(User? value) => _currentUser = value;

  @visibleForTesting
  set errorForTesting(String? value) => _error = value;

  AuthProvider({required AuthService authService}) : _authService = authService;

  User? get currentUser => _currentUser;
  AuthState get authState => _authState;
  String? get error => _error;
  bool get isAuthenticated => _currentUser != null;
  String? get authToken => _authService.authToken;

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
    _authState = AuthState.authenticating;
    _error = null;
    notifyListeners();

    try {
      await _authService.signup(
        phone: phone,
        password: password,
        firstName: firstName,
        lastName: lastName,
        email: email,
        deliveryAddress: deliveryAddress,
        deliveryPincode: deliveryPincode,
        eatingHealthyMeaning: eatingHealthyMeaning,
      );
      _currentUser = await _authService.getCurrentUser();
      _authState = AuthState.authenticated;
      notifyListeners();
    } catch (e) {
      _authState = AuthState.error;
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  Future<void> login(String phone, String password) async {
    _authState = AuthState.authenticating;
    _error = null;
    notifyListeners();

    try {
      await _authService.login(phone, password);
      _currentUser = await _authService.getCurrentUser();
      _authState = AuthState.authenticated;
      notifyListeners();
    } catch (e) {
      _authState = AuthState.error;
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  Future<void> logout() async {
    _authState = AuthState.authenticating;
    _error = null;
    notifyListeners();

    try {
      await _authService.logout();
      _currentUser = null;
      _authState = AuthState.unauthenticated;
      notifyListeners();
    } catch (e) {
      _authState = AuthState.error;
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  Future<void> restoreAuthState() async {
    _authState = AuthState.initial;
    _error = null;
    notifyListeners();

    try {
      final token = await _authService.restoreToken();

      if (token != null && token.isNotEmpty) {
        _currentUser = await _authService.getCurrentUser();
        _authState = AuthState.authenticated;
      } else {
        _authState = AuthState.unauthenticated;
      }
    } catch (e) {
      _authState = AuthState.unauthenticated;
      _currentUser = null;
    }
    notifyListeners();
  }

  Future<void> continueAsGuest() async {
    _authState = AuthState.authenticating;
    _error = null;
    notifyListeners();

    try {
      // Create a guest user object to mark authenticated state
      _currentUser = User(
        id: 'guest',
        phone: '',
        email: '',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
      _authState = AuthState.authenticated;
      notifyListeners();
    } catch (e) {
      _authState = AuthState.error;
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  Future<void> updateProfile({
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
    _authState = AuthState.authenticating;
    _error = null;
    notifyListeners();

    try {
      _currentUser = await _authService.updateUserProfile(
        emailAddress: emailAddress,
        salutation: salutation,
        firstName: firstName,
        lastName: lastName,
        whMobilePhone: whMobilePhone,
        deliveryAddress: deliveryAddress,
        deliveryPincode: deliveryPincode,
        dietPreference: dietPreference,
        packingPreference: packingPreference,
        productUpdatePreference: productUpdatePreference,
        clearCartAfterOrder: clearCartAfterOrder,
        newPassword: newPassword,
      );
      _authState = AuthState.authenticated;
      notifyListeners();
    } catch (e) {
      _authState = AuthState.error;
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
