import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Comments from '../Comments';

Meteor.publish('comments.list', () => Comments.find());

Meteor.publish('comments.view', (postId) => {
  check(postId, String);
  return Comments.find({ postId });
});


Meteor.publishComposite('comments.viewExpanded', (postId) => {
  check(postId, String);
  return {
    find() {
      return Comments.find({ postId });
    },
    children: [{
      find(comment) {
        return Meteor.users.find({ _id: comment.owner }, { fields: { _id: 1, 'profile.name': 1 } });
      },
    }],
  };
});
