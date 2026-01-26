import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../models/invoice.dart';
import '../models/payment.dart';
import '../utils/paytm_sdk_wrapper.dart';
import 'payment_service.dart';
import 'paytm_config_service.dart';
import 'payment_error_handler.dart';
import 'payment_retry_manager.dart';

/// Controller for managing Paytm payment flow
class PaytmPaymentController {
  static final PaytmPaymentController _instance =
      PaytmPaymentController._internal();

  factory PaytmPaymentController() {
    return _instance;
  }

  PaytmPaymentController._internal();

  static PaytmPaymentController get instance => _instance;

  final _paymentService = PaymentService.instance;
  final _configService = PaytmConfigService.instance;
  final _errorHandler = PaymentErrorHandler.instance;
  final _retryManager = PaymentRetryManager.instance;

  /// Launch Paytm payment gateway
  /// 
  /// Returns: { success: bool, orderId: string, status: string, error?: string }
  Future<Map<String, dynamic>> launchPaytmCheckout({
    required List<Invoice> selectedInvoices,
    required String userMobile,
    required String firstName,
    required String lastName,
    double? customAmount,
    bool showOptionsWithFee = false,
  }) async {
    try {
      // Validate input
      if (selectedInvoices.isEmpty) {
        return {
          'success': false,
          'error': 'No invoices selected',
        };
      }

      if (userMobile.isEmpty || userMobile.length < 10) {
        return {
          'success': false,
          'error': 'Invalid mobile number',
        };
      }

      // Fetch Paytm configuration
      final config = await _configService.fetchPaytmConfig();

      // Validate configuration
      if (!_configService.validateConfiguration(config)) {
        return {
          'success': false,
          'error': 'Paytm configuration invalid',
        };
      }

      if (kDebugMode) {
        print('✓ Paytm config validated');
        print('  merchantId: ${config['merchantId']}');
        print('  hostName: ${config['hostName']}');
      }

      // Step 1: Initiate transaction with server (with retry)
      late Map<String, dynamic> initiateResult;
      
      try {
        initiateResult = await _retryManager.executeWithRetryAndTimeout(
          () => Future.value(_paymentService.initiatePayment(
            selectedInvoices: selectedInvoices,
            userMobile: userMobile,
            firstName: firstName,
            lastName: lastName,
            showOptionsWithFee: showOptionsWithFee,
            customAmount: customAmount,
          )),
          timeout: const Duration(seconds: 15),
          config: const RetryConfig(
            maxAttempts: 2,
            initialDelay: Duration(seconds: 2),
          ),
        );
      } catch (e) {
        final error = _errorHandler.parseError(e, context: 'initiatePayment');
        if (kDebugMode) {
          print('✗ Initiate payment failed: ${error.message}');
        }
        return {
          'success': false,
          'error': error.userMessage ?? error.message,
          'isRetryable': error.isRetryable,
        };
      }

      if (!initiateResult['success']) {
        final error = _errorHandler.parseError(
          initiateResult['error'] ?? 'Failed to initiate transaction',
          context: 'initiatePayment',
        );
        return {
          'success': false,
          'error': error.userMessage ?? error.message,
          'isRetryable': error.isRetryable,
        };
      }

      final txToken = initiateResult['txToken'] as String?;
      final suvaiTransactionId = initiateResult['suvaiTransactionId'] as String?;

      if (txToken == null || txToken.isEmpty) {
        return {
          'success': false,
          'error': 'Failed to get transaction token from server',
        };
      }

      if (suvaiTransactionId == null || suvaiTransactionId.isEmpty) {
        return {
          'success': false,
          'error': 'Failed to get transaction ID from server',
        };
      }

      if (kDebugMode) {
        print('✓ Transaction initiated');
        print('  txToken received');
        print('  orderId: $suvaiTransactionId');
      }

      // Step 2: Launch Paytm checkout using AllInOneSDK
      late Map<String, dynamic> checkoutResult;
      
      try {
        checkoutResult = await _launchPaytmCheckoutSDK(
          txToken: txToken,
          orderId: suvaiTransactionId,
          amount: showOptionsWithFee 
              ? _calculateTotalWithFee(customAmount ?? _calculateTotalAmount(selectedInvoices))
              : (customAmount ?? _calculateTotalAmount(selectedInvoices)),
          merchantId: config['merchantId'] as String,
          isStaging: config['isMock'] == true || 
                     (config['hostName'] as String).contains('stage'),
          callbackUrl: config['callbackUrl'] as String?,
        ).timeout(
          const Duration(minutes: 5),
          onTimeout: () => {
            'success': false,
            'error': 'Payment gateway timeout. Please try again.',
          },
        );
      } catch (e) {
        final error = _errorHandler.parseError(e, context: 'launchPaytmCheckout');
        if (kDebugMode) {
          print('✗ Paytm checkout error: ${error.message}');
        }

        // Log error to server
        try {
          await _paymentService.handlePaymentError(
            orderId: suvaiTransactionId,
            errorObject: {
              'reason': error.message,
              'type': 'sdk_error',
              'timestamp': DateTime.now().toIso8601String(),
            },
          );
        } catch (_) {
          // Ignore logging errors
        }

        return {
          'success': false,
          'orderId': suvaiTransactionId,
          'error': error.userMessage ?? error.message,
          'isRetryable': error.isRetryable,
        };
      }

      if (!checkoutResult['success']) {
        // User cancelled or error occurred
        if (kDebugMode) {
          print('✗ Payment cancelled or error');
          print('  error: ${checkoutResult['error']}');
        }

        // Log error to server
        try {
          await _paymentService.handlePaymentError(
            orderId: suvaiTransactionId,
            errorObject: {
              'reason': checkoutResult['error'] ?? 'Unknown error',
              'type': 'user_cancelled',
              'timestamp': DateTime.now().toIso8601String(),
            },
          );
        } catch (_) {
          // Ignore logging errors
        }

        return {
          'success': false,
          'orderId': suvaiTransactionId,
          'error': checkoutResult['error'] ?? 'Payment cancelled',
          'isRetryable': true,
        };
      }

      // Step 3: Handle Paytm response
      final Map<String, dynamic> paymentStatus = checkoutResult['paymentStatus'] is Map 
          ? Map<String, dynamic>.from(checkoutResult['paymentStatus'])
          : {};

      if (kDebugMode) {
        print('✓ Paytm response received');
        print('  Full response: $paymentStatus');
        print('  status: ${paymentStatus['STATUS']}');
        print('  respCode: ${paymentStatus['RESPCODE']}');
        print('  txnId: ${paymentStatus['TXNID']}');
      }

      // Validate payment status before proceeding to server completion
      if (paymentStatus['STATUS'] != 'TXN_SUCCESS') {
        final error = _errorHandler.parsePaytmResponse(paymentStatus);
        if (kDebugMode) {
          print('✗ Payment not successful: ${error.message}');
        }
        
        // Log the failure to server
        try {
          await _paymentService.handlePaymentError(
            orderId: suvaiTransactionId,
            errorObject: {
              'reason': error.message,
              'type': 'status_check_failure',
              'paymentStatus': paymentStatus,
              'timestamp': DateTime.now().toIso8601String(),
            },
          );
        } catch (_) {}

        return {
          'success': false,
          'orderId': suvaiTransactionId,
          'error': error.userMessage ?? error.message,
          'isRetryable': true,
          'technicalDetails': 'Paytm status: ${paymentStatus['STATUS']}, code: ${paymentStatus['RESPCODE']}',
        };
      }

      // Step 4: Complete transaction on server (with retry)
      late Map<String, dynamic> completeResult;
      
      try {
        completeResult = await _retryManager.executeWithRetryAndTimeout(
          () => Future.value(_paymentService.completePayment(
            paymentStatus: paymentStatus,
            invoicesToPay: selectedInvoices,
          )),
          timeout: const Duration(seconds: 15),
          config: const RetryConfig(
            maxAttempts: 2,
            initialDelay: Duration(seconds: 2),
          ),
        );
      } catch (e) {
        final error = _errorHandler.parseError(e, context: 'completePayment');
        if (kDebugMode) {
          print('✗ Payment completion failed: ${error.message}');
        }
        
        // Log error to server even if completion failed
        try {
          await _paymentService.handlePaymentError(
            orderId: suvaiTransactionId,
            errorObject: {
              'reason': error.message,
              'type': 'completion_error',
              'timestamp': DateTime.now().toIso8601String(),
            },
          );
        } catch (_) {
          // Ignore logging errors
        }
        
        return {
          'success': false,
          'orderId': suvaiTransactionId,
          'error': error.userMessage ?? error.message,
          'isRetryable': error.isRetryable,
        };
      }

      if (!completeResult['success']) {
        final error = _errorHandler.parseError(
          completeResult['error'] ?? 'Failed to complete payment',
          context: 'completePayment',
        );
        if (kDebugMode) {
          print('✗ Payment completion failed');
          print('  error: ${error.message}');
        }

        return {
          'success': false,
          'orderId': suvaiTransactionId,
          'error': error.userMessage ?? error.message,
          'isRetryable': error.isRetryable,
        };
      }

      if (kDebugMode) {
        print('✓ Payment completed successfully');
        print('  orderId: ${completeResult['orderId']}');
      }

      // Success
      return {
        'success': true,
        'orderId': suvaiTransactionId,
        'status': 'completed',
        'transactionId': paymentStatus['TXNID'],
        'amount': paymentStatus['TXNAMOUNT'],
      };
    } catch (e) {
      if (kDebugMode) {
        print('✗ Exception during payment: $e');
      }

      return {
        'success': false,
        'error': 'Exception: $e',
      };
    }
  }

