/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';

const Invitations = new Meteor.Collection('Invitations');
export default Invitations;

Invitations.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Invitations.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

const InvitationsSchema = new SimpleSchema({
  sentUserId: {
    type: String,
    label: 'User id of the user who sent the invitation',
  },
  receiverPhoneNumber: {
    type: String,
    label: 'Attempted phone number of the receiver',
    optional: true,
  },
  email: {
    type: String,
    label: 'Email to send invitation to.',
    regEx: SimpleSchema.RegEx.Email,
    optional: true,
  },
  token: {
    type: String,
    label: 'Invitation token.',
  },
  role: {
    type: String,
    label: 'Role to apply to the user.',
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
    optional: true,
  },
  // Force value to be current date (on server) upon update
  // and don't allow it to be set upon insert.
  updatedAt: {
    type: Date,
    autoValue() {
      if (this.isInsert || this.isUpdate || this.isUpsert) {
        return new Date();
      }
    },
    optional: true,
  },
  invitation_status: {
    type: String,
    label: 'Status of the Invitation',
  },
  receivedUserId: {
    type: String,
    label: 'User id of the user who accepted or received the invitation',
    optional: true,
  },
});

if (Meteor.isServer) {
  Invitations._ensureIndex({ _Id: 1, invitation_status: 1, sentUserId: 1 });
  Invitations._ensureIndex({ token: 1, invitation_status: 1 });
}

Invitations.attachSchema(InvitationsSchema);
