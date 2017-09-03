/* eslint-disable consistent-return */
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Meteor } from 'meteor/meteor';
import rateLimit from '../../modules/rate-limit';
import zh from '../ZohoSyncUps/ZohoBooks';

export const getInvoice = new ValidatedMethod({
  name: 'invoices.get',
  validate: new SimpleSchema({
    invoiceId: { type: String },
  }).validator(),
  run({ invoiceId }) {
    if (Meteor.isServer) {
      const r = zh.getRecordById('invoices', invoiceId);
      if (r.code === 0 /* Success */) {
        return r.invoice;
      }

      throw new Meteor.Error(r.code, r.message);
    }
  },
});

rateLimit({
  methods: [getInvoice],
  limit: 5,
  timeRange: 1000,
});
