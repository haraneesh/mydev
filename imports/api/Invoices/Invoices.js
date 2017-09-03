/* eslint-disable consistent-return */
import SimpleSchema from 'simpl-schema';

export const InvoiceSchemaDefObj = new SimpleSchema({
  totalInvoicedAmount: { type: Number, label: 'The total bill amount.', min: 0 },
  createdAt: { type: Date, label: 'The date on which the invoice was created in Zoho.' },
  updatedAt: {
    type: Date, label: 'The date on which the invoice was last modified in Zoho',
  },
  balanceInvoicedAmount: { type: Number, label: 'Balance amount to be received from the customer.', min: 0 },
  zhNotes: { type: String, label: 'Notes sent in the zoho invoice', optional: true },
  zhInvoiceId: { type: String, label: 'Corresponding Zoho Sales Order Id' },
  zhInvoiceStatus: { type: String, label: 'Status of the invoice in Zoho.' },
});
