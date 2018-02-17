import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Comments from '../Comments';

Meteor.publish('comments.list', () => Comments.find());

Meteor.publish('comments.view', (postDetails) => {
  check(postDetails, { postId: String, postType: String });
  return Comments.find({ postId: postDetails.postId, postType: postDetails.postType });
});

Meteor.publishComposite('comments.viewExpanded', (options) => {
  check(options, { postId: String, postType: String });
  return {
    find() {
      return Comments.find({ postId: options.postId, postType: options.postType });
    },
    children: [{
      find(comment) {
        return Meteor.users.find({ _id: comment.owner }, { fields: { _id: 1, 'profile.name': 1 } });
      },
    }],
  };
});
