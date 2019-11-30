import React from 'react';
import PropTypes from 'prop-types';
import { Panel } from 'react-bootstrap';
import ViewOrderDetails from '../../../components/Orders/ViewOrderDetails';
import ViewInvoicedOrderDetails from '../../../components/Orders/ViewInvoicedOrderDetails';
// import ProductsOrderList from '../../../components/Orders/ProductsOrderList';
import ProductsOrderMain from '../../../components/Orders/ProductsOrderMain/ProductsOrderMain';
import constants from '../../../../modules/constants';
import Comments from '../../../containers/Comments/getComments';

const EditOrderDetails = ({ order, history, loggedInUserId }) => {
  if (
      order.order_status === constants.OrderStatus.Pending.name ||
      order.order_status === constants.OrderStatus.Saved.name
    ) {
    return (
      <ProductsOrderMain
        orderId={order._id}
        products={(order.products) ? order.products : []}
        productListId={(order.productOrderListId) ? order.productOrderListId : ''}
        orderStatus={order.order_status}
        comments={order.comments}
        totalBillAmount={order.total_bill_amount}
        history={history}
      />
    );
  }

  if (order.invoices) {
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

  return (
    <div>
      <ViewOrderDetails order={order} history={history} />
      <Panel>
        <h4>Responses</h4>
        <Comments postId={order._id} postType={constants.PostTypes.Order.name} loggedUserId={loggedInUserId} />
      </Panel>
    </div>
  );
};

EditOrderDetails.propTypes = {
  order: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  loggedInUserId: PropTypes.string.isRequired,
};

export default EditOrderDetails;
