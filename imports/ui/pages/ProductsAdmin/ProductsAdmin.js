import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { withTracker } from 'meteor/react-meteor-data';
import { toast } from 'react-toastify';
import InsertProduct from '../../components/ProductsAdmin/InsertProduct';
import UploadPrices from '../../components/ProductsAdmin/UploadPrices';
import ListAllProducts from '../../components/ProductsAdmin/ListAllProducts';
import Products from '../../../api/Products/Products';
import Loading from '../../components/Loading/Loading';

const ProductsAdmin = (args) => {
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    setIsLoadingSuppliers(true);
    Meteor.call('suppliers.list', (error, supplierss) => {
      if (error) {
        toast.error(error.reason);
      } else {
        setSuppliers(supplierss);
      }
      setIsLoadingSuppliers(false);
    });
  }, []);

  return isLoadingSuppliers ? (<Loading />) : (<ProductsAdminSub history={args.history} productListId={args.match.params._id} suppliers={suppliers} />);
};

export default ProductsAdmin;

const ProductsAdminDetail = ({
  loading, products, suppliers, productListId, history,
}) => (
  !loading ? (
    <Row className="pb-4">
      <Col xs={12} className="justify-content-center text-center">
        <h2 className="py-4">{(productListId) ? `Editing Product List - ${productListId}` : 'Products Admin'}</h2>
        <InsertProduct history={history} />
        <UploadPrices products={products} history={history} />
        <ListAllProducts
          products={products}
          suppliers={suppliers}
          productListId={productListId}
          history={history}
        />
      </Col>
    </Row>
  ) : (<Loading />)
);

const ProductsAdminSub = withTracker(({ history, productListId, suppliers }) => {
  const subscriptionProducts = Meteor.subscribe('products.list');

  return {
    loading: !subscriptionProducts.ready(),
    products: Products.find({}, { sort: { type: 1, name: 1 } }).fetch(),
    suppliers,
    productListId,
    history,
  };
})(ProductsAdminDetail);
