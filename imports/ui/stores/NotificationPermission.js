import React, { createContext, useContext, useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';

const NotificationPermissionContext = createContext(null);

export const NotificationPermissionProvider = ({ children }) => {
  const [hasPermission, setHasPermission] = useState(null); // null = checking, true/false
  const [hasPlayerId, setHasPlayerId] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkNotificationStatus();
    
    // Re-check when user logs in or periodically
    const interval = setInterval(checkNotificationStatus, 5000);
    return () => clearInterval(interval);
  }, [Meteor.userId()]);

  const checkNotificationStatus = async () => {
    if (!Meteor.isCordova) {
      // Web users don't need notifications
      setHasPermission(true);
      setHasPlayerId(true);
      setIsChecking(false);
      return;
    }

    // Check OS-level permission
    if (window.plugins?.OneSignal) {
      try {
        const permission = window.plugins.OneSignal.Notifications.hasPermission();
        setHasPermission(permission);
      } catch (error) {
        console.error('Error checking notification permission:', error);
        setHasPermission(false);
      }
    }

    // Check if player ID is registered in database
    if (Meteor.userId()) {
      Meteor.call('getMyPlayerIds', (error, playerIds) => {
        if (!error && playerIds && playerIds.length > 0) {
          setHasPlayerId(true);
        } else {
          setHasPlayerId(false);
        }
        setIsChecking(false);
      });
    } else {
      setIsChecking(false);
    }
  };

  const requestPermission = () => {
    if (window.plugins?.OneSignal) {
      window.plugins.OneSignal.Notifications.requestPermission(true)
        .then((accepted) => {
          console.log('Permission request result:', accepted);
          setTimeout(checkNotificationStatus, 1000);
        })
        .catch((error) => {
          console.error('Error requesting permission:', error);
        });
    }
  };

  const openSettings = () => {
    // Open device settings for the app
    if (window.cordova?.plugins?.settings) {
      window.cordova.plugins.settings.open();
    } else {
      // Fallback: show alert with instructions
      alert('Please enable notifications in your device Settings > Apps > NammaSuvai > Notifications');
    }
  };

  return (
    <NotificationPermissionContext.Provider 
      value={{ 
        hasPermission, 
        hasPlayerId, 
        isChecking,
        requestPermission,
        openSettings,
        refresh: checkNotificationStatus,
        // Helper to check if notifications are fully enabled
        isNotificationEnabled: hasPermission && hasPlayerId,
        // Helper to check if we should block actions
        shouldBlockActions: Meteor.isCordova && (!hasPermission || !hasPlayerId)
      }}
    >
      {children}
    </NotificationPermissionContext.Provider>
  );
};

export const useNotificationPermission = () => {
  const context = useContext(NotificationPermissionContext);
  if (!context) {
    throw new Error('useNotificationPermission must be used within NotificationPermissionProvider');
  }
  return context;
};
