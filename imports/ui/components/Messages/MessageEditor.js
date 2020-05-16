/* eslint-disable max-len, no-return-assign */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Button, Panel, Row } from 'react-bootstrap';
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

const MessageEditor = ({ existingMessage, showOpen, onsuccessFullUpdate }) => {
  const [showSelectMTypeMsg, setShowSelectMTypeMsg] = useState(false);
  const [isActive, setActive] = useState(!!(existingMessage._id) || showOpen);
  const [message, setMessage] = useState(existingMessage);

  const activateControl = (activate) => {
    setActive(activate);
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

  return !isActive ? (<p><input type="text" className="form-control" rows="1" onClick={() => { activateControl(true); }} placeholder="Tap to send a message." /></p>) :
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
};

MessageEditor.propTypes = {
  existingMessage: PropTypes.object,
  showOpen: PropTypes.bool,
  onsuccessFullUpdate: PropTypes.func,
};

export default MessageEditor;
