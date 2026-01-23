/// Represents a credit note (refund) from the Meteor backend
class CreditNote {
  final String id;
  final String creditNoteId;
  final DateTime date;
  final String status;
  final double total;
  final double balance;
  final List<LineItem> lineItems;
  final DateTime? createdTime;

  CreditNote({
    required this.id,
    required this.creditNoteId,
    required this.date,
    required this.status,
    required this.total,
    required this.balance,
    required this.lineItems,
    this.createdTime,
  });

  /// Create a CreditNote from a dynamic map (from Meteor response)
  /// Set [parseLineItems] to false for list views to improve performance
  factory CreditNote.fromJson(Map<String, dynamic> json, {bool parseLineItems = true}) {
    return CreditNote(
      id: json['_id'] ?? json['creditnote_id'] ?? '',
      creditNoteId: json['creditnote_id'] ?? '',
      date: _parseDate(json['date'] ?? json['createdAt']),
      status: (json['status'] ?? 'open').toString().toLowerCase(),
      total: _parseDouble(json['total']),
      balance: _parseDouble(json['balance']),
      lineItems: parseLineItems ? _parseLineItems(json['line_items']) : [],
      createdTime: json['createdAt'] != null ? _parseDate(json['createdAt']) : null,
    );
  }

  /// Get the color for the status badge
  String get statusColor {
    switch (status) {
      case 'open':
        return 'info'; // Light Blue
      case 'applied':
        return 'success'; // Green
      case 'voided':
        return 'danger'; // Red
      case 'draft':
        return 'secondary'; // Gray
      default:
        return 'secondary'; // Gray
    }
  }

  /// Get display name for status
  String get statusDisplay {
    final formatted = status.replaceAll('_', ' ');
    return formatted[0].toUpperCase() + formatted.substring(1);
  }

  /// Format date as DD MMM YYYY (e.g., "15 Jan 2024") in IST
  String getFormattedDate() {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    // Convert UTC to IST (UTC+5:30)
    final istDate = date.add(const Duration(hours: 5, minutes: 30));
    return '${istDate.day} ${months[istDate.month - 1]} ${istDate.year}';
  }

  /// Format total amount as currency with rupee symbol
  String getFormattedTotal() {
    return '₹${total.toStringAsFixed(2)}';
  }

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

/// Represents a line item in a credit note (refunded product)
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

  /// Format item total as currency with rupee symbol
  String getFormattedItemTotal() {
    return '₹${itemTotal.toStringAsFixed(2)}';
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
