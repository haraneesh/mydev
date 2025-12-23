/**
 * Update Manager Module
 * Handles all app update logic including version checking,
 * Meteor code updates, and native app store updates
 */

import { Meteor } from 'meteor/meteor';

class UpdateManager {
  constructor() {
    this.updateCallbacks = {
      onNativeUpdateRequired: null,
      onCodeUpdateRequired: null,
      onCodeUpdateAvailable: null,
      onUpdateCheckError: null,
    };
    this.updateState = {
      isCheckingVersion: false,
      nativeUpdateRequired: false,
      codeUpdateRequired: false,
      updateInfo: null,
      retryCount: 0,
      maxRetries: 3,
      retryDelay: 2000, // ms
    };
    this.reloadHandler = null;
  }

  /**
   * Register a callback for update events
   * @param {string} event - Event name (onNativeUpdateRequired, onCodeUpdateRequired, etc.)
   * @param {function} callback - Callback function
   */
  on(event, callback) {
    if (this.updateCallbacks.hasOwnProperty(event)) {
      this.updateCallbacks[event] = callback;
    }
  }

  /**
   * Emit an event to registered callbacks
   * @param {string} event - Event name
   * @param {*} data - Data to pass to callback
   */
  emit(event, data) {
    if (this.updateCallbacks[event] && typeof this.updateCallbacks[event] === 'function') {
      this.updateCallbacks[event](data);
    }
  }

  /**
   * Initialize update checking and Meteor reload handling
   * Should be called once on app startup
   */
  initialize() {
    if (typeof Meteor !== 'undefined' && Meteor.isCordova) {
      try {
        this.setupMeteorReloadHandler();
        this.checkVersion().catch(err => {
          console.error('Initial version check failed:', err);
        });
      } catch (error) {
        console.error('Error initializing update manager:', error);
      }
    }
  }

  /**
   * Setup Meteor's reload handler to detect code updates
   */
  setupMeteorReloadHandler() {
    try {
      if (typeof Reload === 'undefined') {
        console.warn('Meteor Reload package not available');
        return;
      }

      // Register migration handler to be notified of code updates
      if (typeof Reload.onMigrate === 'function') {
        Reload.onMigrate(() => {
          console.log('Code update available from server');
          this.updateState.codeUpdateRequired = true;
          this.emit('onCodeUpdateAvailable', { codeUpdateRequired: true });
          return [true]; // Allow migration
        });
      }
    } catch (error) {
      console.warn('Error setting up Meteor reload handler:', error);
    }
  }

