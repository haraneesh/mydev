/* eslint-disable max-len, no-return-assign */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import {
  FormGroup, Button, Panel, Col,
} from 'react-bootstrap';

import './Message.scss';

const handleRemove = (commentId, postId) => {
  if (confirm('Are you sure? This is permanent!')) {
    Meteor.call('messages.removeComment', { commentId, postId }, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Comment deleted!', 'success');
      }
    });
  }
};

const MessageCommentEditor = ({ existingMessage, existingComment, onsuccessFullUpdate }) => {
  const [comment, setComment] = useState(existingComment);

  const handleCommentSubmit = () => {
    const methodToCall = comment._id ? 'messages.updateComment' : 'messages.addComment';

    const msg = {
      postId: existingMessage._id,
      commentText: comment.description,
    };

    if (comment._id) {
      msg.commentId = comment._id;
    }

    Meteor.call(methodToCall, msg, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        const confirmation = comment ? 'Comments updated!' : 'Comments added!';
        Bert.alert(confirmation, 'success');
        setComment({ ...comment, description: '' });
        if (onsuccessFullUpdate) {
          onsuccessFullUpdate();
        }
      }
    });
  };

  const handleCommentUpdate = (e) => {
    setComment({ ...comment, description: e.target.value });
  };

  const isEdit = (comment && comment._id);
  return (
    <div>
      <Panel className="commentBackGround">
        <Col xs={7} style={{ paddingBottom: '10px' }}>
          <div className="text-info panel-heading" style={{ padding: '0px', marginBottom: '7px' }}>
            {isEdit ? 'Edit Reply' : 'Your reply' }
          </div>
        </Col>
        <Col xs={5} className="text-right">
          {(isEdit) && (
          <Button
            className="btn btn-xs btn-info"
            style={{ float: 'right' }}
            onClick={() => { onsuccessFullUpdate(); }}
          >
            cancel
          </Button>
          )}
        </Col>
        <FormGroup>
          <textarea
            className="form-control"
            name="comment"
            rows="4"
            value={comment && comment.description}
            onChange={handleCommentUpdate}
            placeholder="Would you like to respond ..."
          />
        </FormGroup>
        {(isEdit) && <Button className="btn-default btn-sm" onClick={() => { handleRemove(comment._id, comment.postId); }}>Delete</Button>}
        <Button type="submit" bsStyle="primary btn-sm" onClick={handleCommentSubmit} style={{ float: 'right' }}>
          {isEdit ? 'Update' : 'Reply'}
        </Button>
      </Panel>
    </div>
  );
};

MessageCommentEditor.defaultProps = {
  existingComment: { commentType: '', comment: '' },
  showOpen: false,
  onsuccessFullUpdate: undefined,
};

MessageCommentEditor.propTypes = {
  existingMessage: PropTypes.object.isRequired,
  existingComment: PropTypes.object,
  onsuccessFullUpdate: PropTypes.func,
};

export default MessageCommentEditor;
