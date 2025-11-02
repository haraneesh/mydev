# Namma Suvai - Technical Specifications Document

> **Application**: E-commerce platform for healthy, organic food products  
> **Stack**: Meteor.js, React 18, MongoDB, Node.js | **Market**: India (Chennai/Tamil Nadu)

---

## 1. User Management & Authentication

### Registration & Onboarding
- [x] Self-service registration with mobile number (OTP verification)
- [x] Email-based invitation system
- [x] Admin approval workflow for signups
- [x] User profile with delivery address and preferences
- [x] Auto Zoho Books contact creation on signup
- [-] Email verification (implemented, config needed)
- [ ] Two-factor authentication
- [ ] Social login (Google, Facebook)

### Authentication & Sessions
- [x] Username/password auth (mobile as username)
- [x] Password reset/recovery
- [x] Session management with token cleanup
- [x] Login validation with account status check
- [x] Rate limiting on auth endpoints
- [ ] Device management (view/revoke sessions)

### Profile Management
- [x] Update personal info (name, email, mobile, address)
- [x] Delivery address with pincode
- [x] Dietary preferences (Vegan, Vegetarian, Non-Veg)
- [x] Packing preferences (Paper, Polythene, No Packing)
- [x] Product update notification preferences
- [x] Change password
- [ ] Multiple delivery addresses
- [ ] Profile picture upload

### Role-Based Access Control
- [x] Customer, Admin, Super Admin, Shop Owner, Supplier roles
- [x] Role-based method access control
- [x] Account status management (Active, Disabled, NewSignUp)
- [ ] Fine-grained permissions system

---

## 2. Product Management

### Product Catalog
- [x] Product CRUD with SKU, name, description, pricing, images
- [x] Product categories (Vegetables, Fruits, Greens, Rice, Spices, Oils, etc.)
- [x] Multiple pricing (retail + wholesale)
- [x] Unit of sale (kg, grams, liters, pieces)
- [x] Availability flags (retail/wholesale)
- [x] Bulk price updates
- [-] Product variants (via unitsForSelection)
- [ ] Product reviews and ratings
- [ ] Product comparison

### Inventory Management
- [x] Stock tracking via Zoho Inventory integration
- [x] Inventory reconciliation workflow
- [x] Product quantity ordered tracking
- [x] Returnable products tracking (containers, jars)
- [-] Stock reports (read-only from Zoho)
- [ ] Manual inventory adjustments UI
- [ ] Automated reorder points

### Pricing & Discounts
- [x] Base and wholesale pricing
- [x] Bulk discounts (quantity-based: "1,2,3=5%,6")
- [x] Discount codes at checkout
- [x] Margin calculation for shop owners
- [x] Returnable deposit pricing
- [ ] Time-based promotions
- [ ] Customer-specific pricing

### Product Display
- [x] Time-bound product lists (start/end dates)
- [x] Product list management
- [x] Special products display
- [x] Product search with tracking
- [x] Category filtering
- [ ] Advanced filters (price, dietary)
- [ ] Wishlist/favorites
- [ ] Recently viewed

---

## 3. Shopping Experience

### Shopping Cart
- [x] Add/remove/update products
- [x] Cart persistence
- [x] Returnable cost calculation
- [x] Apply discount codes
- [x] React Context state management
- [ ] Cart notes/customization
- [ ] Cart abandonment recovery

### Baskets (Saved Orders)
- [x] Create/edit/delete named baskets
- [x] Save product selections
- [x] Quick order from basket
- [x] Admin basket creation for customers
- [ ] Recurring baskets (subscription)
- [ ] Basket sharing

### Product Discovery
- [x] Category tabs
- [x] Search with tracking
- [x] Special products section
- [x] Basic recommendations
- [ ] Personalized recommendations
- [ ] Trending products

---

## 4. Order Management

### Order Placement
- [x] Place order from product list or basket
- [x] Admin orders on behalf of customers
- [x] Order tracking (WhatsApp, Phone, Message)
- [x] Auto delivery date calculation
- [x] Total calculation with discounts
- [x] Customer notes, previous order issues
- [x] Cash/recyclables collection flags
- [-] Delivery slot (fixed next-day)
- [ ] Express delivery
- [ ] Order preview

### Order Tracking & Status
- [x] Status workflow (Saved, Pending, Processing, Awaiting_Fulfillment, Shipped, Completed, Cancelled, Partially_Completed)
- [x] View order details and history
- [x] Customer cancellation of pending orders
- [x] Admin status updates (single/bulk)
- [x] Delivery date management
- [-] Real-time tracking (status only, no GPS)
- [ ] Order modification after placement
- [ ] Return/refund requests

### Order Fulfillment
- [x] Orders linked to product lists
- [x] Product aggregation for fulfillment
- [x] Wholesale vs retail separation
- [x] Purchase order generation
- [x] Packing preferences tracking
- [x] Inventory allocation/release
- [ ] Picking/packing workflow
- [ ] Partial fulfillment

