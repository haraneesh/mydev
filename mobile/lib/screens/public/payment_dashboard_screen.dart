import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/theme.dart';
import '../../models/invoice.dart';
import '../../models/payment.dart';
import '../../services/order_service.dart';
import '../../services/invoice_cache_manager.dart';
import '../../widgets/invoice_list_item.dart';
import '../../widgets/select_invoices_widget.dart';
import '../../widgets/app_bar_with_logo.dart';
import '../../widgets/background_widget.dart';
import '../../widgets/app_menu_drawer.dart';

/// Screen for viewing unpaid invoices and payment history
class PaymentDashboardScreen extends StatefulWidget {
  const PaymentDashboardScreen({Key? key}) : super(key: key);

  @override
  State<PaymentDashboardScreen> createState() => _PaymentDashboardScreenState();
}

class _PaymentDashboardScreenState extends State<PaymentDashboardScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<Invoice> unpaidInvoices = [];
  List<Payment> paymentHistory = [];
  bool isLoading = false;
  String? errorMessage;
  final _cacheManager = InvoiceCacheManager.instance;
  bool _usingCache = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() {
      isLoading = true;
      errorMessage = null;
      _usingCache = false;
    });

    try {
      // Try to get cached invoices first
      List<Invoice>? unpaid = await _cacheManager.getCachedUnpaidInvoices();
      
      if (unpaid != null) {
        // Use cached data
        setState(() {
          unpaidInvoices = unpaid!;
          isLoading = false;
          _usingCache = true;
        });
        
        // Fetch fresh data in background (don't block UI)
        _refreshDataInBackground();
      } else {
        // No cache, fetch from server
        final rawInvoices = await OrderService.instance.fetchMyInvoices();
        
        // Convert dynamic list to Invoice objects
        final invoices = rawInvoices
            .map((inv) => inv is Invoice ? inv : Invoice.fromJson(inv as Map<String, dynamic>))
            .toList();

        // Filter for unpaid and overdue
        unpaid = invoices
            .where((inv) => inv.isPayable)
            .toList();

        // Cache the results
        await _cacheManager.cacheInvoices(invoices);

        if (!mounted) return;

        setState(() {
          unpaidInvoices = unpaid!;
          isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        errorMessage = 'Failed to load invoices: $e';
        isLoading = false;
      });
    }
  }
  
  /// Refresh data in background without blocking UI
  Future<void> _refreshDataInBackground() async {
    try {
      final rawInvoices = await OrderService.instance.fetchMyInvoices();
      
      // Convert dynamic list to Invoice objects
      final invoices = rawInvoices
          .map((inv) => inv is Invoice ? inv : Invoice.fromJson(inv as Map<String, dynamic>))
          .toList();
      
      // Cache the fresh data
      await _cacheManager.cacheInvoices(invoices);
      
      if (!mounted) return;
      
      // Update UI with fresh data
      final unpaid = invoices.where((inv) => inv.isPayable).toList();
      setState(() {
        unpaidInvoices = unpaid;
        _usingCache = false;
      });
    } catch (e) {
      // Silently fail - cache is still valid
      if (kDebugMode) {
        debugPrint('Background refresh failed: $e');
      }
    }
  }

  double get totalUnpaidAmount {
    return unpaidInvoices.fold(
      0.0,
      (sum, invoice) => sum + invoice.amountDue,
    );
  }

  @override
  Widget build(BuildContext context) {
    return BackgroundWidget(
      child: Scaffold(
        extendBodyBehindAppBar: false,
        appBar: const AppBarWithLogo(),
        drawer: const AppMenuDrawer(),
        body: Column(
          children: [
            // Tab bar
            Container(
              color: Colors.white,
              child: TabBar(
                controller: _tabController,
                indicatorColor: AppColors.primary,
                labelColor: AppColors.primary,
                unselectedLabelColor: AppColors.textSecondary,
                labelStyle: GoogleFonts.nunito(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
                unselectedLabelStyle: GoogleFonts.nunito(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
                tabs: const [
                  Tab(text: 'Pay Invoices'),
                  Tab(text: 'Payment History'),
                ],
              ),
            ),
            // Tab content
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  // Pay Invoices Tab - shows invoice selection
                  _buildPayInvoicesTab(),
                  // Payment History Tab
                  _buildPaymentHistoryTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPayInvoicesTab() {
    if (isLoading) {
      return _buildLoadingState();
    }

    if (errorMessage != null) {
      return _buildErrorState(errorMessage!);
    }

    if (unpaidInvoices.isEmpty) {
      return _buildEmptyState();
    }

    // Embed the invoice selection UI here
    return SelectInvoicesWidget(
      preSelectedInvoices: unpaidInvoices.isNotEmpty ? null : null,
    );
  }

  Widget _buildUnpaidInvoicesTab() {
    if (isLoading) {
      return _buildLoadingState();
    }

    if (errorMessage != null) {
      return _buildErrorState(errorMessage!);
    }

    if (unpaidInvoices.isEmpty) {
      return _buildEmptyState();
    }

    return RefreshIndicator(
      onRefresh: _loadData,
      child: SingleChildScrollView(
      child: Column(
        children: [
          // Summary card
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Card(
              color: Colors.blue[50],
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Total Unpaid',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Colors.grey,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '₹${totalUnpaidAmount.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: Colors.blue,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${unpaidInvoices.length} invoice${unpaidInvoices.length != 1 ? 's' : ''}',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          // Invoices list
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Invoices Due',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 12),
                ...unpaidInvoices.map((invoice) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12.0),
                    child: GestureDetector(
                      onTap: () {
                        // Navigate to payment selection with this invoice
                        Navigator.pushNamed(
                          context,
                          '/payments/select-invoices',
                          arguments: [invoice], // Pre-select this invoice
                        );
                      },
                      child: InvoiceListItem(invoice: invoice),
                    ),
                  );
                }).toList(),
              ],
            ),
          ),
          const SizedBox(height: 24),
          // Action button
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pushNamed(
                    context,
                    '/payments/select-invoices',
                  );
                },
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: Colors.green,
                ),
                child: const Text(
                  'Pay Multiple Invoices',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
      ),
    );
  }

  Widget _buildPaymentHistoryTab() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Card(
          color: Colors.white,
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.history,
                  size: 64,
                  color: Colors.grey[300],
                ),
                const SizedBox(height: 16),
                const Text(
                  'No payment history yet',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Colors.grey,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Your payment transactions will appear here',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[600],
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(),
          const SizedBox(height: 16),
          Text(
            'Loading invoices...',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(String error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.red[300],
            ),
            const SizedBox(height: 16),
            const Text(
              'Error Loading Invoices',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              error,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _loadData,
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.check_circle_outline,
              size: 64,
              color: Colors.green[300],
            ),
            const SizedBox(height: 16),
            const Text(
              'No Unpaid Invoices',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Great! All your invoices are paid.',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 24),
            OutlinedButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Go Back'),
            ),
          ],
        ),
      ),
    );
  }
}
