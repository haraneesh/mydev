import 'package:flutter/material.dart';
import '../config/theme.dart';

class QuantityDisplay extends StatefulWidget {
  final double currentQuantity;
  final List<PopupMenuItem<double>> popupMenuItems;
  final ValueChanged<double> onQuantityChanged;
  final VoidCallback onDelete;
  final String unitOfSale;
  final String? unitLabel; // Optional unit label (e.g., "200g")
  final double unitPrice; // Unit-specific price

  const QuantityDisplay({
    required this.currentQuantity,
    required this.popupMenuItems,
    required this.onQuantityChanged,
    required this.onDelete,
    required this.unitOfSale,
    this.unitLabel,
    this.unitPrice = 0.0,
    super.key,
  });

  @override
  State<QuantityDisplay> createState() => _QuantityDisplayState();
}

class _QuantityDisplayState extends State<QuantityDisplay> {
  late GlobalKey<PopupMenuButtonState<double>> _popupMenuKey;
  bool _isDropdownOpen = false;

  @override
  void initState() {
    super.initState();
    _popupMenuKey = GlobalKey<PopupMenuButtonState<double>>();
  }

  /// Format quantity for display (e.g., "Qty: 2 × 200g" or "Qty: 2")
  String _formatQuantityDisplay(double quantity) {
    // If unitLabel is provided (from CartItem.formattedUnit), use it
    if (widget.unitLabel != null && widget.unitLabel!.isNotEmpty) {
      final qtyStr = quantity % 1 == 0 ? quantity.toInt().toString() : quantity.toString();
      return 'Qty: $qtyStr × ${widget.unitLabel}';
    }

    // Fallback: Parse unitOfSale to get unit
    final trimmed = widget.unitOfSale.trim();
    final regex = RegExp(r'^([\d.]+)\s*(.+)$');
    final match = regex.firstMatch(trimmed);
    
    String unit = 'kg';
    if (match != null) {
      unit = (match.group(2) ?? 'kg').toLowerCase();
    }

    // Convert quantity to display format
    final actualAmount = quantity;
    
    if (unit == 'kg' && actualAmount < 1) {
      final grams = (actualAmount * 1000).toInt();
      return 'Qty: $grams g';
    }
    
    if (unit == 'kg' && actualAmount == actualAmount.toInt()) {
      return 'Qty: ${actualAmount.toInt()} kg';
    }
    
    if (unit == 'kg') {
      return 'Qty: $actualAmount kg';
    }
    
    final valueStr = actualAmount % 1 == 0 ? actualAmount.toInt().toString() : actualAmount.toString();
    return 'Qty: $valueStr $unit';
  }

  @override
  Widget build(BuildContext context) {
    final displayText = _formatQuantityDisplay(widget.currentQuantity);

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        // Quantity display with dropdown arrow
        Expanded(
          child: GestureDetector(
            onTap: () {
              _popupMenuKey.currentState?.showButtonMenu();
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.primary, width: 1),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      displayText,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                            color: AppColors.primary,
                          ),
                    ),
                  ),
                  const SizedBox(width: 4),
                  Icon(
                    Icons.arrow_drop_down,
                    size: 16,
                    color: AppColors.primary,
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(width: 4),
        // Delete icon
        SizedBox(
          width: 28,
          height: 28,
          child: IconButton(
            icon: const Icon(Icons.delete_outline),
            iconSize: 14,
            color: AppColors.accent,
            padding: EdgeInsets.zero,
            onPressed: widget.onDelete,
          ),
        ),
        // Hidden PopupMenuButton for dropdown functionality
        PopupMenuButton<double>(
          key: _popupMenuKey,
          initialValue: widget.currentQuantity,
          onSelected: (newQuantity) {
            if (newQuantity != widget.currentQuantity) {
              widget.onQuantityChanged(newQuantity);
            } else {
            }
          },
          itemBuilder: (BuildContext context) => widget.popupMenuItems,
          offset: const Offset(0, 35),
          constraints: const BoxConstraints(
            minWidth: 100,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ],
    );
  }
}
