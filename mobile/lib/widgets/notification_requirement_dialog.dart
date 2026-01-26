import 'package:flutter/material.dart';
import '../services/onesignal_service.dart';

/// A reusable dialog that prompts the user to subscribe to notifications.
/// Matches the app's theme and provides a consistent "Stay Updated!" message.
class NotificationRequirementDialog extends StatelessWidget {
  final OneSignalService oneSignalService;

  const NotificationRequirementDialog({
    super.key,
    required this.oneSignalService,
  });

  /// Shows the dialog and returns true if permission was granted.
  static Future<bool> show(BuildContext context, OneSignalService oneSignalService) async {
    final result = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (context) => NotificationRequirementDialog(oneSignalService: oneSignalService),
    );
    return result ?? false;
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false, // Prevent dismissal via back button
      child: AlertDialog(
        title: const Text('Stay Updated!'),
        content: const Text(
          'To ensure you receive timely updates about your order status and delivery notifications, please subscribe to our notifications.',
        ),
        actions: [
          ElevatedButton(
            onPressed: () async {
              final granted = await oneSignalService.requestPermission();
              if (context.mounted) {
                Navigator.pop(context, granted);
              }
            },
            child: const Text('SUBSCRIBE'),
          ),
        ],
      ),
    );
  }
}
