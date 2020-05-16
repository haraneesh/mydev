import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'react-bootstrap';
import MessageCommentEditor from './MessageCommentEditor';
import MessageCommentView from './MessageCommentView';

const MessageComments = ({ messageComments, history }) => {
  const [editMessage, setEditMessage] = useState('');

  const handleEditMessage = (id) => {
    setEditMessage(id);
  };

  const handleMessageUpdate = () => {
    setEditMessage('');
  };

  return (
    <div className="MessagesComments">
      <div className="page-header clearfix">
        <h3>MessagesComments</h3>
      </div>

      <MessageCommentEditor history={history} />
      {messageComments.length ?
        messageComments.map(msg => (<p key={msg._id}>
          {
            (editMessage === msg._id) ?
              (<MessageCommentEditor
                history={history}
                existingMessage={msg}
                showOpen
                onsuccessFullUpdate={handleMessageUpdate}
              />
              ) :
              (<MessageCommentView existingMessage={msg} history={history} handleEditMessage={handleEditMessage} />)
          }
        </p>
        )) : <Alert bsStyle="warning">No messageComments yet!</Alert>}
    </div>);
};

export default MessageComments;

MessageComments.deaultProps = {
  isAdmin: false,
};

MessageComments.propTypes = {
  isAdmin: PropTypes.bool,
  loggedInUserId: PropTypes.string.isRequired,
  messageComments: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
};
