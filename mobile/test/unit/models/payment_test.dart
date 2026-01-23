import 'package:flutter_test/flutter_test.dart';
import 'package:suvai/models/payment.dart';

void main() {
  group('Payment Model', () {
    test('creates payment with all required fields', () {
      final payment = Payment(
        orderId: 'ORDER_123',
        owner: 'user_456',
        status: PaymentStatus.completed,
        totalAmount: 1500.0,
        relatedInvoices: ['inv_1', 'inv_2'],
        invoiceCount: 2,
      );

      expect(payment.orderId, 'ORDER_123');
      expect(payment.owner, 'user_456');
      expect(payment.status, PaymentStatus.completed);
      expect(payment.totalAmount, 1500.0);
      expect(payment.relatedInvoices, ['inv_1', 'inv_2']);
      expect(payment.invoiceCount, 2);
    });

    test('fromJson parses completed payment correctly', () {
      final json = {
        'orderId': 'ORDER_789',
        'owner': 'user_123',
        'status': 'completed',
        'paymentMethod': 'CC',
        'totalAmount': 2500.0,
        'relatedInvoices': ['inv_1', 'inv_2', 'inv_3'],
        'invoiceCount': 3,
        'paymentApiInitiationResponseObject': {
          'txToken': 'token_abc123',
          'suvaiTransactionId': 'suvai_trans_123',
        },
        'paymentApiResponseObject': {
          'STATUS': 'TXN_SUCCESS',
          'ORDERID': 'ORDER_789',
          'TXNAMOUNT': '2500.00',
          'TXNID': '202301121234567890',
        },
      };

      final payment = Payment.fromJson(json);

      expect(payment.orderId, 'ORDER_789');
      expect(payment.owner, 'user_123');
      expect(payment.status, PaymentStatus.completed);
      expect(payment.paymentMethod, 'CC');
      expect(payment.totalAmount, 2500.0);
      expect(payment.invoiceCount, 3);
    });

    test('fromJson parses failed payment correctly', () {
      final json = {
        'orderId': 'ORDER_FAIL',
        'owner': 'user_123',
        'status': 'failed',
        'totalAmount': 1000.0,
        'relatedInvoices': ['inv_1'],
        'error': 'Insufficient funds',
        'errorDetails': {
          'code': 'INSUFFICIENT_FUNDS',
          'message': 'Account has insufficient funds for this transaction',
        },
      };

      final payment = Payment.fromJson(json);

      expect(payment.orderId, 'ORDER_FAIL');
      expect(payment.status, PaymentStatus.failed);
      expect(payment.isFailed, true);
      expect(payment.error, 'Insufficient funds');
      expect(payment.errorDetails, isNotNull);
    });

    test('fromJson parses error payment correctly', () {
      final json = {
        'orderId': 'ORDER_ERR',
        'owner': 'user_123',
        'status': 'error',
        'totalAmount': 500.0,
        'relatedInvoices': [],
        'error': 'Configuration error',
      };

      final payment = Payment.fromJson(json);

      expect(payment.status, PaymentStatus.error);
      expect(payment.isError, true);
    });

    test('fromJson parses pending payment correctly', () {
      final json = {
        'orderId': 'ORDER_PENDING',
        'owner': 'user_123',
        'status': 'pending',
        'totalAmount': 800.0,
        'relatedInvoices': ['inv_1'],
      };

      final payment = Payment.fromJson(json);

      expect(payment.status, PaymentStatus.pending);
      expect(payment.isPending, true);
      expect(payment.isCompleted, false);
      expect(payment.isFailed, false);
    });

    test('fromJson handles missing optional fields', () {
      final json = {
        'orderId': 'ORDER_MINIMAL',
        'owner': 'user_123',
        'status': 'completed',
        'totalAmount': 100.0,
        'relatedInvoices': [],
      };

      final payment = Payment.fromJson(json);

      expect(payment.orderId, 'ORDER_MINIMAL');
      expect(payment.paymentMethod, isNull);
      expect(payment.error, isNull);
      expect(payment.errorDetails, isNull);
      expect(payment.createdAt, isNull);
    });

    test('statusDisplay returns correct message for completed status', () {
      final payment = Payment(
        orderId: 'TEST_1',
        owner: 'user_123',
        status: PaymentStatus.completed,
        totalAmount: 100.0,
        relatedInvoices: [],
      );

      expect(payment.statusDisplay, 'Payment Completed');
    });

    test('statusDisplay returns correct message for failed status', () {
      final payment = Payment(
        orderId: 'TEST_2',
        owner: 'user_123',
        status: PaymentStatus.failed,
        totalAmount: 100.0,
        relatedInvoices: [],
      );

      expect(payment.statusDisplay, 'Payment Failed');
    });

    test('statusDisplay returns correct message for error status', () {
      final payment = Payment(
        orderId: 'TEST_3',
        owner: 'user_123',
        status: PaymentStatus.error,
        totalAmount: 100.0,
        relatedInvoices: [],
      );

      expect(payment.statusDisplay, 'Payment Error');
    });

    test('statusDisplay returns processing message for pending status', () {
      final payment = Payment(
        orderId: 'TEST_4',
        owner: 'user_123',
        status: PaymentStatus.pending,
        totalAmount: 100.0,
        relatedInvoices: [],
      );

      expect(payment.statusDisplay, 'Processing...');
    });

    test('paymentMethodDisplay returns correct display name for CC', () {
      final payment = Payment(
        orderId: 'TEST_1',
        owner: 'user_123',
        status: PaymentStatus.completed,
        paymentMethod: 'CC',
        totalAmount: 100.0,
        relatedInvoices: [],
      );

      expect(payment.paymentMethodDisplay, 'Credit Card');
    });

    test('paymentMethodDisplay returns correct display name for NB', () {
      final payment = Payment(
        orderId: 'TEST_2',
        owner: 'user_123',
        status: PaymentStatus.completed,
        paymentMethod: 'NB',
        totalAmount: 100.0,
        relatedInvoices: [],
      );

      expect(payment.paymentMethodDisplay, 'Net Banking');
    });

    test('paymentMethodDisplay returns correct display name for UPI', () {
      final payment = Payment(
        orderId: 'TEST_3',
        owner: 'user_123',
        status: PaymentStatus.completed,
        paymentMethod: 'UPI',
        totalAmount: 100.0,
        relatedInvoices: [],
      );

      expect(payment.paymentMethodDisplay, 'UPI');
    });

    test('paymentMethodDisplay returns correct display name for WALLET', () {
      final payment = Payment(
        orderId: 'TEST_4',
        owner: 'user_123',
        status: PaymentStatus.completed,
        paymentMethod: 'WALLET',
        totalAmount: 100.0,
        relatedInvoices: [],
      );

      expect(payment.paymentMethodDisplay, 'Wallet');
    });

    test('paymentMethodDisplay returns unknown for unrecognized method', () {
      final payment = Payment(
        orderId: 'TEST_5',
        owner: 'user_123',
        status: PaymentStatus.completed,
        paymentMethod: 'UNKNOWN',
        totalAmount: 100.0,
        relatedInvoices: [],
      );

      expect(payment.paymentMethodDisplay, 'UNKNOWN');
    });

    test('paymentMethodDisplay returns Unknown when method is null', () {
      final payment = Payment(
        orderId: 'TEST_6',
        owner: 'user_123',
        status: PaymentStatus.completed,
        paymentMethod: null,
        totalAmount: 100.0,
        relatedInvoices: [],
      );

      expect(payment.paymentMethodDisplay, 'Unknown');
    });

    test('fromJson parses timestamps correctly', () {
      final json = {
        'orderId': 'ORDER_TIME',
        'owner': 'user_123',
        'status': 'completed',
        'totalAmount': 100.0,
        'relatedInvoices': [],
        'createdAt': '2026-01-19T10:30:00.000Z',
        'updatedAt': '2026-01-19T10:35:00.000Z',
        'processedAt': '2026-01-19T10:36:00.000Z',
      };

      final payment = Payment.fromJson(json);

      expect(payment.createdAt, isNotNull);
      expect(payment.updatedAt, isNotNull);
      expect(payment.processedAt, isNotNull);
    });

    test('fromJson handles malformed amount gracefully', () {
      final json = {
        'orderId': 'ORDER_BAD',
        'owner': 'user_123',
        'status': 'completed',
        'totalAmount': 'invalid',
        'relatedInvoices': [],
      };

      final payment = Payment.fromJson(json);

      expect(payment.totalAmount, 0.0);
    });

    test('fromJson handles null amount gracefully', () {
      final json = {
        'orderId': 'ORDER_NULL',
        'owner': 'user_123',
        'status': 'completed',
        'totalAmount': null,
        'relatedInvoices': [],
      };

      final payment = Payment.fromJson(json);

      expect(payment.totalAmount, 0.0);
    });

    test('isCompleted returns true only for completed status', () {
      final completed = Payment(
        orderId: 'TEST_1',
        owner: 'user',
        status: PaymentStatus.completed,
        totalAmount: 100.0,
        relatedInvoices: [],
      );
      final failed = Payment(
        orderId: 'TEST_2',
        owner: 'user',
        status: PaymentStatus.failed,
        totalAmount: 100.0,
        relatedInvoices: [],
      );

      expect(completed.isCompleted, true);
      expect(failed.isCompleted, false);
    });

    test('isPending returns true for pending and other non-terminal states', () {
      final pending = Payment(
        orderId: 'TEST_1',
        owner: 'user',
        status: PaymentStatus.pending,
        totalAmount: 100.0,
        relatedInvoices: [],
      );
      final completed = Payment(
        orderId: 'TEST_2',
        owner: 'user',
        status: PaymentStatus.completed,
        totalAmount: 100.0,
        relatedInvoices: [],
      );

      expect(pending.isPending, true);
      expect(completed.isPending, false);
    });

    test('fromJson handles list of invoices as strings and maps', () {
      final json1 = {
        'orderId': 'ORDER_1',
        'owner': 'user',
        'status': 'completed',
        'totalAmount': 100.0,
        'relatedInvoices': ['inv_1', 'inv_2', 'inv_3'],
      };

      final json2 = {
        'orderId': 'ORDER_2',
        'owner': 'user',
        'status': 'completed',
        'totalAmount': 100.0,
        'relatedInvoices': [123, 456, 789], // Numbers
      };

      final payment1 = Payment.fromJson(json1);
      final payment2 = Payment.fromJson(json2);

      expect(payment1.relatedInvoices, ['inv_1', 'inv_2', 'inv_3']);
      expect(payment2.relatedInvoices, ['123', '456', '789']);
    });

    test('fromJson handles empty invoice list', () {
      final json = {
        'orderId': 'ORDER_EMPTY',
        'owner': 'user',
        'status': 'completed',
        'totalAmount': 0.0,
        'relatedInvoices': [],
      };

      final payment = Payment.fromJson(json);

      expect(payment.relatedInvoices, isEmpty);
      expect(payment.invoiceCount, 0);
    });
  });
}
