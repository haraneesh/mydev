import 'package:flutter/foundation.dart';

/// Enumeration of payment error types
enum PaymentErrorType {
  networkError,           // No internet or connection lost
  timeout,                // Request took too long
  invalidConfiguration,   // Paytm settings invalid
  invalidInput,           // User input validation failed
  paytmError,            // Paytm gateway error
  serverError,           // Meteor server error
  userCancelled,         // User cancelled payment
  insufficientFunds,     // Not enough money
  cardDeclined,          // Card was declined
  invalidPaymentMethod,  // Payment mode not available
  transactionFailed,     // Transaction failed
  unknownError,          // Unknown error
}

/// Structured payment error with retry capability
class PaymentError {
  final PaymentErrorType type;
  final String message;
  final String? userMessage;
  final String? technicalDetails;
  final bool isRetryable;
  final dynamic originalError;

  PaymentError({
    required this.type,
    required this.message,
    this.userMessage,
    this.technicalDetails,
    this.isRetryable = true,
    this.originalError,
  });

  @override
  String toString() => 'PaymentError($type): $message';
}

/// Handler for payment-related errors
class PaymentErrorHandler {
  static final PaymentErrorHandler _instance = PaymentErrorHandler._internal();

  factory PaymentErrorHandler() {
    return _instance;
  }

  PaymentErrorHandler._internal();

  static PaymentErrorHandler get instance => _instance;

  /// Parse error from exception
  PaymentError parseError(dynamic error, {String? context}) {
    if (error is PaymentError) {
      return error;
    }

    final errorString = error.toString().toLowerCase();

    if (kDebugMode) {
      print('🔴 PaymentError detected');
      print('  Context: $context');
      print('  Error: $error');
      print('  Type: ${error.runtimeType}');
    }

    // Network errors
    if (errorString.contains('socket') ||
        errorString.contains('connection') ||
        errorString.contains('refused')) {
      return PaymentError(
        type: PaymentErrorType.networkError,
        message: 'Network connection failed',
        userMessage:
            'Unable to connect to payment gateway. Please check your internet connection.',
        technicalDetails: error.toString(),
        isRetryable: true,
      );
    }

    // Timeout errors
    if (errorString.contains('timeout') || errorString.contains('deadline')) {
      return PaymentError(
        type: PaymentErrorType.timeout,
        message: 'Request timeout',
        userMessage:
            'Payment request took too long. Please check your connection and try again.',
        technicalDetails: error.toString(),
        isRetryable: true,
      );
    }

    // Configuration errors
    if (errorString.contains('configuration') || errorString.contains('merchant')) {
      return PaymentError(
        type: PaymentErrorType.invalidConfiguration,
        message: 'Payment gateway configuration error',
        userMessage:
            'Payment gateway is not properly configured. Please contact support.',
        technicalDetails: error.toString(),
        isRetryable: false,
      );
    }

    // Default to unknown
    return PaymentError(
      type: PaymentErrorType.unknownError,
      message: 'An error occurred during payment',
      userMessage: 'Something went wrong. Please try again.',
      technicalDetails: error.toString(),
      isRetryable: true,
      originalError: error,
    );
  }

