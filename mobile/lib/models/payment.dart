class Payment {
  final String orderId;
  final String owner;
  final PaymentStatus status;
  final String? paymentMethod;
  final double totalAmount;
  final List<String> relatedInvoices;
  final int invoiceCount;
  final Map<String, dynamic>? paymentApiInitiationResponseObject;
  final Map<String, dynamic>? paymentApiResponseObject;
  final Map<String, dynamic>? paymentZohoResponseObject;
  final String? error;
  final Map<String, dynamic>? errorDetails;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final DateTime? processedAt;

  Payment({
    required this.orderId,
    required this.owner,
    required this.status,
    this.paymentMethod,
    required this.totalAmount,
    required this.relatedInvoices,
    this.invoiceCount = 0,
    this.paymentApiInitiationResponseObject,
    this.paymentApiResponseObject,
    this.paymentZohoResponseObject,
    this.error,
    this.errorDetails,
    this.createdAt,
    this.updatedAt,
    this.processedAt,
  });

  /// Create Payment from Meteor response
  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      orderId: json['orderId'] ?? json['_id'] ?? '',
      owner: json['owner'] ?? '',
      status: _parseStatus(json['status']),
      paymentMethod: json['paymentMethod']?.toString(),
      totalAmount: _parseDouble(json['totalAmount']),
      relatedInvoices: _parseList(json['relatedInvoices']),
      invoiceCount: json['invoiceCount'] ?? 0,
      paymentApiInitiationResponseObject: json['paymentApiInitiationResponseObject'],
      paymentApiResponseObject: json['paymentApiResponseObject'],
      paymentZohoResponseObject: json['paymentZohoResponseObject'],
      error: json['error']?.toString(),
      errorDetails: json['errorDetails'],
      createdAt: _parseDate(json['createdAt']),
      updatedAt: _parseDate(json['updatedAt']),
      processedAt: _parseDate(json['processedAt']),
    );
  }

  /// Check if payment is completed successfully
  bool get isCompleted => status == PaymentStatus.completed;

  /// Check if payment failed
  bool get isFailed => status == PaymentStatus.failed;

  /// Check if payment is in error state
  bool get isError => status == PaymentStatus.error;

  /// Check if payment is still pending
  bool get isPending => status != PaymentStatus.completed && 
                       status != PaymentStatus.failed && 
                       status != PaymentStatus.error;

  /// Get display message for status
  String get statusDisplay {
    switch (status) {
      case PaymentStatus.completed:
        return 'Payment Completed';
      case PaymentStatus.failed:
        return 'Payment Failed';
      case PaymentStatus.error:
        return 'Payment Error';
      default:
        return 'Processing...';
    }
  }

  /// Get human-readable payment method
  String get paymentMethodDisplay {
    switch (paymentMethod?.toUpperCase()) {
      case 'CC':
        return 'Credit Card';
      case 'NB':
        return 'Net Banking';
      case 'UPI':
        return 'UPI';
      case 'WALLET':
        return 'Wallet';
      default:
        return paymentMethod ?? 'Unknown';
    }
  }

  static PaymentStatus _parseStatus(dynamic value) {
    final status = value?.toString().toLowerCase() ?? '';
    switch (status) {
      case 'completed':
        return PaymentStatus.completed;
      case 'failed':
        return PaymentStatus.failed;
      case 'error':
        return PaymentStatus.error;
      default:
        return PaymentStatus.pending;
    }
  }

  static List<String> _parseList(dynamic value) {
    if (value == null) return [];
    if (value is List) {
      return value.map((item) => item.toString()).toList();
    }
    return [];
  }

  static DateTime? _parseDate(dynamic dateValue) {
    if (dateValue == null) return null;
    if (dateValue is DateTime) return dateValue;

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
          return null;
        }
      }
    }

    if (dateValue is String) {
      try {
        return DateTime.parse(dateValue);
      } catch (_) {
        return null;
      }
    }

    return null;
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

/// Payment status enumeration
enum PaymentStatus {
  completed,  // Payment successful
  failed,     // Payment failed
  error,      // System error
  pending,    // Default/processing
}
