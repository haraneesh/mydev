# Changelog

All notable changes to the Namma Suvai Mobile App will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2026-01-19

### ✨ Added

#### Payments Feature (New)
- **Payments Menu**: New top-level "Payments" menu item in navigation drawer
- **Payment Dashboard**: View unpaid invoices and payment history
  - Two tabs: "Unpaid Invoices" and "Payment History"
  - Display total unpaid amount
  - Filter unpaid/overdue invoices
  - Cache invoices for faster loading
  - Background refresh for latest data

- **Multi-Invoice Selection**: Select multiple invoices for batch payment
  - Checkbox-based invoice selection
  - Real-time total calculation
  - Gateway fee transparency (3% default)
  - Select All / Deselect All functionality
  - Pre-selection support for single invoice payment

- **Paytm Payment Gateway Integration**
  - Secure payment processing via Paytm SDK
  - Support for multiple payment methods:
    - Credit/Debit Cards
    - Net Banking
    - UPI
    - Digital Wallets
  - Real-time payment status tracking
  - Transaction verification
  - Error handling with retry logic

- **Payment Services** (Backend Integration)
  - PaymentService: Core payment operations
  - PaytmConfigService: Dynamic configuration from Meteor
  - PaytmPaymentController: High-level SDK integration
  - PaymentSessionManager: Session state tracking
  - PaymentErrorHandler: Comprehensive error handling
  - PaymentRetryManager: Retry logic with exponential backoff
  - InvoiceCacheManager: Performance caching

- **Data Models**
  - Payment model with PaymentStatus enum
  - PaymentSelection helper for multi-invoice operations
  - Enhanced Invoice model with payment properties

- **UI Components**
  - Payment Dashboard Screen
  - Invoice Selection Screen  
  - Payment Status Screen
  - Invoice list items with payment actions
  - Payment summary cards
  - Error display widgets
  - Loading state indicators

- **Documentation**
  - PAYMENTS.md: User guide with FAQ and troubleshooting
  - FEATURES.md: Complete feature overview
  - Meteor settings documentation
  - Implementation details and architecture

#### Testing (Phase 10)
- Comprehensive unit tests for models
  - payment_test.dart (20+ test cases)
  - payment_selection_test.dart (25+ test cases)
- Comprehensive unit tests for services
  - payment_service_test.dart (22+ test cases)
  - paytm_config_service_test.dart (24+ test cases)
- Widget tests for screens
  - payment_dashboard_screen_test.dart (14+ test cases)
- Mock services for testing
  - MockPaymentService
- Test utilities and helpers

### 🔄 Changed

#### Invoice Management
- **Enhanced Invoice Display**: Invoices now show payment action buttons for unpaid invoices
- **Invoice Status**: Added visual indicators for payment status
  - Green: Paid
  - Orange: Unpaid
  - Red: Overdue
  - Yellow: Partially Paid

#### Navigation
- Added "Payments" menu item after "Invoices" in navigation drawer
- Registered new routes:
  - `/payments` → Payment Dashboard
  - `/payments/select-invoices` → Invoice Selection
  - `/payments/status` → Payment Status
- Updated main.dart with new route configuration

#### Dependencies
- **Added**: `paytm_allinonesdk: ^2.0.1` for Paytm payment gateway

### 🐛 Fixed
- Invoice filtering now properly handles multiple status types
- Cart and checkout stability improvements
- Minor UI alignment issues

### ⚠️ Known Issues

1. **Partial/Installment Payments**: Not yet supported - requires full invoice amount
2. **Offline Mode**: Limited payment functionality without internet
3. **Concurrent Orders**: Cannot place multiple orders simultaneously during payment

### 🔒 Security

- **PCI DSS Compliant**: Payment processing meets industry standards
- **Secure Connections**: All payments via encrypted HTTPS
- **No Card Storage**: Card details never stored locally or on server
- **Session Management**: Secure session handling for authenticated payments

### 📱 Tested On

- iOS 13.0+
- Android 5.0+ (API 21+)
- Both portrait and landscape orientations
- Various device sizes (phones and tablets)

### 🙏 Credits

Built with:
- Flutter framework
- Meteor backend
- Paytm Payment Gateway
- Zoho accounting integration

---

## [1.1.0] - 2025-12-15

### ✨ Added
- Invoice management system
- Order status tracking
- Refund request feature

### 🔄 Changed
- Improved UI responsiveness
- Better error messages

---

## [1.0.0] - 2025-11-01

### ✨ Added
- Initial release
- Product browsing
- Shopping cart
- Order placement
- User authentication

---

## Versioning Notes

### Version Format
`MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes or significant new features
- **MINOR**: New features that don't break existing functionality
- **PATCH**: Bug fixes and minor improvements

### Release Cadence
- Monthly minor releases
- Weekly patch releases (hotfixes)
- Quarterly major releases (only if needed)

---

## Upcoming Changes

### In Development [1.3.0]
- [ ] Partial/installment payment support
- [ ] Scheduled automatic payments
- [ ] Additional payment gateways
- [ ] Payment plans and subscriptions
- [ ] Wallet integration improvements
- [ ] Enhanced analytics

### Planned [1.4.0]
- [ ] Multi-language support (Hindi, Kannada, Tamil)
- [ ] Dark theme refinements
- [ ] Offline payment queue
- [ ] Advanced inventory features
- [ ] Loyalty program integration

### Future Considerations
- [ ] Voice-based ordering
- [ ] AR product visualization
- [ ] AI-powered recommendations
- [ ] Social sharing features
- [ ] Integration with other payment gateways

---

## Migration Guide

### Upgrading from 1.1.x to 1.2.0

**What Changed:**
- New "Payments" menu item added to navigation
- New routes for payment screens
- Enhanced invoice display with payment buttons
- New dependency: `paytm_allinonesdk`

**How to Update:**
1. Backup your current app data
2. Update to latest version
3. Clear app cache and data
4. Restart the app
5. Confirm Meteor settings include PayTM configuration

**New Features Available:**
- Pay invoices directly from the app
- View payment history
- Multi-invoice batch payment
- Real-time payment tracking

**No Breaking Changes**
- Existing functionality preserved
- All data remains accessible
- Backward compatible with previous orders

---

## Support

For issues or questions about changes:
- **Version Bugs**: Report in [issues section]
- **Migration Help**: Email support@nammasuvai.com
- **Feature Requests**: Use in-app feedback

---

## Archive

### Previous Versions
- [1.1.0 Release Notes](changelog/1.1.0.md)
- [1.0.0 Release Notes](changelog/1.0.0.md)

---

**Last Updated**: January 19, 2026  
**Current Version**: 1.2.0 (Beta)  
**Next Release**: 1.3.0 (Q2 2026)
