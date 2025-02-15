import { Roles } from 'meteor/alanning:roles';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import Row from 'react-bootstrap/Row';
import { toast } from 'react-toastify';
import { Orders } from '../../../../api/Orders/Orders';
import constants from '../../../../modules/constants';
import { getProductUnitPrice } from '../../../../modules/helpers';
import Loading from '../../../components/Loading/Loading';
import SelectDeliveryLocation from '../../../components/Orders/ProductsOrderCommon/SelectDeliveryLocation';
// import ProductsOrderList from '../../../components/Orders/ProductsOrderList';
import ProductsOrderMain from '../../../components/Orders/ProductsOrderMain/ProductsOrderMain';
import ViewInvoicedOrderDetails from '../../../components/Orders/ViewInvoicedOrderDetails';
import ViewOrderDetails from '../../../components/Orders/ViewOrderDetails';
import Comments from '../../../containers/Comments/getComments';
import {
  cartActions,
  useCartDispatch,
  useCartState,
} from '../../../stores/ShoppingCart';
import NotFound from '../../Miscellaneous/NotFound/NotFound';

const EditOrderDetails = ({
  selectedOrder,
  loggedInUserId,
  loggedInUser,
  addItemsFromCart,
}) => {
  const cartState = useCartState();
  const cartDispatch = useCartDispatch();
  const [order] = useState(selectedOrder);
  const currentActiveCartId = cartState.activeCartId;
  const editOrder =
    order.order_status === constants.OrderStatus.Pending.name ||
    order.order_status === constants.OrderStatus.Saved.name;

  const updateCart = ({
    orderId,
    products,
    comments,
    basketId,
    payCashWithThisDelivery,
    collectRecyclablesWithThisDelivery,
    issuesWithPreviousOrder,
    deliveryPincode,
  }) => {
    switch (true) {
      case orderId !== '' && orderId === currentActiveCartId: {
        //! !addItemsFromCart
        cartDispatch({
          type: cartActions.activateCart,
          payload: { cartIdToActivate: orderId },
        });
        break;
      }
      case orderId !== '': {
        const selectedProducts = {};
        const orderedProducts = products || [];
        orderedProducts.forEach((product) => {
          selectedProducts[product._id] = product;
        });
        cartDispatch({
          type: cartActions.setActiveCart,
          payload: {
            activeCartId: orderId,
            selectedProducts,
            comments,
            basketId,
            deliveryPincode,
            payCashWithThisDelivery,
            collectRecyclablesWithThisDelivery,
            issuesWithPreviousOrder,
          },
        });
        break;
      }
      default: {
        cartDispatch({
          type: cartActions.activateCart,
          payload: { cartIdToActivate: 'NEW' },
        });
      }
    }
  };

  const [productList, setProductList] = useState([]);
  const [isProductListLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (editOrder) {
      const productListId = order.productOrderListId;
      setIsLoading(true);
      Meteor.call('getProductList.view', productListId, (error, prdList) => {
        if (error) {
          toast.error(error.reason);
        } else {
          updateCart({
            orderId: order._id,
            products: order.products,
            comments: order.comments,
            basketId: order.basketId || '',
            payCashWithThisDelivery: order.payCashWithThisDelivery || false,
            collectRecyclablesWithThisDelivery:
              order.collectRecyclablesWithThisDelivery || false,
            issuesWithPreviousOrder: order.issuesWithPreviousOrder || '',
            deliveryPincode: order.deliveryPincode || 0,
          });
          setProductList(prdList);
          setIsLoading(false);
        }
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  switch (true) {
    case editOrder: {
      return !isProductListLoading ? (
        <>
          <SelectDeliveryLocation loggedInUser={loggedInUser} />

          <ProductsOrderMain
            productList={productList}
            orderId={order._id || ''}
            products={getProductUnitPrice(
              Roles.userIsInRole(
                order.customer_details._id,
                constants.Roles.shopOwner.name,
              ),
              productList.products,
            )}
            productListId={
              order.productOrderListId ? order.productOrderListId : ''
            }
            orderCustomerId={order.customer_details._id}
            orderStatus={order.order_status}
            comments={order.comments}
            history={history}
            addItemsFromCart={addItemsFromCart}
            loggedInUser={loggedInUser}
          />
        </>
      ) : (
        <Loading />
      );
    }
    case 'invoices' in order &&
      order.invoices !== null &&
      order.invoices.length > 0: {
      return (
        <div className="pb-4">
          <ViewInvoicedOrderDetails order={order} />
          <Row className="p-4">
            <h4>Responses</h4>
            <Comments
              postId={order._id}
              postType={constants.PostTypes.Order.name}
              loggedUserId={loggedInUserId}
            />
          </Row>
        </div>
      );
    }
    default: {
      return (
        <div className="pb-4">
          <ViewOrderDetails order={order} />
          <Row className="p-4">
            <h4>Responses</h4>
            <Comments
              postId={order._id}
              postType={constants.PostTypes.Order.name}
              loggedUserId={loggedInUserId}
            />
          </Row>
        </div>
      );
    }
  }
};

EditOrderDetails.propTypes = {
  order: PropTypes.object.isRequired,
  loggedInUserId: PropTypes.string.isRequired,
  loggedInUser: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
};

const EditOrderDetailsWrapper = (props) =>
  props.loading ? (
    <Loading />
  ) : props.selectedOrder ? (
    <EditOrderDetails {...props} />
  ) : (
    <NotFound />
  );

export default withTracker((args) => {
  const subscription = Meteor.subscribe(
    'orders.orderDetails',
    args.match.params._id,
  );

  const order = Orders.findOne({ _id: args.match.params._id });

  return {
    loading: !subscription.ready(),
    selectedOrder: order,
    loggedInUserId: args.loggedInUserId,
    loggedInUser: args.loggedInUser,
  };
})(EditOrderDetailsWrapper);