  /// Launch Paytm All-in-One SDK
  /// 
  /// Returns: { success: bool, paymentStatus: map?, error: string? }
  Future<Map<String, dynamic>> _launchPaytmCheckoutSDK({
    required String txToken,
    required String orderId,
    required double amount,
    required String merchantId,
    required bool isStaging,
    String? callbackUrl,
  }) async {
    try {
      // Prepare Paytm parameters for SDK
      final params = {
        'mid': merchantId,
        'orderId': orderId,
        'txnToken': txToken,
        'amount': amount.toStringAsFixed(2),
        'isStaging': isStaging,
        'restrictAppInvoke': isStaging, // Restrict app invoke for staging to avoid app link issues
      };

      if (kDebugMode) {
        print('Launching Paytm SDK with:');
        print('  mid: $merchantId');
        print('  orderId: $orderId');
        print('  amount: $amount');
        print('  isStaging: $isStaging');
      }

      // Construct callback URL safely
      String finalCallbackUrl = (callbackUrl == null || callbackUrl.isEmpty)
          ? (isStaging 
              ? 'https://securestage.paytmpayments.com/theia/paytmCallback' 
              : 'https://securegw.paytm.in/theia/paytmCallback')
          : callbackUrl;
      
      // Ensure ORDER_ID is appended correctly but only once
      if (!finalCallbackUrl.contains('ORDER_ID=')) {
        finalCallbackUrl += (finalCallbackUrl.contains('?') ? '&' : '?') + 'ORDER_ID=$orderId';
      } else {
        // If it already has it, ensure the value is set correctly
        finalCallbackUrl = finalCallbackUrl.replaceAll(
          RegExp(r'ORDER_ID=[^&]*'), 
          'ORDER_ID=$orderId'
        );
      }

      if (kDebugMode) {
        print('  finalCallbackUrl: $finalCallbackUrl');
      }

      if (kDebugMode) {
        print('  callbackUrl: $finalCallbackUrl');
      }

      // Call Paytm SDK wrapper
      final response = await PaytmSdkWrapper.startTransaction(
        mid: params['mid'] as String,
        orderId: params['orderId'] as String,
        amount: params['amount'] as String,
        txnToken: params['txnToken'] as String,
        isStaging: params['isStaging'] as bool,
        restrictAppInvoke: params['restrictAppInvoke'] as bool,
        callbackUrl: finalCallbackUrl,
      );

      if (kDebugMode) {
        print('✓ Paytm response received');
        print('  response: $response');
      }

      if (response == null) {
        return {
          'success': false,
          'error': 'No response from Paytm SDK',
        };
      }

      return {
        'success': true,
        'paymentStatus': _parsePaytmResponse(response),
      };
    } catch (e) {
      if (kDebugMode) {
        print('Exception in Paytm SDK: $e');
      }

      return {
        'success': false,
        'error': 'Paytm SDK error: $e',
      };
    }
  }

