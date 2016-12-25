/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Meteor } from 'meteor/meteor'
import { assert } from 'meteor/practicalmeteor:chai'
import { resetDatabase } from 'meteor/xolvio:cleaner'
import { Factory } from 'meteor/dburles:factory'
import { CartProducts } from './cart-products.js'
import { addCartProduct, updateCartProductQty, removeCartProduct } from './methods.js'

describe('Cart methods', function () {
  beforeEach(function () {
    if (Meteor.isServer) {
      resetDatabase()
    }
  })

  it('inserts a product into the CartProducts collection', function () {
    addCartProduct.call({ name: 'Test Cart' })
    const getCartProduct = CartProducts.findOne({ name: 'Test Cart' })
    assert.equal(getCartProduct.name, 'Test Cart')
  })


  it('updates a product quantity in the CartProducts collection', function () {
    const { _id } = Factory.create('cartProduct')

    updateCartProductQty.call({
      _id,
      update: {
        quantity: 9,
      },
    })

    const getCartProduct = CartProducts.findOne(_id)
    assert.equal(getCartProduct.quantity, 9)
  })


  it('removes a product from the Cart collection', function () {
    const { _id } = Factory.create('cartProduct')
    removeCartProduct.call({ _id })
    const getCartProduct = CartProducts.findOne(_id)
    assert.equal(getCartProduct, undefined)
  })
})
