import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/theme.dart';
import '../models/user_wallet.dart';

class WalletBalanceCard extends StatelessWidget {
  final UserWallet wallet;
  final bool isLoading;

  const WalletBalanceCard({
    Key? key,
    required this.wallet,
    this.isLoading = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            // Wallet Icon
            Container(
              padding: const EdgeInsets.all(12),
              child: const Icon(
                Icons.credit_card,
                size: 40,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(width: 16),
            // Balance and Dues
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildRow(
                    context,
                    'Wallet Balance:',
                    '₹${wallet.balance.toStringAsFixed(2)}',
                    valueColor: AppColors.textPrimary,
                  ),
                  const SizedBox(height: 8),
                  _buildRow(
                    context,
                    'Total Dues:',
                    '₹${wallet.totalDues.toStringAsFixed(2)}',
                    valueColor: Colors.red,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRow(BuildContext context, String label, String value, {Color? valueColor, bool isBold = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: GoogleFonts.nunito(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        if (isLoading)
          const SizedBox(
            width: 16,
            height: 16,
            child: CircularProgressIndicator(strokeWidth: 2),
          )
        else
          Text(
            value,
            style: GoogleFonts.nunito(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: valueColor ?? AppColors.textPrimary,
            ),
          ),
      ],
    );
  }
}
