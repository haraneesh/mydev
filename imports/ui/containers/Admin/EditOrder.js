import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';
import Orders from '../../../api/Orders/Orders';
import ProductLists from '../../../api/ProductLists/ProductLists';
// import ProductsOrderList from '../../components/Orders/ProductsOrderList'
import EditOrderDetails from '../../pages/Orders/EditOrderDetails/EditOrderDetails';
import Loading from '../../components/Loading/Loading';

function getOrderWithProductListProductsAdded(order, productList) {
  const newOrder = order;
  const orderProductArray = order.products.reduce((map, obj) => {
    const mapp = map;
    mapp[obj._id] = obj;
    return mapp;
  }, {});

  newOrder.products = productList.products.slice();
  newOrder.products.forEach((prd) => {
    const product = prd;
    product.quantity = (orderProductArray[product._id]) ? orderProductArray[product._id].quantity : 0;
  });
  return newOrder;
}

const composer = ({ match, history }, onData) => {
  const subscription = Meteor.subscribe('orders.orderDetails', match.params._id);
  if (subscription.ready()) {
    const order = Orders.findOne();
    const subscriptionToProductList = Meteor.subscribe('productList.view', order.productOrderListId);

    if (subscriptionToProductList.ready()) {
      const productList = ProductLists.findOne();
      const orderP = getOrderWithProductListProductsAdded(order, productList);
      onData(null, { order: orderP, history });
    }
  }
};

export default composeWithTracker(composer, Loading)(EditOrderDetails);
