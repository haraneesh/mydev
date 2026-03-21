import { Roles } from 'meteor/alanning:roles';
import { Meteor } from 'meteor/meteor';
import constants from '../constants';

async function hasRole(userId, role) {
  const isInRole = await Roles.userIsInRoleAsync(userId, role);
  return isInRole;
}

function checkLoggedIn(userId) {
  if (!userId) {
    throw new Meteor.Error('not-authorized', 'You are not authorized');
  }
}

function checkUserIsAdmin(userId) {
  if (
    !hasRole(userId, [
      constants.Roles.superAdmin.name,
      constants.Roles.admin.name,
    ])
  ) {
    throw new Meteor.Error('not-authorized');
  }
}

function checkUserIsSupplier(userId) {
  if (!hasRole(userId, constants.Roles.supplier.name)) {
    throw new Meteor.Error('not-authorized');
  }
}

function checkBoolUserIsShopOwner(userId) {
  if (!hasRole(userId, constants.Roles.shopOwner.name)) {
    return false;
  }
  return true;
}

function checkBoolUserIsSupplier(userId) {
  if (!hasRole(userId, constants.Roles.supplier.name)) {
    return false;
  }
  return true;
}

function checkBoolUserIsAdmin(userId) {
  if (
    !hasRole(userId, [
      constants.Roles.superAdmin.name,
      constants.Roles.admin.name,
    ])
  ) {
    return false;
  }
  return true;
}

function checkRole(userId, role) {
  if (!hasRole(userId, role)) {
    throw new Meteor.Error('not-authorized');
  }
}

// add other business logic checks here that you use throughout the app
// something like: isUserAllowedToSeeDocument()

const Security = {
  checkLoggedIn,
  checkUserIsAdmin,
  checkUserIsSupplier,
  checkBoolUserIsShopOwner,
  checkBoolUserIsSupplier,
  checkBoolUserIsAdmin,
  checkRole,
};

export default Security;
