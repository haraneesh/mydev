import 'package:flutter/foundation.dart';
import '../models/invoice.dart';
import '../models/payment.dart';
import 'meteor_client.dart';

/// Service for handling payment operations via Meteor backend
class PaymentService {
  static final PaymentService _instance = PaymentService._internal();

  factory PaymentService() {
    return _instance;
  }

  PaymentService._internal();

  @visibleForTesting
  PaymentService.forTest();

  static PaymentService get instance => _instance;

  final _meteorClient = MeteorClient.instance;

  /// Initiate Paytm payment transaction
  /// 
  /// Calls Meteor method: payment.paytm.initiateTransaction
  /// Returns: { status, txToken, suvaiTransactionId } or error
  Future<Map<String, dynamic>> initiatePayment({
    required List<Invoice> selectedInvoices,
    required String userMobile,
    required String firstName,
    required String lastName,
    bool showOptionsWithFee = false,
    double? customAmount,
  }) async {
    try {
      // Calculate total amount
      final baseAmount = selectedInvoices.fold<double>(
        0,
        (sum, invoice) => sum + invoice.amountDue,
      );

      // Use customAmount if provided, otherwise use baseAmount
      final totalAmount = customAmount ?? baseAmount;

      if (totalAmount <= 0) {
        return {
          'success': false,
          'error': 'Invalid amount for payment',
        };
      }

      // Ensure connection
      if (!_meteorClient.isConnected) {
        await _meteorClient.connect();
      }

      // Wait for auth to be ready
      await _meteorClient.waitForAuth();

      // Call Meteor method
      final result = await _meteorClient.call('payment.paytm.initiateTransaction', [
        {
          'amount': totalAmount.toStringAsFixed(2),
          'mobile': userMobile,
          'firstName': firstName,
          'lastName': lastName,
          'showOptionsWithFee': showOptionsWithFee,
          'cartTotalBillAmount': totalAmount.toInt(),
        }
      ]);

      if (result == null) {
        return {
          'success': false,
          'error': 'No response from server',
        };
      }

      // Check for success status
      if (result['status'] == 'S') {
        return {
          'success': true,
          'txToken': result['txToken'],
          'suvaiTransactionId': result['suvaiTransactionId'],
          'status': 'S',
        };
      } else {
        return {
          'success': false,
          'error': result['errorMsg'] ?? 'Failed to initiate transaction',
          'status': 'F',
        };
      }
    } catch (e) {
      if (kDebugMode) {
        print('Error initiating payment: $e');
      }
      return {
        'success': false,
        'error': 'Error initiating payment: $e',
      };
    }
  }

  /// Complete Paytm payment transaction after user completes payment
  /// 
  /// Called with Paytm response and list of paid invoices
  /// Calls Meteor method: payment.paytm.completeTransaction
  Future<Map<String, dynamic>> completePayment({
    required Map<String, dynamic> paymentStatus,
    required List<Invoice> invoicesToPay,
  }) async {
    try {
      // Prepare invoice data for server
      final invoiceData = invoicesToPay.map((inv) => {
        '_id': inv.id,
        'invoice_id': inv.invoiceId,
        'total': inv.amountDue,
      }).toList();

      // Ensure connection
      if (!_meteorClient.isConnected) {
        await _meteorClient.connect();
      }

      // Wait for auth to be ready
      await _meteorClient.waitForAuth();

      // Call Meteor method
      final result = await _meteorClient.call(
        'payment.paytm.completeTransaction',
        [paymentStatus, invoiceData],
      );

      if (result == null) {
        return {
          'success': false,
          'error': 'No response from server',
        };
      }

      return {
        'success': result['success'] ?? false,
        'status': result['status'],
        'orderId': result['orderId'],
        'processedAt': result['processedAt'],
        'message': result['message'],
      };
    } catch (e) {
      if (kDebugMode) {
        print('Error completing payment: $e');
      }
      return {
        'success': false,
        'error': 'Error completing payment: $e',
      };
    }
  }

