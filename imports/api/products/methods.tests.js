/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Meteor } from 'meteor/meteor'
import { assert } from 'meteor/practicalmeteor:chai'
import { resetDatabase } from 'meteor/xolvio:cleaner'
import { Factory } from 'meteor/dburles:factory'
import { Products } from './products.js'
import { insertProduct, updateProductName, updateProductPrice, updateProductDescription, removeProduct } from './methods.js'

describe('Products methods', function () {
  beforeEach(function () {
    if (Meteor.isServer) {
      resetDatabase()
    }
  })

  it('inserts a product into the Products collection', function () {
    insertProduct.call({ name: 'Test Product' })
    const getProduct = Products.findOne({ name: 'Test Product' })
    assert.equal(getProduct.name, 'Test Product')
  })

  it('updates a product name in the Products collection', function () {
    const { _id } = Factory.create('product')

    updateProductName.call({
      _id,
      update: {
        name: 'Test Product 2',
      },
    })

    const getProduct = Products.findOne(_id)
    assert.equal(getProduct.name, 'Test Product 2')
  })


  it('updates a product price in the Products collection', function () {
    const { _id } = Factory.create('product')

    updateProductPrice.call({
      _id,
      update: {
        price: 99,
      },
    })

    const getProduct = Products.findOne(_id)
    assert.equal(getProduct.price, 99)
  })


  it('updates a product description in the Products collection', function () {
    const { _id } = Factory.create('product')

    updateProductName.call({
      _id,
      update: {
        description: 'A product test description.',
      },
    })

    const getProduct = Products.findOne(_id)
    assert.equal(getProduct.description, 'A product test description')
  })


  it('removes a product from the Products collection', function () {
    const { _id } = Factory.create('product')
    removeProduct.call({ _id })
    const getProduct = Products.findOne(_id)
    assert.equal(getProduct, undefined)
  })
})
