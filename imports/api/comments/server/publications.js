import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Comments from '../comments';

Meteor.publish('comments.list', () => Comments.find());

Meteor.publish('comments.view', (postId) => {
  check(postId, String);
  return Comments.find({postId:postId});
});


Meteor.publishComposite('comments.viewExpanded', function(postId) {
  check(postId, String);
  const userId = this.userId;
  return {
    find() {
      return Comments.find({postId:postId});
    },
    children: [{
      find(comment) {
        return Meteor.users.find({ _id: comment.owner }, {fields: {'_id': 1, 'profile.name': 1}});
      }
    }]
  };
});