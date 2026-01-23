import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../models/invoice.dart';

/// Manages payment session state and recovery
class PaymentSessionManager {
  static final PaymentSessionManager _instance =
      PaymentSessionManager._internal();

  factory PaymentSessionManager() {
    return _instance;
  }

  PaymentSessionManager._internal();

  static PaymentSessionManager get instance => _instance;

  static const String _sessionKey = 'payment_session';
  static const String _selectedInvoicesKey = 'selected_invoices';
  static const String _pendingPaymentKey = 'pending_payment';
  static const String _lastPaymentTimeKey = 'last_payment_time';

  late SharedPreferences _prefs;
  bool _initialized = false;

  /// Initialize the session manager
  Future<void> initialize() async {
    if (_initialized) return;
    
    try {
      _prefs = await SharedPreferences.getInstance();
      _initialized = true;
      
      if (kDebugMode) {
        print('✅ PaymentSessionManager initialized');
      }
    } catch (e) {
      if (kDebugMode) {
        print('❌ Failed to initialize PaymentSessionManager: $e');
      }
    }
  }

  /// Save selected invoices to session
  Future<void> saveSelectedInvoices(List<Invoice> invoices) async {
    if (!_initialized) return;
    
    try {
      final invoiceJson = jsonEncode(
        invoices.map((inv) => {
          'id': inv.id,
          'invoiceId': inv.invoiceId,
          'invoiceNumber': inv.invoiceNumber,
          'date': inv.date.toIso8601String(),
          'status': inv.status,
          'total': inv.total,
          'balance': inv.balance,
          'dueDate': inv.dueDate?.toIso8601String(),
        }).toList(),
      );
      
      await _prefs.setString(_selectedInvoicesKey, invoiceJson);
      
      if (kDebugMode) {
        print('✅ Saved ${invoices.length} selected invoices to session');
      }
    } catch (e) {
      if (kDebugMode) {
        print('❌ Failed to save selected invoices: $e');
      }
    }
  }

  /// Retrieve selected invoices from session
  Future<List<Invoice>?> getSelectedInvoices() async {
    if (!_initialized) return null;
    
    try {
      final invoiceJson = _prefs.getString(_selectedInvoicesKey);
      if (invoiceJson == null) return null;
      
      final invoiceList = jsonDecode(invoiceJson) as List;
      final invoices = invoiceList.map((item) {
        final map = item as Map<String, dynamic>;
        return Invoice(
          id: map['id'] ?? '',
          invoiceId: map['invoiceId'] ?? '',
          invoiceNumber: map['invoiceNumber'] ?? '',
          date: DateTime.parse(map['date'] ?? DateTime.now().toIso8601String()),
          status: map['status'] ?? 'unknown',
          total: (map['total'] as num?)?.toDouble() ?? 0.0,
          balance: (map['balance'] as num?)?.toDouble() ?? 0.0,
          dueDate: map['dueDate'] != null ? DateTime.parse(map['dueDate']) : null,
          customer: Customer(),
          lineItems: [],
        );
      }).toList();
      
      if (kDebugMode) {
        print('✅ Retrieved ${invoices.length} selected invoices from session');
      }
      
      return invoices;
    } catch (e) {
      if (kDebugMode) {
        print('❌ Failed to retrieve selected invoices: $e');
      }
      return null;
    }
  }

  /// Save pending payment details
  Future<void> savePendingPayment(Map<String, dynamic> paymentData) async {
    if (!_initialized) return;
    
    try {
      final paymentJson = jsonEncode({
        ...paymentData,
        'savedAt': DateTime.now().toIso8601String(),
      });
      
      await _prefs.setString(_pendingPaymentKey, paymentJson);
      
      if (kDebugMode) {
        print('✅ Saved pending payment to session');
        print('  orderId: ${paymentData['orderId']}');
      }
    } catch (e) {
      if (kDebugMode) {
        print('❌ Failed to save pending payment: $e');
      }
    }
  }

  /// Retrieve pending payment details
  Future<Map<String, dynamic>?> getPendingPayment() async {
    if (!_initialized) return null;
    
    try {
      final paymentJson = _prefs.getString(_pendingPaymentKey);
      if (paymentJson == null) return null;
      
      final payment = jsonDecode(paymentJson) as Map<String, dynamic>;
      
      if (kDebugMode) {
        print('✅ Retrieved pending payment from session');
        print('  orderId: ${payment['orderId']}');
      }
      
      return payment;
    } catch (e) {
      if (kDebugMode) {
        print('❌ Failed to retrieve pending payment: $e');
      }
      return null;
    }
  }

  /// Clear pending payment
  Future<void> clearPendingPayment() async {
    if (!_initialized) return;
    
    try {
      await _prefs.remove(_pendingPaymentKey);
      
      if (kDebugMode) {
        print('✅ Cleared pending payment from session');
      }
    } catch (e) {
      if (kDebugMode) {
        print('❌ Failed to clear pending payment: $e');
      }
    }
  }

  /// Save last payment timestamp
  Future<void> saveLastPaymentTime() async {
    if (!_initialized) return;
    
    try {
      await _prefs.setString(
        _lastPaymentTimeKey,
        DateTime.now().toIso8601String(),
      );
      
      if (kDebugMode) {
        print('✅ Saved last payment timestamp');
      }
    } catch (e) {
      if (kDebugMode) {
        print('❌ Failed to save last payment time: $e');
      }
    }
  }

  /// Get last payment timestamp
  Future<DateTime?> getLastPaymentTime() async {
    if (!_initialized) return null;
    
    try {
      final timeStr = _prefs.getString(_lastPaymentTimeKey);
      if (timeStr == null) return null;
      
      return DateTime.parse(timeStr);
    } catch (e) {
      if (kDebugMode) {
        print('❌ Failed to retrieve last payment time: $e');
      }
      return null;
    }
  }

  /// Check if there's a pending payment older than a threshold
  Future<bool> hasStalePendingPayment({
    Duration staleDuration = const Duration(hours: 1),
  }) async {
    final payment = await getPendingPayment();
    if (payment == null) return false;
    
    try {
      final savedAt = DateTime.parse(payment['savedAt'] as String);
      final age = DateTime.now().difference(savedAt);
      
      return age > staleDuration;
    } catch (e) {
      if (kDebugMode) {
        print('❌ Failed to check stale pending payment: $e');
      }
      return false;
    }
  }

  /// Clear entire session (for logout)
  Future<void> clearSession() async {
    if (!_initialized) return;
    
    try {
      await Future.wait([
        _prefs.remove(_selectedInvoicesKey),
        _prefs.remove(_pendingPaymentKey),
        _prefs.remove(_lastPaymentTimeKey),
      ]);
      
      if (kDebugMode) {
        print('✅ Cleared entire payment session');
      }
    } catch (e) {
      if (kDebugMode) {
        print('❌ Failed to clear session: $e');
      }
    }
  }

  /// Get session summary for debugging
  Future<Map<String, dynamic>> getSessionSummary() async {
    if (!_initialized) {
      return {'error': 'Not initialized'};
    }
    
    try {
      return {
        'hasSelectedInvoices': _prefs.containsKey(_selectedInvoicesKey),
        'hasPendingPayment': _prefs.containsKey(_pendingPaymentKey),
        'lastPaymentTime': _prefs.getString(_lastPaymentTimeKey),
        'timestamp': DateTime.now().toIso8601String(),
      };
    } catch (e) {
      return {'error': e.toString()};
    }
  }
}
