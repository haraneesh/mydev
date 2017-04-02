/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Factory } from 'meteor/dburles:factory';
import Documents from './recipes.js';
import { upsertDocument, removeDocument } from './methods.js';

describe('Documents methods', function () {
  beforeEach(function () {
    if (Meteor.isServer) {
      resetDatabase();
    }
  });

  it('inserts a recipe into the Documents collection', function () {
    upsertDocument.call({
      title: 'You can\'t arrest me, I\'m the Cake Boss!',
      body: 'They went nuts!',
    });

    const getDocument = Documents.findOne({ title: 'You can\'t arrest me, I\'m the Cake Boss!' });
    assert.equal(getDocument.body, 'They went nuts!');
  });

  it('updates a recipe in the Documents collection', function () {
    const { _id } = Factory.create('recipe');

    upsertDocument.call({
      _id,
      title: 'You can\'t arrest me, I\'m the Cake Boss!',
      body: 'They went nuts!',
    });

    const getDocument = Documents.findOne(_id);
    assert.equal(getDocument.title, 'You can\'t arrest me, I\'m the Cake Boss!');
  });

  it('removes a recipe from the Documents collection', function () {
    const { _id } = Factory.create('recipe');
    removeDocument.call({ _id });
    const getDocument = Documents.findOne(_id);
    assert.equal(getDocument, undefined);
  });
});
