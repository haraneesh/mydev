import '../models/refund.dart';

class RefundCache {
  static final RefundCache _instance = RefundCache._internal();
  final Map<String, CreditNote> _cache = {};
  DateTime? _lastFetchTime;

  RefundCache._internal();

  factory RefundCache() {
    return _instance;
  }

  /// Get cached refunds if they're fresh (less than 5 minutes old)
  List<CreditNote>? getCachedRefunds() {
    if (_cache.isEmpty) return null;
    
    final now = DateTime.now();
    if (_lastFetchTime != null && 
        now.difference(_lastFetchTime!).inMinutes < 5) {
      return _cache.values.toList();
    }
    
    // Cache expired
    _cache.clear();
    _lastFetchTime = null;
    return null;
  }

  /// Cache refunds
  void cacheRefunds(List<CreditNote> refunds) {
    _cache.clear();
    for (final refund in refunds) {
      _cache[refund.id] = refund;
    }
    _lastFetchTime = DateTime.now();
  }

  /// Get single cached refund
  CreditNote? getCachedRefund(String id) {
    return _cache[id];
  }

  /// Clear cache
  void clearCache() {
    _cache.clear();
    _lastFetchTime = null;
  }
}
