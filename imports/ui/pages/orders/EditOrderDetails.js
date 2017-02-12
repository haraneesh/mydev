import React from 'react'
import { Row, Col, Pager } from 'react-bootstrap'
import ViewOrderDetailsC from '../../components/orders/ViewOrderDetails'
import ProductsOrderList from '../../components/orders/ProductsOrderList'
import constants from '../../../modules/constants'

const EditOrderDetails = ({ order }) =>{
  if (order.order_status === constants.OrderStatus.Pending.name )
  {
    return (
        <ProductsOrderList 
            orderId = { order._id } 
            products = { (order.products)? order.products : []   }
            productListId = { (order.productOrderListId)? order.productOrderListId : '' }
            order_status = { order.order_status }
            comments = { order.comments }
            total_bill_amount = { order.total_bill_amount }
        />
    ) 
  } else {
      return (
          <ViewOrderDetailsC order = { order }/>
      )
  }
}

EditOrderDetails.propTypes = {
  order: React.PropTypes.object.isRequired,
};

export default EditOrderDetails;
