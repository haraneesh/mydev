import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:provider/provider.dart';
import 'package:mydev/models/user.dart';
import 'package:mydev/providers/auth_provider.dart';
import 'package:mydev/widgets/order_footer.dart';

class MockAuthProvider extends Mock implements AuthProvider {
  @override
  User? get currentUser => super.noSuchMethod(
    Invocation.getter(#currentUser),
    returnValue: null,
  );

  @override
  bool get isAuthenticated => super.noSuchMethod(
    Invocation.getter(#isAuthenticated),
    returnValue: false,
  );
}

void main() {
  group('OrderFooter Widget Tests', () {
    late MockAuthProvider mockAuthProvider;

    setUp(() {
      mockAuthProvider = MockAuthProvider();
    });

    testWidgets('OrderFooter shows CHECKOUT button for non-logged-in user',
        (WidgetTester tester) async {
      when(mockAuthProvider.isAuthenticated).thenReturn(false);
      when(mockAuthProvider.currentUser).thenReturn(null);

      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider as AuthProvider,
            child: const Scaffold(
              body: OrderFooter(
                totalAmount: 500.0,
                itemCount: 2,
              ),
            ),
          ),
        ),
      );

      expect(find.text('CHECKOUT'), findsOneWidget);
    });

    testWidgets(
        'OrderFooter shows CHECKOUT button for logged-in user',
        (WidgetTester tester) async {
      final testUser = User(
        id: '123',
        phone: '9876543210',
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        firstName: 'John',
        lastName: 'Doe',
        deliveryAddress: '123 Main St',
        whMobilePhone: '9876543210',
      );

      when(mockAuthProvider.isAuthenticated).thenReturn(true);
      when(mockAuthProvider.currentUser).thenReturn(testUser);

      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider as AuthProvider,
            child: const Scaffold(
              body: OrderFooter(
                totalAmount: 500.0,
                itemCount: 2,
              ),
            ),
          ),
        ),
      );

      expect(find.text('CHECKOUT'), findsOneWidget);
    });

    testWidgets('OrderFooter disables button when no items in cart',
        (WidgetTester tester) async {
      when(mockAuthProvider.isAuthenticated).thenReturn(true);
      when(mockAuthProvider.currentUser).thenReturn(
        User(
          id: '123',
          phone: '9876543210',
          name: 'John Doe',
          email: 'john@example.com',
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        ),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider as AuthProvider,
            child: const Scaffold(
              body: OrderFooter(
                totalAmount: 0.0,
                itemCount: 0,
              ),
            ),
          ),
        ),
      );

      final button = find.byType(ElevatedButton);
      expect(button, findsOneWidget);

      final buttonWidget = tester.widget<ElevatedButton>(button);
      expect(buttonWidget.onPressed, isNull);
    });
  });
}
