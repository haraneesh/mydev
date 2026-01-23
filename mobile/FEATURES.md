# Namma Suvai Mobile App - Features

This document describes the features and capabilities of the Namma Suvai Flutter mobile application.

---

## 🛍️ Shopping & Orders

### Product Browsing
- View products by category
- Search for products
- Filter by availability
- View product details with images
- See pricing and minimum order quantities

### Shopping Cart
- Add/remove products
- Adjust quantities
- View cart totals
- Proceed to checkout

### Order Management
- Place orders
- View order history
- Track order status
- View order details
- Cancel orders
- Refund management

### Invoices
- View all invoices
- Filter by status (Paid, Unpaid, Overdue)
- View invoice details
- Download invoices
- **NEW**: Pay invoices directly

---

## 💳 Payments

### Payment Dashboard
Users can now manage payments directly from the mobile app.

**Features:**
- View unpaid and overdue invoices
- Track payment history
- See total outstanding amount
- Batch payment of multiple invoices
- Real-time payment status updates

### Supported Payment Methods
- Paytm Payment Gateway
  - Credit/Debit Cards
  - Net Banking
  - UPI
  - Digital Wallets

### Payment Workflow
1. **View Invoices** - See all unpaid and overdue invoices in Payment Dashboard
2. **Select Invoices** - Choose one or more invoices to pay together
3. **Review Amount** - See total with applicable gateway fees
4. **Complete Payment** - Securely pay via Paytm gateway
5. **Confirmation** - View payment status and details

### Key Features
✅ Multi-invoice batch payment  
✅ Real-time total calculation  
✅ Gateway fee transparency  
✅ Secure payment processing  
✅ Payment history tracking  
✅ Error recovery with retry logic  
✅ Transaction verification

---

## 👤 User Accounts

### Authentication
- Phone number based login
- Secure authentication via Meteor backend
- Session management
- Auto-logout on inactivity

### Profile Management
- View profile information
- Edit personal details
- Manage addresses
- Payment methods (connected to Paytm)

### Wallet & Accounts
- View wallet balance
- Track wallet transactions
- Use wallet for payments

---

## 📱 Mobile Features

### User Interface
- Clean, intuitive design
- Dark mode support
- Responsive layout for all device sizes
- Fast app performance
- Low data usage optimizations

### Data Management
- Offline product cache
- Invoice caching for quick access
- Session persistence
- Automatic data sync when online

### Notifications
- Order status updates
- Payment confirmations
- Overdue invoice reminders

---

## 🔒 Security & Privacy

### Data Protection
- Secure HTTPS connections
- End-to-end encrypted payments
- Session token management
- PCI DSS compliant payment processing

### User Privacy
- No unnecessary data collection
- Secure local storage
- Session timeout for security
- Logout clears sensitive data

---

## ⚙️ Technical Features

### Backend Integration
- Meteor DDP for real-time data
- Paytm payment gateway integration
- Zoho accounting synchronization
- Invoice management system

### Performance
- Lazy loading of images
- Smart caching strategies
- Efficient list rendering
- Optimized database queries

---

## 🐛 Known Limitations

1. **Offline Mode**: Limited functionality without internet connection
2. **Concurrent Orders**: Cannot place multiple orders simultaneously
3. **Partially Paid Invoices**: Limited support for installment payments

---

## 📋 Version History

### Latest (Jan 2026)
- ✨ Added Payments feature with Paytm integration
- 🎨 UI improvements and refinements
- 🐛 Bug fixes and performance improvements

### Previous Versions
See CHANGELOG.md for detailed history

---

## 🚀 Getting Help

### For Users
- Contact support team
- Check FAQ in app
- Review user guide in PAYMENTS.md

### For Developers
- See ARCHITECTURE.md for system design
- Check openspec/ directory for detailed specifications
- Review code comments in source files

---

## 📞 Support

For issues, feature requests, or questions:
- Contact: support@nammasuvai.com
- Response time: 24 hours
- Available: Mon-Fri 9AM-6PM IST

---

**Last Updated**: January 19, 2026  
**App Version**: 1.x.x  
**Minimum iOS**: 11.0  
**Minimum Android**: API 21 (Android 5.0)
