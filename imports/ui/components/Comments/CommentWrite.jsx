import React from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import { upsertComment } from '../../../api/Comments/methods';

const saveComment = (postId, postType, userId, commentId, commentAddBoxName, onSave) => {
  const inputName = `[name="${commentAddBoxName}"]`;
  const comment = {
    postType,
    description: document.querySelector(inputName).value,
    postId,
    owner: userId,
  };

  comment._id = commentId || '';

  upsertComment.call(comment, (error, succ) => {
    if (error) {
      toast.error(error.reason);
    } else {
      const message = succ.insertedId ? 'Added Comment' : 'Updated Comment';
      toast.success(message);
      if (onSave) {
        onSave('Update');
      }
    }
  });
};

const CommentWrite = ({
  postId, postType, loggedUserId, expandedComment, onSave,
}) => {
  const value = expandedComment ? expandedComment.description : '';
  const cancelButton = onSave ? (<Button size="sm" className="ms-2" onClick={() => onSave('cancel')}> Cancel </Button>) : '';
  const saveButtonText = onSave ? 'Update' : 'Post';
  const commentId = expandedComment ? expandedComment._id : '';
  const commentAddBoxName = `commentAddBox_${commentId}`;

  return (
    <Row controlId="commentWrite">
      <textarea
        name={commentAddBoxName}
        rows={4}
        placeholder="Write a response ..."
        defaultValue={value}
        className="form-control"
      />
      <ButtonToolbar style={{ marginTop: '1em' }}>
        <Button
          size="sm"
          onClick={() => saveComment(postId, postType, loggedUserId, commentId, commentAddBoxName, onSave)}
        >
          { saveButtonText }
        </Button>
        { cancelButton }
      </ButtonToolbar>
    </Row>
  );
};

CommentWrite.defaultProps = {
  loggedUserId: Meteor.userId(),
};

CommentWrite.propTypes = {
  postId: PropTypes.string.isRequired,
  postType: PropTypes.string.isRequired,
  loggedUserId: PropTypes.string.isRequired,
  expandedComment: PropTypes.string,
  onSave: PropTypes.func,
};

export default CommentWrite;
