import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../models/invoice.dart';

/// Manages invoice caching and retrieval
class InvoiceCacheManager {
  static final InvoiceCacheManager _instance =
      InvoiceCacheManager._internal();

  factory InvoiceCacheManager() {
    return _instance;
  }

  InvoiceCacheManager._internal();

  static InvoiceCacheManager get instance => _instance;

  static const String _invoicesCacheKey = 'invoices_cache';
  static const String _cacheTimestampKey = 'invoices_cache_timestamp';
  static const Duration _defaultCacheDuration = Duration(hours: 1);

  late SharedPreferences _prefs;
  bool _initialized = false;
  List<Invoice>? _memoryCache;
  DateTime? _memoryCacheTime;

  /// Initialize the cache manager
  Future<void> initialize() async {
    if (_initialized) return;
    
    try {
      _prefs = await SharedPreferences.getInstance();
      _initialized = true;
      
      if (kDebugMode) {
        print('✅ InvoiceCacheManager initialized');
      }
    } catch (e) {
      if (kDebugMode) {
        print('❌ Failed to initialize InvoiceCacheManager: $e');
      }
    }
  }

  /// Cache invoices
  Future<void> cacheInvoices(List<Invoice> invoices) async {
    if (!_initialized) return;
    
    try {
      // Update memory cache
      _memoryCache = invoices;
      _memoryCacheTime = DateTime.now();
      
      // Persist to disk
      final invoiceJson = jsonEncode(
        invoices.map((inv) => {
          'id': inv.id,
          'invoiceId': inv.invoiceId,
          'invoiceNumber': inv.invoiceNumber,
          'date': inv.date.toIso8601String(),
          'status': inv.status,
          'total': inv.total,
          'balance': inv.balance,
          'dueDate': inv.dueDate?.toIso8601String(),
        }).toList(),
      );
      
      await Future.wait([
        _prefs.setString(_invoicesCacheKey, invoiceJson),
        _prefs.setString(
          _cacheTimestampKey,
          DateTime.now().toIso8601String(),
        ),
      ]);
      
      if (kDebugMode) {
        print('✅ Cached ${invoices.length} invoices');
      }
    } catch (e) {
      if (kDebugMode) {
        print('❌ Failed to cache invoices: $e');
      }
    }
  }

  /// Get cached invoices (from memory first, then disk)
  Future<List<Invoice>?> getCachedInvoices({
    Duration? cacheDuration,
  }) async {
    cacheDuration ??= _defaultCacheDuration;
    
    // Check memory cache first
    if (_memoryCache != null && _memoryCacheTime != null) {
      final age = DateTime.now().difference(_memoryCacheTime!);
      if (age < cacheDuration) {
        if (kDebugMode) {
          print('✅ Retrieved ${_memoryCache!.length} invoices from memory cache');
        }
        return _memoryCache;
      } else {
        // Memory cache is stale
        _memoryCache = null;
        _memoryCacheTime = null;
      }
    }
    
    if (!_initialized) return null;
    
    try {
      // Check disk cache
      final cacheTimestampStr = _prefs.getString(_cacheTimestampKey);
      if (cacheTimestampStr == null) return null;
      
      final cacheTime = DateTime.parse(cacheTimestampStr);
      final age = DateTime.now().difference(cacheTime);
      
      // Check if cache is still valid
      if (age > cacheDuration) {
        if (kDebugMode) {
          print('⚠️ Invoice cache is stale (${age.inMinutes} minutes old)');
        }
        return null;
      }
      
      final invoiceJson = _prefs.getString(_invoicesCacheKey);
      if (invoiceJson == null) return null;
      
      final invoiceList = jsonDecode(invoiceJson) as List;
      final invoices = invoiceList.map((item) {
        final map = item as Map<String, dynamic>;
        return Invoice(
          id: map['id'] ?? '',
          invoiceId: map['invoiceId'] ?? '',
          invoiceNumber: map['invoiceNumber'] ?? '',
          date: DateTime.parse(map['date'] ?? DateTime.now().toIso8601String()),
          status: map['status'] ?? 'unknown',
          total: (map['total'] as num?)?.toDouble() ?? 0.0,
          balance: (map['balance'] as num?)?.toDouble() ?? 0.0,
          dueDate: map['dueDate'] != null ? DateTime.parse(map['dueDate']) : null,
          customer: Customer(),
          lineItems: [],
        );
      }).toList();
      
      // Restore to memory cache
      _memoryCache = invoices;
      _memoryCacheTime = DateTime.now();
      
      if (kDebugMode) {
        print('✅ Retrieved ${invoices.length} invoices from disk cache');
      }
      
      return invoices;
    } catch (e) {
      if (kDebugMode) {
        print('❌ Failed to retrieve cached invoices: $e');
      }
      return null;
    }
  }

