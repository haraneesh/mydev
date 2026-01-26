import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../models/invoice.dart';
import '../models/payment_selection.dart';
import '../services/order_service.dart';
import '../services/paytm_payment_controller.dart';
import '../providers/auth_provider.dart';
import '../widgets/invoice_list_item.dart';
import '../widgets/wallet_balance_card.dart';
import '../models/user_wallet.dart';
import '../services/payment_service.dart';
import '../screens/public/invoice_detail_screen.dart';
import '../screens/public/payment_summary_screen.dart';

/// Reusable widget for selecting multiple invoices to pay
class SelectInvoicesWidget extends StatefulWidget {
  final List<Invoice>? preSelectedInvoices;

  const SelectInvoicesWidget({
    Key? key,
    this.preSelectedInvoices,
  }) : super(key: key);

  @override
  State<SelectInvoicesWidget> createState() => _SelectInvoicesWidgetState();
}

class _SelectInvoicesWidgetState extends State<SelectInvoicesWidget> {
  List<Invoice> availableInvoices = [];
  PaymentSelection paymentSelection = PaymentSelection();
  UserWallet? userWallet;
  bool isLoading = false;
  bool isWalletLoading = false;
  bool isProcessingPayment = false;
  String? errorMessage;
  final _paymentController = PaytmPaymentController.instance;
  final _paymentService = PaymentService.instance;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    await Future.wait([
      _loadInvoices(),
      _loadWallet(),
    ]);
  }

  Future<void> _loadWallet() async {
    setState(() {
      isWalletLoading = true;
    });

    try {
      final result = await _paymentService.getUserWallet();
      if (result['success'] == true && result['wallet'] != null) {
        setState(() {
          userWallet = UserWallet.fromJson(result['wallet']);
          isWalletLoading = false;
        });
      } else {
        setState(() {
          isWalletLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        isWalletLoading = false;
      });
    }
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

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (errorMessage != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: AppColors.accent),
            const SizedBox(height: 16),
            Text(
              'Error',
              style: GoogleFonts.sourceSerif4(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              errorMessage!,
              textAlign: TextAlign.center,
              style: GoogleFonts.nunito(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _loadInvoices,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
              ),
              child: Text(
                'Retry',
                style: GoogleFonts.nunito(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
      );
    }

    if (availableInvoices.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.check_circle_outline, size: 64, color: AppColors.success),
            const SizedBox(height: 16),
            Text(
              'All Paid!',
              style: GoogleFonts.sourceSerif4(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'You have no pending invoices.',
              textAlign: TextAlign.center,
              style: GoogleFonts.nunito(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      );
    }

    return Column(
      children: [
        Expanded(
          child: RefreshIndicator(
            onRefresh: _loadData,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Wallet Balance Card
                  if (userWallet != null || isWalletLoading)
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                      child: WalletBalanceCard(
                        wallet: userWallet ?? UserWallet.empty(),
                        isLoading: isWalletLoading,
                      ),
                    ),

                  // Page heading
                  Padding(
                    padding: const EdgeInsets.only(left: 16, top: 16, bottom: 12),
                    child: Text(
                      'Pay Invoices',
                      textAlign: TextAlign.left,
                      style: GoogleFonts.sourceSerif4(
                        fontSize: 24,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ),

                  // Invoices list with table-like layout
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4.0),
                    child: Card(
                      color: Colors.white,
                      child: Column(
                        children: [
                          // Table header
                          Padding(
                            padding: const EdgeInsets.only(left: 4.0, right: 4.0, top: 8.0, bottom: 8.0),
                            child: Row(
                              children: [
                                SizedBox(
                                  width: 40,
                                  child: Checkbox(
                                    value: paymentSelection.selectedInvoices.length == availableInvoices.length && availableInvoices.isNotEmpty,
                                    activeColor: AppColors.primary,
                                    onChanged: (_) {
                                      if (paymentSelection.selectedInvoices.length == availableInvoices.length) {
                                        _deselectAll();
                                      } else {
                                        _selectAll();
                                      }
                                    },
                                    visualDensity: VisualDensity.compact,
                                  ),
                                ),
                                Expanded(
                                  flex: 2,
                                  child: Text(
                                    'Date',
                                    style: GoogleFonts.nunito(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.textPrimary,
                                    ),
                                  ),
                                ),
                                Expanded(
                                  flex: 3,
                                  child: Text(
                                    'Invoice',
                                    style: GoogleFonts.nunito(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.textPrimary,
                                    ),
                                  ),
                                ),
                                Expanded(
                                  flex: 2,
                                  child: Text(
                                    'Balance',
                                    textAlign: TextAlign.right,
                                    style: GoogleFonts.nunito(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.textPrimary,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 24),
                              ],
                            ),
                          ),
                          // Divider
                          Divider(
                            height: 1,
                            color: Colors.grey[300],
                          ),
                          // Table rows
                          ...availableInvoices.map((invoice) {
                            final isSelected = paymentSelection.selectedInvoices
                                .any((inv) => inv.id == invoice.id);
                            return Column(
                              children: [
                                GestureDetector(
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) => InvoiceDetailScreen(invoice: invoice),
                                      ),
                                    );
                                  },
                                  child: Column(
                                    children: [
                                      // Row 1: Checkbox | Invoice# | Balance | Chevron
                                      Padding(
                                        padding: const EdgeInsets.only(left: 4.0, right: 4.0, top: 12.0, bottom: 12.0),
                                        child: Row(
                                          crossAxisAlignment: CrossAxisAlignment.center,
                                          children: [
                                            GestureDetector(
                                              onTap: () => _toggleInvoice(invoice),
                                              child: SizedBox(
                                                width: 40,
                                                child: Center(
                                                  child: Checkbox(
                                                    value: isSelected,
                                                    activeColor: AppColors.primary,
                                                    onChanged: (_) => _toggleInvoice(invoice),
                                                    visualDensity: VisualDensity.compact,
                                                  ),
                                                ),
                                              ),
                                            ),
                                            Expanded(
                                              flex: 2,
                                              child: Text(
                                                '${invoice.date.day}/${invoice.date.month}/${invoice.date.year}',
                                                style: GoogleFonts.nunito(
                                                  fontSize: 14,
                                                  fontWeight: FontWeight.w600,
                                                  color: AppColors.textPrimary,
                                                ),
                                              ),
                                            ),
                                            Expanded(
                                              flex: 3,
                                              child: Text(
                                                invoice.invoiceNumber,
                                                maxLines: 2,
                                                overflow: TextOverflow.ellipsis,
                                                style: GoogleFonts.nunito(
                                                  fontSize: 14,
                                                  fontWeight: FontWeight.w600,
                                                  color: AppColors.textPrimary,
                                                ),
                                              ),
                                            ),
                                            Expanded(
                                              flex: 2,
                                              child: Text(
                                                '₹${invoice.amountDue.toStringAsFixed(2)}',
                                                textAlign: TextAlign.right,
                                                style: GoogleFonts.nunito(
                                                  fontSize: 14,
                                                  fontWeight: FontWeight.w600,
                                                  color: AppColors.primary,
                                                ),
                                              ),
                                            ),
                                            const SizedBox(
                                              width: 24,
                                              child: Icon(Icons.chevron_right, size: 20, color: Colors.grey),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Divider(
                                  height: 1,
                                  color: Colors.grey[300],
                                ),
                              ],
                            );
                          }).toList(),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ),
        _buildFooter(),
      ],
    );
  }

  Widget _buildFooter() {
    final int selectedCount = paymentSelection.selectedInvoices.length;
    final String itemText = selectedCount == 1 ? '1 invoice selected' : '$selectedCount invoices selected';
    final double totalAmount = paymentSelection.totalAmount;
    final double walletBalance = userWallet?.balance ?? 0.0;
    final double amountDue = (totalAmount - walletBalance).clamp(0.0, double.infinity);
    final bool canCoverWithWallet = walletBalance >= totalAmount && totalAmount > 0;

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
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Selected Items & Total
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                itemText,
                style: GoogleFonts.nunito(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              Text(
                '₹${totalAmount.toStringAsFixed(2)}',
                style: GoogleFonts.nunito(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          
          // Wallet Balance Row (Only show if there is a balance)
          if (walletBalance > 0 && totalAmount > 0) ...[
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.account_balance_wallet_outlined, size: 16, color: AppColors.textPrimary),
                    const SizedBox(width: 4),
                    Text(
                      'Wallet Balance',
                      style: GoogleFonts.nunito(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ],
                ),
                Text(
                  '- ₹${(walletBalance > totalAmount ? totalAmount : walletBalance).toStringAsFixed(2)}',
                  style: GoogleFonts.nunito(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
          ],

          // Amount Due Row
          if (totalAmount > 0) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal:8, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.divider.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Amount Due',
                    style: GoogleFonts.nunito(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  Text(
                    '₹${amountDue.toStringAsFixed(2)}',
                    style: GoogleFonts.nunito(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: paymentSelection.selectedInvoices.isEmpty || isProcessingPayment
                  ? null
                  : _proceedToPayment,
              style: ElevatedButton.styleFrom(
                backgroundColor: canCoverWithWallet ? AppColors.primary : AppColors.secondary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                elevation: 0,
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
                  : Text(
                      canCoverWithWallet 
                        ? 'PAY FROM WALLET' 
                        : 'PROCEED TO PAY ₹${amountDue.toStringAsFixed(2)}',
                      style: getButtonTextStyle(fontSize: 14),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _proceedToPayment() async {
    if (!paymentSelection.isValid) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select at least one invoice')),
      );
      return;
    }

    final authProvider = context.read<AuthProvider>();
    final user = authProvider.currentUser;

    if (user == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please login to proceed')),
      );
      return;
    }

    setState(() => isProcessingPayment = true);

    final double walletBalance = userWallet?.balance ?? 0.0;
    final double totalAmount = paymentSelection.totalAmount;
    final double amountDue = (totalAmount - walletBalance).clamp(0.0, double.infinity);
    final bool canCoverWithWallet = walletBalance >= totalAmount && totalAmount > 0;

    if (canCoverWithWallet) {
      // For pure wallet payments, we can still post to server directly as there's no gateway to choose
      try {
        final result = await _paymentService.payFromWallet(
          invoices: paymentSelection.selectedInvoices,
        );

        if (!mounted) return;

        if (result['success']) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Paid successfully using wallet balance!'),
              backgroundColor: AppColors.success,
            ),
          );
          _loadData();
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: ${result['error']}')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: $e')),
          );
        }
      } finally {
        if (mounted) {
          setState(() => isProcessingPayment = false);
        }
      }
      return;
    }

    // For payments with a remainder, go to the summary screen with the net amount
    try {
      final bool? paymentSuccess = await Navigator.push<bool>(
        context,
        MaterialPageRoute(
          builder: (context) => PaymentSummaryScreen(
            selectedInvoices: paymentSelection.selectedInvoices,
            minAmount: amountDue,
          ),
        ),
      );

      if (!mounted) return;

      if (paymentSuccess == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Payment successful!'),
            backgroundColor: AppColors.success,
          ),
        );
        _loadData();
      }
    } finally {
      if (mounted) {
        setState(() => isProcessingPayment = false);
      }
    }
  }
}
