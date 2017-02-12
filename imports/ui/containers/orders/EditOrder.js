import { Meteor } from 'meteor/meteor'
import { composeWithTracker } from 'react-komposer'
import Orders from '../../../api/orders/orders'
import ProductLists from '../../../api/productLists/productLists'
//import ProductsOrderList from '../../components/orders/ProductsOrderList'
import EditOrderDetails from '../../pages/orders/EditOrderDetails'
import Loading from '../../components/Loading'

function getOrderWithProductListProductsAdded(order, productList){
  let newOrder = order
  let orderProductArray = order.products.reduce(function(map, obj) {
        map[obj._id] = obj;
        return map;
      }, {});
        
      newOrder.products = productList.products.slice()
      newOrder.products.forEach(function (product){
        product.quantity = (orderProductArray.hasOwnProperty(product._id))? orderProductArray[product._id].quantity : 0
      })
      return newOrder
}

const composer = ({ params }, onData) => {
  const subscription = Meteor.subscribe('orders.orderDetails', params._id)
   if (subscription.ready()) {
      const order = Orders.findOne()

      const subscriptionToProductList = Meteor.subscribe('productList.view',order.productOrderListId)

        if ( subscriptionToProductList.ready()){
          const productList = ProductLists.findOne()
          const orderP = getOrderWithProductListProductsAdded(order, productList)
          onData(null, { order:orderP });
        } 
    }
}

export default composeWithTracker(composer, Loading)(EditOrderDetails);
