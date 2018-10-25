import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import ReconcileInventory from './ReconcileInventory';
import rateLimit from '../../modules/rate-limit';
import handleMethodException from '../../modules/handle-method-exception';

export const reconcileInventoryUpsert = new ValidatedMethod({
  name: 'reconcileInventory.upsert',
  validate: new SimpleSchema({
    createdOn: String,
    products: Array,
    'products.$': Object,
    'products.$.productId': String,
    'products.$.productName': String,
    'products.$.zohoProductInventory': Number,
    'products.$.reportedPhysicalInventory': Number,
    'products.$.unit': String,
    'products.$.differenceQty': Number,
  }).validator(),
  run(doc) {
    try {
      const record = doc;
      record.updatedBy = this.userId;
      return ReconcileInventory.upsert({ createdOn: record.createdOn }, { $set: record });
      // Return _id so we can redirect to document after update.
    } catch (exception) {
      handleMethodException(exception);
    }
  },
});

rateLimit({
  methods: [
    reconcileInventoryUpsert,
  ],
  limit: 5,
  timeRange: 1000,
});
