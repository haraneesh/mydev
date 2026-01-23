import '../models/invoice.dart';

class InvoiceCache {
  static final InvoiceCache _instance = InvoiceCache._internal();
  final Map<String, Invoice> _cache = {};
  DateTime? _lastFetchTime;

  InvoiceCache._internal();

  factory InvoiceCache() {
    return _instance;
  }

  /// Get cached invoices if they're fresh (less than 5 minutes old)
  List<Invoice>? getCachedInvoices() {
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

  /// Cache invoices
  void cacheInvoices(List<Invoice> invoices) {
    _cache.clear();
    for (final invoice in invoices) {
      _cache[invoice.id] = invoice;
    }
    _lastFetchTime = DateTime.now();
  }

  /// Get single cached invoice
  Invoice? getCachedInvoice(String id) {
    return _cache[id];
  }

  /// Clear cache
  void clearCache() {
    _cache.clear();
    _lastFetchTime = null;
  }
}
