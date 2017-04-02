import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Factory } from 'meteor/dburles:factory';

Invitations = new Meteor.Collection( 'Invitations' );
export default Invitations;

Invitations.allow({
  insert: () => false,
  update: () => false,
  remove: () => false
});

Invitations.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
});

let InvitationsSchema = new SimpleSchema({
  sentUserId:{
    type: String,
    label: "User id of the user who sent the invitation"
  },
  email: {
    type: String,
    label: "Email to send invitation to.",
    regEx: SimpleSchema.RegEx.Email
  },
  token: {
    type: String,
    label: "Invitation token."
  },
  role: {
    type: String,
    label: "Role to apply to the user."
  },
  createdAt: { type: Date,
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return {$setOnInsert: new Date()};
      } else {
        this.unset();  // Prevent user from supplying their own value
      }
    },
    optional: true
  },
  // Force value to be current date (on server) upon update
  // and don't allow it to be set upon insert.
  updatedAt: {
    type: Date,
    autoValue: function() {
      if (this.isUpdate) {
        return new Date();
      }
    },
    denyInsert:true,
    optional: true
  },
  invitation_status:{
    type:String,
    label: "Status of the Invitation"
  },
  receivedUserId:{
    type:String,
    label: "User id of the user who accepted or received the invitation",
    optional:true
  }
});

Invitations.attachSchema( InvitationsSchema );