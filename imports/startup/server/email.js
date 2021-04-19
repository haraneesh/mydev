import { Meteor } from 'meteor/meteor';

const smtp = {
  username: Meteor.settings.private.MAIL_URL.username,
  password: Meteor.settings.private.MAIL_URL.password,
  server: Meteor.settings.private.MAIL_URL.smtpServer,
  port: Meteor.settings.private.MAIL_URL.port,
};

process.env.MAIL_URL = `smtps://${encodeURIComponent(smtp.username)}:${encodeURIComponent(smtp.password)}@${encodeURIComponent(smtp.server)}:${smtp.port}`;
