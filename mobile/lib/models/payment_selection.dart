import 'invoice.dart';

/// Helper class for managing multiple invoice selection for payment
class PaymentSelection {
  final List<Invoice> selectedInvoices;

  PaymentSelection({
    this.selectedInvoices = const [],
  });

  /// Create a copy with modifications
  PaymentSelection copyWith({
    List<Invoice>? selectedInvoices,
  }) {
    return PaymentSelection(
      selectedInvoices: selectedInvoices ?? this.selectedInvoices,
    );
  }

  /// Total amount of selected invoices (sum of balance/amountDue)
  double get totalAmount {
    return selectedInvoices.fold(
      0.0,
      (sum, invoice) => sum + invoice.amountDue,
    );
  }

  /// Number of selected invoices
  int get count => selectedInvoices.length;

  /// Check if any invoices are selected
  bool get hasSelection => selectedInvoices.isNotEmpty;

  /// Check if at least one invoice is selected
  bool get isValid => count > 0 && totalAmount > 0;

  /// Add an invoice to selection
  PaymentSelection addInvoice(Invoice invoice) {
    if (invoice.isPayable && !selectedInvoices.contains(invoice)) {
      final updated = List<Invoice>.from(selectedInvoices);
      updated.add(invoice);
      return copyWith(selectedInvoices: updated);
    }
    return this;
  }

  /// Remove an invoice from selection
  PaymentSelection removeInvoice(Invoice invoice) {
    final updated = List<Invoice>.from(selectedInvoices);
    updated.removeWhere((inv) => inv.id == invoice.id);
    return copyWith(selectedInvoices: updated);
  }

  /// Toggle invoice selection
  PaymentSelection toggleInvoice(Invoice invoice) {
    if (isSelected(invoice)) {
      return removeInvoice(invoice);
    } else {
      return addInvoice(invoice);
    }
  }

  /// Check if invoice is selected
  bool isSelected(Invoice invoice) {
    return selectedInvoices.any((inv) => inv.id == invoice.id);
  }

  /// Select all payable invoices from list
  PaymentSelection selectAll(List<Invoice> invoices) {
    final payable = invoices.where((inv) => inv.isPayable).toList();
    return copyWith(selectedInvoices: payable);
  }

  /// Clear all selections
  PaymentSelection clear() {
    return copyWith(selectedInvoices: []);
  }

  /// Get list of invoice IDs for API call
  List<Map<String, dynamic>> getInvoicePayload() {
    return selectedInvoices.map((invoice) {
      return {
        '_id': invoice.id,
        'invoice_id': invoice.invoiceId,
        'total': invoice.amountDue,
      };
    }).toList();
  }

  /// Validate that all invoices are still payable
  bool validateInvoices(List<Invoice> availableInvoices) {
    for (final selected in selectedInvoices) {
      final available = availableInvoices.firstWhere(
        (inv) => inv.id == selected.id,
        orElse: () => null as Invoice,
      );
      
      if (available == null || !available.isPayable) {
        return false;
      }
    }
    return true;
  }

  /// Get summary text for UI
  String getSummaryText() {
    return '$count invoice${count != 1 ? 's' : ''} selected • ₹${totalAmount.toStringAsFixed(2)}';
  }
}
