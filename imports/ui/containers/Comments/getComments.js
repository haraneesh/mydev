import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';
import constants from '../../../modules/constants';
import CommentsObj from '../../../api/Comments/Comments';
import Comments from '../../components/Comments/Comments';
import Loading from '../../components/Loading/Loading';

const composer = (params, onData) => {
  const subscription = Meteor.subscribe('comments.viewExpanded', params.postId);

  if (subscription.ready()) {
    const attachedComments = CommentsObj.find({}, { sort: { createdAt: constants.Sort.DESCENDING } }).fetch();
    const users = Meteor.users.find({}).fetch();
    onData(null, { comments: attachedComments, commentUsers: users, postId: params.postId });
  }
};

export default composeWithTracker(composer, Loading)(Comments);
