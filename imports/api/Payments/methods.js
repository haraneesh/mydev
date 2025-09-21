import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import Razorpay from 'razorpay';
import Payments from './Payments';
import { ZhInvoices } from '../ZhInvoices/ZhInvoices';
import './paytm-methods';
import zohoPayments from '../ZohoSyncUps/zohoPayments';
import { updateUserWallet } from '../ZohoSyncUps/zohoContactsMethods';
import rateLimit from '../../modules/rate-limit';
import handleMethodException from '../../modules/handle-method-exception';

const rzp = new Razorpay({
  key_id: Meteor.settings.private.Razor.merchantKey,
  key_secret: Meteor.settings.private.Razor.merchantKeySecret,
});

/**
 * Helper to allocate amounts from a pool up to a target amount.
 * @param {Array<Record<string, any>>} pool
 * @param {string} takeKey - 'creditnote_id' | 'payment_id'
 * @param {string} amountKey - 'balance' | 'unused_amount'
 * @param {number} needAmount
 * @returns {{ applied: Array<Record<string, any>>, remaining: number }}
 */
function allocateFromPool(pool, takeKey, amountKey, needAmount) {
  const applied = [];
  let remaining = Number(needAmount) || 0;
  for (let i = 0; i < pool.length && remaining > 0; i += 1) {
    const entry = pool[i];
    const available = Number(entry[amountKey]) || 0;
    if (available <= 0) continue;
    const applyAmt = Math.min(available, remaining);
    const item = {};
    item[takeKey] = entry[takeKey];
    item.amount = applyAmt;
    applied.push(item);
    pool[i][amountKey] = available - applyAmt; // mutate pool balance
    remaining -= applyAmt;
  }
  return { applied, remaining };
}

