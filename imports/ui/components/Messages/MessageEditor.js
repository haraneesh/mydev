/* eslint-disable max-len, no-return-assign */
import { Meteor } from 'meteor/meteor';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup, Button, Panel, Col, Row,
} from 'react-bootstrap';
import Camera, { FACING_MODES, IMAGE_TYPES } from 'react-html5-camera-photo';
import { toast } from 'react-toastify';
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
        toast.error(error.reason);
      } else {
        toast.success('Message deleted!');
      }
    });
  }
};

const MessageEditor = ({
  existingMessage, showOpen, onsuccessFullUpdate, isAdmin, doNotShowClose,
}) => {
  const [showSelectMTypeMsg, setShowSelectMTypeMsg] = useState(false);
  const [isActive, setActive] = useState(!!(existingMessage._id) || showOpen);
  const [message, setMessage] = useState(existingMessage);
  const [showCamera, setShowCamera] = useState(false);
  const [imageDataUri, setImageDataUri] = useState('');
  const msgId = (message && message._id) ? `${message._id}` : 'new';
  const fileUploadId = `${msgId}_filename`;

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
        // toast.error(error.reason);
        toast.error(error.reason);
      } else {
        const confirmation = message ? 'Message updated!' : 'Message added!';
        toast.success(confirmation);
        activateControl(false);
      }
    });
  };

  const handleOnMessageTypeSelect = (e) => {
    const newMessage = { ...message, messageType: e.target.value };
    setMessage(newMessage);
    setShowSelectMTypeMsg(false);
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

  const getImageAttachment = (fileId) => {
    setShowCamera(false);
    document.getElementById(fileId).click();
  };

  const handleImageFileSelect = (fileId) => {
    const fileUploadControl = document.getElementById(fileId);

    const file = fileUploadControl.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageDataUri(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return !isActive
    ? (
      <p>
        <input
          type="text"
          className="form-control"
          rows="1"
          onClick={() => { activateControl(true); }}
          placeholder="Tap to send a message."
        />
      </p>
    )
    : (
      <p>
        <form onSubmit={(e) => e.preventDefault()}>
          <Panel>
            <FormGroup id="msgTypes">
              {(!doNotShowClose) && (
              <Row
                className="panel-heading"
                style={{ padding: '0px', marginBottom: '7px', marginTop: '-5px' }}
              >
                <Col xs={11}>
                  <span className="text-info">
                    {message.ownerName}
                  </span>
                </Col>
                <Col xs={1} className="text-right">
                  <Button
                    className="btn btn-xs btn-link"
                    style={{ float: 'right', fontSize: '1.25em', lineHeight: '1' }}
                    onClick={() => { activateControl(false); }}
                  >
                    <Icon className="text-info" icon="times" />
                  </Button>
                </Col>
              </Row>
              )}

              <fieldset id={message && message._id ? message._id : 'new'}>
                {
            constants.MessageTypes.allowedValues.map((value, index) => {
              const item = constants.MessageTypes[value];
              const isChecked = message.messageType === item.name;
              const radioId = `${msgId}_${index}`;
              return (
                <div key={`key-${value}`}>
                  <input
                    type="radio"
                    name="messageTypeRadios"
                    id={radioId}
                    value={item.name}
                    checked={isChecked}
                    onChange={handleOnMessageTypeSelect}
                  />
                  <label
                    htmlFor={radioId}
                    style={{ display: 'contents' }}
                    className={(isChecked) ? 'text-default' : 'text-muted'}
                  >
                    <i className={item.iconClass} style={{ minWidth: '2em' }} />
                    {item.display_value}
                  </label>
                </div>
              );
            })
          }
              </fieldset>
              {(showSelectMTypeMsg) && (
              <label id="msgTypes-error" className="alert-warning" htmlFor="msgTypes">
                To whom do you wish to share?
              </label>
              ) }
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
                  placeholder="Today is your day. What is on your mind?"
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
                <Col xs={5}>
                  <Button
                    bsStyle="link"
                    onClick={() => { setShowCamera(!showCamera); }}
                    style={{
                      paddingTop: '0px', marginLeft: '0px', fontSize: '1.7em',
                    }}
                  >
                    <Icon icon="camera" />
                  </Button>
                  <Button
                    bsStyle="link"
                    onClick={() => { getImageAttachment(fileUploadId); }}
                    style={{
                      paddingTop: '5px', marginLeft: '0px', fontSize: '1.4em',
                    }}
                  >
                    <Icon icon="paperclip" />
                    <input
                      type="file"
                      id={fileUploadId}
                      onChange={() => {
                        handleImageFileSelect(fileUploadId);
                      }}
                      accept=".jpg,.jpeg,.png"
                      style={{ display: 'none' }}
                    />
                  </Button>

                </Col>
                <Col xs={7} className="text-right" style={{ paddingTop: '0.5em' }}>
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
                    {message && message._id ? 'Update' : 'Share'}
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
  doNotShowClose: false,
};

MessageEditor.propTypes = {
  existingMessage: PropTypes.object,
  showOpen: PropTypes.bool,
  doNotShowClose: PropTypes.bool,
  isAdmin: PropTypes.bool,
  onsuccessFullUpdate: PropTypes.func,
};

export default MessageEditor;
