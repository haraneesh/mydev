import { composeWithTracker } from 'react-komposer'
import  Products from '../../api/products/products'
import ListAllProducts from '../components/products-admin/ListAllProducts'
import { Loading } from '../components/Loading'
import { Meteor } from 'meteor/meteor'

const composer = (params, onData) => {
  const subscription = Meteor.subscribe('products.list')
  if (subscription.ready()) {
    const products = Products.find().fetch()
    onData(null, { products, productListId:params.productListId })
  }
}

export default composeWithTracker(composer, Loading)(ListAllProducts)
