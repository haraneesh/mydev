import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import rateLimit from '../../modules/rate-limit';
import Media from './media';

export const getMediaFiles = new ValidatedMethod({
  name: 'media.getMediaFiles',
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  run({ _id }) {
    return Media.find({ _id }).fetch();
  },
});

rateLimit({
  methods: [getMediaFiles],
  limit: 5,
  timeRange: 1000,
});
