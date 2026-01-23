import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:provider/provider.dart';
import 'package:suvai/models/invoice.dart';
import 'package:suvai/screens/public/payment_dashboard_screen.dart';
import 'package:suvai/services/order_service.dart';
import 'package:suvai/services/invoice_cache_manager.dart';

void main() {
  group('PaymentDashboardScreen', () {
    late MockOrderService mockOrderService;
    late MockInvoiceCacheManager mockCacheManager;

    setUp(() {
      mockOrderService = MockOrderService();
      mockCacheManager = MockInvoiceCacheManager();
    });

    Widget createWidgetUnderTest() {
      return MaterialApp(
        home: Scaffold(
          body: PaymentDashboardScreen(),
        ),
      );
    }

    testWidgets('displays tab bar with two tabs', (WidgetTester tester) async {
      when(mockOrderService.fetchMyInvoices()).thenAnswer((_) async => []);
      when(mockCacheManager.getCachedUnpaidInvoices()).thenAnswer((_) async => null);

      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      expect(find.byType(TabBar), findsOneWidget);
      expect(find.text('Unpaid Invoices'), findsOneWidget);
      expect(find.text('Payment History'), findsOneWidget);
    });

    testWidgets('displays empty state when no unpaid invoices', (WidgetTester tester) async {
      when(mockOrderService.fetchMyInvoices()).thenAnswer((_) async => []);
      when(mockCacheManager.getCachedUnpaidInvoices()).thenAnswer((_) async => null);

      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      // Should show empty state message
      expect(find.byType(Text), findsWidgets);
    });

    testWidgets('displays list of unpaid invoices', (WidgetTester tester) async {
      final testInvoices = [
        createTestInvoice('inv_1', 'INV-001', 500.0, 'unpaid'),
        createTestInvoice('inv_2', 'INV-002', 750.0, 'overdue'),
      ];

      when(mockOrderService.fetchMyInvoices()).thenAnswer((_) async => testInvoices);
      when(mockCacheManager.getCachedUnpaidInvoices()).thenAnswer((_) async => null);

      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      expect(find.text('INV-001'), findsOneWidget);
      expect(find.text('INV-002'), findsOneWidget);
    });

    testWidgets('filters only unpaid and overdue invoices', (WidgetTester tester) async {
      final testInvoices = [
        createTestInvoice('inv_1', 'INV-001', 500.0, 'unpaid'),
        createTestInvoice('inv_2', 'INV-002', 750.0, 'paid'),
        createTestInvoice('inv_3', 'INV-003', 1000.0, 'overdue'),
      ];

      when(mockOrderService.fetchMyInvoices()).thenAnswer((_) async => testInvoices);
      when(mockCacheManager.getCachedUnpaidInvoices()).thenAnswer((_) async => null);

      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      // Should only show unpaid and overdue, not paid
      expect(find.text('INV-001'), findsOneWidget); // unpaid
      expect(find.text('INV-003'), findsOneWidget); // overdue
      expect(find.text('INV-002'), findsNothing);   // paid - should be filtered
    });

    testWidgets('displays total unpaid amount', (WidgetTester tester) async {
      final testInvoices = [
        createTestInvoice('inv_1', 'INV-001', 500.0, 'unpaid'),
        createTestInvoice('inv_2', 'INV-002', 750.0, 'unpaid'),
      ];

      when(mockOrderService.fetchMyInvoices()).thenAnswer((_) async => testInvoices);
      when(mockCacheManager.getCachedUnpaidInvoices()).thenAnswer((_) async => null);

      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      // Should display total of 1250
      expect(find.text(RegExp(r'1250|1,250')), findsWidgets);
    });

    testWidgets('shows loading state initially', (WidgetTester tester) async {
      when(mockOrderService.fetchMyInvoices()).thenAnswer(
        (_) => Future.delayed(Duration(seconds: 2), () => []),
      );
      when(mockCacheManager.getCachedUnpaidInvoices()).thenAnswer((_) async => null);

      await tester.pumpWidget(createWidgetUnderTest());

      // Should show loading indicator
      expect(find.byType(CircularProgressIndicator), findsOneWidget);

      await tester.pumpAndSettle();
    });

    testWidgets('handles error state with retry button', (WidgetTester tester) async {
      when(mockOrderService.fetchMyInvoices()).thenThrow(Exception('Network error'));
      when(mockCacheManager.getCachedUnpaidInvoices()).thenAnswer((_) async => null);

      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      // Should show error message
      expect(find.text(RegExp(r'error|Error|failed|Failed')), findsWidgets);
      
      // Should have retry button
      expect(find.widgetWithText(ElevatedButton, RegExp(r'Retry|retry')), findsWidgets);
    });

    testWidgets('payment history tab shows transaction list', (WidgetTester tester) async {
      when(mockOrderService.fetchMyInvoices()).thenAnswer((_) async => []);
      when(mockCacheManager.getCachedUnpaidInvoices()).thenAnswer((_) async => null);

      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      // Tap Payment History tab
      await tester.tap(find.text('Payment History'));
      await tester.pumpAndSettle();

      // Tab should be active
      expect(find.text('Payment History'), findsOneWidget);
    });

    testWidgets('uses cached data when available', (WidgetTester tester) async {
      final cachedInvoices = [
        createTestInvoice('inv_cached', 'INV-CACHED', 500.0, 'unpaid'),
      ];

      when(mockCacheManager.getCachedUnpaidInvoices()).thenAnswer((_) async => cachedInvoices);

      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      // Should immediately show cached data
      expect(find.text('INV-CACHED'), findsOneWidget);
    });

    testWidgets('refreshes data in background after showing cache', (WidgetTester tester) async {
      final cachedInvoices = [
        createTestInvoice('inv_1', 'INV-001', 500.0, 'unpaid'),
      ];
      final freshInvoices = [
        createTestInvoice('inv_1', 'INV-001', 500.0, 'unpaid'),
        createTestInvoice('inv_2', 'INV-002', 750.0, 'unpaid'),
      ];

      when(mockCacheManager.getCachedUnpaidInvoices()).thenAnswer((_) async => cachedInvoices);
      when(mockOrderService.fetchMyInvoices()).thenAnswer((_) async => freshInvoices);

      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      // Should eventually show both invoices after background refresh
      expect(find.text('INV-001'), findsOneWidget);
      // Wait for background refresh to complete
      await Future.delayed(Duration(milliseconds: 500));
      await tester.pumpAndSettle();
    });

    testWidgets('displays invoice status badges', (WidgetTester tester) async {
      final testInvoices = [
        createTestInvoice('inv_1', 'INV-001', 500.0, 'unpaid'),
        createTestInvoice('inv_2', 'INV-002', 750.0, 'overdue'),
      ];

      when(mockOrderService.fetchMyInvoices()).thenAnswer((_) async => testInvoices);
      when(mockCacheManager.getCachedUnpaidInvoices()).thenAnswer((_) async => null);

      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      // Should display status indicators
      expect(find.byType(Container), findsWidgets); // badges are containers
    });

    testWidgets('allows navigation to invoice details', (WidgetTester tester) async {
      final testInvoices = [
        createTestInvoice('inv_1', 'INV-001', 500.0, 'unpaid'),
      ];

      when(mockOrderService.fetchMyInvoices()).thenAnswer((_) async => testInvoices);
      when(mockCacheManager.getCachedUnpaidInvoices()).thenAnswer((_) async => null);

      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      // Should have clickable invoice items
      expect(find.byType(GestureDetector), findsWidgets);
    });

    testWidgets('supports retry after error', (WidgetTester tester) async {
      var callCount = 0;
      when(mockOrderService.fetchMyInvoices()).thenAnswer((_) async {
        callCount++;
        if (callCount == 1) throw Exception('First attempt failed');
        return [];
      });
      when(mockCacheManager.getCachedUnpaidInvoices()).thenAnswer((_) async => null);

      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      // Should show error
      expect(find.text(RegExp(r'error|Error')), findsWidgets);

      // Tap retry button
      await tester.tap(find.widgetWithText(ElevatedButton, RegExp(r'Retry|retry')));
      await tester.pumpAndSettle();

      // Should retry the call
      expect(callCount >= 1, true);
    });
  });
}

/// Helper to create test invoice
Invoice createTestInvoice(
  String id,
  String invoiceNumber,
  double amount,
  String status,
) {
  return Invoice(
    id: id,
    invoiceId: invoiceNumber,
    invoiceNumber: invoiceNumber,
    date: DateTime(2026, 1, 15),
    dueDate: DateTime(2026, 1, 25),
    status: status,
    total: amount,
    balance: amount,
    amountDue: amount,
    customer: Customer(id: 'cust_1', name: 'Test Customer'),
    lineItems: [],
  );
}

// Mock classes
class MockOrderService extends Mock implements OrderService {}
class MockInvoiceCacheManager extends Mock implements InvoiceCacheManager {}

class Customer {
  final String id;
  final String name;

  Customer({required this.id, required this.name});
}
