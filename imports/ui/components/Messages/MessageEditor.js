/* eslint-disable max-len, no-return-assign */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Button, Panel, Col, Row } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import constants from '../../../modules/constants';

const handleRemove = (messageId) => {
  if (confirm('Are you sure? This is permanent!')) {
    Meteor.call('messages.remove', messageId, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Message deleted!', 'success');
      }
    });
  }
};

const MessageEditor = ({ existingMessage, showOpen, onsuccessFullUpdate, editMessagePage, isAdmin }) => {
  const [showSelectMTypeMsg, setShowSelectMTypeMsg] = useState(false);
  const [isActive, setActive] = useState(!!(existingMessage._id) || showOpen);
  const [message, setMessage] = useState(existingMessage);

  const activateControl = (activate) => {
    if (!editMessagePage) {
      setActive(activate);
    }
    if (onsuccessFullUpdate) {
      onsuccessFullUpdate();
    }
  };

  const handleSubmit = () => {
    const methodToCall = message._id ? 'messages.update' : 'messages.insert';

    let msg = {};

    if (!message.messageType) {
      setShowSelectMTypeMsg(true);
      return;
    }

    if (!message._id) {
      msg = {
        messageType: message.messageType,
        message: message.message,
      };
    } else {
      msg = {
        _id: message._id,
        postId: message.postId,
        postType: message.postType,
        messageType: message.messageType,
        message: message.message,
        messageStatus: message.messageStatus,
      };
    }

    Meteor.call(methodToCall, msg, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        const confirmation = message ? 'Message updated!' : 'Message added!';
        Bert.alert(confirmation, 'success');
        activateControl(false);
      }
    });
  };

  const handleOnMessageTypeSelect = (e) => {
    const newMessage = { ...message, messageType: e.target.value };
    setMessage(newMessage);
  };

  const handleMessageUpdate = (e) => {
    setMessage({ ...message, message: e.target.value });
  };

  const handleCheckClicked = (e) => {
    const messageStatus = (e.target.checked) ? constants.MessageStatus.Closed.name : constants.MessageStatus.Open.name;
    setMessage({ ...message, messageStatus });
  };

  return !isActive ? (<p><input type="text" className="form-control" rows="1" onClick={() => { activateControl(true); }} placeholder="Tap to send a message." /></p>) :
    (<p><form onSubmit={e => e.preventDefault()}>
      <Panel>
        <FormGroup id="msgTypes">
          <Row className="panel-heading" style={{ padding: '0px', marginBottom: '7px' }}>
            <Col xs={8}>
              <span className="text-info">
                {message.ownerName}
              </span>
            </Col>
            <Col xs={4} className="text-right">
              {(!editMessagePage) && (<button
                className="btn btn-xs btn-info"
                style={{ float: 'right' }}
                onClick={() => { activateControl(false); }}
              >
                cancel
              </button>)}
            </Col>
          </Row>
          {
            constants.MessageTypes.allowedValues.map((value, index) => {
              const item = constants.MessageTypes[value];
              return (
                <div key={`key-${value}`}>
                  <input
                    type="radio"
                    name="messageTypeRadios"
                    id={index}
                    value={item.name}
                    checked={message.messageType === item.name}
                    onChange={handleOnMessageTypeSelect}
                  />
                  <label htmlFor={index}>
                    <i className={item.iconClass} style={{ minWidth: '2em' }} />
                    {item.display_value}
                  </label>
                </div>
              );
            })
          }
          {(showSelectMTypeMsg) && (<label id="msgTypes-error" className="alert-warning" htmlFor="msgTypes">Please select message type.</label>) }
        </FormGroup>
        <FormGroup>
          <textarea
            className="form-control"
            name="message"
            rows="4"
            defaultValue={message && message.message}
            onChange={handleMessageUpdate}
            placeholder="Today is your day. Let us know how Suvai can help you."
          />
        </FormGroup>
        {isAdmin && message.messageType === constants.MessageTypes.Issue.name && (<FormGroup>
          <input type="checkbox" id="closeMessage" name="CloseMessage" value="closeMessage" onClick={handleCheckClicked} checked={message.messageStatus === constants.MessageStatus.Closed.name} />
          <label htmlFor="closeMessage">Mark this issue as resolved</label>
        </FormGroup>)}
        {(message && message._id) && <Button className="btn-default btn-sm" onClick={() => { handleRemove(message._id); }}>Delete</Button>}
        <Button type="submit" bsStyle="primary btn-sm" onClick={handleSubmit} style={{ float: 'right' }}>
          {message && message._id ? 'Update' : 'Send Message'}
        </Button>
      </Panel>
    </form></p>);
};

MessageEditor.defaultProps = {
  existingMessage: { messageType: '', message: '' },
  showOpen: false,
  onsuccessFullUpdate: undefined,
  editMessagePage: false,
  isAdmin: false,
};

MessageEditor.propTypes = {
  existingMessage: PropTypes.object,
  showOpen: PropTypes.bool,
  isAdmin: PropTypes.bool,
  onsuccessFullUpdate: PropTypes.func,
  editMessagePage: PropTypes.bool,
};

export default MessageEditor;
