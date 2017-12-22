import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { check } from 'meteor/check';
import Invitations from '../Invitations';

Meteor.publish('invitations.view', (invitationId) => {
  check(invitationId, String);
  return Invitations.find(
    { $and: [
              { _Id: invitationId },
              { sentUserId: this.userId },
        ],
    });
});

Meteor.publish('invitations.list', function () {
   const loggedInUserId = this.userId
   if (Roles.userIsInRole(loggedInUserId,['admin'])) {
     return Invitations.find()
   }
   
       return Invitations.find({sentUserId:loggedInUserId})
   
});

Meteor.publish('invitations.list.status', function(invitationStatuses){
   check(invitationStatuses,[String])
   if (Roles.userIsInRole(this.userId, ['admin'])) {
      return Invitations.find(
        {  invitation_status:{ $in: invitationStatuses }},
      )
   }
   
     return Invitations.find(
         {  $and: [
              { invitation_status:{ $in: orderStatuses }},
              { sentUserId: this.userId },
            ]
        },
      )
   
});
