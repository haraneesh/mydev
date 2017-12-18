import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import Comments from './Comments';
import rateLimit from '../../modules/rate-limit';
import constants from '../../modules/constants';

export const upsertComment = new ValidatedMethod({
  name: 'comments.upsert',
  validate: new SimpleSchema({
    _id: { type: String, optional: true },
    postType: { type: String, optional: true },
    description: { type: String, optional: true },
    postId: { type: String, optional: true },
    owner: { type: String, optional: true },
  }).validator(),
  run(commentt) {
    const comment = commentt;
    comment.status = constants.CommentTypes.Approved.name;
    return Comments.upsert({ _id: comment._id }, { $set: comment });
  },
});

export const removeComment = new ValidatedMethod({
  name: 'comments.remove',
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  run({ _id }) {
    Comments.remove(_id);
  },
});

rateLimit({
  methods: [
    upsertComment,
    removeComment,
  ],
  limit: 5,
  timeRange: 1000,
});
