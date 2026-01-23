import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../models/invoice.dart';
import '../../config/theme.dart';
import '../../utils/formatters.dart';

class InvoiceListItemWidget extends StatelessWidget {
  final Invoice invoice;
  final VoidCallback onTap;

  const InvoiceListItemWidget({
    required this.invoice,
    required this.onTap,
    super.key,
  });

  Color _getStatusColor() {
    switch (invoice.status) {
      case 'paid':
        return AppColors.success;
      case 'unpaid':
        return Colors.orange;
      case 'overdue':
        return const Color(0xFFEF0905);
      case 'draft':
        return Colors.grey;
      case 'sent':
        return Colors.blue;
      case 'partially_paid':
        return Colors.blue[700] ?? Colors.blue;
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
                      Formatters.formatDate(invoice.date),
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
                          Formatters.formatCurrency(invoice.total),
                          style: GoogleFonts.nunito(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primary,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Icon(
                          Icons.chevron_right,
                          color: AppColors.divider,
                          size: 20,
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                // Bottom Row: Status Badge
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: _getStatusColor(),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        invoice.statusDisplay,
                        style: GoogleFonts.nunito(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                          fontSize: 12,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
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
