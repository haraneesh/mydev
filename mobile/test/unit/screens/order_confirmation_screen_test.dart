import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:suvai/screens/public/order_confirmation_screen.dart';

void main() {
  group('OrderConfirmationScreen', () {
    testWidgets('displays order ID', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: OrderConfirmationScreen(
            orderId: 'ORD-123456',
            totalAmount: 500.0,
            name: 'John Doe',
          ),
        ),
      );

      expect(find.text('ORD-123456'), findsOneWidget);
    });

    testWidgets('displays order total', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: OrderConfirmationScreen(
            orderId: 'ORD-123456',
            totalAmount: 500.0,
            name: 'John Doe',
          ),
        ),
      );

      expect(find.text('₹500'), findsOneWidget);
    });

    testWidgets('displays customer name', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: OrderConfirmationScreen(
            orderId: 'ORD-123456',
            totalAmount: 500.0,
            name: 'Jane Smith',
          ),
        ),
      );

      expect(find.text('Jane Smith'), findsOneWidget);
    });

    testWidgets('displays success message', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: OrderConfirmationScreen(
            orderId: 'ORD-123456',
            totalAmount: 500.0,
            name: 'John Doe',
          ),
        ),
      );

      expect(find.text('Order Confirmed'), findsOneWidget);
      expect(find.byIcon(Icons.check_circle), findsOneWidget);
    });

    testWidgets('has continue shopping button', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: OrderConfirmationScreen(
            orderId: 'ORD-123456',
            totalAmount: 500.0,
            name: 'John Doe',
          ),
        ),
      );

      expect(find.byType(ElevatedButton), findsOneWidget);
      expect(find.text('Continue Shopping'), findsOneWidget);
    });

    testWidgets('navigates home when continue button is tapped',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: OrderConfirmationScreen(
            orderId: 'ORD-123456',
            totalAmount: 500.0,
            name: 'John Doe',
          ),
        ),
      );

      await tester.tap(find.byType(ElevatedButton));
      await tester.pumpAndSettle();

      expect(find.byType(OrderConfirmationScreen), findsNothing);
    });
  });
}
