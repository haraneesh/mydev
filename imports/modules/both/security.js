import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import constants from '../constants';

export default class Security {
  static hasRole(userId, role) {
    return Roles.userIsInRole(userId, role);
  }

  static checkLoggedIn(userId) {
    if (!userId) {
      throw new Meteor.Error('not-authorized', 'You are not authorized');
    }
  }

  static checkUserIsAdmin(userId) {
    if (!this.hasRole(userId, constants.Roles.admin.name)) {
      throw new Meteor.Error('not-authorized');
    }
  }

  static checkUserIsSupplier(userId) {
    if (!this.hasRole(userId, constants.Roles.supplier.name)) {
      throw new Meteor.Error('not-authorized');
    }
  }

  static checkBoolUserIsShopOwner(userId) {
    if (!this.hasRole(userId, constants.Roles.shopOwner.name)) {
      return false;
    }
    return true;
  }

  static checkBoolUserIsSupplier(userId) {
    if (!this.hasRole(userId, constants.Roles.supplier.name)) {
      return false;
    }
    return true;
  }

  static checkRole(userId, role) {
    if (!this.hasRole(userId, role)) {
      throw new Meteor.Error('not-authorized');
    }
  }

  // add other business logic checks here that you use throughout the app
  // something like: isUserAllowedToSeeDocument()
}
