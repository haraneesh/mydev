import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Random } from 'meteor/random';
import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import { check, Match } from 'meteor/check';
import rateLimit from '../../modules/rate-limit';
import handleMethodException from '../../modules/handle-method-exception';
import constants from '../../modules/constants';
import Invitations from './Invitations';
import InvitationTemplate from './invitation_template';

Meteor.methods({
  'invitation.getInvitation': function invitationCreate(phoneNumber) {
    check(phoneNumber, Match.Maybe(String));
    try {
      let invitation;

      if (phoneNumber) {
        invitation = Invitations.findOne(
          {
            $and: [
              { receiverPhoneNumber: phoneNumber },
              { invitation_status: constants.InvitationStatus.Sent.name },
            ],
          },
        );
      }

      if (!invitation) {
        invitation = {};
        invitation.sentUserId = Meteor.userId();
        invitation.token = Random.hexString(16);
        invitation.role = 'member';
        invitation.receivedUserId = '';
        invitation.receiverPhoneNumber = phoneNumber;
        invitation.invitation_status = constants.InvitationStatus.Sent.name;

        Invitations.insert(invitation);
      }
      const { domain } = Meteor.settings.private;
      return `http://${domain}/invitations/${invitation.token}`;
    } catch (exception) {
      handleMethodException(exception);
    }
  },
});

export const sendInvitation = new ValidatedMethod({
  name: 'invitations.send',
  validate: new SimpleSchema({
    name: { type: String },
    email: { type: String, regEx: SimpleSchema.RegEx.Email },
  }).validator(),
  run(invitation) {
    invitation.sentUserId = Meteor.userId();
    invitation.token = Random.hexString(16);
    invitation.role = 'member';
    invitation.receivedUserId = '';
    invitation.invitation_status = constants.InvitationStatus.Sent.name;

    /* let query
        switch (true){
          case (Roles.userIsInRole(loggedInUserId, ['admin']) || !(invitation._id)):
             query = { _id: invitation._id }
             break;
          default:
             query = { $and:[
               { _id: invitation._id },
               { sentUserId :loggedInUserId }
             ]}
             break;
      } */

    if (Meteor.isServer) {
      const user = Meteor.users.findOne(this.userId);
      const fromName = `${user.profile.name.first} ${user.profile.name.last}`;
      const email = prepareEmail(invitation.token, invitation.name, fromName);
      this.unblock();
      sendEmail(invitation.email, email, `${fromName} has Invited you to Suvai Community`);
    }
    Invitations.insert(invitation);
  },
});

const prepareEmail = (token, name, fromName) => {
  const { domain } = Meteor.settings.private;
  const url = `http://${domain}/invitations/${token}`;

  // SSR.compileTemplate('invitation', Assets.getText('email/templates/invitation.html'));
  // const html = SSR.render('invitation', { url, nameOfInvited: name, nameOfInvitee: fromName });

  const html = InvitationTemplate({ url, nameOfInvited: name, nameOfInvitee: fromName });
  return html;
};

const sendEmail = (email, content, subject) => {
  Email.send({
    to: email,
    from: `Suvai ${Meteor.settings.private.fromInvitationEmail}`,
    subject,
    html: content,
  });
};

const _createUser = (user) => {
  const userId = Accounts.createUser(user);

  if (userId) {
    return userId;
  }
};

const _getInvitation = (token) => {
  const invitation = Invitations.findOne({
    $and: [
      { token }, // token
      { invitation_status: constants.InvitationStatus.Sent.name }, // constants.InvitationStatus.Sent.name
    ],
  });

  if (invitation) {
    return invitation;
  }
};

const _updateInvitation = (token, userId) => {
  Invitations.update({ token }, {
    $set: {
      invitation_status: constants.InvitationStatus.Accepted.name,
      receivedUserId: userId,
    },
  });
};

export const acceptInvitation = new ValidatedMethod({
  name: 'invitations.accept',
  validate: new SimpleSchema({
    token: { type: String },
    user: { type: Object, blackbox: true },
  }).validator(),
  run(options) {
    if (Meteor.isServer) {
      const invitation = _getInvitation(options.token);
      if (invitation) {
        const userId = _createUser(options.user);
        if (userId) {
          _updateInvitation(options.token, userId);
        }
      } else {
        throw new Meteor.Error(403, 'Sign up token has expired or is invalid.');
      }
    }
  },
});

export const removeInvitation = new ValidatedMethod({
  name: 'invitations.remove',
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  run({ _id }) {
    let query;
    switch (true) {
      case Roles.userIsInRole(this.userId, ['admin']):
        query = {
          $and: [
            { _id },
            { invitation_status: constants.InvitationStatus.Sent.name },
          ],
        };
        break;
      default:
        query = {
          $and: [
            { _id },
            { sentUserId: Meteor.userId() },
            { invitation_status: constants.InvitationStatus.Sent.name },
          ],
        };
        break;
    }
    Invitations.remove(query, { justOne: true });
  },
});

rateLimit({
  methods: [
    'invitation.getInvitation',
    sendInvitation,
    removeInvitation,
    acceptInvitation,
  ],
  limit: 5,
  timeRange: 1000,
});
