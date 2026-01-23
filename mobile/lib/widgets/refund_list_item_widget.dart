import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/refund.dart';
import '../config/theme.dart';
import '../utils/formatters.dart';

class RefundListItemWidget extends StatelessWidget {
  final CreditNote refund;
  final VoidCallback onTap;
  final bool isExpanded;

  const RefundListItemWidget({
    required this.refund,
    required this.onTap,
    this.isExpanded = false,
    super.key,
  });

  Color _getStatusColor() {
    switch (refund.status) {
      case 'applied':
        return AppColors.success;
      case 'open':
        return Colors.blue;
      case 'voided':
        return const Color(0xFFEF0905);
      case 'draft':
        return Colors.grey;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Card(
        margin: EdgeInsets.zero,
        color: Colors.white,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(8),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                // Top Row: Date and Amount
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(
                      refund.getFormattedDate(),
                      style: GoogleFonts.nunito(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          refund.getFormattedTotal(),
                          style: GoogleFonts.nunito(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primary,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Transform.rotate(
                          angle: isExpanded ? 1.5708 : 0, // 90 degrees in radians
                          child: Icon(
                            Icons.chevron_right,
                            color: AppColors.divider,
                            size: 20,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),

              ],
            ),
          ),
        ),
      ),
    );
  }
}
