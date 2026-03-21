import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNotificationPermission } from '../../stores/NotificationPermission';
import './NotificationRequiredModal.scss';

const NotificationRequiredModal = ({ show, onClose, action = 'place orders' }) => {
  const { hasPermission, requestPermission, openSettings, refresh } = useNotificationPermission();

  const handleEnable = () => {
    if (!hasPermission) {
      // Request permission
      requestPermission();
      // Wait a bit then refresh status
      setTimeout(() => {
        refresh();
      }, 2000);
    } else {
      // Permission granted but player ID not registered
      // Could be a timing issue, try refreshing
      refresh();
    }
  };

  const handleOpenSettings = () => {
    openSettings();
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} centered className="notification-required-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fa fa-bell" /> Notifications Required
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="notification-modal-content">
          <p className="notification-modal-intro">
            To <strong>{action}</strong>, you need to enable push notifications. This ensures you receive:
          </p>
          <ul className="notification-benefits">
            <li>
              <i className="fa fa-check-circle" />
              <span>Order confirmation alerts</span>
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
              <span>Special offers and promotions</span>
            </li>
          </ul>
          {hasPermission && (
            <div className="alert alert-info">
              <i className="fa fa-info-circle" />
              <span>
                Notifications are enabled but not fully registered. Please check your internet connection and try again.
              </span>
            </div>
          )}
          {!hasPermission && (
            <p className="text-muted notification-modal-hint">
              <i className="fa fa-lightbulb-o" />
              <small>
                If you previously denied permissions, you may need to enable them in your device settings.
              </small>
            </p>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        {!hasPermission && (
          <Button variant="outline-secondary" onClick={handleOpenSettings}>
            Open Settings
          </Button>
        )}
        <Button variant="primary" onClick={handleEnable}>
          {hasPermission ? 'Refresh Status' : 'Enable Notifications'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NotificationRequiredModal;
