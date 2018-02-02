import React from 'react';
import { Row, Col, ListGroupItem } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { formatMoney } from 'accounting-js';
import QuantitySelector from './QuantitySelector';
import ProductForAdmin from './ProductForAdmin';
import { calcExcessQtyOrdered, InformProductUnavailability } from './ProductFunctions';
import { accountSettings } from '../../../modules/settings';

import './Product.scss';


// <Col sm = { 2 }><Image  src={ image } className = "order-image" responsive /> </Col>
const FieldGroup = ({
  productId,
  sku,
  name,
  image,
  description,
  unit,
  unitprice,
  vendor,
  onChange,
  quantitySelected,
  unitsForSelection,
  maxUnitsAvailableToOrder,
  totQuantityOrdered,
  previousOrdQty,
  isAdmin,
}) => (
  <Row>
    <Col sm={6}>
      <h4 className="product-name"><strong>{`${name} ${unit}`}</strong></h4>
      { (quantitySelected > 0) && <InformProductUnavailability
        maxUnitsAvailableToOrder={maxUnitsAvailableToOrder}
        excessQtyOrdered={
          calcExcessQtyOrdered(maxUnitsAvailableToOrder,
            totQuantityOrdered, previousOrdQty, quantitySelected)
          }
      /> }
      <h4><small>{description}</small></h4>
    </Col>

    <Col sm={3} className="text-right-not-xs">
      <h4>{formatMoney(unitprice, accountSettings)} <span className="text-muted">x</span></h4>
    </Col>

    <Col sm={3}>
      <QuantitySelector
        onChange={onChange}
        controlName={productId}
        quantitySelected={quantitySelected}
        values={(unitsForSelection) ? unitsForSelection.split(',') : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
        maxUnitsAvailableToOrder={maxUnitsAvailableToOrder}
      />
    </Col>
  </Row>
);

const Product = ({ updateProductQuantity, product, isAdmin }) => (
  <ListGroupItem key={product._id}>
    {!isAdmin ?
    (<FieldGroup
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
  </ListGroupItem>
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
