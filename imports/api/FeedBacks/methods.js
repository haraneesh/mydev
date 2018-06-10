//.'.'ort { check } from 'meteor/check';
import FeedBacks from './FeedBacks';
import { check } from 'meteor/check';
import rateLimit from '../../modules/rate-limit';
import constants from '../../modules/constants';
import Orders from '../Orders/Orders';

Meteor.methods({
  'feedbacks.upsert': function feedbacksInsert(feedBack) {
    check(feedBack, {
      postId: String,
      postType: String,
      description: String,
      rating: Number,
    });

    const fB = feedBack;
    fB.owner = this.userId;
    //try {
    switch (fB.postType) {
      case constants.PostTypes.Order.name:
        Orders.update({ _id: fB.postId }, { $set: { receivedFeedBack: true } });
        break;
    }
    return FeedBacks.upsert({ postId: fB.postId, postType: fB.postType }, { $set: fB });
    //return Comments.upsert({ _id: comment._id }, { $set: comment });
    /*} catch (exception) {
      handleMethodException(exception);
    }*/
  },
});

rateLimit({
  methods: [
    'feedbacks.upsert',
  ],
  limit: 5,
  timeRange: 1000,
});