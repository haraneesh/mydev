import React from 'react';
import { Row, Col } from 'react-bootstrap';
import ListAllProducts from '../../containers/ProductsAdmin/ListAllProducts';
import InsertProduct from '../../components/ProductsAdmin/InsertProduct';

const ProductsAdmin = ({ match, history }) => (
  <Row>
    <Col xs={12}>
      <h3 className="page-header">{ (match.params._id) ? `Editing Product List - ${match.params._id}` : 'Products Admin' }</h3>
      <InsertProduct history={history} />
      <ListAllProducts productListId={match.params._id} history={history} />
    </Col>
  </Row>
);

export default ProductsAdmin;
