import 'package:flutter/material.dart';
import '../models/product.dart';
import '../config/theme.dart';

/// Unit Selection Widget
/// Displays available unit options and allows selection with calculated pricing
class UnitSelectionWidget extends StatefulWidget {
  final Product product;
  final Function(double selectedUnit, double unitPrice) onUnitSelected;

  const UnitSelectionWidget({
    super.key,
    required this.product,
    required this.onUnitSelected,
  });

  @override
  State<UnitSelectionWidget> createState() => _UnitSelectionWidgetState();
}

class _UnitSelectionWidgetState extends State<UnitSelectionWidget> {
  late double _selectedUnit;
  late List<double> _availableUnits;

  @override
  void initState() {
    super.initState();
    _availableUnits = widget.product.getAvailableUnits();
    _selectedUnit = _availableUnits.isNotEmpty ? _availableUnits.last : 1.0;
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        // Compact unit selector using buttons/chips
        SizedBox(
          height: 46,
          child: SingleChildScrollView(
            child: Wrap(
              spacing: 3,
              runSpacing: 3,
              children: _availableUnits.map((unit) {
                final label = widget.product.formatUnitLabel(unit);
                final price = widget.product.calculateUnitPrice(unit);
                final discount = widget.product.getDiscountPercentage(unit);
                final isSelected = unit == _selectedUnit;

                return Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: () => setState(() => _selectedUnit = unit),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.primary : Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(3),
                        border: Border.all(
                          color: isSelected ? AppColors.primary : Colors.grey.shade300,
                          width: 0.5,
                        ),
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            label,
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w600,
                              color: isSelected ? Colors.white : Colors.black87,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          if (discount == null)
                            Text(
                              '₹${price.toStringAsFixed(0)}',
                              style: TextStyle(
                                fontSize: 8,
                                fontWeight: FontWeight.w600,
                                color: isSelected ? Colors.white : Colors.black54,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            )
                          else
                            Text(
                              '${discount.toStringAsFixed(0)}%',
                              style: TextStyle(
                                fontSize: 8,
                                fontWeight: FontWeight.w500,
                                color: isSelected ? Colors.white70 : AppColors.accent,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                        ],
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ),
        const SizedBox(height: 3),
        // Add button
        SizedBox(
          height: 20,
          child: ElevatedButton(
            onPressed: () {
              final unitPrice = widget.product.calculateUnitPrice(_selectedUnit);
              widget.onUnitSelected(_selectedUnit, unitPrice);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 0),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            child: Text(
              'Add',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                fontSize: 9,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ),
      ],
    );
  }
}
