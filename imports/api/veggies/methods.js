import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import Veggies from './veggies';
import rateLimit from '../../modules/rate-limit.js';

export const upsertVeggie = new ValidatedMethod({
  name: 'veggies.upsert',
  validate: new SimpleSchema({
    _id: { type: String, optional: true },
    title: { type: String, optional: true },
    body: { type: String, optional: true },
  }).validator(),
  run(document) {
    return Veggies.upsert({ _id: document._id }, { $set: document });
  },
});

export const removeVeggie = new ValidatedMethod({
  name: 'veggies.remove',
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  run({ _id }) {
    Veggies.remove(_id);
  },
});

rateLimit({
  methods: [
    upsertVeggie,
    removeVeggie,
  ],
  limit: 5,
  timeRange: 1000,
});
