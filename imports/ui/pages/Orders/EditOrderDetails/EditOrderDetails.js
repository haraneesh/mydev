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
import { CartStateContext, CartDispatchContext } from '../../../stores/ShoppingCart';
import OrdersCollection from '../../../../api/Orders/Orders';
import Loading from '../../../components/Loading/Loading';


const EditOrderDetails = ({ loading, order, history, loggedInUserId, addItemsFromCart }) => {
  switch (true) {
    case loading: {
      return <Loading />;
    }
    case (order.order_status === constants.OrderStatus.Pending.name ||
      order.order_status === constants.OrderStatus.Saved.name) : {
        const productListId = order.productOrderListId;
        const [productList, setProductList] = useState([]);
        const [isProductListLoading, setIsLoading] = useState(true);
        useEffect(() => {
          setIsLoading(true);
          Meteor.call('getProductList.view', productListId,
          (error, value) => {
            if (error) {
              Bert.alert(error.reason, 'danger');
            } else {
              setProductList(value);
              setIsLoading(false);
            }
          },

    );
        }, []);

        return !isProductListLoading ? (
          <CartStateContext.Consumer>
            { cartState => (
              <CartDispatchContext.Consumer>
                { cartDispatch => (
                  <ProductsOrderMain
                    productList={productList}
                    orderId={order._id}
                    orderedProducts={(order.products) ? order.products : []}
                    products={productList.products}
                    productListId={(order.productOrderListId) ? order.productOrderListId : ''}
                    orderStatus={order.order_status}
                    comments={order.comments}
                    totalBillAmount={order.total_bill_amount}
                    history={history}
                    addItemsFromCart={addItemsFromCart}
                    cartState={cartState}
                    cartDispatch={cartDispatch}
                  />
        )}
              </CartDispatchContext.Consumer>
      )}
          </CartStateContext.Consumer>
    ) : <Loading />;
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
        </div>);
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
  addItemsFromCart: PropTypes.bool.isRequired,
};

export default withTracker((args) => {
  const subscription = Meteor.subscribe('orders.orderDetails', args.match.params._id);

  const order = OrdersCollection.findOne({ _id: args.match.params._id });

  return {
    loading: !subscription.ready(),
    order,
    history: args.history,
    loggedInUserId: args.loggedInUserId,
    addItemsFromCart: !!(args.match.params.addItemsFromCart),
  };
})(EditOrderDetails);
