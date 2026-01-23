import 'dart:math';

class UnitFormatter {
  /// Extract number from the beginning of a string with optional base parameter
  static int extractNumber(String x, [int base = 10]) {
    final match = RegExp(r'^(\d+)').firstMatch(x);
    if (match != null) {
      try {
        return int.parse(match.group(1)!, radix: base);
      } catch (e) {
        return 0;
      }
    }
    return 0;
  }

  /// Extract only alphabetic characters from a string
  static String extractString(String x) {
    return x.replaceAll(RegExp(r'[^a-zA-Z]'), '');
  }

  /// Pad whitespace to a string
  static String padWhiteSpace(String pad, String? str, [bool padLeft = false]) {
    if (str == null) {
      return pad;
    }
    if (padLeft) {
      return (pad + str).substring(max(0, (pad + str).length - pad.length));
    }
    return (str + pad).substring(0, pad.length);
  }

  /// Format number to remove decimals if it's a whole number
  static String _formatNumber(double value) {
    if (value == value.toInt()) {
      return value.toInt().toString();
    }
    return value.toStringAsFixed(2);
  }

  /// Display unit of sale with quantity and unit conversion
  static String displayUnitOfSale(dynamic numOfUnits, String unit) {
    // Handle string "0"
    if (numOfUnits.toString() == '0') {
      return '';
    }

    final num = numOfUnits is String ? double.tryParse(numOfUnits) ?? 0 : numOfUnits.toDouble();
    final parsedUnitNumber = extractNumber(unit).toDouble();
    final value = num * parsedUnitNumber;
    final lowerCaseUnitValue = extractString(unit).toLowerCase();
    String retValue = '${_formatNumber(value)} ${lowerCaseUnitValue.toLowerCase()}';

    switch (lowerCaseUnitValue) {
      case 'kg':
        if (value < 1) {
          retValue = '${(value * 1000).toInt()} g';
        } else {
          retValue = '${_formatNumber(value)} kg';
        }
        break;
      case 'kl':
        if (value < 1) {
          retValue = '${(value * 1000).toInt()} l';
        } else {
          retValue = '${_formatNumber(value)} kl';
        }
        break;
      case 'g':
      case 'gram':
      case 'grams':
        if (value >= 1000) {
          retValue = '${_formatNumber(value / 1000)} kg';
        } else if (value < 0) {
          retValue = '${(value * 1000).toInt()} mg';
        } else {
          retValue = '${value.toInt()} g';
        }
        break;
      case 'l':
      case 'litre':
      case 'litres':
      case 'liter':
      case 'liters':
        if (value >= 1000) {
          retValue = '${_formatNumber(value / 1000)} kl';
        } else if (value < 0) {
          retValue = '${(value * 1000).toInt()} ml';
        } else {
          retValue = '${value.toInt()} l';
        }
        break;
      case 'ml':
        if (value >= 1000) {
          retValue = '${(value / 1000).toInt()} l';
        } else {
          retValue = '${value.toInt()} ml';
        }
        break;
      case 'mg':
        if (value >= 1000) {
          retValue = '${(value / 1000).toInt()} g';
        } else {
          retValue = '${value.toInt()} mg';
        }
        break;
      default:
        retValue = '${_formatNumber(value)} $lowerCaseUnitValue';
    }

    return retValue;
  }
}
