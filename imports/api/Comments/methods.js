import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Email } from 'meteor/email';
import moment from 'moment';
import 'moment-timezone';
import Comments from './Comments';
import { Orders } from '../Orders/Orders';
import { dateSettings } from '../../modules/settings';
import rateLimit from '../../modules/rate-limit';
import constants from '../../modules/constants';
import OrderCommentTemplate from './order-comment-template';
import handleMethodException from '../../modules/handle-method-exception';

const notifyCommentOnOrder = (content, subject) => {
  const toEmail = Meteor.settings.private.toOrderCommentsEmail.split(',');
  const fromEmail = Meteor.settings.private.fromInvitationEmail;
  if (Meteor.isDevelopment) {
    console.log(`To Email: ${toEmail} From Email: ${fromEmail} Subject: ${subject} Content: ${content}`);
  } else {
    Email.send({
      to: toEmail,
      from: `Suvai Order Comments ${fromEmail}`,
      subject,
      html: content,
    });
  }
};

export const upsertComment = new ValidatedMethod({
  name: 'comments.upsert',
  validate: new SimpleSchema({
    _id: { type: String, optional: true },
    postType: { type: String, optional: true },
    description: { type: String, optional: true },
    postId: { type: String, optional: true },
    owner: { type: String, optional: true },
  }).validator(),
  async run(commentt) {
    const comment = commentt;
    comment.status = constants.CommentTypes.Approved.name;
    try {
      const response = await Comments.upsertAsync({ _id: comment._id }, { $set: comment });
      /*  if (constants.PostTypes.Order.name === comment.postType && Meteor.isServer) {
        const correspondingOrder = Orders.findOne({ _id: comment.postId });
        const customer = Meteor.users.findOne({ _id: comment.owner });

        this.unblock();
        const name = `${customer.profile.name.last}, ${customer.profile.name.first}`;
        const orderDate = moment(correspondingOrder.createdAt).tz(dateSettings.timeZone).format(dateSettings.shortFormat);
         notifyCommentOnOrder(
          OrderCommentTemplate(
            orderDate,
            name,
            customer.profile.whMobilePhone,
            comment.description),
          `${orderDate}, ${name} commented on an order.`);
      } */
      return response;
    } catch (exception) {
      handleMethodException(exception);
    }
  },
});

export const removeComment = new ValidatedMethod({
  name: 'comments.remove',
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  async run({ _id }) {
    await Comments.removeAsync(_id);
  },
});


rateLimit({
  methods: [
    upsertComment,
    removeComment,
  ],
  limit: 5,
  timeRange: 1000,
});
