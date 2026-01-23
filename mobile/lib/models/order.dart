import 'package:flutter/foundation.dart';

/// Order status enum matching Meteor constants.OrderStatus
enum OrderStatus {
  saved('Saved', 'warning', 'Draft'),
  pending('Pending', 'brand-yellow', 'Order Placed'),
  processing('Processing', 'warning', 'Processing'),
  awaitingFulfillment('Awaiting_Fulfillment', 'brand-yellow', 'Packing'),
  awaitingPayment('Awaiting_Payment', 'danger', 'Awaiting Payment'),
  shipped('Shipped', 'info', 'Shipped'),
  partiallyCompleted('Partially_Completed', 'danger', 'Partially Completed'),
  completed('Completed', 'success', 'Completed'),
  cancelled('Cancelled', 'primary', 'Cancelled');

  final String value; // Server value (e.g., 'Pending', 'Processing')
  final String label; // Bootstrap label for badge styling
  final String displayValue; // Display value for UI

  const OrderStatus(this.value, this.label, this.displayValue);

  factory OrderStatus.fromString(String value) {
    try {
      return OrderStatus.values.firstWhere(
        (status) => status.value == value,
        orElse: () => OrderStatus.pending,
      );
    } catch (e) {
      debugPrint('Unknown order status: $value, defaulting to pending');
      return OrderStatus.pending;
    }
  }
}

class CustomerDetails {
  final String id;
  final String name;
  final String email;
  final int mobilePhone;
  final String deliveryAddress;
  final String role;

  CustomerDetails({
    required this.id,
    required this.name,
    required this.email,
    required this.mobilePhone,
    required this.deliveryAddress,
    required this.role,
  });

