import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../models/invoice.dart';
import '../../services/paytm_payment_controller.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/app_bar_with_logo.dart';
import '../../widgets/background_widget.dart';

class PaymentSummaryScreen extends StatefulWidget {
  final List<Invoice> selectedInvoices;
  final double minAmount;

  const PaymentSummaryScreen({
    Key? key,
    required this.selectedInvoices,
    required this.minAmount,
  }) : super(key: key);

  @override
  State<PaymentSummaryScreen> createState() => _PaymentSummaryScreenState();
}

class _PaymentSummaryScreenState extends State<PaymentSummaryScreen> {
  late TextEditingController _amountController;
  late double _currentAmount;
  bool _isProcessing = false;
  final NumberFormat _currencyFormat = NumberFormat.currency(symbol: '₹', decimalDigits: 2);

  @override
  void initState() {
    super.initState();
    _currentAmount = widget.minAmount;
    _amountController = TextEditingController(text: _currentAmount.toStringAsFixed(2));
  }

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  double _calculateTotalWithFee(double baseAmount) {
    // 2.3% fee logic matches Meteor: Math.ceil(total * 2.3) / 100
    final fee = (baseAmount * 2.3).ceilToDouble() / 100.0;
    return double.parse((baseAmount + fee).toStringAsFixed(2));
  }

  void _onAmountChanged(String value) {
    if (value.isEmpty) {
      setState(() {
        _currentAmount = 0.0;
      });
      return;
    }
    
    final newAmount = double.tryParse(value);
    if (newAmount != null) {
      setState(() {
        _currentAmount = newAmount;
      });
    }
  }

  Future<void> _handlePayment(bool withFee) async {
    if (_currentAmount < widget.minAmount) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Minimum amount is ₹${widget.minAmount.toStringAsFixed(2)}')),
      );
      return;
    }

    final authProvider = context.read<AuthProvider>();
    final user = authProvider.currentUser;

    if (user == null) return;

    setState(() => _isProcessing = true);

    try {
      final result = await PaytmPaymentController.instance.launchPaytmCheckout(
        selectedInvoices: widget.selectedInvoices,
        userMobile: user.phone,
        firstName: user.firstName ?? 'User',
        lastName: user.lastName ?? '',
        customAmount: _currentAmount,
        showOptionsWithFee: withFee,
      );

      if (!mounted) return;

      if (result['success']) {
        Navigator.pop(context, true); // Return success to previous screen
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Payment failed: ${result['error']}')),
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
        setState(() => _isProcessing = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return BackgroundWidget(
      child: Scaffold(
        backgroundColor: Colors.transparent,
      appBar: const AppBarWithLogo(showLeading: true),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 12.0),
        child: Column(
          children: [
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24.0),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                children: [
                  Text(
                    'Payment Summary',
                    style: GoogleFonts.nunito(
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Surplus payments will be saved in your wallet for your next purchase.',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.nunito(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 24),
                  
                  // Amount Input
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Text(
                         '₹',
                        style: GoogleFonts.nunito(
                          fontSize: 24,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Container(
                        width: 150,
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.grey.shade300),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: TextField(
                          controller: _amountController,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          textAlign: TextAlign.center,
                          inputFormatters: [
                            FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d{0,2}')),
                          ],
                          style: GoogleFonts.nunito(
                            fontSize: 24,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                          decoration: const InputDecoration(
                            contentPadding: EdgeInsets.symmetric(vertical: 8),
                            border: InputBorder.none,
                            isDense: true,
                          ),
                          onChanged: _onAmountChanged,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    '${widget.selectedInvoices.length} invoice(s) selected',
                    style: GoogleFonts.nunito(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Minimum: ₹${widget.minAmount.toStringAsFixed(2)}',
                    style: GoogleFonts.nunito(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: _currentAmount < widget.minAmount ? Colors.red : Colors.grey,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Scan and Pay Card
            _buildOptionCard(
              icon: Icons.qr_code_scanner,
              title: 'Scan and Pay with any UPI App',
              description: 'Scan the QR code with any UPI app to complete your payment. Please note it may take up to 2 business days to reflect in your account.',
              child: Image.asset(
                'assets/images/pay/scan-pay-upi.jpg',
                height: 200,
                fit: BoxFit.contain,
              ),
            ),
            const SizedBox(height: 12),

            // UPI/Debit Card Card
            _buildOptionCard(
              icon: Icons.currency_rupee,
              title: Text.rich(
                TextSpan(
                  children: [
                    const TextSpan(text: 'UPI or Debit card, '),
                    WidgetSpan(
                      alignment: PlaceholderAlignment.baseline,
                      baseline: TextBaseline.alphabetic,
                      child: Container(
                        decoration: const BoxDecoration(
                          border: Border(
                            bottom: BorderSide(color: Colors.red, width: 2.0),
                          ),
                        ),
                        padding: const EdgeInsets.only(bottom: 2.0), // Gap between text and underline
                        child: Text(
                          'No fee',
                          style: GoogleFonts.nunito(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                style: GoogleFonts.nunito(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              description: '',
              action: Column(
                children: [
                  Text(
                    '₹${_currentAmount.toStringAsFixed(2)}',
                    style: GoogleFonts.nunito(fontSize: 22, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isProcessing ? null : () => _handlePayment(false),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF6A2121), // Matching image color
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                      ),
                      child: Text(
                        _isProcessing ? 'Processing...' : 'PAY UPI, DEBIT CARD',
                        style: GoogleFonts.nunito(color: Colors.white, fontWeight: FontWeight.w700),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Credit Card/NetBanking Card
            _buildOptionCard(
              icon: Icons.credit_card,
              title: 'Credit Card or NetBanking,',
              subtitle: '2.3% transaction fee',
              description: '',
              action: Column(
                children: [
                  Text(
                    '₹${_calculateTotalWithFee(_currentAmount).toStringAsFixed(2)}',
                    style: GoogleFonts.nunito(fontSize: 22, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isProcessing ? null : () => _handlePayment(true),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF6A2121), // Matching image color
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                      ),
                      child: Text(
                        _isProcessing ? 'Processing...' : 'PAY NET, CREDIT CARD',
                        style: GoogleFonts.nunito(color: Colors.white, fontWeight: FontWeight.w700),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    ),
  );
}

  Widget _buildOptionCard({
    required IconData icon,
    required dynamic title,
    String? subtitle,
    required String description,
    Widget? child,
    Widget? action,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.grey.shade200),
        borderRadius: BorderRadius.circular(8),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: Colors.brown, size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    title is Widget
                        ? title
                        : Text(
                            title,
                            style: GoogleFonts.nunito(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                    if (subtitle != null)
                      Text(
                        subtitle,
                        style: GoogleFonts.nunito(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
          if (description.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              description,
              style: GoogleFonts.nunito(
                fontSize: 14,
                color: AppColors.textSecondary,
                height: 1.4,
              ),
            ),
          ],
          if (child != null) ...[
            const SizedBox(height: 24),
            Center(child: child),
          ],
          if (action != null) ...[
            const SizedBox(height: 24),
            action,
          ],
        ],
      ),
    );
  }
}
