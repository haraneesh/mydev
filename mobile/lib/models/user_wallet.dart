class UserWallet {
  final double unusedRetainerPayments;
  final double unusedCreditsReceivableAmount;
  final double outstandingReceivableAmount;
  final DateTime? lastZohoSync;

  UserWallet({
    required this.unusedRetainerPayments,
    required this.unusedCreditsReceivableAmount,
    required this.outstandingReceivableAmount,
    this.lastZohoSync,
  });

  double get balance => unusedRetainerPayments + unusedCreditsReceivableAmount;
  double get totalDues => outstandingReceivableAmount;

  factory UserWallet.fromJson(Map<String, dynamic> json) {
    // Input values are in Paise from Meteor backend
    return UserWallet(
      unusedRetainerPayments: _parseNum(json['unused_retainer_payments_InPaise']) / 100.0,
      unusedCreditsReceivableAmount: _parseNum(json['unused_credits_receivable_amount_InPaise']) / 100.0,
      outstandingReceivableAmount: _parseNum(json['outstanding_receivable_amount_InPaise']) / 100.0,
      lastZohoSync: _parseDate(json['lastZohoSync']),
    );
  }

  static double _parseNum(dynamic val) {
    if (val == null) return 0.0;
    if (val is num) return val.toDouble();
    if (val is String) return double.tryParse(val) ?? 0.0;
    return 0.0;
  }

  static DateTime? _parseDate(dynamic val) {
    if (val == null) return null;
    if (val is String) return DateTime.tryParse(val);
    if (val is Map && val.containsKey('\$date')) {
      final timestamp = val['\$date'];
      if (timestamp is num) {
        return DateTime.fromMillisecondsSinceEpoch(timestamp.toInt());
      }
    }
    if (val is num) {
      // Possible timestamp as number
      return DateTime.fromMillisecondsSinceEpoch(val.toInt());
    }
    return null;
  }

  Map<String, dynamic> toJson() => {
    'unused_retainer_payments_InPaise': unusedRetainerPayments * 100,
    'unused_credits_receivable_amount_InPaise': unusedCreditsReceivableAmount * 100,
    'outstanding_receivable_amount_InPaise': outstandingReceivableAmount * 100,
    'lastZohoSync': lastZohoSync?.toIso8601String(),
  };

  factory UserWallet.empty() => UserWallet(
    unusedRetainerPayments: 0,
    unusedCreditsReceivableAmount: 0,
    outstandingReceivableAmount: 0,
  );
}
