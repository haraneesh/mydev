import React from 'react'
import { Row, Col } from 'react-bootstrap'
import ProductsOrderList from '../../containers/orders/ProductsOrderList'

const Order = () => (
  <Row>
    <Col xs={ 12 }>
      <h3 className="page-header">Place an Order</h3>
      <ProductsOrderList />
    </Col>
  </Row>
)

export default Order