### Order Communications
- [x] Email notifications to admin
- [x] Order comments system
- [x] Customer messages
- [-] Email to customers (needs config)
- [ ] SMS order status notifications
- [ ] **WhatsApp notifications on order status changes** (Order Placed, Processing, Packing, Shipped, Completed, Cancelled)
- [ ] Push notifications

---

## 5. Payment & Invoicing

### Payment Processing
- [x] Razorpay + Paytm gateway integration
- [x] Payment capture and verification
- [x] Fee/tax tracking
- [x] Sync with Zoho Books
- [x] Multiple payment modes (card, wallet, UPI, net banking)
- [-] Cash on delivery (flag exists, manual processing)
- [ ] EMI/installments
- [ ] Saved payment methods

### Wallet System
- [x] Wallet balance tracking
- [x] Unused credits/retainer tracking
- [x] Outstanding receivable tracking
- [x] Zoho sync
- [x] Pay invoices from wallet (credits + payments)
- [x] Open credit notes retrieval
- [x] Wallet balance display
- [ ] Wallet top-up UI
- [ ] Transaction history UI
- [ ] Cashback/rewards

### Invoice Management
- [x] Zoho Books invoice integration
- [x] Invoice sync to MongoDB
- [x] View unpaid invoices
- [x] Status tracking (unpaid, overdue, partially_paid, sent, paid)
- [x] Pay invoices with wallet
- [x] Apply credit notes/payments
- [x] Payment status updates
- [x] PDF viewing via Zoho
- [-] Invoice generation (via Zoho)
- [ ] Invoice download/email
- [ ] Dispute/query system

### Refunds
- [x] Credit note retrieval
- [x] Credit note application
- [ ] Refund request workflow
- [ ] Refund processing

---

## 6. Admin Dashboard

### User Management
- [x] View all users (pagination, sorting)
- [x] Search by mobile
- [x] Create/edit users
- [x] Update account status
- [x] Assign roles
- [x] View wallet info
- [x] Approve signups
- [ ] User activity logs
- [ ] User segments

### Product Management
- [x] CRUD operations
- [x] Bulk price updates
- [x] Product list management
- [x] Zoho sync
- [x] Availability flags
- [x] Bulk discount config
- [ ] CSV import/export
- [ ] Product archive

### Order Management
- [x] View all orders (filtering, pagination)
- [x] Order count by type
- [x] Status updates (single/bulk)
- [x] Delivery date updates (bulk)
- [x] Place orders for customers
- [x] Fulfillment reports
- [x] Customer preferences report
- [x] Purchase order details
- [ ] Advanced search
- [ ] Order export

### Inventory
- [x] Stock on hand (from Zoho)
- [x] Reconciliation workflow
- [x] PO tracking
- [ ] Stock adjustment UI
- [ ] Movement reports

---

## 7. Reporting & Analytics

### Sales Reports
- [x] Daily sales summary
- [x] Sales by product/customer type
- [x] Week-over-week comparison
- [x] Customer preferences
- [x] User export
- [-] Invoice reports (via Zoho)
- [ ] Trends/forecasting
- [ ] Profit margins

### Inventory Reports
- [x] Stock on hand (Zoho)
- [x] Quantity ordered aggregation
- [x] PO tracking
- [ ] Stock movement
- [ ] Low stock alerts

### Analytics Integration
- [x] Amplitude analytics
- [x] Google Analytics (GA4)
- [x] Facebook Pixel
- [x] Microsoft Clarity
- [x] Event tracking (pages, orders)
- [x] Search query tracking
- [-] Admin exclusion (needs testing)
- [ ] Custom dashboard
- [ ] Funnel analysis

---

## 8. Integrations

### Zoho Books/Inventory
- [x] OAuth authentication
- [x] Customer contact sync
- [x] Order sync (as sales orders)
- [x] Invoice/payment/credit note sync
- [x] Product/item sync
- [x] Stock retrieval
- [x] PO data retrieval
- [x] Apply payments to invoices
- [-] Sales by items report
- [ ] Automated sync schedule
- [ ] Sync status dashboard

### Payment Gateways
- [x] Razorpay capture + webhooks
- [x] Paytm integration + checksum
- [x] Payment validation
- [x] Zoho sync
- [ ] Failure handling UI
- [ ] Reconciliation dashboard

### Delivery
- [x] Porter API integration
- [x] Order creation/tracking
- [x] Sync ups collection
- [ ] Real-time map tracking
- [ ] Cost calculation

### Communication
- [x] Fast2SMS (OTP)
- [x] Email (Meteor Email)
- [x] Email templates
- [-] WhatsApp (framework exists)
- [ ] **WhatsApp Business API integration for order status notifications**
- [ ] SMS order updates
- [ ] Push notifications

---

## 9. Mobile Application

- [x] Cordova configuration
- [x] iOS/Android builds
- [x] Universal links
- [x] OneSignal push setup
- [x] PWA install prompt (iOS)
- [x] Responsive design
- [-] PWA support (partial)
- [ ] Offline functionality
- [ ] Camera integration
- [ ] Biometric auth

