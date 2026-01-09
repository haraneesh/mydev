import 'package:flutter/material.dart';

class QuantitySelector extends StatelessWidget {
  final int quantity;
  final Function(int) onQuantityChanged;

  const QuantitySelector({
    required this.quantity,
    required this.onQuantityChanged,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        IconButton(
          icon: const Icon(Icons.remove),
          iconSize: 20,
          constraints: const BoxConstraints(minHeight: 32, minWidth: 32),
          padding: EdgeInsets.zero,
          onPressed: quantity > 1 ? () => onQuantityChanged(quantity - 1) : null,
        ),
        SizedBox(
          width: 32,
          child: Center(
            child: Text(
              quantity.toString(),
              style: Theme.of(context).textTheme.labelLarge,
            ),
          ),
        ),
        IconButton(
          icon: const Icon(Icons.add),
          iconSize: 20,
          constraints: const BoxConstraints(minHeight: 32, minWidth: 32),
          padding: EdgeInsets.zero,
          onPressed: () => onQuantityChanged(quantity + 1),
        ),
      ],
    );
  }
}
