/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { assert } from 'meteor/practicalmeteor:chai';
import Recipes from './recipes.js';

describe('Recipes collection', function () {
  it('registers the collection with Mongo properly', function () {
    assert.equal(typeof Recipes, 'object');
  });
});
