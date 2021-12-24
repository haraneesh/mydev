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

const addInvitation = (phoneNumber, sentUserId, sentRole, otp) => {
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
    invitation.sentUserId = sentUserId;
    invitation.token = Random.hexString(16);
    invitation.otp = otp;
    invitation.role = sentRole;
    invitation.receivedUserId = '';
    invitation.receiverPhoneNumber = phoneNumber;
    invitation.invitation_status = constants.InvitationStatus.Sent.name;

    Invitations.insert(invitation);
  }
  const { domain } = Meteor.settings.private;
  return `http://${domain}/invitations/${invitation.token}`;
};

Meteor.methods({
  'invitation.getInvitation': function invitationCreate(phoneNumber) {
    check(phoneNumber, Match.Maybe(String));
    try {
      return addInvitation(phoneNumber, Meteor.userId(), constants.Roles.customer.name, '');
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  'invitations.confirmToken': function confirmToken(confirmationToken) {
    check(confirmationToken, String);
    try {
      const invitation = Invitations.findOne({ token: confirmationToken });
      if (invitation) {
        return invitation.receiverPhoneNumber;
      }
      throw new Meteor.Error(403, 'The token is invalid');
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  'invitation.sendOTP': function invitationSendOTP(phoneNumber) {
    check(phoneNumber, String);
    const indiaMobilePhoneRegExp = RegExp(/^[6789]\d{9}$/);
    try {
      if (indiaMobilePhoneRegExp.test(phoneNumber)) {
        const otp = Math.floor(1000 + Math.random() * 9000);

        const isPhoneNumberRegistered = Meteor.users.findOne({ username: phoneNumber });
        if (isPhoneNumberRegistered) {
          throw new Meteor.Error(404, 'Please check you phone number. You are either a registered user or the phone number is invalid.');
        }

        const adminUser = Meteor.users.findOne({ username: '9999999999' }); // admin
        addInvitation(phoneNumber, adminUser._id, 'self', otp);

        if (Meteor.isDevelopment) {
          console.log(otp);
        }
        // send SMS
        return true;
      }

      throw new Meteor.Error(403, 'The phone number is not a valid India Mobile Number');
    } catch (exception) {
      handleMethodException(exception);
    }
    return false;
  },
  'invitation.isValidOTP': function isValidOTP(otp) {
    check(otp, String);
    try {
      const invitation = Invitations.findOne({ otp });
      if (invitation) {
        return { token: invitation.token };
      }
      throw new Meteor.Error(403, 'OTP is in valid. Please request a new OTP.');
    } catch (exception) {
      handleMethodException(exception);
    }
    return '';
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

const createUser = (user) => {
  const userId = Accounts.createUser(user);

  if (userId) {
    Meteor.users.update(
      { _id: userId },
      {
        $set: {
          status: {
            accountStatus: constants.UserAccountStatus.NewSignUp.name,
            statusUpdate: new Date(),
          },
        },
      },
    );

    return userId;
  }
};

const getInvitation = (token) => {
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

const updateInvitation = (token, userId) => {
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
      const invitation = getInvitation(options.token);
      const cUser = { ...options.user };
      cUser.username = invitation.receiverPhoneNumber;
      cUser.profile.whMobilePhone = invitation.receiverPhoneNumber;

      if (invitation) {
        const userId = createUser(cUser);
        if (userId) {
          updateInvitation(options.token, userId);
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
    'invitation.sendOTP',
    sendInvitation,
    removeInvitation,
    acceptInvitation,
  ],
  limit: 5,
  timeRange: 1000,
});
