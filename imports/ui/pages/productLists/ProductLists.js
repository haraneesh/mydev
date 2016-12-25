import React from 'react'
import { Row, Col } from 'react-bootstrap'
import DisplayProductLists from '../../containers/productLists/DisplayProductLists'

export const ProductLists = () => (
  <Row>
    <Col xs={ 12 }>
      <h3 className="page-header">All Product Lists</h3>
      <DisplayProductLists />
    </Col>
  </Row>
)