  factory CustomerDetails.fromJson(Map<String, dynamic> json) {
    return CustomerDetails(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      mobilePhone: json['mobilePhone'] is int
          ? json['mobilePhone']
          : int.tryParse(json['mobilePhone'].toString()) ?? 0,
      deliveryAddress: json['deliveryAddress'] ?? '',
      role: json['role'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    '_id': id,
    'name': name,
    'email': email,
    'mobilePhone': mobilePhone,
    'deliveryAddress': deliveryAddress,
    'role': role,
  };
}

class OrderProduct {
  final String id;
  final String sku;
  final String name;
  final double unitPrice;
  final String unitOfSale;
  final double quantity;
  final String? imagePath;

  OrderProduct({
    required this.id,
    required this.sku,
    required this.name,
    required this.unitPrice,
    required this.unitOfSale,
    required this.quantity,
    this.imagePath,
  });

  factory OrderProduct.fromJson(Map<String, dynamic> json) {
    return OrderProduct(
      id: json['_id'] ?? '',
      sku: json['sku'] ?? '',
      name: json['name'] ?? '',
      unitPrice: (json['unitprice'] as num?)?.toDouble() ?? 0.0,
      unitOfSale: json['unitOfSale'] ?? '',
      quantity: (json['quantity'] as num?)?.toDouble() ?? 0.0,
      imagePath: json['image_path'],
    );
  }

  Map<String, dynamic> toJson() => {
    '_id': id,
    'sku': sku,
    'name': name,
    'unitprice': unitPrice,
    'unitOfSale': unitOfSale,
    'quantity': quantity,
    'image_path': imagePath,
  };
}

/// Order model representing a complete order from the server
/// Mirrors the Meteor Orders collection structure
class Order {
  final String id;
  final List<OrderProduct> products;
  final double totalBillAmount;
  final OrderStatus orderStatus;
  final DateTime createdAt;
  final DateTime? expectedDeliveryDate;
  final CustomerDetails customerDetails;
  final String? comments;
  final String deliveryPincode;
  final List<dynamic>? invoices;

  Order({
    required this.id,
    required this.products,
    required this.totalBillAmount,
    required this.orderStatus,
    required this.createdAt,
    this.expectedDeliveryDate,
    required this.customerDetails,
    this.comments,
    required this.deliveryPincode,
    this.invoices,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    final orderStatusStr = json['order_status'] ?? 'Pending';
    final productsList = (json['products'] as List?)
        ?.map((p) => OrderProduct.fromJson(p as Map<String, dynamic>))
        .toList() ?? [];

    return Order(
      id: json['_id'] ?? '',
      products: productsList,
      totalBillAmount: (json['total_bill_amount'] as num?)?.toDouble() ?? 0.0,
      orderStatus: OrderStatus.fromString(orderStatusStr),
      createdAt: _parseDateTime(json['createdAt']),
      expectedDeliveryDate: _parseDateTime(json['expectedDeliveryDate']),
      customerDetails: CustomerDetails.fromJson(
        json['customer_details'] ?? {},
      ),
      comments: json['comments'],
      deliveryPincode: json['deliveryPincode'] ?? '',
      invoices: json['invoices'],
    );
  }

  Map<String, dynamic> toJson() => {
    '_id': id,
    'products': products.map((p) => p.toJson()).toList(),
    'total_bill_amount': totalBillAmount,
    'order_status': orderStatus.value,
    'createdAt': createdAt.toIso8601String(),
    'expectedDeliveryDate': expectedDeliveryDate?.toIso8601String(),
    'customer_details': customerDetails.toJson(),
    'comments': comments,
    'deliveryPincode': deliveryPincode,
    'invoices': invoices,
  };

  /// Format creation date as "dd MMM yyyy" (e.g., "15 Jan 2024")
  String getFormattedDate() {
    return '${createdAt.day} ${_getMonthName(createdAt.month)} ${createdAt.year}';
  }

  static String _getMonthName(int month) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[month - 1];
  }

  /// Format currency in Indian Rupee format
  String formatCurrency(double amount) {
    final formatter = _IndianNumberFormatter();
    return formatter.format(amount);
  }

  /// Get display status string
  String getDisplayStatus() {
    return orderStatus.displayValue;
  }

  /// Check if order is in active state
  bool isActive() {
    return orderStatus == OrderStatus.pending ||
        orderStatus == OrderStatus.processing ||
        orderStatus == OrderStatus.awaitingFulfillment ||
        orderStatus == OrderStatus.shipped ||
        orderStatus == OrderStatus.partiallyCompleted;
  }

  /// Parse DateTime from various formats (ISO string or MongoDB BSON {$date: ms})
  static DateTime _parseDateTime(dynamic value) {
    if (value == null) return DateTime.now();
    
    // Handle MongoDB BSON date format: {$date: 1234567890}
    if (value is Map<String, dynamic>) {
      final ms = value['\$date'];
      if (ms is int) {
        return DateTime.fromMillisecondsSinceEpoch(ms);
      }
    }
    
    // Handle ISO string format
    if (value is String) {
      final parsed = DateTime.tryParse(value);
      if (parsed != null) return parsed;
    }
    
    // Default to now if parsing fails
    return DateTime.now();
  }
}

/// Simple formatter for Indian Rupee currency
class _IndianNumberFormatter {
  String format(double amount) {
    final absAmount = amount.abs();
    final isNegative = amount < 0 ? '-' : '';

    // Format with 2 decimal places
    final formatted = absAmount.toStringAsFixed(2);
    final parts = formatted.split('.');
    final intPart = parts[0];
    final decPart = parts[1];

    // Add Indian number formatting (comma every 2 digits from right in thousands)
    final buffer = StringBuffer();
    final intStr = intPart.split('').reversed.toList();

    for (int i = 0; i < intStr.length; i++) {
      if (i > 0 && (i == 3 || (i > 3 && (i - 3) % 2 == 0))) {
        buffer.write(',');
      }
      buffer.write(intStr[i]);
    }

    return '$isNegative₹${buffer.toString().split('').reversed.join('')}.$decPart';
  }
}
