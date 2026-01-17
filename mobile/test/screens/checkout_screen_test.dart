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
  group('CheckoutScreen Tests', () {
    late MockCartProvider mockCartProvider;
    late MockAuthProvider mockAuthProvider;

    setUp(() {
      mockCartProvider = MockCartProvider();
      mockAuthProvider = MockAuthProvider();
    });

    testWidgets(
        'CheckoutScreen populates form fields with user profile data',
        (WidgetTester tester) async {
      final userProfileData = {
        'userId': 'user123',
        'phone': '9876543210',
        'name': 'John Doe',
        'firstName': 'John',
        'lastName': 'Doe',
        'deliveryAddress': '123 Main Street, Chennai',
        'whMobilePhone': '9876543210',
      };

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
            child: CheckoutScreen(
              userProfileData: userProfileData,
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Verify form fields are populated with user data
      expect(find.byType(TextFormField), findsWidgets);
      
      final nameFinder = find.byType(TextFormField).first;
      final nameField = tester.widget<TextFormField>(nameFinder);
      expect(nameField.controller?.text, contains('John'));
    });

    testWidgets(
        'CheckoutScreen shows empty form fields when no profile data provided',
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

      // Verify form fields are empty
      expect(find.byType(TextFormField), findsWidgets);
      final formFields = find.byType(TextFormField);
      
      for (int i = 0; i < tester.widgetList<TextFormField>(formFields).length; i++) {
        final field = tester.widget<TextFormField>(formFields.at(i));
        expect(field.controller?.text, isEmpty);
      }
    });

    testWidgets(
        'CheckoutScreen correctly builds full name from firstName and lastName',
        (WidgetTester tester) async {
      final userProfileData = {
        'userId': 'user123',
        'phone': '9876543210',
        'firstName': 'Jane',
        'lastName': 'Smith',
        'deliveryAddress': '456 Oak Avenue, Bangalore',
      };

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
            child: CheckoutScreen(
              userProfileData: userProfileData,
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Verify the full name is correctly built
      final formFields = find.byType(TextFormField);
      final nameField = tester.widget<TextFormField>(formFields.first);
      expect(nameField.controller?.text, equals('Jane Smith'));
    });
  });
}
