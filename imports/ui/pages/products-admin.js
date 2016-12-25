import React from 'react'
import { Row, Col } from 'react-bootstrap'
import ListAllProducts from '../containers/ListAllProducts'
import { InsertProduct } from '../components/products-admin/insert-product'

export const ProductsAdmin = () => (
  <Row>
    <Col xs={ 12 }>
      <h3 className="page-header">Products Admin</h3>
      <InsertProduct />
      <ListAllProducts />
    </Col>
  </Row>
)
