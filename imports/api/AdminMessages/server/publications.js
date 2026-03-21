import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import AdminMessages from '../AdminMessages';
import constants from '../../../modules/constants';

Meteor.publish('adminMessages.list', async function adminMessagesList(limit = 10, skip = 0) {
  check(limit, Number);
  check(skip, Number);

  if (!this.userId) {
    return this.ready();
  }

  // Check if user is admin
  const isAdmin = await Roles.userIsInRoleAsync(this.userId, constants.Roles.admin.name);
  
  if (!isAdmin) {
    return this.ready();
  }

  return AdminMessages.find(
    {},
    {
      sort: { sentAt: -1 },
      limit,
      skip,
    }
  );
});

Meteor.publish('adminMessages.count', async function adminMessagesCount() {
  if (!this.userId) {
    return this.ready();
  }

  // Check if user is admin
  const isAdmin = await Roles.userIsInRoleAsync(this.userId, constants.Roles.admin.name);
  
  if (!isAdmin) {
    return this.ready();
  }

  // Use Counts package or return a simple count
  const count = await AdminMessages.find({}).countAsync();
  
  // Publish a pseudo-document with the count
  this.added('counts', 'adminMessages', { count });
  this.ready();
});
