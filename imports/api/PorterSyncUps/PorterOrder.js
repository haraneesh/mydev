import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const PorterOrder = new Mongo.Collection('PorterOrder');

PorterOrder.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

PorterOrder.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

PorterOrder.schema = new SimpleSchema({
  orderId: {
    type: String,
    label: 'The ID of the order this booking is done for.',
  },
  createdAt: {
    type: Date,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      } if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      }
      this.unset(); // Prevent user from supplying their own value
    },
  },
  updatedAt: {
    type: Date,
    autoValue() {
      if (this.isInsert || this.isUpdate || this.isUpsert) {
        return new Date();
      }
    },
    optional: true,
  },
  requestId: {
    type: String,
    label: 'Request Id from Porter API',
  },
  porterOrderId: {
    type: String,
    label: 'The Id of the order booked on Porter.',
    optional: true,
  },
  estimatedFare: {
    type: Number,
    label: 'Estimated cost of delivery in paisa',
    optional: true,
  },
  estimatedPickUpTime: {
    type: String,
    label: 'Estimated time for pickup in milliseconds',
    optional: true,
  },
  trackingUrl: {
    type: String,
    label: 'Tracking url of the order on Porter',
    optional: true,
  },
  orderStatus: {
    type: String,
    label: 'Status of the order on Porter', // enum of 'open', 'accepted', 'live', 'ended', 'cancelled'
    optional: true,
  },

});

if (Meteor.isServer) {
  PorterOrder.rawCollection().createIndex({ orderId: 1 });
}

PorterOrder.attachSchema(PorterOrder.schema);
