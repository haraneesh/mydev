import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { withTracker } from 'meteor/react-meteor-data';
//import ListAllProducts from '../../containers/ProductsAdmin/ListAllProducts';
import InsertProduct from '../../components/ProductsAdmin/InsertProduct';
import UploadPrices from '../../components/ProductsAdmin/UploadPrices';
import ListAllProducts from '../../components/ProductsAdmin/ListAllProducts';
import Products from '../../../api/Products/Products';
import SuppliersCollection from '../../../api/Suppliers/Suppliers';
import Loading from '../../components/Loading/Loading';

const ProductsAdmin = ({ loading, products, suppliers, productListId, history }) => (!loading ? (

  <Row>
    <Col xs={12}>
      <h3 className="page-header">{(productListId) ? `Editing Product List - ${productListId}` : 'Products Admin'}</h3>
      <InsertProduct history={history} />
      <UploadPrices products={products} history={history} />
      {/*<ListAllProducts productListId={match.params._id} history={history} />*/}
      <ListAllProducts
        products={products}
        suppliers={suppliers}
        productListId={productListId}
        history={history} />
    </Col>
  </Row>) : (<Loading />)
);

export default withTracker((args) => {
  const productListId = args.match.params._id;

  const subscriptionProducts = Meteor.subscribe('products.list');

  const subscriptionToSuppliers = Meteor.subscribe('suppliers');


  return {
    loading: !subscriptionProducts.ready() || !subscriptionToSuppliers.ready(),
    products: Products.find({}, { sort: { type: 1, name: 1 } }).fetch(),
    suppliers: SuppliersCollection.find().fetch(),
    productListId,
    history: args.history,
  };
})(ProductsAdmin);

