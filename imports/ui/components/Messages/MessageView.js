import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Label, Button } from 'react-bootstrap';
import * as timeago from 'timeago.js';
import constants from '../../../modules/constants';
import { dateSettings } from '../../../modules/settings';
import { MessageImageViewHero } from './MessageImageUpload';

import './Message.scss';

const MessageView = ({
  existingMessage, handleEditMessage, editMessagePage, isAdmin, loggedInUserId, history,
}) => {
  const {
    messageStatus, updatedAt, messageType, message, ownerName, commentCount, _id,
  } = existingMessage;
  const canEditMsg = (isAdmin || loggedInUserId === message.owner);
  const isClosed = constants.MessageStatus.Closed.name === messageStatus;
  const isIssue = constants.MessageTypes.Issue.name === messageType;
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
          <Col xs={6} className="text-left text-muted" style={{ padding: '10px 0px 0px 5px' }}>

            <Button bsStyle="link" className="btn btn-sm" onClick={() => { history.push(`/messages/${_id}/edit`); }}>
              {(commentCount && commentCount > 0)
                ? commentCount
                : 'No' }
              {' '}
              replies
            </Button>

          </Col>
          <Col xs={6} className="text-right" style={{ padding: '10px 5px 0px 0px' }}>

            {(!isClosed && !!canEditMsg) && (
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
  editMessagePage: false,
  isAdmin: false,
};

MessageView.propTypes = {
  history: PropTypes.object.isRequired,
  existingMessage: PropTypes.object.isRequired,
  handleEditMessage: PropTypes.func.isRequired,
  loggedInUserId: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool,
  editMessagePage: PropTypes.bool,
};

export default MessageView;