---

## 10. Communication & Engagement

### Messaging
- [x] Customer/admin messages
- [x] Role-based visibility
- [x] Status tracking
- [x] Like/comment
- [x] Image attachments
- [x] Post on behalf (admin)
- [ ] Threading
- [ ] Notifications

### Feedback
- [x] Order feedback/ratings
- [x] Multi-question surveys
- [x] Feedback flags
- [ ] Analysis dashboard
- [ ] Public reviews

### Recommendations
- [x] Customer recommendations
- [ ] Display/tracking
- [ ] Personalization

### WhatsApp Order Status Notifications
- [ ] Implementation


---

## 11. Security & Compliance

### Application Security
- [x] Rate limiting (5/sec)
- [x] Input validation (SimpleSchema)
- [x] Password hashing (bcrypt)
- [x] CSRF protection
- [x] RBAC
- [x] Method-level auth
- [-] Security headers (basic)
- [ ] XSS protection
- [ ] Security audits

### Data Security
- [x] Sensitive data filtering
- [x] User-specific data access
- [x] PCI-compliant gateways
- [ ] Encryption at rest/transit
- [ ] GDPR compliance
- [ ] Audit logging

---

## 12. Performance & Development

### Performance
- [x] React 18
- [x] Code splitting
- [x] Lazy loading
- [x] Efficient queries
- [x] Aggregate pipelines
- [ ] Image optimization
- [ ] Caching strategy
- [ ] CDN

### Code Quality
- [x] ESLint + Biome
- [x] SimpleSchema validation
- [x] Error handling utilities
- [-] Test setup (minimal coverage)
- [ ] TypeScript migration
- [ ] Documentation

### DevOps
- [x] Dev/prod configs
- [x] Mobile build config
- [ ] CI/CD pipeline
- [ ] Staging environment
- [ ] Monitoring/alerting

---

## 🚨 Review Questions & Assumptions

### Key Questions

**Architecture**
1. Expected user growth? Current Meteor pub/sub may have scaling limits.
2. Backup plan if Zoho integration fails?
3. Multi-tenant support planned?

**Business Logic**
4. Delivery hardcoded to "tomorrow" - need flexible scheduling?
5. Inventory read-only from Zoho - need real-time updates?
6. Return collection workflow for containers unclear?
7. Loyalty program for retail customers?

**Technical**
8. Payment reconciliation automated?
9. Mobile app actively maintained?
10. Why 4 analytics tools? Plan to consolidate?
11. Which email service provider?
12. Recipe management planned? (constants exist)
13. **WhatsApp Business API** - Which provider planned for order status notifications? (Twilio, MessageBird, official Meta API?)

### Assumptions

**Business**
- B2C + B2B model (retail + wholesale)
- Pre-order/daily menu system
- Regional focus: India (Tamil Nadu)
- Organic/healthy food niche

**Technical**
- Monolithic Meteor app
- Single MongoDB database
- No SSR
- Zoho as source of truth
- HTTPS at infrastructure level
- Manual QA (minimal tests)

### Technical Debt (High Priority)

1. **Error Handling**: Inconsistent patterns, unclear client-side display
2. **Testing**: Critical paths lack tests (order calc, payments)
3. **Type Safety**: Partial TS, should migrate fully
4. **Security Headers**: Helmet commented out
5. **Rate Limiting**: May be too restrictive/lenient

---

## 📱 Proposed Feature: WhatsApp Order Status Notifications

### Overview
Implement automated WhatsApp notifications to customers whenever their order status changes, providing real-time updates throughout the order lifecycle.

### Status Triggers
Notifications should be sent when order status changes to:
- **Order Placed** (Pending) - Confirmation with order number and estimated delivery
- **Processing** - Order being prepared
- **Packing** (Awaiting_Fulfillment) - Items being packed
- **Shipped** - Order dispatched with delivery partner details
- **Completed** - Order delivered successfully
- **Cancelled** - Order cancellation notice

### Implementation Considerations

**Technical Requirements**:
- WhatsApp Business API integration (recommended providers: Twilio, MessageBird, or Meta's official API)
- Message templates pre-approval (required by WhatsApp)
- Webhook/event system to trigger on order status updates
- Template variables: customer name, order number, status, delivery date, tracking link
- Rate limiting compliance (WhatsApp API limits)
- Opt-in/opt-out management for customers
- Fallback to SMS if WhatsApp delivery fails

**Database Changes**:
- Add `whatsappOptIn` field to user profile
- Track notification delivery status in orders collection
- Log WhatsApp message IDs for tracking

**Integration Points**:
- Hook into existing `updateOrderStatus` and `updateMyOrderStatus` methods
- Leverage existing SMS integration pattern (Fast2SMS)
- Use Meteor's event system (existing `Emitter` in `Events/events.js`)

**Cost Implications**:
- WhatsApp Business API charges per message (varies by provider)
- Message template submission and approval process
- Need pricing model decision: free for customers or included in service

**Localization**:
- Support for English and Tamil (regional market)
- Template translations required

