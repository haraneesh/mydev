import 'package:flutter_test/flutter_test.dart';
import 'package:suvai/models/invoice.dart';
import 'package:suvai/models/payment_selection.dart';

void main() {
  group('PaymentSelection Model', () {
    final testInvoice1 = Invoice(
      id: 'inv_1',
      invoiceId: 'INV-001',
      invoiceNumber: 'INV-001',
      date: DateTime(2026, 1, 15),
      dueDate: DateTime(2026, 1, 25),
      status: 'unpaid',
      total: 500.0,
      balance: 500.0,
      amountDue: 500.0,
      customer: Customer(id: 'cust_1', name: 'John Doe'),
      lineItems: [],
    );

    final testInvoice2 = Invoice(
      id: 'inv_2',
      invoiceId: 'INV-002',
      invoiceNumber: 'INV-002',
      date: DateTime(2026, 1, 16),
      dueDate: DateTime(2026, 1, 26),
      status: 'unpaid',
      total: 750.0,
      balance: 750.0,
      amountDue: 750.0,
      customer: Customer(id: 'cust_1', name: 'John Doe'),
      lineItems: [],
    );

    final testInvoice3 = Invoice(
      id: 'inv_3',
      invoiceId: 'INV-003',
      invoiceNumber: 'INV-003',
      date: DateTime(2026, 1, 17),
      dueDate: DateTime(2026, 1, 27),
      status: 'paid',
      total: 1000.0,
      balance: 0.0,
      amountDue: 0.0,
      customer: Customer(id: 'cust_1', name: 'John Doe'),
      lineItems: [],
    );

    test('creates empty selection by default', () {
      final selection = PaymentSelection();

      expect(selection.selectedInvoices, isEmpty);
      expect(selection.count, 0);
      expect(selection.subtotal, 0.0);
      expect(selection.totalAmount, 0.0);
      expect(selection.hasSelection, false);
      expect(selection.isValid, false);
    });

    test('calculates subtotal correctly', () {
      final selection = PaymentSelection(
        selectedInvoices: [testInvoice1, testInvoice2],
      );

      expect(selection.subtotal, 1250.0);
    });

    test('calculates gateway fee correctly with default 3%', () {
      final selection = PaymentSelection(
        selectedInvoices: [testInvoice1],
        gatewayFeePercentage: 0.03,
      );

      expect(selection.gatewayFee, 15.0); // 500 * 0.03
    });

    test('calculates total amount including gateway fee', () {
      final selection = PaymentSelection(
        selectedInvoices: [testInvoice1],
        gatewayFeePercentage: 0.03,
      );

      expect(selection.totalAmount, 515.0); // 500 + 15
    });

    test('calculates total with custom gateway fee percentage', () {
      final selection = PaymentSelection(
        selectedInvoices: [testInvoice2],
        gatewayFeePercentage: 0.05, // 5%
      );

      expect(selection.gatewayFee, 37.5); // 750 * 0.05
      expect(selection.totalAmount, 787.5); // 750 + 37.5
    });

    test('counts selected invoices correctly', () {
      final selection = PaymentSelection(
        selectedInvoices: [testInvoice1, testInvoice2],
      );

      expect(selection.count, 2);
    });

    test('hasSelection returns true when invoices selected', () {
      final emptySelection = PaymentSelection();
      final withSelection = PaymentSelection(
        selectedInvoices: [testInvoice1],
      );

      expect(emptySelection.hasSelection, false);
      expect(withSelection.hasSelection, true);
    });

    test('isValid returns true only when at least one invoice selected', () {
      final empty = PaymentSelection();
      final withSelection = PaymentSelection(
        selectedInvoices: [testInvoice1],
      );

      expect(empty.isValid, false);
      expect(withSelection.isValid, true);
    });

    test('addInvoice adds payable invoice to selection', () {
      var selection = PaymentSelection();

      selection = selection.addInvoice(testInvoice1);

      expect(selection.count, 1);
      expect(selection.selectedInvoices, contains(testInvoice1));
    });

    test('addInvoice does not add already selected invoice', () {
      var selection = PaymentSelection(selectedInvoices: [testInvoice1]);

      selection = selection.addInvoice(testInvoice1);

      expect(selection.count, 1);
    });

    test('addInvoice does not add non-payable invoice', () {
      var selection = PaymentSelection();

      selection = selection.addInvoice(testInvoice3); // paid invoice

      expect(selection.count, 0);
    });

    test('removeInvoice removes selected invoice', () {
      var selection = PaymentSelection(
        selectedInvoices: [testInvoice1, testInvoice2],
      );

      selection = selection.removeInvoice(testInvoice1);

      expect(selection.count, 1);
      expect(selection.selectedInvoices, contains(testInvoice2));
      expect(selection.selectedInvoices, isNot(contains(testInvoice1)));
    });

    test('toggleInvoice adds invoice if not selected', () {
      var selection = PaymentSelection();

      selection = selection.toggleInvoice(testInvoice1);

      expect(selection.count, 1);
      expect(selection.selectedInvoices, contains(testInvoice1));
    });

    test('toggleInvoice removes invoice if already selected', () {
      var selection = PaymentSelection(selectedInvoices: [testInvoice1]);

      selection = selection.toggleInvoice(testInvoice1);

      expect(selection.count, 0);
      expect(selection.selectedInvoices, isNot(contains(testInvoice1)));
    });

    test('isSelected returns true for selected invoice', () {
      final selection = PaymentSelection(selectedInvoices: [testInvoice1]);

      expect(selection.isSelected(testInvoice1), true);
      expect(selection.isSelected(testInvoice2), false);
    });

    test('selectAll selects all payable invoices from list', () {
      var selection = PaymentSelection();

      selection = selection.selectAll([testInvoice1, testInvoice2, testInvoice3]);

      expect(selection.count, 2);
      expect(selection.selectedInvoices, contains(testInvoice1));
      expect(selection.selectedInvoices, contains(testInvoice2));
      expect(selection.selectedInvoices, isNot(contains(testInvoice3))); // paid
    });

    test('clear removes all selected invoices', () {
      var selection = PaymentSelection(
        selectedInvoices: [testInvoice1, testInvoice2],
      );

      selection = selection.clear();

      expect(selection.count, 0);
      expect(selection.selectedInvoices, isEmpty);
    });

    test('copyWith creates new instance with modifications', () {
      final original = PaymentSelection(selectedInvoices: [testInvoice1]);
      final modified = original.copyWith(
        selectedInvoices: [testInvoice1, testInvoice2],
        gatewayFeePercentage: 0.05,
      );

      expect(original.count, 1);
      expect(modified.count, 2);
      expect(modified.gatewayFeePercentage, 0.05);
    });

    test('getSummaryText returns formatted summary', () {
      final selection1 = PaymentSelection(selectedInvoices: [testInvoice1]);
      final selection2 = PaymentSelection(selectedInvoices: [testInvoice1, testInvoice2]);

      expect(selection1.getSummaryText(), contains('1 invoice'));
      expect(selection2.getSummaryText(), contains('2 invoices'));
      expect(selection1.getSummaryText(), contains('515')); // with 3% fee
    });

    test('getInvoicePayload returns correct format for API call', () {
      final selection = PaymentSelection(
        selectedInvoices: [testInvoice1, testInvoice2],
      );

      final payload = selection.getInvoicePayload();

      expect(payload, isNotEmpty);
      expect(payload.length, 2);
      expect(payload[0]['_id'], 'inv_1');
      expect(payload[0]['invoice_id'], 'INV-001');
      expect(payload[0]['total'], 500.0);
    });

    test('validateInvoices returns true when all selected are still payable', () {
      final selection = PaymentSelection(
        selectedInvoices: [testInvoice1, testInvoice2],
      );
      final availableInvoices = [testInvoice1, testInvoice2, testInvoice3];

      expect(selection.validateInvoices(availableInvoices), true);
    });

    test('validateInvoices returns false when selected invoice is no longer payable', () {
      final selection = PaymentSelection(
        selectedInvoices: [testInvoice1, testInvoice3], // inv_3 is paid
      );
      final availableInvoices = [testInvoice1, testInvoice2, testInvoice3];

      expect(selection.validateInvoices(availableInvoices), false);
    });

    test('validateInvoices returns false when invoice is removed', () {
      final selection = PaymentSelection(
        selectedInvoices: [testInvoice1, testInvoice2],
      );
      final availableInvoices = [testInvoice1]; // inv_2 removed

      expect(selection.validateInvoices(availableInvoices), false);
    });

    test('handles zero gateway fee correctly', () {
      final selection = PaymentSelection(
        selectedInvoices: [testInvoice1],
        gatewayFeePercentage: 0.0,
      );

      expect(selection.gatewayFee, 0.0);
      expect(selection.totalAmount, 500.0);
    });

    test('handles large gateway fee percentage', () {
      final selection = PaymentSelection(
        selectedInvoices: [testInvoice1],
        gatewayFeePercentage: 0.10, // 10%
      );

      expect(selection.gatewayFee, 50.0);
      expect(selection.totalAmount, 550.0);
    });

    test('maintains invoice order in selection', () {
      var selection = PaymentSelection();
      selection = selection.addInvoice(testInvoice3);
      selection = selection.addInvoice(testInvoice1);
      selection = selection.addInvoice(testInvoice2);

      expect(selection.selectedInvoices[0].id, 'inv_1');
      expect(selection.selectedInvoices[1].id, 'inv_2');
    });

    test('calculateTotalAmount with multiple invoices and complex fees', () {
      final invoices = [testInvoice1, testInvoice2];
      final selection = PaymentSelection(
        selectedInvoices: invoices,
        gatewayFeePercentage: 0.025, // 2.5%
      );

      final expectedSubtotal = 1250.0;
      final expectedFee = 31.25;
      final expectedTotal = 1281.25;

      expect(selection.subtotal, expectedSubtotal);
      expect(selection.gatewayFee, expectedFee);
      expect(selection.totalAmount, expectedTotal);
    });
  });
}

// Helper class for testing
class Customer {
  final String id;
  final String name;

  Customer({required this.id, required this.name});
}
