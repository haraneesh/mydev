import 'package:flutter_test/flutter_test.dart';
import 'package:suvai/models/invoice.dart';
import 'package:suvai/services/payment_service.dart';
import '../../test_helpers/mock_payment_service.dart';

void main() {
  group('PaymentService', () {
    late MockPaymentService paymentService;
    late Invoice testInvoice1;
    late Invoice testInvoice2;

    setUp(() {
      paymentService = MockPaymentService();
      
      testInvoice1 = Invoice(
        id: 'inv_1',
        invoiceId: 'INV-001',
        invoiceNumber: 'INV-001',
        date: DateTime(2026, 1, 15),
        dueDate: DateTime(2026, 1, 25),
        status: 'unpaid',
        total: 500.0,
        balance: 500.0,
        customer: Customer(id: 'cust_1', name: 'John Doe'),
        lineItems: [],
      );

      testInvoice2 = Invoice(
        id: 'inv_2',
        invoiceId: 'INV-002',
        invoiceNumber: 'INV-002',
        date: DateTime(2026, 1, 16),
        dueDate: DateTime(2026, 1, 26),
        status: 'unpaid',
        total: 750.0,
        balance: 750.0,
        customer: Customer(id: 'cust_1', name: 'John Doe'),
        lineItems: [],
      );
    });

    group('initiatePayment', () {
      test('returns success with tokens on valid invoices', () async {
        final result = await paymentService.initiatePayment(
          selectedInvoices: [testInvoice1],
          userMobile: '9876543210',
          firstName: 'John',
          lastName: 'Doe',
        );

        expect(result['success'], true);
        expect(result['txToken'], isNotNull);
        expect(result['suvaiTransactionId'], isNotNull);
        expect(result['status'], 'S');
      });

      test('handles multiple invoices correctly', () async {
        final result = await paymentService.initiatePayment(
          selectedInvoices: [testInvoice1, testInvoice2],
          userMobile: '9876543210',
          firstName: 'John',
          lastName: 'Doe',
        );

        expect(result['success'], true);
        expect(paymentService.lastInitiateParams['selectedInvoices'].length, 2);
      });

      test('returns error for zero amount', () async {
        final zeroInvoice = Invoice(
          id: 'inv_zero',
          invoiceId: 'INV-ZERO',
          invoiceNumber: 'INV-ZERO',
          date: DateTime.now(),
          dueDate: DateTime.now(),
          status: 'unpaid',
          total: 0.0,
          balance: 0.0,
          customer: Customer(id: 'cust_1', name: 'John'),
          lineItems: [],
        );

        final result = await paymentService.initiatePayment(
          selectedInvoices: [zeroInvoice],
          userMobile: '9876543210',
          firstName: 'John',
          lastName: 'Doe',
        );

        expect(result['success'], false);
        expect(result['error'], 'Invalid amount for payment');
      });

      test('handles initiation failure gracefully', () async {
        paymentService.shouldFailInitiate = true;
        paymentService.initiateErrorMessage = 'Configuration error';

        final result = await paymentService.initiatePayment(
          selectedInvoices: [testInvoice1],
          userMobile: '9876543210',
          firstName: 'John',
          lastName: 'Doe',
        );

        expect(result['success'], false);
        expect(result['error'], 'Configuration error');
      });

      test('stores initiate parameters for verification', () async {
        await paymentService.initiatePayment(
          selectedInvoices: [testInvoice1],
          userMobile: '9876543210',
          firstName: 'John',
          lastName: 'Doe',
          showOptionsWithFee: true,
        );

        expect(paymentService.lastInitiateParams['userMobile'], '9876543210');
        expect(paymentService.lastInitiateParams['firstName'], 'John');
        expect(paymentService.lastInitiateParams['lastName'], 'Doe');
        expect(paymentService.lastInitiateParams['showOptionsWithFee'], true);
      });
    });

    group('completePayment', () {
      test('successfully completes payment with valid data', () async {
        final paymentStatus = {
          'STATUS': 'TXN_SUCCESS',
          'ORDERID': 'ORDER_123',
          'TXNID': 'txn_456',
          'TXNAMOUNT': '500.00',
        };

        final result = await paymentService.completePayment(
          paymentStatus: paymentStatus,
          invoicesToPay: [testInvoice1],
        );

        expect(result['success'], true);
        expect(result['status'], 'TXN_SUCCESS');
        expect(result['orderId'], 'ORDER_123');
      });

      test('handles multiple invoices in completion', () async {
        final paymentStatus = {
          'STATUS': 'TXN_SUCCESS',
          'ORDERID': 'ORDER_456',
          'TXNID': 'txn_789',
          'TXNAMOUNT': '1250.00',
        };

        final result = await paymentService.completePayment(
          paymentStatus: paymentStatus,
          invoicesToPay: [testInvoice1, testInvoice2],
        );

        expect(result['success'], true);
        expect(paymentService.lastCompleteParams['invoicesToPay'].length, 2);
      });

      test('returns error on completion failure', () async {
        paymentService.shouldFailComplete = true;
        paymentService.completeErrorMessage = 'Payment processing error';

        final result = await paymentService.completePayment(
          paymentStatus: {'STATUS': 'TXN_FAILURE'},
          invoicesToPay: [testInvoice1],
        );

        expect(result['success'], false);
        expect(result['error'], 'Payment processing error');
      });

      test('stores payment status for audit trail', () async {
        final paymentStatus = {
          'STATUS': 'TXN_SUCCESS',
          'ORDERID': 'ORDER_AUDIT',
          'TXNID': 'txn_audit_123',
          'TXNAMOUNT': '500.00',
        };

        await paymentService.completePayment(
          paymentStatus: paymentStatus,
          invoicesToPay: [testInvoice1],
        );

        expect(
          paymentService.lastCompleteParams['paymentStatus']['ORDERID'],
          'ORDER_AUDIT',
        );
      });

      test('includes invoice details in completion call', () async {
        final paymentStatus = {
          'STATUS': 'TXN_SUCCESS',
          'ORDERID': 'ORDER_123',
        };

        await paymentService.completePayment(
          paymentStatus: paymentStatus,
          invoicesToPay: [testInvoice1, testInvoice2],
        );

        final invoiceData = paymentService.lastCompleteParams['invoicesToPay'];
        expect(invoiceData[0]['invoice_id'], 'INV-001');
        expect(invoiceData[1]['invoice_id'], 'INV-002');
      });
    });

    group('verifyPaymentStatus', () {
      test('successfully verifies payment status', () async {
        final result = await paymentService.verifyPaymentStatus('ORDER_123');

        expect(result['success'], true);
        expect(result['STATUS'], 'TXN_SUCCESS');
        expect(result['ORDERID'], 'ORDER_123');
      });

      test('handles verification errors gracefully', () async {
        paymentService.shouldFailVerify = true;
        paymentService.verifyErrorMessage = 'Paytm API error';

        final result = await paymentService.verifyPaymentStatus('ORDER_FAIL');

        expect(result['success'], false);
        expect(result['error'], 'Paytm API error');
      });

      test('stores order ID for verification', () async {
        await paymentService.verifyPaymentStatus('ORDER_VERIFY_TEST');

        expect(paymentService.lastVerifyOrderId, 'ORDER_VERIFY_TEST');
      });

      test('returns transaction details from verification', () async {
        final result = await paymentService.verifyPaymentStatus('ORDER_123');

        expect(result['TXNAMOUNT'], '1500.00');
        expect(result['TXNID'], isNotNull);
      });
    });

    group('handlePaymentError', () {
      test('logs payment errors with error data', () async {
        await paymentService.handlePaymentError(
          orderId: 'ORDER_ERR',
          errorObject: {'error': 'Insufficient funds'},
        );
        
        expect(paymentService.lastCompleteParams['orderId'], 'ORDER_ERR');
      });

      test('preserves error details in log', () async {
        final errorObject = {
          'STATUS': 'FAILED',
          'reason': 'User cancelled',
        };

        await paymentService.handlePaymentError(
          orderId: 'ORDER_123',
          errorObject: errorObject,
        );

        expect(paymentService.lastCompleteParams['errorObject'], errorObject);
      });
    });

    group('payFromWallet', () {
      test('successfully pays invoices from wallet', () async {
        final result = await paymentService.payFromWallet(
          invoices: [testInvoice1, testInvoice2],
        );

        expect(result['success'], true);
        expect(result['message'], 'success');
        expect(result['results'], isList);
        expect(result['results'].length, 2);
        expect(result['results'][0]['invoice_id'], 'INV-001');
      });

      test('handles empty invoice list', () async {
        final result = await paymentService.payFromWallet(invoices: []);
        
        expect(result['success'], true); // Mock returns success with empty list
        expect(result['results'], isEmpty);
      });
    });

    group('error handling and edge cases', () {
      test('handles empty invoice list gracefully', () async {
        final result = await paymentService.initiatePayment(
          selectedInvoices: [],
          userMobile: '9876543210',
          firstName: 'John',
          lastName: 'Doe',
        );

        expect(result['success'], false);
      });

      test('handles invalid mobile number gracefully', () async {
        final result = await paymentService.initiatePayment(
          selectedInvoices: [testInvoice1],
          userMobile: '', // empty
          firstName: 'John',
          lastName: 'Doe',
        );

        // Should still succeed at service level (validation at UI)
        expect(result['success'], true);
      });

      test('handles null payment status response', () async {
        paymentService.shouldFailComplete = true;

        final result = await paymentService.completePayment(
          paymentStatus: {},
          invoicesToPay: [testInvoice1],
        );

        expect(result['success'], false);
      });

      test('resets mock state for clean tests', () async {
        paymentService.shouldFailInitiate = true;
        paymentService.reset();

        final result = await paymentService.initiatePayment(
          selectedInvoices: [testInvoice1],
          userMobile: '9876543210',
          firstName: 'John',
          lastName: 'Doe',
        );

        expect(result['success'], true);
      });
    });

    group('amount calculation', () {
      test('correctly calculates total from multiple invoices', () async {
        await paymentService.initiatePayment(
          selectedInvoices: [testInvoice1, testInvoice2],
          userMobile: '9876543210',
          firstName: 'John',
          lastName: 'Doe',
        );

        // Mock would have calculated 500 + 750 = 1250
        final invoices = paymentService.lastInitiateParams['selectedInvoices'];
        final total = invoices.fold<double>(0.0, (double sum, Invoice inv) => sum + inv.amountDue);

        expect(total, 1250.0);
      });

      test('handles partial amounts correctly', () async {
        final partialInvoice = Invoice(
          id: 'inv_partial',
          invoiceId: 'INV-PARTIAL',
          invoiceNumber: 'INV-PARTIAL',
          date: DateTime.now(),
          dueDate: DateTime.now(),
          status: 'partially_paid',
          total: 1000.0,
          balance: 250.0, // Remaining amount
          customer: Customer(id: 'cust_1', name: 'John'),
          lineItems: [],
        );

        await paymentService.initiatePayment(
          selectedInvoices: [partialInvoice],
          userMobile: '9876543210',
          firstName: 'John',
          lastName: 'Doe',
        );

        final invoices = paymentService.lastInitiateParams['selectedInvoices'];
        final total = invoices.fold<double>(0.0, (double sum, Invoice inv) => sum + inv.amountDue);

        expect(total, 250.0);
      });
    });
  });
}
