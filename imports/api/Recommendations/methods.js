import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Recommendations from './Recommendations';
import rateLimit from '../../modules/rate-limit';

Meteor.methods({
  'recommendations.upsert': async function recommendationsUpsert(order) {
    check(order, {
      title: String,
      body: String,
    });

    try {
      return await Recommendations.upsertAsync({ customerId: this.userId }, { $set: order });
    } catch (exception) {
      handleMethodException(exception);
    }
  },
});

rateLimit({
  methods: [
    'recommendations.upsert',
  ],
  limit: 5,
  timeRange: 1000,
});