  /// Parse Paytm-specific error response
  PaymentError parsePaytmResponse(Map<String, dynamic> response) {
    final status = response['STATUS']?.toString().toUpperCase() ?? 'UNKNOWN';
    final respCode = response['RESPCODE']?.toString() ?? '999';
    final respMsg = response['RESPMSG']?.toString() ?? 'Unknown error';

    if (kDebugMode) {
      print('🔴 Paytm Response Error');
      print('  Status: $status');
      print('  Code: $respCode');
      print('  Message: $respMsg');
    }

    // Payment successful - not an error
    if (status == 'TXN_SUCCESS') {
      return PaymentError(
        type: PaymentErrorType.paytmError,
        message: 'Payment successful',
        isRetryable: false,
      );
    }

    // Insufficient funds
    if (respCode == '1001' ||
        respMsg.toLowerCase().contains('insufficient') ||
        respMsg.toLowerCase().contains('amount')) {
      return PaymentError(
        type: PaymentErrorType.insufficientFunds,
        message: 'Insufficient funds',
        userMessage:
            'Your account does not have sufficient balance for this transaction.',
        technicalDetails: 'Paytm Response: $respMsg',
        isRetryable: true,
      );
    }

    // Card declined
    if (respCode == '1002' ||
        respMsg.toLowerCase().contains('declined') ||
        respMsg.toLowerCase().contains('card')) {
      return PaymentError(
        type: PaymentErrorType.cardDeclined,
        message: 'Card declined',
        userMessage:
            'Your card was declined. Please try a different payment method.',
        technicalDetails: 'Paytm Response: $respMsg',
        isRetryable: true,
      );
    }

    // Invalid payment method
    if (respMsg.toLowerCase().contains('payment mode') ||
        respMsg.toLowerCase().contains('method')) {
      return PaymentError(
        type: PaymentErrorType.invalidPaymentMethod,
        message: 'Invalid payment method',
        userMessage:
            'The selected payment method is not available. Please choose another method.',
        technicalDetails: 'Paytm Response: $respMsg',
        isRetryable: true,
      );
    }

    // User cancelled
    if (status == 'TXN_FAILURE' && respCode == '1003') {
      return PaymentError(
        type: PaymentErrorType.userCancelled,
        message: 'Payment cancelled by user',
        userMessage: 'You cancelled the payment.',
        isRetryable: true,
      );
    }

    // Generic Paytm error
    return PaymentError(
      type: PaymentErrorType.paytmError,
      message: 'Payment gateway error',
      userMessage: respMsg,
      technicalDetails: 'Paytm Code: $respCode',
      isRetryable: true,
    );
  }

  /// Parse server error response
  PaymentError parseServerError(Map<String, dynamic> response) {
    final errorMessage = response['error']?.toString() ?? 'Unknown error';
    final errorCode = response['errorCode']?.toString();

    if (kDebugMode) {
      print('🔴 Server Error');
      print('  Message: $errorMessage');
      print('  Code: $errorCode');
    }

    // Specific error codes
    if (errorCode == '401' || errorMessage.toLowerCase().contains('unauthorized')) {
      return PaymentError(
        type: PaymentErrorType.serverError,
        message: 'Unauthorized',
        userMessage: 'Your session has expired. Please log in again.',
        isRetryable: false,
      );
    }

    if (errorCode == '403' || errorMessage.toLowerCase().contains('forbidden')) {
      return PaymentError(
        type: PaymentErrorType.serverError,
        message: 'Access denied',
        userMessage: 'You do not have permission to perform this action.',
        isRetryable: false,
      );
    }

    if (errorCode == '500' ||
        errorMessage.toLowerCase().contains('internal') ||
        errorMessage.toLowerCase().contains('server')) {
      return PaymentError(
        type: PaymentErrorType.serverError,
        message: 'Server error',
        userMessage:
            'Payment server is experiencing issues. Please try again later.',
        isRetryable: true,
      );
    }

    // Generic server error
    return PaymentError(
      type: PaymentErrorType.serverError,
      message: 'Server error',
      userMessage: errorMessage,
      technicalDetails: 'Code: $errorCode',
      isRetryable: true,
    );
  }

  /// Get user-friendly error message
  String getUserMessage(PaymentError error) {
    return error.userMessage ?? error.message;
  }

  /// Check if error is retryable
  bool isRetryable(PaymentError error) {
    return error.isRetryable;
  }

  /// Get error icon
  String getErrorIcon(PaymentError error) {
    switch (error.type) {
      case PaymentErrorType.networkError:
      case PaymentErrorType.timeout:
        return '📡'; // Signal/network icon
      case PaymentErrorType.insufficientFunds:
        return '💰'; // Money icon
      case PaymentErrorType.cardDeclined:
        return '🚫'; // Decline icon
      case PaymentErrorType.userCancelled:
        return '⏹️'; // Cancel icon
      default:
        return '❌'; // Error icon
    }
  }
}
