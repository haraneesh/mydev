# Payments Guide

**Version**: 1.0  
**Updated**: January 19, 2026  
**Feature**: Paytm Payment Gateway Integration

---

## 📱 Quick Start

### How to Pay Your Invoices

1. **Open Payments**
   - Tap the **"Payments"** menu item in the main drawer
   - You'll see the Payment Dashboard

2. **View Your Invoices**
   - The **"Unpaid Invoices"** tab shows all invoices you haven't paid yet
   - View amount, due date, and status

3. **Select Invoices to Pay**
   - Tap **"Pay Now"** or **"Select Invoices"**
   - Check the invoices you want to pay
   - Use **"Select All"** to choose all unpaid invoices

4. **Review Amount**
   - See the total amount including any gateway fees
   - Confirm the details are correct

5. **Complete Payment**
   - Tap **"Proceed to Pay"**
   - Complete payment through Paytm
   - Your payment will be processed securely

6. **Confirmation**
   - See payment status and confirmation details
   - Return to dashboard to see updated invoices

---

## 💰 Payment Methods

### Supported Methods via Paytm

| Method | Type | Available |
|--------|------|-----------|
| **Credit Card** | Visa, Mastercard, American Express | ✅ Yes |
| **Debit Card** | Visa, Mastercard | ✅ Yes |
| **Net Banking** | All major Indian banks | ✅ Yes |
| **UPI** | Google Pay, PhonePe, BHIM, etc. | ✅ Yes |
| **Digital Wallet** | Paytm Wallet, others | ✅ Yes |
| **Cash on Delivery** | Pay with delivery | ⚠️ Not for invoice payments |

---

## 🔍 Understanding Payment Dashboard

### Unpaid Invoices Tab

Shows all invoices that need to be paid:

```
┌─────────────────────────────────────────┐
│ Total Unpaid: ₹2,500                    │
├─────────────────────────────────────────┤
│ INV-001    | ₹500  | Due: Jan 25 | ⚠️   │
│ INV-002    | ₹750  | Due: Jan 26 | 🔴   │
│ INV-003    | ₹1250 | Due: Jan 27 | ⚠️   │
├─────────────────────────────────────────┤
│ [Pay Invoices]                          │
└─────────────────────────────────────────┘
```

**Status Indicators:**
- 🟠 **Orange** = Unpaid (Due soon)
- 🔴 **Red** = Overdue (Payment due)
- 🟢 **Green** = Paid (Already paid)
- 🟡 **Yellow** = Partially Paid (Some amount due)

### Payment History Tab

Shows your recent payment transactions:

```
Date       | Amount  | Status    | Invoice
-----------|---------|-----------|----------
Jan 18     | ₹500    | ✅ Success| INV-001
Jan 17     | ₹750    | ✅ Success| INV-002
Jan 16     | ₹2,500  | ❌ Failed | INV-003
```

---

## 💳 Making a Payment

### Step-by-Step Instructions

#### Step 1: Select Invoices
```
Payment Dashboard
  ↓
[Unpaid Invoices] Tab
  ↓
Tap: "Select Invoices" or "Pay Now"
```

#### Step 2: Choose Invoices
```
□ INV-001  ₹500   Due: Jan 25
☑ INV-002  ₹750   Due: Jan 26
□ INV-003  ₹1,250 Due: Jan 27

[Select All] [Deselect All]

Total Selected: ₹750
```

#### Step 3: Review Amount
```
Subtotal:        ₹750.00
Gateway Fee:     ₹22.50 (3%)
────────────────────────
TOTAL TO PAY:    ₹772.50
```

#### Step 4: Proceed to Payment
```
Tap: [Proceed to Pay]
  ↓
Paytm Payment Gateway Opens
  ↓
Enter Payment Details
  ↓
Confirm Payment
```

