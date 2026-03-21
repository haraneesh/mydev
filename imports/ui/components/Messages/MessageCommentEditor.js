/* eslint-disable max-len, no-return-assign */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { toast } from 'react-toastify';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

import './Message.scss';

const handleRemove = (commentId, postId) => {
  if (confirm('Are you sure? This is permanent!')) {
    Meteor.call('messages.removeComment', { commentId, postId }, (error) => {
      if (error) {
        toast.error(error.reason);
      } else {
        toast.success('Comment has been deleted');
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
        // toast.error(error.reason);
        toast.error(error.reason);
      } else {
        const confirmation = comment ? 'Comments updated!' : 'Comments added!';
        toast.success(confirmation);
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
      <Card className="commentBackGround p-4">
        <Row>
          <Col xs={7} style={{ paddingBottom: '10px' }}>
            <div className="text-info" style={{ padding: '0px', marginBottom: '7px' }}>
              {isEdit ? 'Edit Reply' : 'Your reply' }
            </div>
          </Col>
          <Col xs={5} className="text-right">
            {(isEdit) && (
            <Button
              className="btn btn-sm btn-info"
              onClick={() => { onsuccessFullUpdate(); }}
            >
              cancel
            </Button>
            )}
          </Col>
          <Row className="col-12">
            <textarea
              className="form-control"
              name="comment"
              rows={4}
              value={comment && comment.description}
              onChange={handleCommentUpdate}
              placeholder="Would you like to respond ..."
            />
          </Row>
          <Col className="text-end">
            {(isEdit) && <Button className="btn-primary btn-sm me-2" onClick={() => { handleRemove(comment._id, comment.postId); }}>Delete</Button>}
            <Button type="submit" className="btn-block btn-sm" variant="secondary" onClick={handleCommentSubmit}>
              {isEdit ? 'Update' : 'Reply'}
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

MessageCommentEditor.defaultProps = {
  existingComment: { commentType: '', comment: '' },
  onsuccessFullUpdate: undefined,
};

MessageCommentEditor.propTypes = {
  existingMessage: PropTypes.object.isRequired,
  existingComment: PropTypes.object,
  onsuccessFullUpdate: PropTypes.func,
};

export default MessageCommentEditor;
