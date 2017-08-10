import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import Specials from './Specials';
import rateLimit from '../../modules/rate-limit.js';
import constants from '../../modules/constants';

const _upsertSpecial = (userId, special) => {
  if (Roles.userIsInRole(userId, constants.Roles.admin.name)) {
    return Specials.upsert({ _id: special._id }, { $set: special });
  }

 // user not authorized. do not publish secrets
  throw new Meteor.Error(401, 'Access denied');
};

export const upsertSpecialDraft = new ValidatedMethod({
  name: 'specials.upsertDraft',
  validate: new SimpleSchema({
    _id: { type: String, optional: true },
    title: { type: String },
    description: { type: Object, optional: true, blackbox: true },
    displayOrder: { type: Number, optional: true },
    colorTheme: { type: String, optional: true },
    imageUrl: { type: String, optional: true },
  }).validator(),
  run(special) {
    // Check if special creator is the one who is updating
    const specialTemp = special;
    specialTemp.publishStatus = constants.PublishStatus.Draft.name;
    return _upsertSpecial(this.userId, specialTemp);
  },
});

const specialPublishSchema = new SimpleSchema({
  _id: { type: String },
  title: { type: String },
  description: {
    type: Object,
    blackbox: true,
    custom() {
      const { convertFromRaw } = require('draft-js');

      if (!convertFromRaw(this.value).hasText()) {
        return 'emptySpecialDescription';
      }
    },
  },
  imageUrl: { type: String },
  displayOrder: { type: Number, optional: true },
  colorTheme: { type: String },
});

specialPublishSchema.messageBox.messages({
  en: {
    emptySpecialDescription: 'A description is mandatory to publish a special announcement. To save it temporarily and edit it later you can save it as draft.',
  },
});

export const upsertSpecialPublish = new ValidatedMethod({
  name: 'specials.upsertPublish',
  validate: specialPublishSchema.validator(),
  run(special) {
    // Check if special creator is the one who is updating
    const specialTemp = special;
    specialTemp.publishStatus = constants.PublishStatus.Published.name;
    return _upsertSpecial(this.userId, specialTemp);
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
