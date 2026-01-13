import 'package:flutter_test/flutter_test.dart';
import 'package:suvai/models/product.dart';

void main() {
  group('Product Unit Selection and Discount Parsing', () {
    final testProduct = Product(
      id: 'test-rice-001',
      name: 'Basmati Rice',
      description: 'Premium rice',
      price: 220.0,
      category: 'Grains',
      subcategory: 'Rice',
      imageUrl: '',
      unitOfSale: '1Kg',
      unitsForSelection: '0,0.2,0.4=5%,0.6,0.8=10%,1',
    );

    test('parseUnitsWithDiscounts extracts fractions and discounts correctly', () {
      final parsed = testProduct.parseUnitsWithDiscounts();
      
      expect(parsed.length, 5); // 0.2, 0.4, 0.6, 0.8, 1.0 (0 is filtered out)
      expect(parsed[0.2], null); // No discount
      expect(parsed[0.4], 5.0); // 5% discount
      expect(parsed[0.6], null); // No discount
      expect(parsed[0.8], 10.0); // 10% discount
      expect(parsed[1.0], null); // No discount
    });

    test('getAvailableUnits returns fractions in ascending order', () {
      final units = testProduct.getAvailableUnits();
      
      expect(units.length, 5);
      expect(units, [0.2, 0.4, 0.6, 0.8, 1.0]);
    });

    test('getDiscountPercentage returns correct discount for each fraction', () {
      expect(testProduct.getDiscountPercentage(0.2), null);
      expect(testProduct.getDiscountPercentage(0.4), 5.0);
      expect(testProduct.getDiscountPercentage(0.6), null);
      expect(testProduct.getDiscountPercentage(0.8), 10.0);
      expect(testProduct.getDiscountPercentage(1.0), null);
    });

    test('calculateUnitPrice applies discount correctly', () {
      // Formula: base_price × fraction × (1 - discount%/100)
      
      // 0.2Kg: 220 × 0.2 = 44 (no discount)
      expect(testProduct.calculateUnitPrice(0.2), closeTo(44.0, 0.01));
      
      // 0.4Kg: 220 × 0.4 × (1 - 5/100) = 220 × 0.4 × 0.95 = 83.6
      expect(testProduct.calculateUnitPrice(0.4), closeTo(83.6, 0.01));
      
      // 0.6Kg: 220 × 0.6 = 132 (no discount)
      expect(testProduct.calculateUnitPrice(0.6), closeTo(132.0, 0.01));
      
      // 0.8Kg: 220 × 0.8 × (1 - 10/100) = 220 × 0.8 × 0.9 = 158.4
      expect(testProduct.calculateUnitPrice(0.8), closeTo(158.4, 0.01));
      
      // 1Kg: 220 × 1 = 220 (no discount)
      expect(testProduct.calculateUnitPrice(1.0), closeTo(220.0, 0.01));
    });

    test('formatUnitLabel converts to user-friendly units', () {
      expect(testProduct.formatUnitLabel(0.2), '200g'); // 0.2 × 1Kg = 200g
      expect(testProduct.formatUnitLabel(0.4), '400g');
      expect(testProduct.formatUnitLabel(0.6), '600g');
      expect(testProduct.formatUnitLabel(0.8), '800g');
      expect(testProduct.formatUnitLabel(1.0), '1kg'); // 1.0 × 1Kg = 1kg
    });

    test('formatUnitLabel handles different base units', () {
      final litrProduct = Product(
        id: 'test-oil-001',
        name: 'Olive Oil',
        description: 'Premium oil',
        price: 500.0,
        category: 'Oils',
        subcategory: 'Cooking',
        imageUrl: '',
        unitOfSale: '1L',
        unitsForSelection: '0,0.5,1',
      );
      
      expect(litrProduct.formatUnitLabel(0.5), '500ml'); // 0.5 × 1L = 500ml
      expect(litrProduct.formatUnitLabel(1.0), '1l'); // 1.0 × 1L = 1l
    });

    test('parseUnitsWithDiscounts handles empty discount', () {
      final simpleProduct = Product(
        id: 'test-salt-001',
        name: 'Salt',
        description: 'Common salt',
        price: 20.0,
        category: 'Spices',
        subcategory: 'Salt',
        imageUrl: '',
        unitOfSale: '1Kg',
        unitsForSelection: '0,0.5,1',
      );
      
      final parsed = simpleProduct.parseUnitsWithDiscounts();
      expect(parsed[0.5], null);
      expect(parsed[1.0], null);
    });
  });

  group('CartItem with Unit Selection', () {
    final testProduct = Product(
      id: 'test-rice-001',
      name: 'Basmati Rice',
      description: 'Premium rice',
      price: 220.0,
      category: 'Grains',
      subcategory: 'Rice',
      imageUrl: '',
      unitOfSale: '1Kg',
      unitsForSelection: '0,0.2,0.4=5%,0.6,0.8=10%,1',
    );

    test('CartItem stores unit and price correctly', () {
      final cartItem = CartItem(
        product: testProduct,
        quantity: 2.0,
        selectedUnit: 0.4,
        selectedUnitPrice: 83.6,
      );
      
      expect(cartItem.quantity, 2.0);
      expect(cartItem.selectedUnit, 0.4);
      expect(cartItem.selectedUnitPrice, 83.6);
    });

    test('CartItem.subtotal uses selectedUnitPrice', () {
      final cartItem = CartItem(
        product: testProduct,
        quantity: 2.0,
        selectedUnit: 0.4,
        selectedUnitPrice: 83.6,
      );
      
      // subtotal = selectedUnitPrice × quantity = 83.6 × 2 = 167.2
      expect(cartItem.subtotal, closeTo(167.2, 0.01));
    });

    test('CartItem.formattedUnit returns correct label', () {
      final cartItem = CartItem(
        product: testProduct,
        quantity: 2.0,
        selectedUnit: 0.4,
        selectedUnitPrice: 83.6,
      );
      
      expect(cartItem.formattedUnit, '400g');
    });

    test('CartItem.unitDiscount returns correct discount percentage', () {
      final cartItem = CartItem(
        product: testProduct,
        quantity: 1.0,
        selectedUnit: 0.4,
        selectedUnitPrice: 83.6,
      );
      
      expect(cartItem.unitDiscount, 5.0);
    });

    test('CartItem.subtotal falls back to base price if selectedUnitPrice is 0', () {
      final cartItem = CartItem(
        product: testProduct,
        quantity: 1.0,
        selectedUnit: 1.0,
        selectedUnitPrice: 0.0, // Invalid case, should fall back
      );
      
      // Falls back to price × quantity = 220 × 1
      expect(cartItem.subtotal, closeTo(220.0, 0.01));
    });
  });

  group('Complex Discount Scenarios', () {
    test('Multiple items with different units and discounts', () {
      final product = Product(
        id: 'test-rice-001',
        name: 'Basmati Rice',
        description: 'Premium rice',
        price: 220.0,
        category: 'Grains',
        subcategory: 'Rice',
        imageUrl: '',
        unitOfSale: '1Kg',
        unitsForSelection: '0,0.2,0.4=5%,0.6,0.8=10%,1',
      );

      final cart = [
        CartItem(
          product: product,
          quantity: 1.0,
          selectedUnit: 0.2,
          selectedUnitPrice: product.calculateUnitPrice(0.2),
        ),
        CartItem(
          product: product,
          quantity: 1.0,
          selectedUnit: 0.4,
          selectedUnitPrice: product.calculateUnitPrice(0.4),
        ),
        CartItem(
          product: product,
          quantity: 1.0,
          selectedUnit: 0.8,
          selectedUnitPrice: product.calculateUnitPrice(0.8),
        ),
      ];

      final cartTotal = cart.fold<double>(0, (sum, item) => sum + item.subtotal);
      
      // 44 + 83.6 + 158.4 = 286
      expect(cartTotal, closeTo(286.0, 0.01));
    });
  });
}
