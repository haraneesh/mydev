import 'dart:async';
import 'package:flutter/foundation.dart';

/// Configuration for retry logic
class RetryConfig {
  final int maxAttempts;
  final Duration initialDelay;
  final Duration maxDelay;
  final double backoffMultiplier;
  final bool exponentialBackoff;

  const RetryConfig({
    this.maxAttempts = 3,
    this.initialDelay = const Duration(seconds: 2),
    this.maxDelay = const Duration(seconds: 30),
    this.backoffMultiplier = 2.0,
    this.exponentialBackoff = true,
  });
}

/// Manager for payment retry logic with exponential backoff
class PaymentRetryManager {
  static final PaymentRetryManager _instance =
      PaymentRetryManager._internal();

  factory PaymentRetryManager() {
    return _instance;
  }

  PaymentRetryManager._internal();

  static PaymentRetryManager get instance => _instance;

  final RetryConfig _defaultConfig = const RetryConfig();

  /// Execute async function with retry logic
  /// 
  /// Returns the result of [operation] if successful
  /// Throws the last error if all retries fail
  Future<T> executeWithRetry<T>(
    Future<T> Function() operation, {
    RetryConfig? config,
    VoidCallback? onRetry,
    void Function(int, Exception)? onRetryError,
  }) async {
    config ??= _defaultConfig;
    
    Exception? lastError;
    Duration delay = config.initialDelay;

    for (int attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        if (kDebugMode) {
          print('🔄 Retry attempt $attempt/${config.maxAttempts}');
        }

        final result = await operation();

        if (kDebugMode) {
          print('✅ Operation successful on attempt $attempt');
        }

        return result;
      } catch (e) {
        lastError = e is Exception ? e : Exception(e.toString());

        if (attempt < config.maxAttempts) {
          if (kDebugMode) {
            print(
              '⚠️ Attempt $attempt failed: $e',
            );
            print('   Retrying in ${delay.inSeconds}s...');
          }

          onRetryError?.call(attempt, lastError);

          // Wait before retrying
          await Future.delayed(delay);

          // Calculate next delay
          if (config.exponentialBackoff) {
            delay = Duration(
              milliseconds: (delay.inMilliseconds *
                      config.backoffMultiplier)
                  .toInt(),
            );
            // Cap at max delay
            if (delay > config.maxDelay) {
              delay = config.maxDelay;
            }
          }

          onRetry?.call();
        } else {
          if (kDebugMode) {
            print('❌ All retry attempts failed');
            print('   Last error: $e');
          }
        }
      }
    }

    throw lastError ?? Exception('Operation failed after ${config.maxAttempts} attempts');
  }

  /// Execute with timeout
  /// 
  /// Throws TimeoutException if operation takes longer than [timeout]
  Future<T> executeWithTimeout<T>(
    Future<T> Function() operation, {
    Duration timeout = const Duration(seconds: 30),
  }) async {
    try {
      return await operation().timeout(
        timeout,
        onTimeout: () {
          throw TimeoutException(
            'Operation timed out after ${timeout.inSeconds}s',
            timeout,
          );
        },
      );
    } catch (e) {
      if (kDebugMode) {
        print('⏱️ Timeout: $e');
      }
      rethrow;
    }
  }

  /// Execute with retry and timeout
  /// 
  /// Combines retry logic with timeout per attempt
  Future<T> executeWithRetryAndTimeout<T>(
    Future<T> Function() operation, {
    RetryConfig? config,
    Duration timeout = const Duration(seconds: 30),
    VoidCallback? onRetry,
    void Function(int, Exception)? onRetryError,
  }) async {
    return executeWithRetry<T>(
      () => executeWithTimeout(operation, timeout: timeout),
      config: config,
      onRetry: onRetry,
      onRetryError: onRetryError,
    );
  }

  /// Get human-readable retry message
  String getRetryMessage(int attempt, int maxAttempts) {
    if (attempt >= maxAttempts) {
      return 'All retry attempts failed';
    }
    return 'Attempt $attempt of $maxAttempts';
  }
}

/// Exponential backoff calculator
class BackoffCalculator {
  /// Calculate delay for given attempt
  static Duration calculateDelay(
    int attempt, {
    Duration initialDelay = const Duration(seconds: 1),
    Duration maxDelay = const Duration(seconds: 30),
    double multiplier = 2.0,
  }) {
    final exponentialDelay = Duration(
      milliseconds: (initialDelay.inMilliseconds *
              (multiplier * (attempt - 1).toDouble()))
          .toInt(),
    );

    // Cap at max delay
    return exponentialDelay > maxDelay ? maxDelay : exponentialDelay;
  }

  /// Get delay with jitter (random variation)
  static Duration calculateDelayWithJitter(
    int attempt, {
    Duration initialDelay = const Duration(seconds: 1),
    Duration maxDelay = const Duration(seconds: 30),
    double multiplier = 2.0,
  }) {
    final baseDelay = calculateDelay(
      attempt,
      initialDelay: initialDelay,
      maxDelay: maxDelay,
      multiplier: multiplier,
    );

    // Add up to 20% jitter
    final jitterMs = (baseDelay.inMilliseconds * 0.2).toInt();
    final random = DateTime.now().millisecondsSinceEpoch % jitterMs;

    return Duration(milliseconds: baseDelay.inMilliseconds + random);
  }
}
