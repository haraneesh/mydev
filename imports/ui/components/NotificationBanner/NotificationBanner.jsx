import React from 'react';
import { Meteor } from 'meteor/meteor';
import { useNotificationPermission } from '../../stores/NotificationPermission';
import './NotificationBanner.scss';

const NotificationBanner = () => {
  const { hasPermission, hasPlayerId, requestPermission, openSettings } = useNotificationPermission();

  // Don't show if notifications are properly set up
  if (hasPermission && hasPlayerId) return null;

  // Don't show on web
  if (!Meteor.isCordova) return null;

  const handleAction = () => {
    if (!hasPermission) {
      // Need to request permission first
      requestPermission();
    } else if (!hasPlayerId) {
      // Permission granted but player ID not registered - might need to wait or refresh
      openSettings();
    }
  };

  const getMessage = () => {
    if (!hasPermission) {
      return {
        title: 'Enable Notifications',
        description: 'Get real-time updates on your orders, deliveries, and special offers'
      };
    } else if (!hasPlayerId) {
      return {
        title: 'Notifications Not Active',
        description: 'Please check your connection or refresh to activate notifications'
      };
    }
  };

  const message = getMessage();

  return (
    <div className="notification-banner">
      <div className="notification-banner-content">
        <div className="notification-banner-text">
          <strong>{message.title}</strong>
          <p>{message.description}</p>
        </div>
        <button 
          className="btn btn-primary btn-sm notification-banner-button"
          onClick={handleAction}
        >
          {!hasPermission ? 'Enable Now' : 'Refresh'}
        </button>
      </div>
    </div>
  );
};

export default NotificationBanner;
