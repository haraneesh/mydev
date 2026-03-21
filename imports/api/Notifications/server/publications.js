import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
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

// Publish paginated list of users who have subscribed to notifications (admin only)
Meteor.publish('notificationSubscribers.list', async function notificationSubscribersList(limit = 10, skip = 0) {
  check(limit, Number);
  check(skip, Number);
  
  if (!this.userId) {
    return this.ready();
  }

  const isAdmin = await Roles.userIsInRoleAsync(this.userId, constants.Roles.admin.name);
  if (!isAdmin) {
    return this.ready();
  }

  // Get unique user IDs from Notifications collection
  const subscribedUserIds = await Notifications.rawCollection()
    .distinct('userId')
    .then(ids => ids.filter(id => id)); // Filter out any null/undefined

  // Return users who have notifications, with pagination
  return Meteor.users.find(
    { _id: { $in: subscribedUserIds } },
    {
      limit,
      skip,
      sort: { 'profile.name': 1, 'emails.0.address': 1 },
      fields: {
        'profile.name': 1,
        'emails.address': 1,
        'username': 1,
        'createdAt': 1,
      },
    }
  );
});

// Publish count of users who have subscribed to notifications (admin only)
Meteor.publish('notificationSubscribers.count', async function notificationSubscribersCount() {
  if (!this.userId) {
    return this.ready();
  }

  const isAdmin = await Roles.userIsInRoleAsync(this.userId, constants.Roles.admin.name);
  if (!isAdmin) {
    return this.ready();
  }

  const subscribedUserIds = await Notifications.rawCollection()
    .distinct('userId')
    .then(ids => ids.filter(id => id));

  // Publish a count document
  this.added('counts', 'notificationSubscribers', { count: subscribedUserIds.length });
  this.ready();
});

// Publish paginated list of users who have NOT subscribed to notifications (admin only)
Meteor.publish('notificationNonSubscribers.list', async function notificationNonSubscribersList(limit = 10, skip = 0) {
  check(limit, Number);
  check(skip, Number);
  
  if (!this.userId) {
    return this.ready();
  }

  const isAdmin = await Roles.userIsInRoleAsync(this.userId, constants.Roles.admin.name);
  if (!isAdmin) {
    return this.ready();
  }

  // Get unique user IDs from Notifications collection
  const subscribedUserIds = await Notifications.rawCollection()
    .distinct('userId')
    .then(ids => ids.filter(id => id));

  // Return users who DON'T have notifications, with pagination
  return Meteor.users.find(
    { _id: { $nin: subscribedUserIds } },
    {
      limit,
      skip,
      sort: { 'profile.name': 1, 'emails.0.address': 1 },
      fields: {
        'profile.name': 1,
        'emails.address': 1,
        'username': 1,
        'createdAt': 1,
      },
    }
  );
});

// Publish count of users who have NOT subscribed to notifications (admin only)
Meteor.publish('notificationNonSubscribers.count', async function notificationNonSubscribersCount() {
  if (!this.userId) {
    return this.ready();
  }

  const isAdmin = await Roles.userIsInRoleAsync(this.userId, constants.Roles.admin.name);
  if (!isAdmin) {
    return this.ready();
  }

  const subscribedUserIds = await Notifications.rawCollection()
    .distinct('userId')
    .then(ids => ids.filter(id => id));

  const totalUsers = await Meteor.users.find({}).countAsync();
  const nonSubscribersCount = totalUsers - subscribedUserIds.length;

  // Publish a count document
  this.added('counts', 'notificationNonSubscribers', { count: nonSubscribersCount });
  this.ready();
});
