import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import './PrePermissionModal.scss';

const PrePermissionModal = ({ show, onAccept, onDecline }) => {
  return (
    <Modal show={show} onHide={onDecline} centered className="pre-permission-modal">
      <Modal.Header>
        <Modal.Title>
          <i className="fa fa-bell" /> Stay Updated on Your Orders
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="pre-permission-content">
          <p className="pre-permission-intro">
            Great! Your order has been placed successfully. 
          </p>
          <p className="pre-permission-message">
            Enable notifications to receive real-time updates about:
          </p>
          <ul className="pre-permission-benefits">
            <li>
              <i className="fa fa-check-circle" />
              <span>Order confirmation</span>
            </li>
            <li>
              <i className="fa fa-check-circle" />
              <span>Delivery status updates</span>
            </li>
            <li>
              <i className="fa fa-check-circle" />
              <span>Payment confirmations</span>
            </li>
            <li>
              <i className="fa fa-check-circle" />
              <span>Special offers & promotions</span>
            </li>
          </ul>
          <p className="pre-permission-note">
            <i className="fa fa-info-circle" />
            You'll see a system prompt next to allow notifications
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onDecline}>
          Maybe Later
        </Button>
        <Button variant="secondary" onClick={onAccept}>
          Enable Notifications
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PrePermissionModal;
