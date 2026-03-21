import { Meteor } from 'meteor/meteor';
import Recommendations from '../Recommendations';

Meteor.publish('recommendations.view', function recommendationsView() {
  return Recommendations.find({ customerId: this.userId });
});
