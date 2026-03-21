import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import ReconcileInventory from '../ReconcileInventory';
import constants from '../../../modules/constants';

Meteor.publish('reconcileInventory.list', async function reconcileInventoryList(options) {
   check(options, { limit: Number,
   skip: Number,
    sort: {
      createdAt: Match.Maybe(Number),
      'customer_details.mobilePhone': Match.Maybe(Number),
      'customer_details.name': Match.Maybe(Number),
      order_status: Match.Maybe(Number),
      total_bill_amount: Match.Maybe(Number),
    },
  });

  const skip = 0;

  if (await Roles.userIsInRoleAsync(this.userId, constants.Roles.admin.name)) {
    const { limit, skip, sort } = options;
    return ReconcileInventory.find({}, {
      skip,
      sort,
      limit,
    });
  }
  return [];
});