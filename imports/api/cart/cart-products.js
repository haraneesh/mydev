import faker from 'faker'
import { Mongo } from 'meteor/mongo'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Factory } from 'meteor/dburles:factory'

export const CartProducts = new Mongo.Collection('CartProducts')

CartProducts.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
})

CartProducts.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
})

CartProducts.schema = new SimpleSchema({
  productId: {
    type: String,
    label: 'The id of the product.',
  },
  quantity: {
    type: Number,
    label: 'The quantity of the product.',
  },
})

CartProducts.attachSchema(CartProducts.schema)

Factory.define('CartProducts', CartProducts, {
  title: () => faker.hacker.phrase(),
})