#### Step 5: Confirmation
```
✅ PAYMENT SUCCESSFUL

Order ID: ORDER_123
Amount: ₹772.50
Date: Jan 19, 2026 10:30 AM

Invoices Paid:
- INV-002 ✓

[View Details] [Back to Dashboard]
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Payment Gateway Not Opening"

**Symptoms:**
- Paytm payment screen doesn't appear
- App freezes when trying to pay

**Solutions:**
1. Check your internet connection
2. Ensure you're not in airplane mode
3. Clear app cache:
   - Settings → Apps → Namma Suvai → Clear Cache
4. Restart the app
5. Try a different payment method

**Still not working?**
- Reinstall the app
- Contact support

---

### Issue 2: "Payment Declined by Bank"

**Symptoms:**
- Payment fails with "Transaction Declined"
- "Insufficient Funds" error

**Possible Causes:**
- Insufficient funds in account
- Card limit exceeded
- Invalid card details
- Bank declined the transaction

**Solutions:**
1. Check your account balance
2. Verify card details are correct
3. Try a different payment method
4. Contact your bank
5. Try again after 24 hours

---

### Issue 3: "Payment Stuck or Not Confirming"

**Symptoms:**
- Payment screen shows "Processing..."
- Status doesn't update after payment
- Unsure if payment was successful

**Solutions:**
1. **Check Payment Status:**
   - Go back to Payment Dashboard
   - View Payment History tab
   - Look for your recent transaction

2. **If Payment Succeeded:**
   - Invoices will show as "Paid"
   - Money will be credited to your account
   - No action needed

3. **If Payment Failed:**
   - Select the invoice again
   - Retry the payment
   - Try different method if needed

4. **If Unsure:**
   - Contact support with transaction details
   - Include Order ID and amount
   - We'll verify the payment

---

### Issue 4: "Gateway Fee Too High"

**Symptoms:**
- 3% fee seems high for payment

**Explanation:**
- Paytm charges us a processing fee
- We pass this fee to users transparently
- Helps keep app free

**How to Minimize:**
- Batch multiple invoices together (one payment = one fee)
- Pay invoices before they become overdue
- Check if your bank offers discounts

---

### Issue 5: "Can't Select Invoice"

**Symptoms:**
- Invoice checkbox is disabled/grayed out
- "Cannot select this invoice" message

**Reasons:**
- Invoice is already paid
- Invoice is not due yet
- Incomplete invoice data

**Solution:**
- Only unpaid/overdue invoices can be selected
- Paid invoices cannot be paid again
- Contact support if invoice status is incorrect

---

## 🔒 Security

### Your Payment Information is Safe

✅ **Secure Encryption**
- All payment data encrypted with SSL/TLS
- PCI DSS Level 1 compliant

✅ **Paytm Security**
- Paytm is India's largest payment platform
- 256-bit encryption
- Two-factor authentication support

✅ **Your Privacy**
- We never store your card details
- Payment processing via Paytm only
- No sharing of payment data

✅ **Fraud Protection**
- Secure transaction verification
- Real-time fraud monitoring
- Refund protection

---

## 💡 Tips & Best Practices

### ✅ DO's

✅ **Pay Invoices Before Due Date**
- Avoid late payment penalties
- Better for your account standing

✅ **Batch Multiple Invoices**
- Pay 2-3 invoices together
- One gateway fee for multiple invoices
- Saves time and money

✅ **Check Payment Status**
- Verify successful payment in history
- Confirm invoices marked as "Paid"
- Keep transaction confirmations

✅ **Use Saved Payment Methods**
- Faster checkout next time
- More convenient
- Still secure

✅ **Keep Invoice Numbers Handy**
- Helps for reference
- Easy to track payments
- Important for disputes

### ❌ DON'Ts

❌ **Don't Pay Same Invoice Twice**
- System prevents duplicate payments
- But always verify before paying

❌ **Don't Close App During Payment**
- May cause payment to fail
- Or stuck transaction status
- Always wait for confirmation

❌ **Don't Pay with Unsaved Cards**
- Higher fraud risk
- May not work reliably
- Always verify card details

❌ **Don't Ignore Overdue Invoices**
- Accumulate penalties
- May affect future orders
- Pay as soon as possible

❌ **Don't Share Card Details**
- Never via SMS, email, or call
- Support never asks for full card details
- Report suspicious requests immediately

---

## 📞 Frequently Asked Questions

### Q: How long does payment take?
**A:** Usually instant. If stuck, check Payment History after 5 minutes.

### Q: Can I pay partial amount?
**A:** Not yet. Partial payments coming soon. Pay full balance now.

### Q: What if I need to cancel payment?
**A:** Contact support immediately with Order ID.

### Q: Do I get receipt?
**A:** Yes! Check Payment History for details. Email receipt sent to registered email.

### Q: Can I use wallet balance?
**A:** Not yet. Coming soon! For now, use card/bank/UPI via Paytm.

### Q: What about refunds?
**A:** Refunds within 5-7 business days. Contact support for status.

### Q: Is payment data safe?
**A:** Yes! Paytm is India's safest payment platform.

### Q: What if transaction shows "Failed" but money debited?
**A:** Don't panic! Contact support with details. We'll investigate.

---

## 🆘 Getting Help

### Need Assistance?

**Contact Support:**
- **Email**: support@nammasuvai.com
- **Phone**: +91 XXXX XXX XXXX
- **Chat**: In-app support (M-F 9AM-6PM IST)
- **WhatsApp**: +91 XXXX XXX XXXX

**Provide These Details:**
- Invoice number(s)
- Transaction amount
- Payment date
- Order ID (if available)
- Error message (if any)
- Screenshot (if needed)

**Response Time:**
- Priority: 2-4 hours
- Standard: 24 hours
- Complex: 48-72 hours

---

## 📚 More Information

- **Full Features**: See [FEATURES.md](FEATURES.md)
- **Invoices**: View and manage invoices in "Invoices" menu
- **Orders**: Track orders in "Orders" menu
- **Account Settings**: Manage profile and preferences

---

## 🔄 What's Coming Next

### Upcoming Features
- ⏳ Partial/installment payments
- ⏳ Scheduled automatic payments  
- ⏳ Multiple payment methods
- ⏳ Payment plans
- ⏳ Wallet balance usage
- ⏳ One-click checkout

---

**Last Updated**: January 19, 2026  
**Version**: 1.0 (Beta)  
**Status**: Active & Monitoring

For the latest updates, check the app notifications and in-app announcements.

Happy paying! 💳✨
