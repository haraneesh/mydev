/**
 * Back Button Handler Utility
 * Manages Cordova back button behavior to prevent navigation during critical operations
 */

class BackButtonManager {
  constructor() {
    this.handlers = [];
    this.isDisabled = false;
  }

  /**
   * Disable back button and register a custom handler
   * @param {function} handler - Function to call when back button is pressed
   * @returns {function} Unsubscribe function
   */
  disable(handler) {
    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function');
    }

    const backbuttonHandler = (e) => {
      if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
      }
      handler();
    };

    this.handlers.push(backbuttonHandler);
    
    if (typeof Meteor !== 'undefined' && Meteor.isCordova && typeof document !== 'undefined') {
      document.addEventListener('backbutton', backbuttonHandler, false);
    }

    this.isDisabled = true;

    // Return unsubscribe function
    return () => this.enable(backbuttonHandler);
  }

  /**
   * Enable back button and remove a specific handler
   * @param {function} handler - The handler to remove
   */
  enable(handler) {
    const index = this.handlers.findIndex(h => h === handler);
    if (index > -1) {
      this.handlers.splice(index, 1);
      
      if (typeof Meteor !== 'undefined' && Meteor.isCordova && typeof document !== 'undefined') {
        document.removeEventListener('backbutton', handler, false);
      }
    }

    if (this.handlers.length === 0) {
      this.isDisabled = false;
    }
  }

  /**
   * Enable all back button handlers
   */
  enableAll() {
    this.handlers.forEach(handler => {
      if (typeof Meteor !== 'undefined' && Meteor.isCordova && typeof document !== 'undefined') {
        document.removeEventListener('backbutton', handler, false);
      }
    });
    this.handlers = [];
    this.isDisabled = false;
  }

  /**
   * Check if back button is disabled
   * @returns {boolean}
   */
  getIsDisabled() {
    return this.isDisabled;
  }
}

// Export singleton instance
export default new BackButtonManager();
