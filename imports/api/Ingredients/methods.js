import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Ingredients from './Ingredients';
import ApiUtils from './ApiUtils';
import rateLimit from '../../modules/rate-limit';
import handleMethodException from '../../modules/handle-method-exception';

function escapeRegexCharacters(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const filterGroup = [
  100,
  200,
  400,
  900,
  1100,
  1200,
  1600,
  2000,
  90000,
];

Meteor.methods({
  'ingredients.find': function ingredientsFind(searchParams) {
    check(searchParams, {
      searchString: String,
    });
    try {
      // has to be \" double quotes
      const srchString = `\"${searchParams.searchString.split(' ').join('\" \"')}\"`;
      const retVal = Ingredients.find(
        {
          $text: { $search: srchString },
          FdGrp_Cd: { $in: filterGroup },
        },
        {
          fields: {
            score: { $meta: 'textScore' },
          },
          sort: {
            score: { $meta: 'textScore' },
          },
        });
      return retVal.fetch();
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  /* Parameters

    The only required parameter for a valid search request is your authentication key (api_key). The default sort order of results list is "relevance", i.e. how closely a food matches the query terms.

    Name	Required	Default	Description
    api_key	y	n/a	Must be a data.gov registered API key
    q	n	""	Search terms
    ds	n	""	Data source. Must be either 'Branded Food Products' or 'Standard Reference'
    fg	n	""	Food group ID
    sort	n	r	Sort the results by food name (n) or by search relevance (r)
    max	n	50	maximum rows to return
    offset	n	0	beginning row in the result set to begin
    format	n	JSON	results format: json or xml
  */
  'ingredients.getApi': function ingredientsGetApi(searchParams) {
    check(searchParams, {
      searchString: String,
    });
    try {
      const results = ApiUtils.getRecordsByParams('search', {
        q: escapeRegexCharacters(searchParams.searchString),
        max: 25,
        offset: 0,
        format: 'json',
        ds: 'Standard Reference',
        sort: 'r',
      });
      const ingList = [];
      /*
      const filterGroup = [
        'Cereal Grains and Pasta',
        'Dairy and Egg Products',
        'Fats and Oils',
        'Fruits and Fruit Juices',
        'Legumes and Legume Products',
        'Nut and Seed Products',
        'Spices and Herbs',
        'Vegetables and Vegetable Products',
      ]; */

      if (!results.data || !results.data.list) {
        return [];
      }

      results.data.list.item.forEach((value) => {
        if (filterGroup.indexOf(value.group) > -1) { ingList.push(value); }
      });

      return ingList;
    } catch (exception) {
      handleMethodException(exception);
    }
  },
});

rateLimit({
  methods: [
    'ingredients.find',
    'ingredients.getApi',
  ],
  limit: 5,
  timeRange: 1000,
});
