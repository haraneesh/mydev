import { CartProducts } from './cart-products'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import  rateLimit  from '../../modules/rate-limit.js'

export const insertCartProduct = new ValidatedMethod({
  name: 'cart.product.insert',
  validate: new SimpleSchema({
    productId: { type: String },
    quantity: { type: Number },
  }).validator(),
  run(cartProduct) {
    CartProducts.insert(cartProduct)
  },
})

export const updateCartProductQty = new ValidatedMethod({
  name: 'cart.product.quantity.update',
  validate: new SimpleSchema({
    _id: { type: String },
    'update.quantity': { type: Number, optional: true },
  }).validator(),
  run({ _id, update }) {
    CartProducts.update(_id, { $set: update })
  },
})

export const removeCartProduct = new ValidatedMethod({
  name: 'cart.product.remove',
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  run({ _id }) {
    CartProducts.remove(_id)
  },
})

rateLimit({
  methods: [
    insertCartProduct,
    updateCartProductQty,
    removeCartProduct,
  ],
  limit: 5,
  timeRange: 1000,
})
