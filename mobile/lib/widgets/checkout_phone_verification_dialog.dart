import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../services/meteor_client.dart';

class CheckoutPhoneVerificationDialog extends StatefulWidget {
  final MeteorClient meteorClient;
  final VoidCallback onSignUpPressed;

  const CheckoutPhoneVerificationDialog({
    required this.meteorClient,
    required this.onSignUpPressed,
    super.key,
  });

  @override
  State<CheckoutPhoneVerificationDialog> createState() =>
      _CheckoutPhoneVerificationDialogState();
}

class _CheckoutPhoneVerificationDialogState
    extends State<CheckoutPhoneVerificationDialog> {
  final _phoneController = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  bool _isPhoneValid(String phone) {
    return phone.length == 10 && RegExp(r'^[0-9]{10}$').hasMatch(phone);
  }

  Future<void> _validateAndProceed() async {
    final phone = _phoneController.text.trim();

    if (!_isPhoneValid(phone)) {
      setState(() {
        _errorMessage = 'Phone must be 10 digits';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // Call usersNotLoggedIn.find to check if phone is registered
      final response = await widget.meteorClient
          .call('usersNotLoggedIn.find', [{'mobileNumber': phone}]);

      if (response == null) {
        // Phone not registered
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
          _showUnregisteredAlert(phone);
        }
      } else {
        // Phone is registered, proceed with order
        if (mounted) {
          Navigator.pop(context, phone);
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Error validating phone: ${e.toString()}';
        });
      }
    }
  }

  void _showUnregisteredAlert(String phone) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Phone Not Registered'),
        content: Text(
          'The phone number $phone is not registered with us.\n\nPlease sign up to place an order.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Back'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              widget.onSignUpPressed();
            },
            child: const Text('Sign Up'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Complete Order',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: const Icon(Icons.close),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Text(
              'Enter Your Registered Mobile Number',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              maxLength: 10,
              enabled: !_isLoading,
              decoration: InputDecoration(
                hintText: '9876543210',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                counterText: '',
              ),
              style: const TextStyle(fontSize: 18, letterSpacing: 2),
            ),
            if (_errorMessage != null) ...[
              const SizedBox(height: 12),
              Text(
                _errorMessage!,
                style: const TextStyle(
                  color: Colors.red,
                  fontSize: 14,
                ),
              ),
            ],
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _validateAndProceed,
                child: _isLoading
                    ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                    : const Text('PLACE ORDER'),
              ),
            ),
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 16),
            Text(
              'If you are a new user, please sign up',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.secondary,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  side: BorderSide(color: AppColors.secondary),
                ),
                onPressed: _isLoading ? null : widget.onSignUpPressed,
                child: const Text('SIGN UP'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
