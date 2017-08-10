import React from 'react';
import PropTypes from 'prop-types';
import ViewOrderDetailsC from '../../../components/Orders/ViewOrderDetails';
import ProductsOrderList from '../../../components/Orders/ProductsOrderList';
import constants from '../../../../modules/constants';

const EditOrderDetails = ({ order, history }) => {
  if (order.order_status === constants.OrderStatus.Pending.name) {
    return (
      <ProductsOrderList
        orderId={order._id}
        products={(order.products) ? order.products : []}
        productListId={(order.productOrderListId) ? order.productOrderListId : ''}
        order_status={order.order_status}
        comments={order.comments}
        total_bill_amount={order.total_bill_amount}
        history={history}
      />
    );
  }
  return (
    <ViewOrderDetailsC order={order} history={history} />
  );
};

EditOrderDetails.propTypes = {
  order: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default EditOrderDetails;
