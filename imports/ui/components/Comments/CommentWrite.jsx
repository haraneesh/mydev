import React from 'react';
import PropTypes from 'prop-types';
import { Bert } from 'meteor/themeteorchef:bert';
import { FormGroup, FormControl, Button, ButtonToolbar } from 'react-bootstrap';
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
      Bert.alert(error.reason, 'danger');
    } else {
      const message = succ.insertedId ? 'Added Comment' : 'Updated Comment';
      Bert.alert(message, 'success');
      if (onSave) {
        onSave('Update');
      }
    }
  });
};

const CommentWrite = ({ postId, postType, loggedUserId, expandedComment, onSave }) => {
  const value = expandedComment ? expandedComment.description : '';
  const cancelButton = onSave ? (<Button bsSize="small" onClick={() => onSave('cancel')} > Cancel </Button>) : '';
  const saveButtonText = onSave ? 'Update' : 'Post';
  const commentId = expandedComment ? expandedComment._id : '';
  const commentAddBoxName = `commentAddBox_${commentId}`;

  return (
    <FormGroup controlId="commentWrite">
      <FormControl
        name={commentAddBoxName}
        componentClass="textarea"
        rows="2"
        placeholder="Write a response ..."
        defaultValue={value}
      />
        <ButtonToolbar >
        <Button
          bsSize="small"
          className="btn-primary"
          onClick={() => saveComment(postId, postType, loggedUserId, commentId, commentAddBoxName, onSave)}
        > { saveButtonText } </Button>
        { cancelButton }
      </ButtonToolbar >
    </FormGroup>
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

