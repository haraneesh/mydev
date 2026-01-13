import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

/**
 * Returns the public settings from Meteor.settings
 * Used by mobile clients (Flutter) to access configuration like image URLs, payment settings, etc.
 */
export const getPublicSettings = new ValidatedMethod({
  name: 'getPublicSettings',
  validate() {
    // No validation needed - this is public data
  },
  run() {
    // Return a copy of public settings
    // Filter to only include necessary settings for the mobile app
    const publicSettings = Meteor.settings.public || {};
    
    console.log('📡 getPublicSettings called - returning settings from Meteor.settings.public');
    console.log('Product_Images: ' + (publicSettings.Product_Images || 'NOT CONFIGURED'));
    console.log('Product_Images_Version: ' + (publicSettings.Product_Images_Version || 'NOT CONFIGURED'));
    
    return {
      Product_Images: publicSettings.Product_Images || '',
      Product_Images_Version: publicSettings.Product_Images_Version || '',
      App_Name: publicSettings.App_Name || '',
      PRODUCT_ORDER: publicSettings.PRODUCT_ORDER || {},
      CART_ORDER: publicSettings.CART_ORDER || {},
      Support_Numbers: publicSettings.Support_Numbers || {},
      pinCodes: publicSettings.pinCodes || {},
      cloudinary: publicSettings.cloudinary || {},
    };
  },
});
