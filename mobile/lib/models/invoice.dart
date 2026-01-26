class Invoice {
  final String id;
  final String invoiceId;
  final String invoiceNumber;
  final DateTime date;
  final String status;
  final double total;
  final double balance;
  final DateTime? dueDate;
  final Customer customer;
  final List<LineItem> lineItems;
  final DateTime? createdTime;
  final DateTime? lastModifiedTime;

  Invoice({
    required this.id,
    required this.invoiceId,
    required this.invoiceNumber,
    required this.date,
    required this.status,
    required this.total,
    required this.balance,
    this.dueDate,
    required this.customer,
    required this.lineItems,
    this.createdTime,
    this.lastModifiedTime,
  });

  /// Create an Invoice from a dynamic map (from Meteor response)
  /// Set [parseLineItems] to false for list views to improve performance
  factory Invoice.fromJson(Map<String, dynamic> json, {bool parseLineItems = true}) {
    return Invoice(
      id: json['_id'] ?? json['invoice_id'] ?? '',
      invoiceId: json['invoice_id']?.toString() ?? '',
      invoiceNumber: json['invoice_number'] ?? 'N/A',
      date: _parseDate(json['date'] ?? json['createdAt']),
      status: (json['status'] ?? 'unknown').toString().toLowerCase(),
      total: _parseDouble(json['total']),
      balance: _parseDouble(json['balance']),
      dueDate: json['due_date'] != null ? _parseDate(json['due_date']) : null,
      customer: Customer.fromJson(json['customer'] ?? {}),
      lineItems: parseLineItems ? _parseLineItems(json['line_items']) : [],
      createdTime: json['createdAt'] != null ? _parseDate(json['createdAt']) : null,
      lastModifiedTime: json['updatedAt'] != null ? _parseDate(json['updatedAt']) : null,
    );
  }

  /// Get the color for the status badge
  String get statusColor {
    switch (status) {
      case 'paid':
        return 'success'; // Green
      case 'unpaid':
        return 'warning'; // Orange
      case 'overdue':
        return 'danger'; // Red
      case 'draft':
        return 'secondary'; // Gray
      case 'sent':
        return 'info'; // Light Blue
      case 'partially_paid':
        return 'primary'; // Blue
      default:
        return 'secondary'; // Gray
    }
  }

  /// Get display name for status
  String get statusDisplay {
    final formatted = status.replaceAll('_', ' ');
    return formatted[0].toUpperCase() + formatted.substring(1);
  }

  /// Check if invoice is paid in full
  bool get isPaidInFull => balance == 0 && status == 'paid';
  
  /// Check if invoice is unpaid or partially paid (payable) and has a positive balance
  bool get isPayable => (status == 'unpaid' || status == 'partially_paid' || status == 'overdue') && balance > 0;
  
  /// Check if invoice is unpaid
  bool get isUnpaid => status == 'unpaid';
  
  /// Check if invoice is overdue
  bool get isOverdue => status == 'overdue';
  
  /// Check if invoice is paid
  bool get isPaid => status == 'paid';
  
  /// Get the amount due (remaining balance)
  double get amountDue => balance;

  static DateTime _parseDate(dynamic dateValue) {
    // Fast path for common types
    if (dateValue == null) return DateTime.now();
    if (dateValue is DateTime) return dateValue;
    
    // Handle MongoDB extended JSON format first (common case)
    if (dateValue is Map<String, dynamic>) {
      final milliseconds = dateValue['\$date'];
      if (milliseconds != null) {
        try {
          if (milliseconds is int) {
            return DateTime.fromMillisecondsSinceEpoch(milliseconds);
          } else if (milliseconds is String) {
            return DateTime.fromMillisecondsSinceEpoch(int.parse(milliseconds));
          }
        } catch (_) {
          return DateTime.now();
        }
      }
    }
    
    // Handle string dates
    if (dateValue is String) {
      try {
        return DateTime.parse(dateValue);
      } catch (_) {
        return DateTime.now();
      }
    }
    
    return DateTime.now();
  }

  static double _parseDouble(dynamic value) {
    if (value == null) return 0.0;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) {
      try {
        return double.parse(value);
      } catch (_) {
        return 0.0;
      }
    }
    return 0.0;
  }

  static List<LineItem> _parseLineItems(dynamic items) {
    if (items == null || items is! List) return [];
    return items
        .map((item) {
          try {
            return LineItem.fromJson(item as Map<String, dynamic>);
          } catch (_) {
            return null;
          }
        })
        .whereType<LineItem>()
        .toList();
  }
}

class Customer {
  final String? id;
  final String? name;
  final String? email;

  Customer({
    this.id,
    this.name,
    this.email,
  });

  factory Customer.fromJson(Map<String, dynamic> json) {
    return Customer(
      id: json['id']?.toString(),
      name: json['name']?.toString(),
      email: json['email']?.toString(),
    );
  }
}

class LineItem {
  final String itemId;
  final String name;
  final double quantity;
  final double rate;
  final String unit;
  final double itemTotal;

  LineItem({
    required this.itemId,
    required this.name,
    required this.quantity,
    required this.rate,
    required this.unit,
    required this.itemTotal,
  });

  factory LineItem.fromJson(Map<String, dynamic> json) {
    return LineItem(
      itemId: json['item_id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Unknown',
      quantity: _parseDouble(json['quantity']),
      rate: _parseDouble(json['rate']),
      unit: json['unit']?.toString() ?? '',
      itemTotal: _parseDouble(json['item_total']),
    );
  }

  static double _parseDouble(dynamic value) {
    if (value == null) return 0.0;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) {
      try {
        return double.parse(value);
      } catch (_) {
        return 0.0;
      }
    }
    return 0.0;
  }
}
