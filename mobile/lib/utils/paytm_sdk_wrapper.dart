import 'package:paytmpayments_allinonesdk/paytmpayments_allinonesdk.dart';

/// Wrapper for Paytm AllInOne SDK
class PaytmSdkWrapper {
  static final _sdk = PaytmPaymentsAllinonesdk();

  /// Start a Paytm transaction
  static Future<Map<dynamic, dynamic>> startTransaction({
    required String mid,
    required String orderId,
    required String amount,
    required String txnToken,
    required bool isStaging,
    required bool restrictAppInvoke,
    String callbackUrl = '',
  }) async {
    try {
      final response = await _sdk.startTransaction(
        mid,
        orderId,
        amount,
        txnToken,
        callbackUrl,
        isStaging,
        restrictAppInvoke,
      );
      
      return response ?? {};
    } catch (e) {
      throw Exception('Paytm SDK Error: $e');
    }
  }
}
