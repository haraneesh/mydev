import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:suvai/widgets/quantity_selector.dart';

void main() {
  group('QuantitySelector', () {
    testWidgets('displays current quantity', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: QuantitySelector(
              quantity: 3,
              onQuantityChanged: (_) {},
            ),
          ),
        ),
      );

      expect(find.text('3'), findsOneWidget);
    });

    testWidgets('increments quantity when plus button is tapped',
        (WidgetTester tester) async {
      var lastQuantity = 0;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: QuantitySelector(
              quantity: 1,
              onQuantityChanged: (q) => lastQuantity = q,
            ),
          ),
        ),
      );

      await tester.tap(find.byIcon(Icons.add));
      await tester.pumpAndSettle();

      expect(lastQuantity, 2);
    });

    testWidgets('decrements quantity when minus button is tapped',
        (WidgetTester tester) async {
      var lastQuantity = 0;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: QuantitySelector(
              quantity: 3,
              onQuantityChanged: (q) => lastQuantity = q,
            ),
          ),
        ),
      );

      await tester.tap(find.byIcon(Icons.remove));
      await tester.pumpAndSettle();

      expect(lastQuantity, 2);
    });

    testWidgets('does not go below 1', (WidgetTester tester) async {
      var lastQuantity = 1;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: QuantitySelector(
              quantity: 1,
              onQuantityChanged: (q) => lastQuantity = q,
            ),
          ),
        ),
      );

      await tester.tap(find.byIcon(Icons.remove));
      await tester.pumpAndSettle();

      expect(lastQuantity, 1);
    });

    testWidgets('displays correct format', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: QuantitySelector(
              quantity: 5,
              onQuantityChanged: (_) {},
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.remove), findsOneWidget);
      expect(find.text('5'), findsOneWidget);
      expect(find.byIcon(Icons.add), findsOneWidget);
    });
  });
}
