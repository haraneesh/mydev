import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/refund.dart';
import '../../config/theme.dart';
import '../../utils/formatters.dart';
import '../../utils/refund_cache.dart';
import '../../widgets/refund_list_item_widget.dart';
import '../../widgets/background_widget.dart';
import '../../widgets/app_menu_drawer.dart';
import '../../widgets/app_bar_with_logo.dart';
import '../../providers/cart_provider.dart';

class RefundListScreen extends StatefulWidget {
  const RefundListScreen({super.key});

  @override
  State<RefundListScreen> createState() => _RefundListScreenState();
}

class _RefundListScreenState extends State<RefundListScreen> {
  List<CreditNote> _refundsList = [];
  bool _isLoading = false;
  String? _errorMessage;
  bool _refundsTabLoaded = false;
  final RefundCache _cache = RefundCache();
  late Future<void> _refundsFuture;
  CreditNote? _expandedRefund;
  dynamic _expandedRefundDetails;
  bool _expandingRefundDetail = false;

  @override
  void initState() {
    super.initState();
    _loadRefunds();
  }

  Future<void> _loadRefunds() async {
    if (_isLoading) return;

    setState(() {
      _isLoading = true;
      _refundsTabLoaded = true;
      _errorMessage = null;
    });

    try {
      // Check cache first
      final cachedRefunds = _cache.getCachedRefunds();
      if (cachedRefunds != null && cachedRefunds.isNotEmpty) {
        if (mounted) {
          setState(() {
            _refundsList = cachedRefunds;
            _isLoading = false;
          });
        }
        return;
      }

      final cartProvider = context.read<CartProvider>();
      final rawRefunds = await cartProvider.orderService.fetchCreditNotes();
      
      if (mounted) {
        // Parse refunds without line items for list view (much faster)
        final refunds = rawRefunds
            .map((refund) {
              try {
                return CreditNote.fromJson(
                  refund as Map<String, dynamic>,
                  parseLineItems: false, // Skip line items for list view
                );
              } catch (e) {
                debugPrint('[RefundListScreen] Error parsing refund: $e');
                return null;
              }
            })
            .whereType<CreditNote>()
            .toList();

        // Sort by date (descending - newest first)
        refunds.sort((a, b) => b.date.compareTo(a.date));

        // Cache the parsed refunds
        _cache.cacheRefunds(refunds);

        setState(() {
          _refundsList = refunds;
        });
      }
    } catch (e) {
      debugPrint('[RefundListScreen] Error loading refunds: $e');
      if (mounted) {
        setState(() => _errorMessage = 'Error loading refunds: $e');
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _loadRefundDetails(CreditNote refund) async {
    setState(() => _expandingRefundDetail = true);

    try {
      final cartProvider = context.read<CartProvider>();
      final details = await cartProvider.orderService.fetchCreditNote(refund.creditNoteId);
      
      if (mounted) {
        // Parse the full details with line items
        if (details != null) {
          final fullRefund = CreditNote.fromJson(
            details as Map<String, dynamic>,
            parseLineItems: true,
          );
          setState(() {
            _expandedRefund = fullRefund;
            _expandedRefundDetails = details;
          });
        }
      }
    } catch (e) {
      debugPrint('[RefundListScreen] Error loading refund details: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading refund details: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _expandingRefundDetail = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return BackgroundWidget(
      child: Scaffold(
        extendBodyBehindAppBar: false,
        appBar: AppBarWithLogo(
          actions: [
            IconButton(
              icon: const Icon(Icons.refresh, color: AppColors.primary),
              onPressed: _loadRefunds,
              tooltip: 'Refresh refunds',
            ),
          ],
        ),
        drawer: const AppMenuDrawer(),
        body: _buildBody(),
      ),
    );
  }

  Widget _buildBody() {
    if (_errorMessage != null) {
      return _buildErrorState();
    }

    if (_isLoading) {
      return _buildLoadingState();
    }

    if (_refundsList.isEmpty) {
      return _buildEmptyState();
    }

    return _buildRefundsList();
  }

  Widget _buildLoadingState() {
    return ListView.builder(
      itemCount: 5,
      itemBuilder: (context, index) => _buildSkeletonItem(),
    );
  }

  Widget _buildSkeletonItem() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Card(
        color: Colors.white,
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Shimmer.fromColors(
                baseColor: Colors.grey[300]!,
                highlightColor: Colors.grey[100]!,
                child: Container(
                  height: 12,
                  width: 80,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Shimmer.fromColors(
                baseColor: Colors.grey[300]!,
                highlightColor: Colors.grey[100]!,
                child: Container(
                  height: 12,
                  width: 150,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Shimmer.fromColors(
                baseColor: Colors.grey[300]!,
                highlightColor: Colors.grey[100]!,
                child: Container(
                  height: 12,
                  width: 120,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.error_outline,
            size: 64,
            color: Colors.red,
          ),
          const SizedBox(height: 16),
          Text(
            'Error Loading Refunds',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              _errorMessage ?? 'An unknown error occurred',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: _loadRefunds,
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.receipt,
            size: 64,
            color: AppColors.primary,
          ),
          const SizedBox(height: 16),
          Text(
            'No Refunds Found',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          Text(
            'You don\'t have any refunds yet',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.btnBg,
              foregroundColor: Colors.white,
            ),
            onPressed: _loadRefunds,
            child: const Text('Refresh'),
          ),
        ],
      ),
    );
  }

  Widget _buildRefundsList() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(vertical: 8),
      itemCount: _refundsList.length + 1,
      itemBuilder: (context, index) {
        if (index == 0) {
          return Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
            child: Text(
              'Refunds',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
          );
        }
         final refund = _refundsList[index - 1];
         final isExpanded = _expandedRefund?.id == refund.id;
        
        return Column(
          children: [
            RefundListItemWidget(
              refund: refund,
              isExpanded: isExpanded,
              onTap: () {
                if (isExpanded) {
                  // Collapse
                  setState(() => _expandedRefund = null);
                } else {
                  // Expand and load details
                  setState(() => _expandedRefund = refund);
                  _loadRefundDetails(refund);
                }
              },
            ),
            // Expanded details
            if (isExpanded)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  color: Colors.white,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: _expandingRefundDetail
                        ? const Center(
                            child: CircularProgressIndicator(
                              valueColor: AlwaysStoppedAnimation<Color>(
                                AppColors.secondary,
                              ),
                            ),
                          )
                        : _buildRefundDetails(_expandedRefund!),
                  ),
                ),
              ),
          ],
        );
      },
    );
  }

  Widget _buildRefundDetails(CreditNote refund) {
    if (refund.lineItems.isEmpty) {
      return const Padding(
        padding: EdgeInsets.all(16),
        child: Text('No items in this refund'),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header row
        Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Row(
            children: [
              Expanded(
                flex: 3,
                child: Text(
                  'Item',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                ),
              ),
              Expanded(
                flex: 2,
                child: Text(
                  'Refund Amount',
                  textAlign: TextAlign.right,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                ),
              ),
            ],
          ),
        ),
        // Items
        ...refund.lineItems.map((item) => Padding(
          padding: const EdgeInsets.symmetric(vertical: 12),
          child: Row(
            children: [
              Expanded(
                flex: 3,
                child: Text(
                  item.name,
                  style: Theme.of(context).textTheme.bodySmall,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Expanded(
                flex: 2,
                child: Text(
                  item.getFormattedItemTotal(),
                  textAlign: TextAlign.right,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: AppColors.primary,
                      ),
                ),
              ),
            ],
          ),
        )),
      ],
    );
  }
}

// Shimmer effect widget
class Shimmer extends StatefulWidget {
  final Widget child;
  final Color baseColor;
  final Color highlightColor;

  const Shimmer.fromColors({
    required this.child,
    required this.baseColor,
    required this.highlightColor,
    super.key,
  });

  @override
  State<Shimmer> createState() => _ShimmerState();
}

class _ShimmerState extends State<Shimmer> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ShaderMask(
      shaderCallback: (bounds) {
        return LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.centerRight,
          stops: const [0.0, 0.5, 1.0],
          colors: [
            widget.baseColor,
            widget.highlightColor,
            widget.baseColor,
          ],
          tileMode: TileMode.clamp,
          transform: _SlidingGradientTransform(
            slidePercent: _controller.value,
          ),
        ).createShader(bounds);
      },
      child: widget.child,
    );
  }
}

class _SlidingGradientTransform extends GradientTransform {
  final double slidePercent;

  _SlidingGradientTransform({required this.slidePercent});

  @override
  Matrix4? transform(Rect bounds, {TextDirection? textDirection}) {
    return Matrix4.translationValues(bounds.width * slidePercent, 0.0, 0.0);
  }
}
