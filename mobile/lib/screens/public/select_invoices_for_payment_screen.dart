import 'package:flutter/material.dart';
import '../../models/invoice.dart';
import '../../models/payment_selection.dart';
import '../../services/order_service.dart';
import '../../services/paytm_payment_controller.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';

/// Screen for selecting multiple invoices to pay together
class SelectInvoicesForPaymentScreen extends StatefulWidget {
  final List<Invoice>? preSelectedInvoices;

  const SelectInvoicesForPaymentScreen({
    Key? key,
    this.preSelectedInvoices,
  }) : super(key: key);

  @override
  State<SelectInvoicesForPaymentScreen> createState() =>
      _SelectInvoicesForPaymentScreenState();
}

class _SelectInvoicesForPaymentScreenState
    extends State<SelectInvoicesForPaymentScreen> {
  List<Invoice> availableInvoices = [];
  PaymentSelection paymentSelection = PaymentSelection();
  bool isLoading = false;
  bool isProcessingPayment = false;
  String? errorMessage;
  final _paymentController = PaytmPaymentController.instance;

  @override
  void initState() {
    super.initState();
    _loadInvoices();
  }

  Future<void> _loadInvoices() async {
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      final rawInvoices = await OrderService.instance.fetchMyInvoices();
      
      // Convert dynamic list to Invoice objects
      final invoices = rawInvoices
          .map((inv) => inv is Invoice ? inv : Invoice.fromJson(inv as Map<String, dynamic>))
          .toList();
      
      // Filter for payable invoices only
      final payable = invoices.where((inv) => inv.isPayable).toList();

      // Pre-select invoices if provided
      var selection = PaymentSelection(selectedInvoices: []);
      if (widget.preSelectedInvoices != null) {
        for (final inv in widget.preSelectedInvoices!) {
          selection = selection.addInvoice(inv);
        }
      }

      setState(() {
        availableInvoices = payable;
        paymentSelection = selection;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        errorMessage = 'Failed to load invoices: $e';
        isLoading = false;
      });
    }
  }

  void _toggleInvoice(Invoice invoice) {
    setState(() {
      paymentSelection = paymentSelection.toggleInvoice(invoice);
    });
  }

  void _selectAll() {
    setState(() {
      paymentSelection = paymentSelection.selectAll(availableInvoices);
    });
  }

  void _deselectAll() {
    setState(() {
      paymentSelection = paymentSelection.clear();
    });
  }

  void _proceedToPayment() async {
    if (!paymentSelection.isValid) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select at least one invoice')),
      );
      return;
    }

    // Get user info from auth provider
    final authProvider = context.read<AuthProvider>();
    final user = authProvider.currentUser;

    if (user == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('User not authenticated')),
      );
      return;
    }

    // Validate user has required fields
    final mobile = user.phone ?? user.mobile;
    if (mobile == null || mobile.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Mobile number not found in profile')),
      );
      return;
    }

    final firstName = user.firstName ?? 'Customer';
    final lastName = user.lastName ?? '';

    // Show loading dialog
    setState(() => isProcessingPayment = true);

    try {
      // Launch Paytm payment
      final result = await _paymentController.launchPaytmCheckout(
        selectedInvoices: paymentSelection.selectedInvoices,
        userMobile: mobile,
        firstName: firstName,
        lastName: lastName,
      );

      if (!mounted) return;

      if (result['success'] == true) {
        // Payment successful - navigate to success status screen
        Navigator.pushNamed(
          context,
          '/payments/status',
          arguments: {
            'selectedInvoices': paymentSelection.selectedInvoices,
            'orderId': result['orderId'],
            'isSuccess': true,
          },
        );
      } else {
        // Payment failed - navigate to failure status screen
        Navigator.pushNamed(
          context,
          '/payments/status',
          arguments: {
            'selectedInvoices': paymentSelection.selectedInvoices,
            'orderId': result['orderId'],
            'isSuccess': false,
            'errorMessage': result['error'] ?? 'Payment failed',
          },
        );
      }
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    } finally {
      if (mounted) {
        setState(() => isProcessingPayment = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        Navigator.pop(context);
        return false;
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Select Invoices'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => Navigator.pop(context),
          ),
        ),
        body: isLoading
            ? _buildLoadingState()
            : errorMessage != null
                ? _buildErrorState()
                : _buildSelectionList(),
        bottomNavigationBar: _buildBottomBar(),
      ),
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(),
          const SizedBox(height: 16),
          Text(
            'Loading invoices...',
            style: TextStyle(color: Colors.grey[600]),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.red[300],
            ),
            const SizedBox(height: 16),
            Text(
              errorMessage ?? 'Error loading invoices',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 14),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _loadInvoices,
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSelectionList() {
    if (availableInvoices.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.check_circle_outline,
                size: 64,
                color: Colors.green[300],
              ),
              const SizedBox(height: 16),
              const Text(
                'No Unpaid Invoices',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'All invoices are paid.',
                style: TextStyle(color: Colors.grey[600]),
              ),
            ],
          ),
        ),
      );
    }

    return SingleChildScrollView(
      child: Column(
        children: [
          // Action buttons
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: _selectAll,
                    child: const Text('Select All'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton(
                    onPressed: _deselectAll,
                    child: const Text('Deselect All'),
                  ),
                ),
              ],
            ),
          ),
          // Invoices list
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: availableInvoices.length,
              itemBuilder: (context, index) {
                final invoice = availableInvoices[index];
                final isSelected = paymentSelection.isSelected(invoice);

                return Padding(
                  padding: const EdgeInsets.only(bottom: 12.0),
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: Row(
                        children: [
                          Checkbox(
                            value: isSelected,
                            onChanged: (_) => _toggleInvoice(invoice),
                          ),
                          Expanded(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 8.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        invoice.invoiceNumber,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.w600,
                                          fontSize: 14,
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 8,
                                          vertical: 4,
                                        ),
                                        decoration: BoxDecoration(
                                          color: _getStatusColor(invoice),
                                          borderRadius:
                                              BorderRadius.circular(4),
                                        ),
                                        child: Text(
                                          invoice.statusDisplay,
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 11,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        _formatDate(invoice.date),
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: Colors.grey[600],
                                        ),
                                      ),
                                      Text(
                                        '₹${invoice.amountDue.toStringAsFixed(2)}',
                                        style: const TextStyle(
                                          fontWeight: FontWeight.w600,
                                          fontSize: 13,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Widget _buildBottomBar() {
    final int selectedCount = paymentSelection.selectedInvoices.length;
    final String itemText = selectedCount == 1 ? '1 invoice selected' : '$selectedCount invoices selected';

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(
          top: BorderSide(color: Colors.grey[300]!),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            offset: const Offset(0, -2),
            blurRadius: 10,
          ),
        ],
      ),
      padding: const EdgeInsets.all(16.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Amount details including fee
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                itemText,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF412f1d), // textPrimary
                ),
              ),
              Text(
                '₹${paymentSelection.totalAmount.toStringAsFixed(2)}',
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF412f1d), // textPrimary
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: (paymentSelection.isValid && !isProcessingPayment)
                  ? _proceedToPayment
                  : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFe04a06), // AppColors.secondary
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: isProcessingPayment
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                  : const Text(
                      'PROCEED TO PAY',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.2,
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(Invoice invoice) {
    switch (invoice.status) {
      case 'paid':
        return Colors.green;
      case 'unpaid':
        return Colors.orange;
      case 'overdue':
        return Colors.red;
      case 'partially_paid':
        return Colors.amber;
      default:
        return Colors.grey;
    }
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final dateOnly = DateTime(date.year, date.month, date.day);

    if (dateOnly == today) {
      return 'Today';
    } else if (dateOnly.year == today.year && dateOnly.month == today.month) {
      return '${date.day} ${_monthName(date.month)}';
    } else {
      return '${date.day} ${_monthName(date.month)}, ${date.year}';
    }
  }

  String _monthName(int month) {
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
      'Dec'
    ];
    return months[month - 1];
  }
}
