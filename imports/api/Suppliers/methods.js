import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Suppliers from './Suppliers';
import rateLimit from '../../modules/rate-limit';
import handleMethodException from '../../modules/handle-method-exception';

Meteor.methods({
  'suppliers.insert': function suppliersInsert(supp) {
    check(supp, {
      name: String,
      description: String,
      marginPercentage: Number,
      zohoAuthtoken: String,
      zohoOrganizationId: String,

    });

    try {
      return Suppliers.insert({ owner: this.userId, ...supp });
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  'suppliers.update': function suppliersUpdate(supp) {
    check(supp, {
      _id: String,
      name: String,
      description: String,
      marginPercentage: Number,
      zohoAuthtoken: String,
      zohoOrganizationId: String,
    });

    try {
      const suppumentId = supp._id;
      Suppliers.update(suppumentId, { $set: supp });
      return suppumentId; // Return _id so we can redirect to suppument after update.
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  'suppliers.remove': function suppliersRemove(suppumentId) {
    check(suppumentId, String);

    try {
      return Suppliers.remove(suppumentId);
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  'suppliers.list': function suppliersList() {
    try {
      if (Meteor.isServer) {
        return Suppliers.find({ owner: this.userId }, { fields: { createdAt: 0, updatedAt: 0 } }).fetch();
      } else {
        return [];
      }
    } catch (exception) {
      handleMethodException(exception);
    }
  },
});

rateLimit({
  methods: [
    'suppliers.insert',
    'suppliers.update',
    'suppliers.remove',
    'suppliers.list',
  ],
  limit: 5,
  timeRange: 1000,
});
