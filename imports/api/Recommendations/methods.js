import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Recommendations from './Recommendations';
import rateLimit from '../../modules/rate-limit';

Meteor.methods({
  'recommendations.upsert': function recommendationsUpsert(order) {
    check(order, {
      title: String,
      body: String,
    });

    try {
      return Recommendations.upsert({ customerId: this.userId });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
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
