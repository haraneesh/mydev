import React from 'react';
import { useTracker, useSubscribe } from 'meteor/react-meteor-data'; 
import { Orders } from '../../../api/Orders/Orders';
import ProductLists from '../../../api/ProductLists/ProductLists';
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

const compose = ({match, history, loggedInUserId }) => {
  const isLoadingOrders = useSubscribe('orders.orderDetails', match.params._id);
  const order = useTracker(() => Orders.findOne());
  const isLoadingProductList = useSubscribe('productList.view', order.productOrderListId);
  const productList = useTracker(() => ProductLists.findOne());
  
  if (isLoadingOrders() || isLoadingProductList()) {
      return (<Loading />);
    }

  const orderP = getOrderWithProductListProductsAdded(order, productList);
  return (<EditOrderDetails order = {orderP} loggedInUserId={loggedInUserId} history={history} />); 
};

export default compose;
