import React from 'react'
import { Row, Col } from 'react-bootstrap'
import ManageAllOrders from '../../containers/admin/ManageAllOrders'

export const AllOrders = () => (
  <Row>
    <Col xs={ 12 }>
      <h3 className="page-header">All Orders</h3>
      <ManageAllOrders />
    </Col>
  </Row>
)