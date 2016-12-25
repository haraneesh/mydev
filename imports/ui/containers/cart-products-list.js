import { composeWithTracker } from 'react-komposer'
import { CartProducts } from '../../api/cart/cart-products.js'
import { CartProductsList } from '../components/cart/cart-products-list.js'
import { Loading } from '../components/Loading.js'
import { Meteor } from 'meteor/meteor'

const composer = (params, onData) => {
  const subscription = Meteor.subscribe('cartProducts')
  if (subscription.ready()) {
    const cartProducts = CartProducts.find().fetch()
    onData(null, { cartProducts })
  }
}

export default composeWithTracker(composer, Loading)(CartProductsList)
