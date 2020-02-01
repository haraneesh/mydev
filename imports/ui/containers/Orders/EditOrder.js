import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';
import { Orders } from '../../../api/Orders/Orders';
import ProductLists from '../../../api/ProductLists/ProductLists';
// import ProductsOrderList from '../../components/orders/ProductsOrderList'
import EditOrderDetails from '../../pages/Orders/EditOrderDetails/EditOrderDetails';
import Loading from '../../components/Loading/Loading';

function getOrderWithProductListProductsAdded(order, productList) {
  const newOrder = order;
  const orderProductArray = order.products.reduce((map, obj) => {
    map[obj._id] = obj;
    return map;
  }, {});

  newOrder.products = productList.products.slice();
  newOrder.products.forEach((prd) => {
    const product = prd;
    product.quantity = (orderProductArray[product._id] && orderProductArray[product._id].quantity) ? orderProductArray[product._id].quantity : 0;
    product.previousOrdQty = product.quantity;
  });
  return newOrder;
}

const composer = ({match, history, loggedInUserId }, onData) => {
  const subscription = Meteor.subscribe('orders.orderDetails', match.params._id);
  if (subscription.ready()) {
    const order = Orders.findOne();
    const subscriptionToProductList = Meteor.subscribe('productList.view', order.productOrderListId);

    if (subscriptionToProductList.ready()) {
      const productList = ProductLists.findOne();
      const orderP = getOrderWithProductListProductsAdded(order, productList);
      onData(null, { order: orderP, loggedInUserId, history });
    }
  }
};

export default composeWithTracker(composer, Loading)(EditOrderDetails);