/*
Razor Pay Error Response
{
  "error": {
      "code": "BAD_REQUEST_ERROR",
      "description": "The amount is invalid",
      "field": "amount"
   }
}

Razor Pay
{
    "id": "pay_7IZD7aJ2kkmOjk",
    "entity": "payment",
    "amount": 50000,
    "currency": "INR",
    "status": "captured",
    "order_id": null,
    "invoice_id": null,
    "international": false,
    "method": "wallet",
    "amount_refunded": 0,
    "refund_status": null,
    "captured": true,
    "description": "Purchase Description",
    "card_id": null,
    "bank": null,
    "wallet": "freecharge",
    "vpa": null,
    "email": "a@b.com",
    "contact": "91xxxxxxxx",
    "notes": {
        "merchant_order_id": "order id"
    },
    "fee": 1438,
    "tax": 188,
    "error_code": null,
    "error_description": null,
    "created_at": 1400826750
}

*/
Meteor.methods({
  'payments.getPayments': async function getPayments() {
    try {
      if (Meteor.isServer) {
        const query = { _id: this.userId };
        const user = await Meteor.users.find(query).fetchAsync();

        if (user[0].zh_contact_id) {
          const r = await zohoPayments.getCustomerPayments(user[0].zh_contact_id);

          if (r.code !== 0) {
            handleMethodException(r, r.code);
          }
          return r.customerpayments;
        }
        return [];
      }
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  'payments.insert': async function paymentInsert(inputParams) {
    check(inputParams, {
      razorpay_payment_id: String,
      amountChargedInPaise: Number,
    });

    try {
      if (Meteor.isServer) {
        const paymentResponse = await rzp.payments.capture(
          inputParams.razorpay_payment_id,
          inputParams.amountChargedInPaise,
        );

        if (Meteor.isDevelopment) {
          console.log(paymentResponse);
        }

        const paymentId = await Payments.insertAsync({
          paymentApiResponseObject: paymentResponse,
          owner: this.userId,
        });

        const paidUser = await Meteor.users.findOneAsync({ _id: this.userId });

        const amountAfterFeeTax = paymentResponse.amount - paymentResponse.fee - paymentResponse.tax;

        const zhResponse = await zohoPayments.createCustomerPayment({
          zhCustomerId: paidUser.zh_contact_id,
          paymentAmountInPaise: paymentResponse.amount, // amountAfterFeeTax,
          paymentMode: paymentResponse.method,
          razorPaymentId: inputParams.razorpay_payment_id,
          paymentDescription: `Paid via RazorPay, id ${inputParams.razorpay_payment_id} 
            fee: ${paymentResponse.fee} 
            tax: ${paymentResponse.tax}
            ${paymentResponse.description} 
            `,
          zoho_fund_deposit_account_id: Meteor.settings.private.Razor.zoho_fund_deposit_account_id,
        });

        if (Meteor.isDevelopment) {
          console.log(zhResponse);
        }

        // Update Payment record history with the updated payment record
        await Payments.updateAsync(
          { _id: paymentId },
          { $set: { paymentZohoResponseObject: zhResponse } },
        );

        if (zhResponse.code !== 0) {
          handleMethodException(zhResponse, zhResponse.code);
        }

        const zhContactResponse = await updateUserWallet(paidUser);

        if (Meteor.isDevelopment) {
          console.log(zhContactResponse);
        }

        // Update Payment record with the latest contact information
        await Payments.updateAsync(
          { _id: paymentId },
          { $set: { contactZohoResponseObject: zhContactResponse.zohoResponse } },
        );

        if (zhContactResponse.zohoResponse.code !== 0) {
          handleMethodException(
            zhContactResponse.zohoResponse,
            zhContactResponse.zohoResponse.code,
          );
        }
      }
      return {
        amountInPaise: paymentResponse.amount,
        feeInPaise: paymentResponse.fee,
        taxInPaise: paymentResponse.tax,
      };
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  
  // Pay selected invoices using user's wallet (credit notes + unused payments)
  'payments.payFromWallet': async function payFromWallet(params) {
    try {
      check(params, {
        invoices: [{
          invoice_id: String,
          amount: Match.Where(amount => {
            check(amount, Number);
            return amount >= 0;
          })
        }]
      });

      const { invoices } = params;

      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in');
      }

      const user = await Meteor.users.findOneAsync({ _id: this.userId });
      if (!user?.zh_contact_id) {
        throw new Meteor.Error('missing-zoho-id', 'No Zoho contact ID found for user');
      }

      // Load credits: open credit notes and recent customer payments (sequential)
      const openCreditNotes = await Meteor.callAsync('zohoPayments.getOpenCreditNotes');
      const recentPayments = await Meteor.callAsync('zohoPayments.getMyRecentPayments');

      // Prepare available credits
      let creditNotesPool = (openCreditNotes || [])
        .filter(cn => Number(cn.balance) > 0)
        .map(cn => ({ creditnote_id: cn.creditnote_id, balance: Number(cn.balance) }));

      let paymentsPool = (recentPayments || [])
        .filter(p => Number(p.unused_amount) > 0)
        .map(p => ({ payment_id: p.payment_id, unused_amount: Number(p.unused_amount) }));

      const results = [];

      // Iterate selected invoices and apply credits
      for (const inv of invoices) {
        const invoiceId = inv.invoice_id; // Zoho invoice id
        let need = Number(inv.amount) || 0;
        if (!invoiceId || need <= 0) continue;

        // 1) Apply credit notes first
        const fromCN = allocateFromPool(creditNotesPool, 'creditnote_id', 'balance', need);
        const creditnotesToApply = fromCN.applied.map((x) => ({ creditnote_id: x['creditnote_id'], balance: Number(x['amount']) }));
        need = fromCN.remaining;

        // 2) Then apply unused payments
        let customerpaymentsToApply = [];
        if (need > 0) {
          const fromPM = allocateFromPool(paymentsPool, 'payment_id', 'unused_amount', need);
          customerpaymentsToApply = fromPM.applied.map((x) => ({ payment_id: x['payment_id'], unused_amount: Number(x['amount']) }));
          need = fromPM.remaining;
        }

        // If anything to apply, call Zoho to apply to invoice
        if (creditnotesToApply.length > 0 || customerpaymentsToApply.length > 0) {
          await Meteor.callAsync('zoho.applyPaymentToInvoice', {
            invoice_id: invoiceId,
            creditnotes: creditnotesToApply,
            customerpayments: customerpaymentsToApply,
          });

          const appliedAmount = [...creditnotesToApply, ...customerpaymentsToApply]
            .reduce((s, x) => s + Number((x.balance ?? x.unused_amount) ?? 0), 0);

          // Update local invoice status/balance
          const { updateInvoicePaymentStatus } = await import('/imports/api/ZhInvoices/methods');
          await updateInvoicePaymentStatus.call({
            invoiceId: invoiceId,
            amount: appliedAmount,
            paymentStatus: { ORDERID: 'wallet', PAYMENTMODE: 'wallet' },
          });

          // Robustness: fetch updated invoice from Zoho and sync exact balance/status locally
          try {
            const zohoInvoice = await Meteor.callAsync('zhInvoices.getInvoiceById', { invoiceId });
            if (zohoInvoice && typeof zohoInvoice.balance !== 'undefined') {
              await ZhInvoices.updateAsync(
                { invoice_id: invoiceId },
                { $set: { balance: Number(zohoInvoice.balance) || 0, status: zohoInvoice.status || 'sent' } },
              );
            }
          } catch (syncErr) {
            // Non-fatal: log and continue
            if (Meteor.isDevelopment) {
              // eslint-disable-next-line no-console
              console.error('Post-apply sync failed for invoice', invoiceId, syncErr);
            }
          }

          results.push({ invoice_id: invoiceId, applied: appliedAmount, remaining: need });
        } else {
          results.push({ invoice_id: invoiceId, applied: 0, remaining: need });
        }
      }

      // Refresh user wallet after applications
      await updateUserWallet(user);

      return { message: 'success', results };
    } catch (exception) {
      handleMethodException(exception);
    }
  },
});

rateLimit({
  methods: ['payments.insert', 'payments.getPayments', 'payments.payFromWallet'],
  limit: 5,
  timeRange: 1000,
});
