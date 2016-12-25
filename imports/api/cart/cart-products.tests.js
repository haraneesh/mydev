/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { assert } from 'meteor/practicalmeteor:chai'
import { CartProducts } from './cart-products.js'

describe('CartProducts collection', function () {
  it('registers the collection with Mongo properly', function () {
    assert.equal(typeof CartProducts, 'object')
  })
})
