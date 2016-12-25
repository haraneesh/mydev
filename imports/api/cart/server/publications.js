import { Meteor } from 'meteor/meteor'
import { CartProducts } from '../cart-products'

Meteor.publish('cartProducts', () => CartProducts.find())
