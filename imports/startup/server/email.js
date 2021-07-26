import { Meteor } from 'meteor/meteor';

const smtp = {
  smtp: Meteor.settings.private.MAIL_URL.smtp,
  username: Meteor.settings.private.MAIL_URL.username,
  password: Meteor.settings.private.MAIL_URL.password,
  server: Meteor.settings.private.MAIL_URL.smtpServer,
  port: Meteor.settings.private.MAIL_URL.port,
};

process.env.MAIL_URL = `${smtp.smtp}://${encodeURIComponent(smtp.username)}:${encodeURIComponent(smtp.password)}@${encodeURIComponent(smtp.server)}:${smtp.port}`;
