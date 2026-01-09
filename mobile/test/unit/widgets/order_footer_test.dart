import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:suvai/widgets/order_footer.dart';

void main() {
  group('OrderFooter', () {
    testWidgets('displays total amount', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: OrderFooter(
              totalAmount: 500.0,
              itemCount: 2,
            ),
          ),
        ),
      );

      expect(find.text('500'), findsOneWidget);
    });

    testWidgets('displays item count', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: OrderFooter(
              totalAmount: 250.0,
              itemCount: 1,
            ),
          ),
        ),
      );

      expect(find.text('1 item'), findsOneWidget);
    });

    testWidgets('displays plural items', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: OrderFooter(
              totalAmount: 750.0,
              itemCount: 3,
            ),
          ),
        ),
      );

      expect(find.text('3 items'), findsOneWidget);
    });

    testWidgets('checkout button is present', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: OrderFooter(
              totalAmount: 500.0,
              itemCount: 2,
            ),
          ),
        ),
      );

      expect(find.byType(ElevatedButton), findsOneWidget);
      expect(find.text('Checkout'), findsOneWidget);
    });

    testWidgets('calls onCheckout when button is tapped',
        (WidgetTester tester) async {
      var checkoutCalled = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: OrderFooter(
              totalAmount: 500.0,
              itemCount: 2,
              onCheckout: () => checkoutCalled = true,
            ),
          ),
        ),
      );

      await tester.tap(find.byType(ElevatedButton));
      await tester.pumpAndSettle();

      expect(checkoutCalled, true);
    });
  });
}
