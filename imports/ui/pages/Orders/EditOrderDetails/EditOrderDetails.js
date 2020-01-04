import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Bert } from 'meteor/themeteorchef:bert';
import { Panel } from 'react-bootstrap';
import ViewOrderDetails from '../../../components/Orders/ViewOrderDetails';
import ViewInvoicedOrderDetails from '../../../components/Orders/ViewInvoicedOrderDetails';
// import ProductsOrderList from '../../../components/Orders/ProductsOrderList';
import ProductsOrderMain from '../../../components/Orders/ProductsOrderMain/ProductsOrderMain';
import constants from '../../../../modules/constants';
import Comments from '../../../containers/Comments/getComments';
import OrdersCollection from '../../../../api/Orders/Orders';
import Loading from '../../../components/Loading/Loading';
import { cartActions, useCartState, useCartDispatch } from '../../../stores/ShoppingCart';

const EditOrderDetails = ({ selectedOrder, history, loggedInUserId, addItemsFromCart }) => {
  const cartState = useCartState();
  const cartDispatch = useCartDispatch();
  const [order, setOrder] = useState(selectedOrder);
  const currentActiveCartId = cartState.activeCartId;
  const editOrder = (order.order_status === constants.OrderStatus.Pending.name ||
 order.order_status === constants.OrderStatus.Saved.name);

  const updateCart = ({ orderId, products, comments }) => {
    switch (true) {
      case (orderId !== '' && orderId === currentActiveCartId): { //! !addItemsFromCart
        cartDispatch({ type: cartActions.activateCart, payload: { cartIdToActivate: orderId } });
        break;
      }
      case (orderId !== ''): {
        const selectedProducts = {};
        const orderedProducts = products || [];
        orderedProducts.forEach((product) => {
          selectedProducts[product._id] = product;
        });
        cartDispatch({ type: cartActions.setActiveCart, payload: { activeCartId: orderId, selectedProducts, comments } });
        break;
      }
      default: {
        cartDispatch({ type: cartActions.activateCart, payload: { cartIdToActivate: 'NEW' } });
      }
    }
  };

  const [productList, setProductList] = useState([]);
  const [isProductListLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (editOrder) {
      const productListId = order.productOrderListId;
      setIsLoading(true);
      Meteor.call('getProductList.view', productListId,
    (error, prdList) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        updateCart({ orderId: order._id, products: order.products, comments: order.comments });
        setProductList(prdList);
        setIsLoading(false);
      }
    });
    } else {
      setIsLoading(false);
    }
  }
, []);


  switch (true) {
    case (editOrder) : {
      return !isProductListLoading ?
        (<ProductsOrderMain
          productList={productList}
          orderId={order._id || ''}
          products={productList.products}
          productListId={(order.productOrderListId) ? order.productOrderListId : ''}
          orderStatus={order.order_status}
          comments={order.comments}
          history={history}
          addItemsFromCart={addItemsFromCart}
        />) : <Loading />;
    }
    case (order.invoices): {
      return (
        <div>
          <ViewInvoicedOrderDetails order={order} history={history} />
          <Panel>
            <h4>Responses</h4>
            <Comments
              postId={order._id}
              postType={constants.PostTypes.Order.name}
              loggedUserId={loggedInUserId}
            />
          </Panel>
        </div>
      );
    }
    default: {
      return (<div>
        <ViewOrderDetails order={order} history={history} />
        <Panel>
          <h4>Responses</h4>
          <Comments postId={order._id} postType={constants.PostTypes.Order.name} loggedUserId={loggedInUserId} />
        </Panel>
      </div>
      );
    }
  }
};

EditOrderDetails.propTypes = {
  order: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  loggedInUserId: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
};

const EditOrderDetailsWrapper = props => props.loading ? (<Loading />) : (<EditOrderDetails {...props} />);


export default withTracker((args) => {
  const subscription = Meteor.subscribe('orders.orderDetails', args.match.params._id);

  const order = OrdersCollection.findOne({ _id: args.match.params._id });

  return {
    loading: !subscription.ready(),
    selectedOrder: order,
    history: args.history,
    loggedInUserId: args.loggedInUserId,
  };
})(EditOrderDetailsWrapper);
