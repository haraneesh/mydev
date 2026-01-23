import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../models/order.dart' as order_models;
import '../../providers/cart_provider.dart';
import '../../widgets/background_widget.dart';

class OrderDetailsScreen extends StatefulWidget {
  final String orderId;

  const OrderDetailsScreen({required this.orderId, super.key});

  @override
  State<OrderDetailsScreen> createState() => _OrderDetailsScreenState();
}

class _OrderDetailsScreenState extends State<OrderDetailsScreen> {
  late Future<order_models.Order?> _orderFuture;
  order_models.Order? _currentOrder;
  Map<String, String> _statusColors = {};

  @override
  void initState() {
    super.initState();
    _loadOrder();
    _loadStatusColors();
  }

  void _loadOrder() {
    final cartProvider = context.read<CartProvider>();
    final orderService = cartProvider.orderService;
    _orderFuture = orderService.getOrderStatus(widget.orderId).then((order) {
      if (mounted) {
        setState(() {
          _currentOrder = order;
        });
      }
      return order;
    });
  }

  void _loadStatusColors() {
    final cartProvider = context.read<CartProvider>();
    final orderService = cartProvider.orderService;
    orderService.fetchStatusColors().then((colors) {
      if (mounted) {
        setState(() {
          _statusColors = colors;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return BackgroundWidget(
      child: Scaffold(
        extendBodyBehindAppBar: false,
        appBar: AppBar(
          backgroundColor: AppColors.background,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.black),
            onPressed: () => Navigator.pop(context),
          ),
          centerTitle: true,
          title: Text(
            'Suvai',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
        ),
        body: FutureBuilder<order_models.Order?>(
          future: _orderFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(
                child: CircularProgressIndicator(),
              );
            }

            if (snapshot.hasError) {
              return Center(
                child: Text('Error: ${snapshot.error}'),
              );
            }

            // Use _currentOrder if available (updated after cancellation), otherwise use snapshot data
            final order = _currentOrder ?? snapshot.data;
            if (order == null) {
              return const Center(
                child: Text('Order not found'),
              );
            }

            return SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _getFormattedDateWithDay(order.createdAt),
                        style: GoogleFonts.nunito(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      if (_isCancellable(order.orderStatus))
                        ElevatedButton(
                          onPressed: () {
                            _showCancelOrderDialog(context, order);
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.secondary,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                          ),
                          child: Text(
                            'CANCEL ORDER',
                            style: getButtonTextStyle(),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(8),
                        topRight: Radius.circular(8),
                      ),
                    ),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: _getStatusColor(order.orderStatus),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            order.orderStatus.displayValue,
                            style: GoogleFonts.nunito(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                              fontSize: 12,
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        _buildOrderItemsTable(order),
                        if (order.comments != null && order.comments!.isNotEmpty) ...[
                          const SizedBox(height: 16),
                          Text(
                            'Notes for packaging team',
                            style: GoogleFonts.nunito(
                              fontWeight: FontWeight.w700,
                              fontSize: 14,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            order.comments!,
                            style: GoogleFonts.nunito(
                              fontSize: 14,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  Container(
                    color: Colors.white,
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Amount:',
                          style: GoogleFonts.nunito(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        Text(
                          '₹${order.totalBillAmount.toStringAsFixed(2)}',
                          style: GoogleFonts.nunito(
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildOrderItemsTable(order_models.Order order) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Table(
          columnWidths: const {
            0: FlexColumnWidth(2),
            1: FlexColumnWidth(1),
            2: FlexColumnWidth(1),
            3: FlexColumnWidth(1),
          },
          children: [
            TableRow(
              children: [
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Text(
                    'Name',
                    style: GoogleFonts.nunito(
                      fontWeight: FontWeight.w700,
                      fontSize: 14,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Text(
                    'Rate',
                    style: GoogleFonts.nunito(
                      fontWeight: FontWeight.w700,
                      fontSize: 14,
                      color: AppColors.textPrimary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Text(
                    'Qty',
                    style: GoogleFonts.nunito(
                      fontWeight: FontWeight.w700,
                      fontSize: 14,
                      color: AppColors.textPrimary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Text(
                    'Value',
                    style: GoogleFonts.nunito(
                      fontWeight: FontWeight.w700,
                      fontSize: 14,
                      color: AppColors.textPrimary,
                    ),
                    textAlign: TextAlign.right,
                  ),
                ),
              ],
            ),
            ...order.products.map((product) {
              final lineValue = product.unitPrice * product.quantity;
              return TableRow(
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    child: Text(
                      '${product.name}, ${product.unitOfSale}',
                      style: GoogleFonts.nunito(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    child: Text(
                      '₹${product.unitPrice.toStringAsFixed(2)}',
                      style: GoogleFonts.nunito(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    child: Text(
                      _formatQuantityDisplay(product),
                      style: GoogleFonts.nunito(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    child: Text(
                      '₹${lineValue.toStringAsFixed(2)}',
                      style: GoogleFonts.nunito(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                      textAlign: TextAlign.right,
                    ),
                  ),
                ],
              );
            }),
          ],
        ),
      ],
    );
  }

  String _formatQuantityDisplay(order_models.OrderProduct product) {
    if (product.unitOfSale.toLowerCase().contains('kg')) {
      final quantityInGrams = (product.quantity * 1000).toStringAsFixed(0);
      return '$quantityInGrams g';
    }
    
    if (product.unitOfSale.isNotEmpty && product.unitOfSale[0].contains(RegExp(r'[0-9]'))) {
      final match = RegExp(r'^(\d+)\s*(.+)$').firstMatch(product.unitOfSale);
      if (match != null) {
        final baseQuantity = int.parse(match.group(1)!);
        final unit = match.group(2)!;
        final totalQuantity = (product.quantity * baseQuantity).toStringAsFixed(0);
        return '$totalQuantity $unit';
      }
      return product.unitOfSale;
    }
    
    return '${product.quantity.toStringAsFixed(0)} ${product.unitOfSale}';
  }

  String _getFormattedDateWithDay(DateTime date) {
    const weekdays = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    final dayOfWeek = weekdays[date.weekday - 1];
    final monthName = months[date.month - 1];
    return '$dayOfWeek, ${date.day} $monthName ${date.year}';
  }

  void _showCancelOrderDialog(BuildContext context, order_models.Order order) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Order'),
        content: const Text('Are you sure you want to cancel this order?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'No',
              style: TextStyle(
                color: AppColors.secondary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              
              final cartProvider = context.read<CartProvider>();
              final orderService = cartProvider.orderService;
              
              final success = await orderService.cancelOrder(order);
              
              if (mounted) {
                if (success) {
                  // Update status immediately without reloading
                  setState(() {
                    if (_currentOrder != null) {
                      _currentOrder = order_models.Order(
                        id: _currentOrder!.id,
                        products: _currentOrder!.products,
                        totalBillAmount: _currentOrder!.totalBillAmount,
                        orderStatus: order_models.OrderStatus.cancelled,
                        createdAt: _currentOrder!.createdAt,
                        expectedDeliveryDate: _currentOrder!.expectedDeliveryDate,
                        customerDetails: _currentOrder!.customerDetails,
                        comments: _currentOrder!.comments,
                        deliveryPincode: _currentOrder!.deliveryPincode,
                        invoices: _currentOrder!.invoices,
                      );
                    }
                  });
                  
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: const Text('Order status changed to Cancelled'),
                      backgroundColor: AppColors.success,
                    ),
                  );
                } else {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: const Text('Failed to cancel order'),
                        backgroundColor: AppColors.accent,
                      ),
                    );
                  }
                }
              }
            },
            child: Text(
              'Yes',
              style: TextStyle(
                color: AppColors.secondary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  bool _isCancellable(order_models.OrderStatus status) {
    // Order can be cancelled only in early stages
    return status == order_models.OrderStatus.saved ||
        status == order_models.OrderStatus.pending ||
        status == order_models.OrderStatus.processing ||
        status == order_models.OrderStatus.awaitingFulfillment ||
        status == order_models.OrderStatus.awaitingPayment;
  }

  Color _getStatusColor(order_models.OrderStatus status) {
    // Try to get color from backend-provided palette
    final hexColor = _statusColors[status.value];
    
    if (hexColor != null && hexColor.isNotEmpty) {
      try {
        // Convert hex string (e.g., '#FFC107') to Color
        return Color(int.parse(hexColor.replaceFirst('#', '0xFF')));
      } catch (e) {
        debugPrint('Error parsing color $hexColor: $e');
      }
    }
    
    // Fallback to hardcoded colors if backend colors not available
    switch (status) {
      case order_models.OrderStatus.saved:
        return const Color(0xFFFFC107);
      case order_models.OrderStatus.pending:
        return const Color(0xFFFFC107);
      case order_models.OrderStatus.processing:
        return const Color(0xFFFFC107);
      case order_models.OrderStatus.awaitingFulfillment:
        return const Color(0xFFFFC107);
      case order_models.OrderStatus.awaitingPayment:
        return const Color(0xFFDC3545);
      case order_models.OrderStatus.shipped:
        return const Color(0xFF17A2B8);
      case order_models.OrderStatus.partiallyCompleted:
        return const Color(0xFFDC3545);
      case order_models.OrderStatus.completed:
        return const Color(0xFF28A745);
      case order_models.OrderStatus.cancelled:
        return AppColors.primary;
    }
  }
}