  /**
   * Check app version and determine update requirements
   * Implements retry logic with exponential backoff
   */
  async checkVersion() {
    if (this.updateState.isCheckingVersion) {
      console.log('Version check already in progress');
      return;
    }

    this.updateState.isCheckingVersion = true;

    try {
      const currentVersion = (Meteor.settings && Meteor.settings.public && Meteor.settings.public.appVersion) || '1.0.0';
      const platform = (typeof window !== 'undefined' && window.device?.platform) || 'android';

      let nativeVersion = null;
      try {
        if (typeof window !== 'undefined' && window.cordova?.getAppVersion?.getVersionNumber) {
          nativeVersion = await Promise.race([
            window.cordova.getAppVersion.getVersionNumber(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
          ]);
          console.log('Native version retrieved:', nativeVersion);
        }
      } catch (e) {
        console.warn('Could not get native version:', e);
      }

      // Call server method to check version with timeout
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          this.updateState.isCheckingVersion = false;
          reject(new Error('Version check timeout'));
        }, 10000);

        Meteor.call('checkAppVersion', currentVersion, platform, nativeVersion, (error, result) => {
          clearTimeout(timeoutId);
          this.updateState.isCheckingVersion = false;

          if (error) {
            console.error('Error checking app version:', error);
            this.handleVersionCheckError(error);
            reject(error);
            return;
          }

          if (result) {
            this.updateState.updateInfo = result;
            this.updateState.retryCount = 0; // Reset retry count on success

            if (result.nativeUpdateRequired) {
              console.log('Native update required:', result.minNativeVersion);
              this.updateState.nativeUpdateRequired = true;
              this.emit('onNativeUpdateRequired', result);
            } else if (result.codeUpdateRequired) {
              console.log('Code update required:', result.minVersion);
              this.updateState.codeUpdateRequired = true;
              this.emit('onCodeUpdateRequired', result);
            }

            resolve(result);
          }
        });
      });
    } catch (error) {
      this.updateState.isCheckingVersion = false;
      this.handleVersionCheckError(error);
      throw error;
    }
  }

  /**
   * Handle version check errors with retry logic
   * @param {Error} error - The error that occurred
   */
  handleVersionCheckError(error) {
    console.error('Version check error:', error);

    if (this.updateState.retryCount < this.updateState.maxRetries) {
      this.updateState.retryCount++;
      const delay = this.updateState.retryDelay * Math.pow(2, this.updateState.retryCount - 1);
      console.log(`Retrying version check in ${delay}ms (attempt ${this.updateState.retryCount})`);

      setTimeout(() => {
        this.checkVersion().catch(err => {
          console.error('Retry failed:', err);
        });
      }, delay);
    } else {
      console.error('Max retry attempts reached for version check');
      this.emit('onUpdateCheckError', {
        error,
        message: 'Failed to check for updates after multiple attempts',
      });
    }
  }

  /**
   * Open app store for native update
   * @param {string} storeUrl - The app store URL
   */
  openAppStore(storeUrl) {
    if (!storeUrl) {
      console.error('No store URL provided');
      return;
    }

    try {
      if (typeof window !== 'undefined') {
        if (window.cordova?.InAppBrowser?.open) {
          window.cordova.InAppBrowser.open(storeUrl, '_system');
        } else {
          window.open(storeUrl, '_system');
        }
      }
    } catch (error) {
      console.error('Error opening app store:', error);
    }
  }

  /**
   * Wait for code update to be ready and reload app
   * Uses Meteor's Reload API to detect when new code is available
   */
  async reloadForCodeUpdate() {
    try {
      if (typeof Reload === 'undefined') {
        console.warn('Meteor Reload package not available, performing direct reload');
        setTimeout(() => {
          try {
            window.location.reload();
          } catch (e) {
            console.error('Error reloading page:', e);
          }
        }, 2000);
        return;
      }

      console.log('Waiting for code update to be ready...');

      // Check every 500ms if new code is waiting to be applied
      const checkInterval = setInterval(() => {
        try {
          if (typeof Reload !== 'undefined' && typeof Reload.isWaitingForResume === 'function') {
            if (Reload.isWaitingForResume()) {
              console.log('Code update ready, reloading app...');
              clearInterval(checkInterval);
              if (typeof Reload.reload === 'function') {
                Reload.reload();
              } else {
                window.location.reload();
              }
            }
          }
        } catch (error) {
          console.error('Error checking for code update:', error);
        }
      }, 500);

      // Fallback: reload after 10 seconds if update doesn't come through
      setTimeout(() => {
        if (checkInterval) {
          clearInterval(checkInterval);
          console.log('Code update timeout, performing reload');
          try {
            window.location.reload();
          } catch (e) {
            console.error('Error reloading page:', e);
          }
        }
      }, 10000);
    } catch (error) {
      console.error('Error in reloadForCodeUpdate:', error);
    }
  }

  /**
   * Get current update state
   * @returns {object} Current update state
   */
  getUpdateState() {
    return { ...this.updateState };
  }

  /**
   * Reset update state (useful for testing)
   */
  resetUpdateState() {
    this.updateState = {
      isCheckingVersion: false,
      nativeUpdateRequired: false,
      codeUpdateRequired: false,
      updateInfo: null,
      retryCount: 0,
      maxRetries: 3,
      retryDelay: 2000,
    };
  }
}

// Export singleton instance
export default new UpdateManager();
