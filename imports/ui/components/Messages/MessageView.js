import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
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
    <Card className="messageView p-2" key={_id}>
      <div className="list-group-item">
        <Row>
          <Col xs={7} style={{ paddingBottom: '10px' }}>
            <div className="d-flex text-black-50">
              <Icon type="mt" icon={`${constants.MessageTypes[messageType].iconClass}`} className="pe-2" />
              {ownerName}
            </div>
          </Col>
          <Col xs={5} style={{ textAlign: 'right' }}>
            {(isIssue) && (
            <small>
              <label className={`${constants.MessageStatus[messageStatus].label}`} style={{ marginRight: '5px' }}>
                {constants.MessageStatus[messageStatus].display_value}
              </label>
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

            <Button
              onClick={() => { history.push(`/messages/${_id}/edit`); }}
              className="bg-body btn-sm pe-1 text-info"
              style={{ border: 'none', width: '4em' }}
            >
              <Icon icon="comment" type="mt" className={(commentCount && commentCount > 0) ? 'icon-fill fs-3' : 'fs-3'} />
              <span>
                {(commentCount && commentCount > 0) ? ` ${commentCount}` : ' 0'}
              </span>
            </Button>

            <Button

              onClick={() => { updateLikeClick(_id); }}
              className="bg-body btn-sm pe-1 text-info"
              style={{ border: 'none', width: '4em' }}
            >
              <Icon icon="favorite" type="mt" className={(userLikes.indexOf(loggedInUserId) > -1) ? 'text-secondary icon-fill fs-3' : 'fs-3'} />
              <span>
                {(userLikes) ? ` ${userLikes.length}` : ' 0'}
              </span>
            </Button>

            {isAdmin && (

            <Button

              className="bg-body btn-sm text-info"
              style={{ border: 'none', width: '4em' }}
              onClick={() => { addLikeClicks(_id); }}
            >

              <Icon icon="add_box" type="mt" className="fs-3" />

            </Button>

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
    </Card>
  );
};

MessageView.defaultProps = {
  loggedInUserId: Meteor.user() ? Meteor.user()._id : '',
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
