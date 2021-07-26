import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

const name = 'Suvai';
const email = `<${Meteor.settings.private.fromInvitationEmail}>`;
const from = `${name} ${email}`;

Accounts.emailTemplates.siteName = name;
Accounts.emailTemplates.from = from;

Accounts.emailTemplates.resetPassword = {
  subject() {
    return `[${name}] - Instructions To Reset Your Password`;
  },
  text(user, url) {
    const userEmail = user.emails[0].address;
    const urlWithoutHash = url.replace('#/', '');

    if (Meteor.isDevelopment) console.info(`Reset Password Link: ${urlWithoutHash}`); // eslint-disable-line

    return `A password reset has been requested for the account related to this address (${userEmail}). To reset the password, visit the following link: \n\n${urlWithoutHash}\n\n 
    If you did not request this reset, please ignore this email. If you feel something is wrong, please contact our support team: ${email}.`;
  },
};

Accounts.emailTemplates.verifyEmail = {
  subject() {
    return `[${name}] - Instructions To Verify Your Email Address`;
  },
  text(user, url) {
    const urlWithoutHash = url.replace('#/', '');
    if (Meteor.isDevelopment) console.info(`verify email Link: ${urlWithoutHash} sent to ${user.emails[0].address}`); // eslint-disable-line

    return `To verify your email address please visit the following link: \n\n${urlWithoutHash}\n\n 
    If you feel something is wrong, please contact our support team: ${email}.`;
  },
};
