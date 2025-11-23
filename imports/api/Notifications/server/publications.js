import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import Notifications from '../Notifications';
import constants from '../../../modules/constants';

// Publish player IDs for the current user
Meteor.publish('notifications.myPlayerIds', async function myPlayerIds() {
  if (!this.userId) {
    return this.ready();
  }

  return Notifications.find({ userId: this.userId });
});

// Publish all player IDs for admins
Meteor.publish('notifications.allPlayerIds', async function allPlayerIds() {
  if (!this.userId) {
    return this.ready();
  }

  const isAdmin = await Roles.userIsInRoleAsync(this.userId, constants.Roles.admin.name);
  if (!isAdmin) {
    return this.ready();
  }

  return Notifications.find({});
});
