import { composeWithTracker } from 'react-komposer'
//import Products from '../../../api/products/products'
import ProductLists from '../../../api/productLists/productLists'
import ProductsOrderList from '../../components/orders/ProductsOrderList'
import { Loading } from '../../components/Loading'
import { Meteor } from 'meteor/meteor'

const composer = ({ dateValue }, onData) => {
  //const subscription = Meteor.subscribe('products.list')
  //const dateValue = Date.now()
  //const dateValue = new Date("1/11/2017")
  const subscription = Meteor.subscribe('productOrderList.view', dateValue)

  if (subscription.ready()) {
    const productList = ProductLists.findOne()
    const products = (productList)? productList.products : [] 
    const productListId = (productList)? productList._id : ''
    onData(null, { products, productListId })
  }
}

export default composeWithTracker(composer, Loading)(ProductsOrderList)
