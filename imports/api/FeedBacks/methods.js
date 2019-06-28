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
      feedBackType: String,
      questionAsked: String,
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
  'feedbacks.insertSurvey': function feedbacksInsertSurvey(feedBack) {
    check(feedBack, {
      postId: String,
      postType: String,
      feedBackType: String,
      ratingsArrayWithValue:[{
        questionIndexNumber: Number,
        questionText: String,
        ratingValue: Number,
        ratingText: String
      }]
    });

    feedBack.ratingsArrayWithValue.forEach((value)=>{

      const fB = {
        owner: this.userId,
        postId: feedBack.postId,
        postType: feedBack.postType,
        feedBackType: feedBack.feedBackType,
        questionAsked: value.questionText,
        rating: value.ratingValue,
        ratingLabel: value.ratingText,
      };

      switch (fB.postType) {
        case constants.PostTypes.Order.name:
          Orders.update({ _id: fB.postId }, { $set: { receivedFeedBack: true } });
          break;
      }
      FeedBacks.upsert({ postId: fB.postId, postType: fB.postType, questionAsked: fB.questionAsked }, { $set: fB });
    });
    return true;
  },
      
});

rateLimit({
  methods: [
    'feedbacks.upsert',
    'feedbacks.insertSurvey',
  ],
  limit: 5,
  timeRange: 1000,
});