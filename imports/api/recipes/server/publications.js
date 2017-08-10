import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Recipes from '../Recipes';

const DEFAULT_LIMIT = 10;

Meteor.publish('recipes.list1', () => Recipes.find());

/*
Meteor.publish('foo', (options) => {
  const { limit = DEFAULT_LIMIT } = options;
  return [
    Foo.find({}, {
      sort: { bar: 1 },
      limit,
    }),
  ];
});*/

Meteor.publish('recipes.list', (options) => {
  check(options, { limit: Number });
  const { limit = DEFAULT_LIMIT } = options;
  return [Recipes.find({}, {
    sort: { createdAt: 1 },
    limit,
  })];
});


Meteor.publish('recipes.view', (_id) => {
  check(_id, String);
  return Recipes.find(_id);
});
