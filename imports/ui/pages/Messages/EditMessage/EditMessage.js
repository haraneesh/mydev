import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Bert } from 'meteor/themeteorchef:bert';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import MessageComments from '../../../components/Messages/MessageComments';
import MessageEditor from '../../../components/Messages/MessageEditor';
import MessageView from '../../../components/Messages/MessageView';

import NotFound from '../../Miscellaneous/NotFound/NotFound';
import constants from '../../../../modules/constants';
import CommentsCollection from '../../../../api/Comments/Comments';

const EditMessage = ({ comments, messageId, history, roles, loggedInUserId }) => {
  const [loadingMessage, setLoadingMessage] = useState(true);
  const [messageEdit, setMessageEdit] = useState(true);

  const [message, setMessage] = useState([]);
  const isAdmin = (roles.indexOf('admin') !== -1);

  useEffect(() => {
    setLoadingMessage(true);
    Meteor.call('message.detail', messageId, (error, msg) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        setMessage(msg);
      }
      setLoadingMessage(false);
    });
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleEditMessage = (msgId) => {
    setMessageEdit((msgId) || '');
  };

  if (message) {
    const isEditMode = (message._id === messageEdit);
    return (
      <div className="EditMessage">
        <h3 className="page-header">
          Message Details
        </h3>
        {(!loadingMessage && isEditMode) && (<MessageEditor existingMessage={message} history={history} isAdmin onsuccessFullUpdate={handleEditMessage} />) }
        {(!loadingMessage && !isEditMode) && (<MessageView existingMessage={message} editMessagePage isAdmin loggedInUserId={loggedInUserId} handleEditMessage={handleEditMessage} />)}
        {(!loadingMessage) && (<MessageComments isAdmin={isAdmin} loggedInUserId={loggedInUserId} existingMessage={message} messageComments={comments} history={history} />)}
      </div>);
  }

  return (<NotFound />);
};

EditMessage.propTypes = {
  comments: PropTypes.array.isRequired,
  messageId: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
  loggedInUserId: PropTypes.bool.isRequired,
  roles: PropTypes.array.isRequired,
};


export default withTracker((args) => {
  const { match, roles, loggedInUserId } = args;
  const messageId = match.params._id;
  const subscription = Meteor.subscribe('comments.view', { postId: messageId, postType: constants.MessageTypes.Message.name });

  return {
    loading: !subscription.ready(),
    messageId,
    comments: CommentsCollection.find({}, { sort: { updatedAt: constants.Sort.DESCENDING } }).fetch(),
    roles,
    loggedInUserId,
  };
})(EditMessage);