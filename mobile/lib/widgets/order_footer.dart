import 'package:flutter/material.dart';
import '../screens/public/checkout_screen.dart';

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

  @override
  Widget build(BuildContext context) {
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
              onPressed: () {
               if (onCheckout != null) {
                 onCheckout!();
               } else {
                 Navigator.push(
                   context,
                   MaterialPageRoute(builder: (_) => const CheckoutScreen()),
                 );
               }
              },
              child: const Text('Checkout'),
            ),
          ),
        ],
      ),
    );
  }
}
