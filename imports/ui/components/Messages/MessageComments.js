import React, { useState } from 'react';
import PropTypes from 'prop-types';
import MessageCommentEditor from './MessageCommentEditor';
import MessageCommentView from './MessageCommentView';

const MessageComments = ({ existingMessage, messageComments, history, isAdmin, loggedInUserId }) => {
  const [editMessage, setEditComment] = useState('');

  const handleEditComment = (commentId) => {
    setEditComment(commentId);
  };

  const handleCommentUpdate = () => {
    setEditComment('');
  };

  return (
    <div className="MessagesComments">
      <MessageCommentEditor
        history={history}
        isAdmin={isAdmin}
        loggedInUserId={loggedInUserId}
        existingMessage={existingMessage}
        showOpen
      />


      {messageComments.length ?
        messageComments.map(comment => (<p key={comment._id}>
          {
            (editMessage === comment._id) ?
              (<MessageCommentEditor
                history={history}
                existingComment={comment}
                isAdmin={isAdmin}
                loggedInUserId={loggedInUserId}
                existingMessage={existingMessage}
                showOpen
                onsuccessFullUpdate={handleCommentUpdate}
              />
              ) :
              (<MessageCommentView
                comment={comment}
                isAdmin={isAdmin}
                loggedInUserId={loggedInUserId}
                handleEditComment={handleEditComment}
              />)
          }
        </p>
        )) : <div />}
    </div>);
};

export default MessageComments;

MessageComments.defaultProps = {
  isAdmin: false,
};

MessageComments.propTypes = {
  isAdmin: PropTypes.bool,
  loggedInUserId: PropTypes.string.isRequired,
  existingMessage: PropTypes.object.isRequired,
  messageComments: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
};
