import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Label } from 'react-bootstrap';
import * as timeago from 'timeago.js';
import constants from '../../../modules/constants';
import { dateSettings } from '../../../modules/settings';

import './MessageView.scss';

const MessageView = ({ existingMessage, handleEditMessage }) => {
  const { messageStatus, updatedAt, messageType, message, _id } = existingMessage;
  const isClosed = constants.MessageStatus.Closed.name === messageStatus;
  const isIssue = constants.MessageTypes.Issue.name === messageType;
  return (
    <p className="messageView" key={_id}>
      <div className="list-group-item from-message">
        <Row>
          <Col xs={6} style={{ paddingBottom: '10px' }}>
            {(isIssue) && (<small>
              <Label bsStyle={constants.MessageStatus[messageStatus].label}>
                {constants.MessageStatus[messageStatus].display_value}
              </Label>
            </small>)}
          </Col>
          <Col xs={6} style={{ textAlign: 'right' }}>
            <small className="text-muted">{timeago.format(updatedAt, dateSettings.timeZone)}</small> &nbsp;
            <i className={`text-muted ${constants.MessageTypes[messageType].iconClass}`} />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            {message}
          </Col>
        </Row>
        <Row>
          <Col xs={12} className="text-right" style={{ paddingBottom: (isClosed) ? '1.5em' : '' }}>
            {(!isClosed) && (<button className="btn btn-info btn-xs" id={`id-${_id}`} onClick={() => { handleEditMessage(_id); }}>edit</button>)}
          </Col>
        </Row>
      </div>
    </p>);
};

MessageView.propTypes = {
  existingMessage: PropTypes.object.isRequired,
  handleEditMessage: PropTypes.func.isRequired,
};

export default MessageView;