  /// Filter unpaid invoices from cache
  Future<List<Invoice>?> getCachedUnpaidInvoices() async {
    final invoices = await getCachedInvoices();
    if (invoices == null) return null;
    
    return invoices.where((inv) => inv.isPayable).toList();
  }

  /// Check if cache is still valid
  Future<bool> isCacheValid({
    Duration? cacheDuration,
  }) async {
    cacheDuration ??= _defaultCacheDuration;
    
    if (!_initialized) return false;
    
    try {
      final cacheTimestampStr = _prefs.getString(_cacheTimestampKey);
      if (cacheTimestampStr == null) return false;
      
      final cacheTime = DateTime.parse(cacheTimestampStr);
      final age = DateTime.now().difference(cacheTime);
      
      return age < cacheDuration;
    } catch (e) {
      if (kDebugMode) {
        print('❌ Failed to check cache validity: $e');
      }
      return false;
    }
  }

  /// Get cache age in minutes
  Future<int?> getCacheAgeMinutes() async {
    if (!_initialized) return null;
    
    try {
      final cacheTimestampStr = _prefs.getString(_cacheTimestampKey);
      if (cacheTimestampStr == null) return null;
      
      final cacheTime = DateTime.parse(cacheTimestampStr);
      final age = DateTime.now().difference(cacheTime);
      
      return age.inMinutes;
    } catch (e) {
      if (kDebugMode) {
        print('❌ Failed to get cache age: $e');
      }
      return null;
    }
  }

  /// Clear cache
  Future<void> clearCache({bool clearMemory = true}) async {
    if (clearMemory) {
      _memoryCache = null;
      _memoryCacheTime = null;
    }
    
    if (!_initialized) return;
    
    try {
      await Future.wait([
        _prefs.remove(_invoicesCacheKey),
        _prefs.remove(_cacheTimestampKey),
      ]);
      
      if (kDebugMode) {
        print('✅ Cleared invoice cache');
      }
    } catch (e) {
      if (kDebugMode) {
        print('❌ Failed to clear cache: $e');
      }
    }
  }

  /// Refresh cache by clearing memory but keeping disk
  void refreshMemoryCache() {
    _memoryCache = null;
    _memoryCacheTime = null;
    
    if (kDebugMode) {
      print('🔄 Refreshed memory cache');
    }
  }

  /// Get cache statistics for debugging
  Future<Map<String, dynamic>> getCacheStats() async {
    if (!_initialized) {
      return {'error': 'Not initialized'};
    }
    
    try {
      final invoices = await getCachedInvoices();
      final age = await getCacheAgeMinutes();
      final isValid = await isCacheValid();
      
      return {
        'invoiceCount': invoices?.length ?? 0,
        'cacheAgeMinutes': age,
        'isValid': isValid,
        'hasMemoryCache': _memoryCache != null,
        'memoryCacheSize': _memoryCache?.length ?? 0,
        'timestamp': DateTime.now().toIso8601String(),
      };
    } catch (e) {
      return {'error': e.toString()};
    }
  }
}
