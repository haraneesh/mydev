import 'package:flutter/material.dart';

class QuantitySelector extends StatelessWidget {
  final double quantity;
  final Function(double) onQuantityChanged;

  const QuantitySelector({
    required this.quantity,
    required this.onQuantityChanged,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        IconButton(
          icon: const Icon(Icons.remove),
          iconSize: 18,
          constraints: const BoxConstraints(minHeight: 28, minWidth: 28),
          padding: EdgeInsets.zero,
          onPressed: quantity > 1 ? () => onQuantityChanged(quantity - 1) : null,
        ),
        SizedBox(
          width: 28,
          child: Center(
            child: Text(
              quantity % 1 == 0 ? quantity.toInt().toString() : quantity.toString(),
              style: Theme.of(context).textTheme.labelSmall,
            ),
          ),
        ),
        IconButton(
          icon: const Icon(Icons.add),
          iconSize: 18,
          constraints: const BoxConstraints(minHeight: 28, minWidth: 28),
          padding: EdgeInsets.zero,
          onPressed: () => onQuantityChanged(quantity + 1),
        ),
      ],
    );
  }
}
