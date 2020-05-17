import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Label } from 'react-bootstrap';
import * as timeago from 'timeago.js';
import constants from '../../../modules/constants';
import { dateSettings } from '../../../modules/settings';

import './Message.scss';

const MessageView = ({ existingMessage, handleEditMessage, editMessagePage, history }) => {
  const { messageStatus, updatedAt, messageType, message, ownerName, _id } = existingMessage;
  const isClosed = constants.MessageStatus.Closed.name === messageStatus;
  const isIssue = constants.MessageTypes.Issue.name === messageType;
  return (
    <p className="messageView" key={_id}>
      <div className="list-group-item">
        <Row>
          <Col xs={7} style={{ paddingBottom: '10px' }}>
            <div className="text-info panel-heading" style={{ padding: '0px', marginBottom: '7px' }}>
              <i className={`text-muted ${constants.MessageTypes[messageType].iconClass}`} /> &nbsp;
              {ownerName}
            </div>
          </Col>
          <Col xs={5} style={{ textAlign: 'right' }}>
            {(isIssue) && (<small>
              <Label bsStyle={constants.MessageStatus[messageStatus].label} style={{ marginRight: '5px' }}>
                {constants.MessageStatus[messageStatus].display_value}
              </Label>
            </small>)}
            <small className="text-muted">{timeago.format(updatedAt, dateSettings.timeZone)}</small>
            {(!isClosed && !editMessagePage) && (<button className="btn btn-info btn-xs" style={{ marginLeft: '5px' }} id={`id-${_id}`} onClick={() => { handleEditMessage(_id); }}>edit</button>)}
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            {message}
          </Col>
        </Row>
        <Row>
          <Col xs={12} className="text-right" style={{ paddingBottom: (isClosed || editMessagePage) ? '1.5em' : '' }} />
        </Row>
        {(!editMessagePage) && (<Row className="commentBackGround">
          <Col xs={12}>
            <input
              type="text"
              className="form-control"
              style={{ width: '100%', padding: '5px 5px', margin: '5px 5px' }}
              placeholder="Have something to say..."
              onClick={() => { history.push(`/messages/${_id}/edit`); }}
            />
          </Col>
        </Row>)}
      </div>
    </p>);
};

MessageView.defaultProps = {
  editMessagePage: false,
};

MessageView.propTypes = {
  history: PropTypes.object.isRequired,
  existingMessage: PropTypes.object.isRequired,
  handleEditMessage: PropTypes.func.isRequired,
  loggedInUser: PropTypes.object.isRequired,
  editMessagePage: PropTypes.bool,
};

export default MessageView;
