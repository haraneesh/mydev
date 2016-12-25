import React from 'react'
import { Row, Col } from 'react-bootstrap'
import MyOrderList from '../../containers/orders/MyOrdersList'

export const MyOrders = () => (
  <Row>
    <Col xs={ 12 }>
      <h3 className="page-header">My Orders</h3>
      <MyOrderList />
    </Col>
  </Row>
)
