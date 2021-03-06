import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import Specials from './Specials';
import rateLimit from '../../modules/rate-limit.js';
import constants from '../../modules/constants';
import handleMethodException from '../../modules/handle-method-exception';

const upsertSpecial = (userId, special) => {
  if (Roles.userIsInRole(userId, constants.Roles.admin.name)) {
    return Specials.upsert({ _id: special._id }, { $set: special });
  }

  // user not authorized. do not publish secrets
  throw new Meteor.Error(401, 'Access denied');
};

export const upsertSpecialDraft = new ValidatedMethod({
  name: 'specials.upsertDraft',
  validate: Specials.schema.validator(),
  run(special) {
    try {
    // Check if special creator is the one who is updating
      const specialTemp = special;
      specialTemp.publishStatus = constants.PublishStatus.Draft.name;
      return upsertSpecial(this.userId, specialTemp);
    } catch (exception) {
      handleMethodException(exception);
    }
  },
});

export const upsertSpecialPublish = new ValidatedMethod({
  name: 'specials.upsertPublish',
  validate: Specials.schema.validator(),
  run(special) {
    try {
    // Check if special creator is the one who is updating
      const specialTemp = special;
      specialTemp.publishStatus = constants.PublishStatus.Published.name;
      return upsertSpecial(this.userId, specialTemp);
    } catch (exception) {
      handleMethodException(exception);
    }
  },
});

export const removeSpecial = new ValidatedMethod({
  name: 'specials.remove',
  validate: new SimpleSchema({
    specialId: { type: String },
  }).validator(),
  run({ specialId }) {
    if (Roles.userIsInRole(this.userId, ['admin'])) {
      Specials.remove({ _id: specialId });
    }
  },
});

rateLimit({
  methods: [
    upsertSpecialDraft,
    upsertSpecialPublish,
    removeSpecial,
  ],
  limit: 5,
  timeRange: 1000,
});
