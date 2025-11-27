import { Meteor } from 'meteor/meteor';

/**
 * Platform detection utilities for handling web vs Cordova environments
 */

/**
 * Check if the app is running in a Cordova environment
 * @returns {boolean} True if running in Cordova, false otherwise
 */
export const isCordova = () => {
  return Meteor.isCordova || false;
};

/**
 * Check if the app is running in a web browser environment
 * @returns {boolean} True if running in web browser, false otherwise
 */
export const isWeb = () => {
  return !Meteor.isCordova;
};

/**
 * Get the current platform name
 * @returns {string} 'cordova' or 'web'
 */
export const getPlatform = () => {
  return isCordova() ? 'cordova' : 'web';
};
