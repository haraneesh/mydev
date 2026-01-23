import 'package:intl/intl.dart';

/// Formatters for date and currency display
class Formatters {
  /// Format date to "Jan 15, 2026" format
  static String formatDate(DateTime date) {
    // Convert from UTC to IST (UTC+5:30)
    final istDate = date.subtract(const Duration(hours: 5, minutes: 30));
    return DateFormat('MMM d, y').format(istDate);
  }

  /// Format currency to "₹25,000.00" format (INR)
  static String formatCurrency(double amount) {
    return NumberFormat.currency(
      symbol: '₹',
      decimalDigits: 2,
      locale: 'en_IN',
    ).format(amount);
  }

  /// Format date and time to "Jan 15, 2026 2:30 PM" format
  static String formatDateTime(DateTime dateTime) {
    return DateFormat('MMM d, y h:mm a').format(dateTime);
  }

  /// Get relative time (e.g., "2 days ago")
  static String getRelativeTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inDays > 0) {
      return '${difference.inDays} day${difference.inDays > 1 ? 's' : ''} ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} hour${difference.inHours > 1 ? 's' : ''} ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes} minute${difference.inMinutes > 1 ? 's' : ''} ago';
    } else {
      return 'Just now';
    }
  }
}
