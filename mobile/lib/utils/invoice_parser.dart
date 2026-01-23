import 'dart:isolate';
import '../models/invoice.dart';

class InvoiceParser {
  /// Parse invoices in a separate isolate for non-blocking operation
  static Future<List<Invoice>> parseInvoicesInIsolate(
    List<dynamic> rawInvoices,
  ) async {
    try {
      final receivePort = ReceivePort();
      
      await Isolate.spawn(
        _parseInvoicesInBackground,
        receivePort.sendPort,
      );

      final sendPort = await receivePort.first as SendPort;
      final responsePort = ReceivePort();

      sendPort.send([rawInvoices, responsePort.sendPort]);
      final result = await responsePort.first as List<Invoice>;

      return result;
    } catch (e) {
      // Fallback to main thread parsing
      return _parseInvoicesSync(rawInvoices);
    }
  }

  /// Background isolate entry point
  static void _parseInvoicesInBackground(SendPort sendPort) {
    final receivePort = ReceivePort();
    sendPort.send(receivePort.sendPort);

    receivePort.listen((dynamic message) {
      if (message is List && message.length == 2) {
        final rawInvoices = message[0] as List<dynamic>;
        final responsePort = message[1] as SendPort;

        try {
          final parsed = _parseInvoicesSync(rawInvoices);
          responsePort.send(parsed);
        } catch (e) {
          responsePort.send(<Invoice>[]);
        }
      }
    });
  }

  /// Synchronous parsing (optimized)
  static List<Invoice> _parseInvoicesSync(List<dynamic> rawInvoices) {
    return rawInvoices
        .map((inv) {
          try {
            return Invoice.fromJson(inv as Map<String, dynamic>);
          } catch (e) {
            return null;
          }
        })
        .whereType<Invoice>()
        .toList()
        ..sort((a, b) => b.date.compareTo(a.date)); // Sort descending
  }

  /// Parse a single invoice (for detail view)
  static Invoice? parseSingleInvoice(Map<String, dynamic> data) {
    try {
      return Invoice.fromJson(data);
    } catch (e) {
      return null;
    }
  }
}
