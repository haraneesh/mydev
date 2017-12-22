import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Recipes from '../Recipes';
import constants from '../../../modules/constants';


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
}); */

// https://forums.meteor.com/t/infinite-scroll-in-meteor-react/36958/2

Meteor.publish('recipes.list', (options) => {
  // check(options, { limit: Number, sort: Match.ObjectIncluding({ createdAt: Number }) });
  check(options, { limit: Number, typeOfFood: String, sort: { createdAt: Number } });
  const { limit = constants.InfiniteScroll.DefaultLimit, typeOfFood, sort } = options;
  return Recipes.find({
    typeOfFood,
  }, {
    sort,
    limit,
  });
});

Meteor.publish('recipes.view', (_id) => {
  check(_id, String);
  return Recipes.find(_id);
});