  /// Verify payment status with Paytm
  /// 
  /// Calls Meteor method: payment.paytm.verifyPayment
  Future<Map<String, dynamic>> verifyPaymentStatus(String orderId) async {
    try {
      // Ensure connection
      if (!_meteorClient.isConnected) {
        await _meteorClient.connect();
      }

      // Wait for auth to be ready
      await _meteorClient.waitForAuth();

      final result = await _meteorClient.call('payment.paytm.verifyPayment', [orderId]);

      if (result == null) {
        return {
          'success': false,
          'error': 'No response from server',
        };
      }

      return {
        'success': true,
        'status': result['STATUS'],
        'txnId': result['TXNID'],
        'amount': result['TXNAMOUNT'],
        'orderId': result['ORDERID'],
        'paymentMode': result['PAYMENTMODE'],
        'rawResponse': result,
      };
    } catch (e) {
      if (kDebugMode) {
        print('Error verifying payment: $e');
      }
      return {
        'success': false,
        'error': 'Error verifying payment: $e',
      };
    }
  }

  /// Handle payment errors - log to server
  /// 
  /// Calls Meteor method: payment.paytm.paymentTransactionError
  Future<void> handlePaymentError({
    required String orderId,
    required dynamic errorObject,
  }) async {
    try {
      // Ensure connection
      if (!_meteorClient.isConnected) {
        await _meteorClient.connect();
      }

      // Wait for auth to be ready
      await _meteorClient.waitForAuth();

      await _meteorClient.call('payment.paytm.paymentTransactionError', [
        {
          'ORDERID': orderId,
          'errorObject': errorObject,
        }
      ]);
    } catch (e) {
      if (kDebugMode) {
        print('Error logging payment error: $e');
      }
      // Don't rethrow - this is just for logging
    }
  }

  /// Get payment record from server (if exists)
  /// 
  /// Used for querying payment history
  Future<Payment?> getPaymentByOrderId(String orderId) async {
    try {
      // This would call a server method to fetch payment details
      // For now, returning null as the spec focuses on creating new payments
      return null;
    } catch (e) {
      if (kDebugMode) {
        print('Error fetching payment: $e');
      }
      return null;
    }
  }

  /// Get user's wallet balance and dues
  /// 
  /// Calls Meteor method: users.getUserWallet
  Future<Map<String, dynamic>> getUserWallet() async {
    try {
      // Ensure connection
      if (!_meteorClient.isConnected) {
        await _meteorClient.connect();
      }

      // Wait for auth to be ready
      await _meteorClient.waitForAuth();

      final result = await _meteorClient.call('users.getUserWallet', []);
      
      if (result == null) {
        return {
          'success': false,
          'error': 'No wallet data returned from server',
        };
      }

      return {
        'success': true,
        'wallet': result,
      };
    } catch (e) {
      if (kDebugMode) {
        print('Error fetching wallet: $e');
      }
      return {
        'success': false,
        'error': 'Error fetching wallet: $e',
      };
    }
  }

  /// Pay invoices using user's wallet (credit notes + unused payments)
  /// 
  /// Calls Meteor method: payments.payFromWallet
  Future<Map<String, dynamic>> payFromWallet({
    required List<Invoice> invoices,
  }) async {
    try {
      // Ensure connection
      if (!_meteorClient.isConnected) {
        await _meteorClient.connect();
      }

      // Wait for auth to be ready
      await _meteorClient.waitForAuth();

      final invoiceData = invoices.map((inv) => {
        'invoice_id': inv.invoiceId,
        'amount': inv.amountDue,
      }).toList();

      final result = await _meteorClient.call('payments.payFromWallet', [
        {'invoices': invoiceData}
      ]);

      if (result == null) {
        return {
          'success': false,
          'error': 'No response from server',
        };
      }

      final bool isSuccess = result['message'] == 'success';
      return {
        'success': isSuccess,
        'error': isSuccess ? null : (result['message']?.toString() ?? 'Server returned failure without message: ${result.toString()}'),
        'message': result['message'],
        'results': result['results'],
      };
    } catch (e) {
      if (kDebugMode) {
        print('Error paying from wallet: $e');
      }
      return {
        'success': false,
        'error': 'Error paying from wallet: $e',
      };
    }
  }
}
