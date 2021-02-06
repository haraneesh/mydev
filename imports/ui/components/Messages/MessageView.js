import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import {
  Row, Col, Label,
} from 'react-bootstrap';
import * as timeago from 'timeago.js';
import { toast } from 'react-toastify';
import Icon from '../Icon/Icon';
import constants from '../../../modules/constants';
import { dateSettings } from '../../../modules/settings';

import { MessageImageViewHero } from './MessageImageUpload';

import './Message.scss';

const MessageView = ({
  existingMessage, handleEditMessage, editMessagePage, isAdmin, history, loggedInUserId,
}) => {
  const {
    messageStatus,
    updatedAt,
    messageType,
    message,
    owner,
    ownerName,
    commentCount,
    _id,
    likeMemberId,
  } = existingMessage;

  const canEditMsg = (isAdmin || loggedInUserId === owner);
  const isClosed = constants.MessageStatus.Closed.name === messageStatus;
  const isIssue = constants.MessageTypes.Issue.name === messageType;
  const [userLikes, setUserLikes] = useState(likeMemberId);

  const updateLikeClick = (messageId) => {
    Meteor.call('messages.updateLike', messageId, (error, usersWhoLiked) => {
      if (error) {
        toast.error(error.reason);
      } else {
        setUserLikes(usersWhoLiked);
      }
    });
  };

  const addLikeClicks = (messageId) => {
    const howManyLikes = Number(prompt('How Many Likes? (number)'));
    Meteor.call('messages.addLikes', { messageId, howManyLikes }, (error) => {
      if (error) {
        toast.error(error.reason);
      }
    });
  };

  return (
    <div className="messageView" key={_id}>
      <div className="list-group-item">
        <Row>
          <Col xs={7} style={{ paddingBottom: '10px' }}>
            <div className="text-info panel-heading" style={{ padding: '0px', marginBottom: '7px' }}>
              <i className={`text-muted ${constants.MessageTypes[messageType].iconClass}`} />
              {' '}
              {ownerName}
            </div>
          </Col>
          <Col xs={5} style={{ textAlign: 'right' }}>
            {(isIssue) && (
            <small>
              <Label bsStyle={constants.MessageStatus[messageStatus].label} style={{ marginRight: '5px' }}>
                {constants.MessageStatus[messageStatus].display_value}
              </Label>
            </small>
            )}
            <small className="text-muted">{timeago.format(updatedAt, dateSettings.timeZone)}</small>
          </Col>
        </Row>
        <Row>
          <Col xs={12} style={{ paddingBottom: '5px' }}>
            {message}
          </Col>
          {existingMessage.imageId && (
          <Col xs={12}>
            <MessageImageViewHero cloudImageId={existingMessage.imageId} />
          </Col>
          )}

        </Row>
        {(!editMessagePage) && (
        <Row>
          <Col xs={6} className="text-left" style={{ padding: '10px 0px 0px 5px' }}>

            <button
              type="button"
              style={{ background: 'transparent', border: 'none', outline: '0' }}
              onClick={() => { history.push(`/messages/${_id}/edit`); }}
            >
              <Icon icon="comment" />
              {(commentCount && commentCount > 0) ? ` ${commentCount}` : ' 0'}
            </button>

            <button
              type="button"
              style={{ background: 'transparent', border: 'none', outline: '0' }}
              onClick={() => { updateLikeClick(_id); }}
            >
              <span className={(userLikes.indexOf(loggedInUserId) > -1) ? 'text-primary' : 'text-default'}>
                <Icon icon="heart" />
              </span>
              {(userLikes) ? ` ${userLikes.length}` : ' 0'}
            </button>

            {isAdmin && (
            <button
              type="button"
              style={{ background: 'transparent', border: 'none', outline: '0' }}
              onClick={() => { addLikeClicks(_id); }}
            >
              <span>
                <Icon icon="plus-square" />
              </span>
            </button>
            )}

          </Col>
          <Col xs={6} className="text-right" style={{ padding: '10px 5px 0px 0px' }}>

            {((!isClosed && !!canEditMsg) || isAdmin) && (
            <button
              type="button"
              className="btn btn-default btn-sm"
              style={{ marginLeft: '5px' }}
              id={`editId-${_id}`}
              onClick={() => { handleEditMessage(_id); }}
            >
              edit
            </button>
            )}

            <button
              type="button"
              className="btn btn-info btn-sm"
              style={{ marginLeft: '5px' }}
              id={`replyId-${_id}`}
              onClick={() => { history.push(`/messages/${_id}/edit`); }}
            >
              reply
            </button>

          </Col>
        </Row>
        )}
      </div>
    </div>
  );
};

MessageView.defaultProps = {
  loggedInUserId: Meteor.user()._id,
  editMessagePage: false,
  isAdmin: false,
};

MessageView.propTypes = {
  history: PropTypes.object.isRequired,
  existingMessage: PropTypes.object.isRequired,
  handleEditMessage: PropTypes.func.isRequired,
  loggedInUserId: PropTypes.string,
  isAdmin: PropTypes.bool,
  editMessagePage: PropTypes.bool,
};

export default MessageView;
