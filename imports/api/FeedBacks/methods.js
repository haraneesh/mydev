import { check } from 'meteor/check';
import constants from '../../modules/constants';
import rateLimit from '../../modules/rate-limit';
import { Orders } from '../Orders/Orders';
//.'.'ort { check } from 'meteor/check';
import FeedBacks from './FeedBacks';

Meteor.methods({
  'feedbacks.upsert': async function feedbacksInsert(feedBack) {
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
        await Orders.updateAsync(
          { _id: fB.postId },
          { $set: { receivedFeedBack: true } },
        );
        break;
    }
    return await FeedBacks.upsertAsync(
      { postId: fB.postId, postType: fB.postType },
      { $set: fB },
    );
    //return Comments.upsert({ _id: comment._id }, { $set: comment });
    /*} catch (exception) {
      handleMethodException(exception);
    }*/
  },
  'feedbacks.insertSurvey': async function feedbacksInsertSurvey(feedBack) {
    check(feedBack, {
      postId: String,
      postType: String,
      feedBackType: String,
      ratingsArrayWithValue: [
        {
          questionIndexNumber: Number,
          questionText: String,
          ratingValue: Number,
          ratingText: String,
        },
      ],
    });

    for (const value of feedBack.ratingsArrayWithValue) {
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
          await Orders.updateAsync(
            { _id: fB.postId },
            { $set: { receivedFeedBack: true } },
          );
          break;
      }
      await FeedBacks.upsertAsync(
        {
          postId: fB.postId,
          postType: fB.postType,
          questionAsked: fB.questionAsked,
        },
        { $set: fB },
      );
    }
    return true;
  },
});

rateLimit({
  methods: ['feedbacks.upsert', 'feedbacks.insertSurvey'],
  limit: 5,
  timeRange: 1000,
});
