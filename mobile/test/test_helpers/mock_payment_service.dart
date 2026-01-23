import 'package:suvai/models/invoice.dart';
import 'package:suvai/services/payment_service.dart';

class MockPaymentService extends PaymentService {
  MockPaymentService() : super.forTest();
  bool shouldFailInitiate = false;
  bool shouldFailComplete = false;
  bool shouldFailVerify = false;
  
  String? initiateErrorMessage;
  String? completeErrorMessage;
  String? verifyErrorMessage;

  late Map<String, dynamic> lastInitiateParams;
  late Map<String, dynamic> lastCompleteParams;
  late String lastVerifyOrderId;

  @override
  Future<Map<String, dynamic>> initiatePayment({
    required List<Invoice> selectedInvoices,
    required String userMobile,
    required String firstName,
    required String lastName,
    bool showOptionsWithFee = false,
  }) async {
    lastInitiateParams = {
      'selectedInvoices': selectedInvoices,
      'userMobile': userMobile,
      'firstName': firstName,
      'lastName': lastName,
      'showOptionsWithFee': showOptionsWithFee,
    };

    if (shouldFailInitiate) {
      return {
        'success': false,
        'error': initiateErrorMessage ?? 'Mock initiate failed',
      };
    }

    final totalAmount = selectedInvoices.fold<double>(
      0,
      (sum, invoice) => sum + invoice.amountDue,
    );

    if (totalAmount <= 0) {
      return {
        'success': false,
        'error': 'Invalid amount for payment',
      };
    }

    return {
      'success': true,
      'txToken': 'mock_token_${DateTime.now().millisecondsSinceEpoch}',
      'suvaiTransactionId': 'mock_trans_${DateTime.now().millisecondsSinceEpoch}',
      'status': 'S',
    };
  }

  @override
  Future<Map<String, dynamic>> completePayment({
    required Map<String, dynamic> paymentStatus,
    required List<Invoice> invoicesToPay,
  }) async {
    final mappedInvoices = invoicesToPay.map((inv) => {
      '_id': inv.id,
      'invoice_id': inv.invoiceId,
      'total': inv.amountDue,
    }).toList();

    lastCompleteParams = {
      'paymentStatus': paymentStatus,
      'invoicesToPay': mappedInvoices,
    };

    if (shouldFailComplete) {
      return {
        'success': false,
        'error': completeErrorMessage ?? 'Mock complete failed',
      };
    }

    return {
      'success': true,
      'status': 'TXN_SUCCESS',
      'orderId': paymentStatus['ORDERID'] ?? 'mock_order_123',
      'processedAt': DateTime.now().toIso8601String(),
      'message': 'Payment processed successfully',
    };
  }

  @override
  Future<Map<String, dynamic>> verifyPaymentStatus(String orderId) async {
    lastVerifyOrderId = orderId;

    if (shouldFailVerify) {
      return {
        'success': false,
        'error': verifyErrorMessage ?? 'Mock verify failed',
      };
    }

    return {
      'success': true,
      'STATUS': 'TXN_SUCCESS',
      'ORDERID': orderId,
      'TXNAMOUNT': '1500.00',
      'TXNID': 'mock_txn_123',
    };
  }

  @override
  Future<void> handlePaymentError({
    required String orderId,
    required dynamic errorObject,
  }) async {
    lastCompleteParams = {
      'orderId': orderId,
      'errorObject': errorObject,
    };
  }

  @override
  Future<Map<String, dynamic>> getUserWallet() async {
    return {
      'success': true,
      'wallet': {
        'unused_retainer_payments_InPaise': 4000, // 40.00
        'unused_credits_receivable_amount_InPaise': 0,
        'outstanding_receivable_amount_InPaise': 50000,
        'lastZohoSync': DateTime.now().toIso8601String(),
      },
    };
  }

  @override
  Future<Map<String, dynamic>> payFromWallet({
    required List<Invoice> invoices,
  }) async {
    return {
      'success': true,
      'message': 'success',
      'results': invoices.map((inv) => {
        'invoice_id': inv.invoiceId,
        'applied': inv.amountDue,
        'remaining': 0.0,
      }).toList(),
    };
  }

  void reset() {
    shouldFailInitiate = false;
    shouldFailComplete = false;
    shouldFailVerify = false;
    initiateErrorMessage = null;
    completeErrorMessage = null;
    verifyErrorMessage = null;
  }
}
