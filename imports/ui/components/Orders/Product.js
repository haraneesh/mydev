import React from 'react';
import { ListGroupItem, Label } from 'react-bootstrap';
import PropTypes from 'prop-types';
import ProductForAdmin from './ProductForAdmin';
import ProductForNonAdmin from './ProductForNonAdmin';

import './Product.scss';

const Product = ({ updateProductQuantity, product, isAdmin }) => (
  <div key={product._id} className={(product.displayAsSpecial) ? 'special-product-item' : ''}>
    {/*product.displayAsSpecial ? (<Label bsStyle="warning">special</Label>) : ''*/}
    {!isAdmin ?
    (<ProductForNonAdmin
      productId={product._id}
      sku={product.sku}
      name={product.name}
      image={product.image_path}
      description={product.description}
      unit={product.unitOfSale}
      unitprice={product.unitprice}
      vendor={product.vendor_details}
      onChange={updateProductQuantity}
      quantitySelected={(product.quantity) ? product.quantity : 0}
      unitsForSelection={product.unitsForSelection}
      maxUnitsAvailableToOrder={(product.maxUnitsAvailableToOrder) ? product.maxUnitsAvailableToOrder : 0}
      totQuantityOrdered={product.totQuantityOrdered}
      previousOrdQty={(product.previousOrdQty) ? product.previousOrdQty : 0}
      isAdmin={isAdmin}
    />)
    :
    (<ProductForAdmin
      productId={product._id}
      sku={product.sku}
      name={product.name}
      image={product.image_path}
      description={product.description}
      unit={product.unitOfSale}
      unitprice={product.unitprice}
      vendor={product.vendor_details}
      onChange={updateProductQuantity}
      quantitySelected={(product.quantity) ? product.quantity : 0}
      unitsForSelection={product.unitsForSelection}
      maxUnitsAvailableToOrder={(product.maxUnitsAvailableToOrder) ? product.maxUnitsAvailableToOrder : 0}
      totQuantityOrdered={product.totQuantityOrdered}
      previousOrdQty={(product.previousOrdQty) ? product.previousOrdQty : 0}
      isAdmin={isAdmin}
    />)
  }
  </div>
);

Product.defaultProps = {
  showQuantitySelector: true,
};

Product.propTypes = {
  updateProductQuantity: PropTypes.func.isRequired,
  product: PropTypes.object.isRequired,
  isAdmin: PropTypes.bool.isRequired,
};

export default Product;
