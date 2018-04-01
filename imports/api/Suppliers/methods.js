import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Suppliers from './Suppliers';
import rateLimit from '../../modules/rate-limit';

Meteor.methods({
  'suppliers.insert': function suppliersInsert(supp) {
    check(supp, {
      name: String,
      description: String,
    });

    try {
      return Suppliers.insert({ owner: this.userId, ...supp });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'suppliers.update': function suppliersUpdate(supp) {
    check(supp, {
      _id: String,
      name: String,
      description: String,
    });

    try {
      const suppumentId = supp._id;
      Suppliers.update(suppumentId, { $set: supp });
      return suppumentId; // Return _id so we can redirect to suppument after update.
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'suppliers.remove': function suppliersRemove(suppumentId) {
    check(suppumentId, String);

    try {
      return Suppliers.remove(suppumentId);
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
});

rateLimit({
  methods: [
    'suppliers.insert',
    'suppliers.update',
    'suppliers.remove',
  ],
  limit: 5,
  timeRange: 1000,
});
