import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import React, { useState, useEffect } from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { toast } from 'react-toastify';
import Products from '../../../api/Products/Products';
import Loading from '../../components/Loading/Loading';
import InsertProduct from '../../components/ProductsAdmin/InsertProduct';
import ListAllProducts from '../../components/ProductsAdmin/ListAllProducts';
import UploadPrices from '../../components/ProductsAdmin/UploadPrices';

const ProductsAdminDetail = ({ loading, products, productListId, history }) =>
  !loading ? (
    <Row className="pb-4">
      <Col xs={12} className="justify-content-center text-center">
        <h2 className="py-4">
          {productListId
            ? `Editing Product List - ${productListId}`
            : 'Products Admin'}
        </h2>
        <InsertProduct history={history} />
        <UploadPrices products={products} history={history} />
        <ListAllProducts
          products={products}
          productListId={productListId}
          history={history}
        />
      </Col>
    </Row>
  ) : (
    <Loading />
  );

const ProductsAdmin = withTracker((props) => {
  const subscriptionProducts = Meteor.subscribe('products.list');
  return {
    loading: !subscriptionProducts.ready(),
    products: Products.find({}, { sort: { type: 1, name: 1 } }).fetch(),
    productListId: props.match.params._id,
    history: props.history,
  };
})(ProductsAdminDetail);

export default ProductsAdmin;
