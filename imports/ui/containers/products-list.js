import { composeWithTracker } from 'react-komposer'
import Products  from '../../api/products/products.js'
import { ProductsList } from '../components/products/products-list.js'
import { Loading } from '../components/Loading.js'
import { Meteor } from 'meteor/meteor'

const composer = (params, onData) => {
  const subscription = Meteor.subscribe('products')
  if (subscription.ready()) {
    const products = Products.find().fetch()
    onData(null, { products })
  }
}

export default composeWithTracker(composer, Loading)(ProductsList)
