/* eslint-disable max-len, no-return-assign */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Button, Panel } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';

const handleRemove = (commentId) => {
  if (confirm('Are you sure? This is permanent!')) {
    Meteor.call('comments.remove', commentId, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Comment deleted!', 'success');
      }
    });
  }
};

const MessageCommentEditor = ({ existingComment, showOpen, onsuccessFullUpdate }) => {
  const [showSelectMTypeMsg, setShowSelectMTypeMsg] = useState(false);
  const [isActive, setActive] = useState(!!(existingComment._id) || showOpen);
  const [comment, setComment] = useState(existingComment);

  const activateControl = (activate) => {
    setActive(activate);
    if (onsuccessFullUpdate) {
      onsuccessFullUpdate();
    }
  };

  const handleSubmit = () => {
    const methodToCall = comment._id ? 'comments.update' : 'comments.insert';

    let msg = {};

    if (!comment.commentType) {
      setShowSelectMTypeMsg(true);
      return;
    }

    if (!comment._id) {
      msg = {
        commentType: comment.commentType,
        comment: comment.comment,
      };
    } else {
      msg = {
        _id: comment._id,
        postId: comment.postId,
        postType: comment.postType,
        commentType: comment.commentType,
        comment: comment.comment,
        commentStatus: comment.commentStatus,
      };
    }

    Meteor.call(methodToCall, msg, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        const confirmation = comment ? 'Comments updated!' : 'Comments added!';
        Bert.alert(confirmation, 'success');
        activateControl(false);
      }
    });
  };

  const handleOnCommentTypeSelect = (e) => {
    const newComment = { ...comment, commentType: e.target.value };
    setComment(newComment);
  };

  const handleCommentUpdate = (e) => {
    setComment({ ...comment, comment: e.target.value });
  };

  return !isActive ? (<p><input type="text" className="form-control" rows="1" onClick={() => { activateControl(true); }} placeholder="Tap to send a comment." /></p>) :
    (<p><form onSubmit={e => e.preventDefault()}>
      <Panel>
        <FormGroup id="msgTypes">
          <button
            className="btn btn-xs btn-info"
            style={{ top: '-7px', position: 'relative', float: 'right' }}
            onClick={() => { activateControl(false); }}
          >
            close
          </button>
        </FormGroup>
        <FormGroup>
          <textarea
            className="form-control"
            name="comment"
            rows="4"
            defaultValue={comment && comment.comment}
            onChange={handleCommentUpdate}
            placeholder="You can say something ..."
          />
        </FormGroup>
        {(comment && comment._id) && <Button className="btn-default btn-sm" onClick={() => { handleRemove(comment._id); }}>Delete</Button>}
        <Button type="submit" bsStyle="primary btn-sm" onClick={handleSubmit} style={{ float: 'right' }}>
          {comment && comment._id ? 'Update' : 'Reply'}
        </Button>
      </Panel>
    </form></p>);
};

MessageCommentEditor.defaultProps = {
  existingComment: { commentType: '', comment: '' },
  showOpen: false,
  onsuccessFullUpdate: undefined,
};

MessageCommentEditor.propTypes = {
  existingComment: PropTypes.object,
  showOpen: PropTypes.bool,
  onsuccessFullUpdate: PropTypes.func,
};

export default MessageCommentEditor;
