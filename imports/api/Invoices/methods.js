/* eslint-disable consistent-return */
import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import rateLimit from '../../modules/rate-limit';
import zh from '../ZohoSyncUps/ZohoBooks';
import handleMethodException from '../../modules/handle-method-exception';

Meteor.methods({
  'invoices.getAll': function getInvoices(invoiceIds) {
    check(invoiceIds, [String]);

    const invoices = [];
    if (Meteor.isServer) {
      invoiceIds.forEach((invoiceId) => {
        const r = zh.getRecordById('invoices', invoiceId);
        if (r.code === 0 /* success */) {
          invoices.push(r.invoice);
        } else {
          handleMethodException(r.message, r.code);
        }
      });
    }
    return invoices;
  },
});


rateLimit({
  methods: ['invoices.getAll'],
  limit: 5,
  timeRange: 1000,
});
