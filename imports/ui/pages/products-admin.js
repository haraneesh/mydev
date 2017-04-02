import React from 'react'
import { Row, Col } from 'react-bootstrap'
import ListAllProducts from '../containers/ListAllProducts'
import { InsertProduct } from '../components/products-admin/insert-product'

export const ProductsAdmin = ({params}) =>(
  <Row>
    <Col xs={ 12 }>
      <h3 className="page-header">{ (params._id)? "Editing Product List - " + params._id: "Products Admin" }</h3>
      <InsertProduct />
      <ListAllProducts productListId = { params._id } />
    </Col>
  </Row>
)