  /// Parse Paytm response from SDK
  Map<String, dynamic> _parsePaytmResponse(dynamic response) {
    if (response == null) {
      return {
        'STATUS': 'UNKNOWN',
        'RESPCODE': '999',
        'RESPMSG': 'Unknown response',
      };
    }

    if (response is String) {
      try {
        // Try to parse as JSON if it looks like JSON
        if (response.trim().startsWith('{')) {
          return Map<String, dynamic>.from(jsonDecode(response));
        }
        
        // Sometimes it's a URL-encoded string of JSON
        final decoded = Uri.decodeFull(response);
        if (decoded.trim().startsWith('{')) {
          return Map<String, dynamic>.from(jsonDecode(decoded));
        }

        // Sometimes it's a query-string format (key1=val1&key2=val2)
        if (response.contains('=') || decoded.contains('=')) {
          final querySource = decoded.contains('=') ? decoded : response;
          final Map<String, String> params = Uri.splitQueryString(querySource);
          
          if (params.isNotEmpty) {
            final Map<String, dynamic> normalized = {};
            // Paytm SDK sometimes returns keys in lowercase or mixed case
            params.forEach((key, value) {
              normalized[key.toUpperCase()] = value;
            });
            return normalized;
          }
        }

        return {
          'STATUS': 'UNKNOWN',
          'RESPCODE': '999',
          'RESPMSG': response,
          'RAW': response,
        };
      } catch (e) {
        return {
          'STATUS': 'ERROR',
          'RESPCODE': '999',
          'RESPMSG': 'Error parsing response: $e',
          'RAW': response,
        };
      }
    }

    // Handle map response
    if (response is Map) {
      final Map<String, dynamic> normalized = {};
      response.forEach((key, value) {
        if (value != null) {
          normalized[key.toString().toUpperCase()] = value.toString();
        }
      });
      return normalized;
    }

    return {
      'STATUS': 'UNKNOWN',
      'RESPCODE': '999',
      'RESPMSG': 'Could not parse response',
    };
  }

  /// Calculate total amount for payment
  double _calculateTotalAmount(List<Invoice> invoices) {
    return invoices.fold(0.0, (sum, inv) => sum + inv.amountDue);
  }

  double _calculateTotalWithFee(double baseAmount) {
    // 2.3% fee logic matches Meteor: Math.ceil(total * 2.3) / 100
    final fee = (baseAmount * 2.3).ceilToDouble() / 100.0;
    return double.parse((baseAmount + fee).toStringAsFixed(2));
  }
}
