import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../screens/public/checkout_screen.dart';
import '../providers/auth_provider.dart';
import '../models/user.dart';

class OrderFooter extends StatelessWidget {
  final double totalAmount;
  final int itemCount;
  final VoidCallback? onCheckout;
  final BuildContext? context;

  const OrderFooter({
    required this.totalAmount,
    required this.itemCount,
    this.onCheckout,
    this.context,
    super.key,
  });

  String get itemText => itemCount == 1 ? '1 item' : '$itemCount items';
  bool get hasAvailableItems => itemCount > 0;

  /// Extract user profile data for order placement
  Map<String, dynamic>? _extractUserProfileData(User? user) {
    if (user == null) return null;
    
    return {
      'userId': user.id,
      'phone': user.phone,
      'name': user.name,
      'email': user.email,
      'salutation': user.salutation,
      'firstName': user.firstName,
      'lastName': user.lastName,
      'whMobilePhone': user.whMobilePhone,
      'deliveryAddress': user.deliveryAddress,
      'deliveryPincode': user.deliveryPincode,
      'dietaryPreference': user.dietaryPreference,
      'packingPreference': user.packingPreference,
      'productUpdatePreference': user.productUpdatePreference,
    };
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, _) {
        final userProfileData = _extractUserProfileData(authProvider.currentUser);

        return Container(
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border(
              top: BorderSide(color: Colors.grey[300]!),
            ),
          ),
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    itemText,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  Text(
                    '₹${totalAmount.toStringAsFixed(0)}',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                ],
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFe04a06),
                    foregroundColor: Colors.white,
                  ),
                  onPressed: hasAvailableItems ? () {
                    if (onCheckout != null) {
                      onCheckout!();
                    } else {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => CheckoutScreen(
                            userProfileData: userProfileData,
                          ),
                        ),
                      );
                    }
                  } : null,
                  child: Text(
                    'CHECKOUT',
                    style: getButtonTextStyle(),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
  }
