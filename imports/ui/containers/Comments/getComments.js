import React from 'react';
import { useTracker, useSubscribe } from 'meteor/react-meteor-data'; 
import CommentsObj from '../../../api/Comments/Comments';
import Comments from '../../components/Comments/Comments';
import Loading from '../../components/Loading/Loading';
import constants from '../../../modules/constants';

const compose = (params) => {
  const isLoading = useSubscribe(
    'comments.viewExpanded',
    { postId: params.postId, postType: params.postType }
  );

  const attachedComments = useTracker(() => CommentsObj.find(
    {}, { sort: { createdAt: constants.Sort.DESCENDING } },
  ).fetch()
);

  if (isLoading()) {
    return (<Loading />);
  }

  const users = Meteor.users.find({}).fetch();
  return (
  <Comments comments= {attachedComments}
    commentUsers= {users}
    postId= {params.postId}
    postType= {params.postType}
    loggedUserId= {params.loggedUserId}
  />); 
};

export default compose;