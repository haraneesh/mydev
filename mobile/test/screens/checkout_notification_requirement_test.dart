import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:provider/provider.dart';
import 'package:suvai/screens/public/checkout_screen.dart';
import 'package:suvai/providers/cart_provider.dart';
import 'package:suvai/providers/auth_provider.dart';
import 'package:suvai/services/onesignal_service.dart';
import 'package:suvai/models/product.dart';
import 'package:suvai/services/order_service.dart';

import 'checkout_notification_requirement_test.mocks.dart';

@GenerateMocks([CartProvider, AuthProvider, OrderService])
void main() {
  group('CheckoutScreen Notification Requirement Tests', () {
    late MockCartProvider mockCartProvider;
    late MockAuthProvider mockAuthProvider;
    late MockOrderService mockOrderService;

    setUp(() {
      mockCartProvider = MockCartProvider();
      mockAuthProvider = MockAuthProvider();
      mockOrderService = MockOrderService();

      when(mockCartProvider.itemCount).thenReturn(1);
      when(mockCartProvider.totalAmount).thenReturn(100.0);
      when(mockCartProvider.availableItems).thenReturn([]);
      when(mockCartProvider.orderService).thenReturn(mockOrderService);
      when(mockAuthProvider.currentUser).thenReturn(null);
    });

    Widget createWidget({required OneSignalService oneSignalService}) {
      return MaterialApp(
        home: MultiProvider(
          providers: [
            ChangeNotifierProvider<CartProvider>.value(value: mockCartProvider),
            ChangeNotifierProvider<AuthProvider>.value(value: mockAuthProvider),
            Provider<OneSignalService>.value(value: oneSignalService),
          ],
          child: const CheckoutScreen(),
        ),
      );
    }

    testWidgets('Direct Order Placement when permission is granted', (WidgetTester tester) async {
      // GIVEN permission is already granted
      final oneSignalService = OneSignalService.createNull(hasPermission: true);
      
      await tester.pumpWidget(createWidget(oneSignalService: oneSignalService));
      await tester.pumpAndSettle();

      // WHEN "PLACE ORDER" is tapped
      final placeOrderButton = find.text('PLACE ORDER');
      await tester.ensureVisible(placeOrderButton);
      await tester.tap(placeOrderButton);
      await tester.pump();

      // THEN no requirement dialog is shown
      expect(find.text('Stay Updated!'), findsNothing);
    });

    testWidgets('Requirement Dialog shown when permission is missing', (WidgetTester tester) async {
      // GIVEN permission is missing
      final oneSignalService = OneSignalService.createNull(hasPermission: false);
      
      await tester.pumpWidget(createWidget(oneSignalService: oneSignalService));
      await tester.pumpAndSettle();

      // WHEN "PLACE ORDER" is tapped
      final placeOrderButton = find.text('PLACE ORDER');
      await tester.ensureVisible(placeOrderButton);
      await tester.tap(placeOrderButton);
      await tester.pump();

      // THEN the requirement dialog is shown
      expect(find.text('Stay Updated!'), findsOneWidget);
    });

    testWidgets('Order placement proceeds after granting permission from dialog', (WidgetTester tester) async {
      // GIVEN permission is missing, but will be granted on request
      final oneSignalService = OneSignalService.createNull(
        hasPermission: false,
        requestResult: true,
      );
      
      await tester.pumpWidget(createWidget(oneSignalService: oneSignalService));
      await tester.pumpAndSettle();

      // WHEN "PLACE ORDER" is tapped
      final placeOrderButton = find.text('PLACE ORDER');
      await tester.ensureVisible(placeOrderButton);
      await tester.tap(placeOrderButton);
      await tester.pump();

      // AND user taps "SUBSCRIBE"
      await tester.tap(find.text('SUBSCRIBE'));
      await tester.pump();

      // THEN dialog is closed
      expect(find.text('Stay Updated!'), findsNothing);
      
      // AND we should see validation logic (guest mode)
      expect(find.text('Phone Number'), findsOneWidget);
    });

    testWidgets('Halt Order if permission is denied from dialog', (WidgetTester tester) async {
      // GIVEN permission is missing, and will be denied on request
      final oneSignalService = OneSignalService.createNull(
        hasPermission: false,
        requestResult: false,
      );
      
      await tester.pumpWidget(createWidget(oneSignalService: oneSignalService));
      await tester.pumpAndSettle();

      // WHEN "PLACE ORDER" is tapped
      final placeOrderButton = find.text('PLACE ORDER');
      await tester.ensureVisible(placeOrderButton);
      await tester.tap(placeOrderButton);
      await tester.pump();

      // AND user taps "NOT NOW"
      await tester.tap(find.text('NOT NOW'));
      await tester.pump();

      // THEN dialog is closed
      expect(find.text('Stay Updated!'), findsNothing);
      
      // AND order placement did NOT proceed to validation/checkout
      // (Wait bit to ensure nothing unexpected happens)
      await tester.pump(const Duration(milliseconds: 100));
      // Still on the summary screen
      expect(find.text('Order Summary'), findsOneWidget);
    });
  });
}
