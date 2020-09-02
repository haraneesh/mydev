/* eslint-disable max-len, no-return-assign */
import { Meteor } from 'meteor/meteor';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup, Button, Panel, Col, Row,
} from 'react-bootstrap';
import Camera, { FACING_MODES, IMAGE_TYPES } from 'react-html5-camera-photo';
import { Bert } from 'meteor/themeteorchef:bert';
import Icon from '../Icon/Icon';
import uploadImage, { deleteImage, MessageImageViewHero } from './MessageImageUpload';
import constants from '../../../modules/constants';

import './Message.scss';

const handleRemove = async (messageId, imageId) => {
  if (confirm('Are you sure? This is permanent!')) {
    if (imageId) {
      await deleteImage(imageId);
    }

    Meteor.call('messages.remove', messageId, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Message deleted!', 'success');
      }
    });
  }
};

const MessageEditor = ({
  existingMessage, showOpen, onsuccessFullUpdate, isAdmin,
}) => {
  const [showSelectMTypeMsg, setShowSelectMTypeMsg] = useState(false);
  const [isActive, setActive] = useState(!!(existingMessage._id) || showOpen);
  const [message, setMessage] = useState(existingMessage);
  const [showCamera, setShowCamera] = useState(false);
  const [imageDataUri, setImageDataUri] = useState('');

  const activateControl = (activate) => {
    setActive(activate);

    if (!activate) {
      setImageDataUri('');
    }

    if (onsuccessFullUpdate) {
      onsuccessFullUpdate();
    }
  };

  const handleSubmit = async () => {
    if (!message.messageType) {
      setShowSelectMTypeMsg(true);
      return;
    }

    let imageId = (existingMessage.imageId) ? existingMessage.imageId : '';
    if (imageDataUri) {
      const publicId = await uploadImage({
        imageData: imageDataUri,
        imageId,
      });
      imageId = publicId;
    }

    const methodToCall = message._id ? 'messages.update' : 'messages.insert';
    let msg = {};

    if (!message._id) {
      msg = {
        messageType: message.messageType,
        message: message.message,
        imageId,
      };
    } else {
      msg = {
        _id: message._id,
        postId: message.postId,
        postType: message.postType,
        messageType: message.messageType,
        message: message.message,
        messageStatus: message.messageStatus,
        imageId,
      };
    }

    // if id exists - pass it on to override default

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

  const handleTakePhoto = (uri) => {
    setImageDataUri(uri);
    setShowCamera(false);
  };

  return !isActive ? (<p><input type="text" className="form-control" rows="1" onClick={() => { activateControl(true); }} placeholder="Tap to send a message." /></p>)
    : (
      <p>
        <form onSubmit={(e) => e.preventDefault()}>
          <Panel>
            <FormGroup id="msgTypes">
              <Row className="panel-heading" style={{ padding: '0px', marginBottom: '7px', marginTop: '-5px' }}>
                <Col xs={11}>
                  <span className="text-info">
                    {message.ownerName}
                  </span>
                </Col>
                <Col xs={1} className="text-right">
                  <Button
                    className="btn btn-xs btn-link"
                    style={{ float: 'right', fontSize: '1.5em' }}
                    onClick={() => { activateControl(false); }}
                  >
                    <Icon icon="times" />
                  </Button>
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

            {isAdmin && message.messageType === constants.MessageTypes.Issue.name && (
            <FormGroup>
              <input
                type="checkbox"
                id="closeMessage"
                name="CloseMessage"
                value="closeMessage"
                onClick={handleCheckClicked}
                checked={message.messageStatus === constants.MessageStatus.Closed.name}
              />
              <label htmlFor="closeMessage">Mark this issue as resolved</label>
            </FormGroup>
            )}

            {(!showCamera && imageDataUri) && (
              <img src={imageDataUri} className="camera-photo" alt="preview" style={{ marginBottom: '5px' }} />
            )}

            {(!showCamera && !imageDataUri && message.imageId) && (
              <MessageImageViewHero cloudImageId={message.imageId} />
            )}

            {(showCamera) && (
            <Col xs={12} />
            )}

            <FormGroup>
              <Col xs={12}>
                {!showCamera && (
                <textarea
                  className="form-control"
                  name="message"
                  rows="4"
                  defaultValue={message && message.message}
                  onChange={handleMessageUpdate}
                  placeholder="Today is your day. Let us know how Suvai can help you."
                />
                )}
                {showCamera && (
                <Camera
                  onTakePhoto={(dataUri) => { handleTakePhoto(dataUri); }}
                  imageCompression={1}
                  idealFacingMode={FACING_MODES.ENVIRONMENT}
                  imageType={IMAGE_TYPES.JPG}
                />
                )}

              </Col>

              <Row>
                <Col xs={2} style={{ minWidth: '3em' }} className="text-center">
                  <Button
                    bsStyle="link"
                    onClick={() => { setShowCamera(!showCamera); }}
                    style={{
                      paddingLeft: '0px', paddingTop: '0px', marginLeft: '0px', fontSize: '2em',
                    }}
                  >
                    <Icon icon="camera" />
                  </Button>
                </Col>
                <Col xs={10} className="text-right" style={{ paddingTop: '0.5em' }}>
                  {(message && message._id) && (
                  <Button
                    className="btn-default btn-sm"
                    onClick={() => { handleRemove(message._id, message.imageId); }}
                  >
                    Delete
                  </Button>
                  )}

                  <Button
                    type="submit"
                    bsStyle="primary btn-sm"
                    style={{ marginLeft: '5px' }}
                    onClick={handleSubmit}
                  >
                    {message && message._id ? 'Update' : 'Send Message'}
                  </Button>
                </Col>
              </Row>

            </FormGroup>

          </Panel>
        </form>
      </p>
    );
};

MessageEditor.defaultProps = {
  existingMessage: { messageType: '', message: '' },
  showOpen: false,
  onsuccessFullUpdate: undefined,
  isAdmin: false,
};

MessageEditor.propTypes = {
  existingMessage: PropTypes.object,
  showOpen: PropTypes.bool,
  isAdmin: PropTypes.bool,
  onsuccessFullUpdate: PropTypes.func,
};

export default MessageEditor;
