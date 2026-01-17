import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:provider/provider.dart';
import 'package:mydev/screens/public/checkout_screen.dart';
import 'package:mydev/providers/cart_provider.dart';
import 'package:mydev/providers/auth_provider.dart';

class MockCartProvider extends Mock implements CartProvider {}

class MockAuthProvider extends Mock implements AuthProvider {}

void main() {
  group('CheckoutScreen Styling and Notes Tests', () {
    late MockCartProvider mockCartProvider;
    late MockAuthProvider mockAuthProvider;

    setUp(() {
      mockCartProvider = MockCartProvider();
      mockAuthProvider = MockAuthProvider();
    });

    testWidgets(
        'CheckoutScreen displays three white-background card sections',
        (WidgetTester tester) async {
      when(mockCartProvider.itemCount).thenReturn(2);
      when(mockCartProvider.totalAmount).thenReturn(1500.0);
      when(mockCartProvider.availableItems).thenReturn([]);
      when(mockAuthProvider.currentUser).thenReturn(null);

      await tester.pumpWidget(
        MaterialApp(
          home: MultiProvider(
            providers: [
              ChangeNotifierProvider<CartProvider>.value(
                value: mockCartProvider,
              ),
              ChangeNotifierProvider<AuthProvider>.value(
                value: mockAuthProvider,
              ),
            ],
            child: const CheckoutScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Verify three Card widgets are present (Order Summary, Delivery Details, Notes)
      expect(find.byType(Card), findsWidgets);
      final cardCount = find.byType(Card).evaluate().length;
      expect(cardCount, greaterThanOrEqualTo(3));
    });

    testWidgets(
        'CheckoutScreen displays section headers with proper styling',
        (WidgetTester tester) async {
      when(mockCartProvider.itemCount).thenReturn(2);
      when(mockCartProvider.totalAmount).thenReturn(1500.0);
      when(mockCartProvider.availableItems).thenReturn([]);
      when(mockAuthProvider.currentUser).thenReturn(null);

      await tester.pumpWidget(
        MaterialApp(
          home: MultiProvider(
            providers: [
              ChangeNotifierProvider<CartProvider>.value(
                value: mockCartProvider,
              ),
              ChangeNotifierProvider<AuthProvider>.value(
                value: mockAuthProvider,
              ),
            ],
            child: const CheckoutScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Verify section headers are displayed
      expect(find.text('Order Summary'), findsOneWidget);
      expect(find.text('Delivery Details'), findsOneWidget);
      expect(find.text('Special Instructions'), findsOneWidget);
      expect(find.text('Order Items'), findsOneWidget);
    });

    testWidgets(
        'CheckoutScreen notes field accepts text input',
        (WidgetTester tester) async {
      when(mockCartProvider.itemCount).thenReturn(2);
      when(mockCartProvider.totalAmount).thenReturn(1500.0);
      when(mockCartProvider.availableItems).thenReturn([]);
      when(mockAuthProvider.currentUser).thenReturn(null);

      await tester.pumpWidget(
        MaterialApp(
          home: MultiProvider(
            providers: [
              ChangeNotifierProvider<CartProvider>.value(
                value: mockCartProvider,
              ),
              ChangeNotifierProvider<AuthProvider>.value(
                value: mockAuthProvider,
              ),
            ],
            child: const CheckoutScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Find notes field and enter text
      final notesField = find.byType(TextFormField).last;
      await tester.enterText(notesField, 'Please handle with care');
      await tester.pumpAndSettle();

      // Verify text was entered
      expect(find.text('Please handle with care'), findsOneWidget);
    });

    testWidgets(
        'CheckoutScreen notes field shows character count',
        (WidgetTester tester) async {
      when(mockCartProvider.itemCount).thenReturn(2);
      when(mockCartProvider.totalAmount).thenReturn(1500.0);
      when(mockCartProvider.availableItems).thenReturn([]);
      when(mockAuthProvider.currentUser).thenReturn(null);

      await tester.pumpWidget(
        MaterialApp(
          home: MultiProvider(
            providers: [
              ChangeNotifierProvider<CartProvider>.value(
                value: mockCartProvider,
              ),
              ChangeNotifierProvider<AuthProvider>.value(
                value: mockAuthProvider,
              ),
            ],
            child: const CheckoutScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Verify helper text (character counter) is present
      expect(find.text(RegExp(r'\d+/500 characters')), findsWidgets);
    });

    testWidgets(
        'CheckoutScreen enforces max 500 character limit on notes',
        (WidgetTester tester) async {
      when(mockCartProvider.itemCount).thenReturn(1);
      when(mockCartProvider.totalAmount).thenReturn(800.0);
      when(mockCartProvider.availableItems).thenReturn([]);
      when(mockAuthProvider.currentUser).thenReturn(null);

      await tester.pumpWidget(
        MaterialApp(
          home: MultiProvider(
            providers: [
              ChangeNotifierProvider<CartProvider>.value(
                value: mockCartProvider,
              ),
              ChangeNotifierProvider<AuthProvider>.value(
                value: mockAuthProvider,
              ),
            ],
            child: const CheckoutScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Try to enter text longer than 500 characters
      final longText = 'a' * 600;
      final notesField = find.byType(TextFormField).last;
      
      await tester.enterText(notesField, longText);
      await tester.pumpAndSettle();

      // Verify text is limited (exact length depends on Flutter's TextFormField implementation)
      final textFieldWidget = tester.widget<TextFormField>(notesField);
      expect(textFieldWidget.maxLength, equals(500));
    });

    testWidgets(
        'CheckoutScreen displays "Order Items" in summary card',
        (WidgetTester tester) async {
      when(mockCartProvider.itemCount).thenReturn(3);
      when(mockCartProvider.totalAmount).thenReturn(2500.0);
      when(mockCartProvider.availableItems).thenReturn([]);
      when(mockAuthProvider.currentUser).thenReturn(null);

      await tester.pumpWidget(
        MaterialApp(
          home: MultiProvider(
            providers: [
              ChangeNotifierProvider<CartProvider>.value(
                value: mockCartProvider,
              ),
              ChangeNotifierProvider<AuthProvider>.value(
                value: mockAuthProvider,
              ),
            ],
            child: const CheckoutScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Verify Order Items section displays item count and total
      expect(find.text('Order Items'), findsOneWidget);
      expect(find.text('3 items'), findsOneWidget);
      expect(find.text('₹2500'), findsOneWidget);
    });

    testWidgets(
        'CheckoutScreen form validation still works with notes section',
        (WidgetTester tester) async {
      when(mockCartProvider.itemCount).thenReturn(1);
      when(mockCartProvider.totalAmount).thenReturn(500.0);
      when(mockCartProvider.availableItems).thenReturn([]);
      when(mockAuthProvider.currentUser).thenReturn(null);

      await tester.pumpWidget(
        MaterialApp(
          home: MultiProvider(
            providers: [
              ChangeNotifierProvider<CartProvider>.value(
                value: mockCartProvider,
              ),
              ChangeNotifierProvider<AuthProvider>.value(
                value: mockAuthProvider,
              ),
            ],
            child: const CheckoutScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Try to submit without filling required fields
      final submitButton = find.byType(ElevatedButton);
      await tester.tap(submitButton);
      await tester.pumpAndSettle();

      // Verify validation errors appear (form not submitted)
      expect(find.text('Name is required'), findsOneWidget);
    });
  });
}
