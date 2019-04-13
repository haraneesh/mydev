import React from 'react';
import { Row, Col, FormControl } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { formatMoney } from 'accounting-js';
import { calcExcessQtyOrdered, InformProductUnavailability } from './ProductFunctions';
import { accountSettings } from '../../../modules/settings';
import { displayUnitOfSale } from '../../../modules/helpers';


const QuantitySelector = ({
  values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  onChange,
  unit,
  unitprice,
  controlName,
  quantitySelected,
}) => (
    <FormControl name={controlName} onChange={onChange} componentClass="select" value={quantitySelected}>
      {values.map((selectValue, index) => (
        <option value={selectValue} key={`option-${index}`} > {displayUnitOfSale(selectValue, unit)} </option>
      ))
      }
    </FormControl>
  );

const ProductName = ({ name, description, quantitySelected, maxUnitsAvailableToOrder, totQuantityOrdered, previousOrdQty }) => (
  <div className="productNameDesc">
    <h4 className="product-name"><strong>{name}</strong></h4>
    {(quantitySelected > 0) && <InformProductUnavailability
      maxUnitsAvailableToOrder={maxUnitsAvailableToOrder}
      excessQtyOrdered={
        calcExcessQtyOrdered(maxUnitsAvailableToOrder,
          totQuantityOrdered, previousOrdQty, quantitySelected)
      }
    />}
    <p><small>{description}</small></p>
  </div>
)

const ProductForNonAdmin = ({
  // <Col sm = { 2 }><Image  src={ image } className = "order-image" responsive /> </Col>
  productId,
  name,
  description,
  unit,
  unitprice,
  onChange,
  quantitySelected,
  unitsForSelection,
  maxUnitsAvailableToOrder,
  totQuantityOrdered,
  previousOrdQty,
  image_path,
}) => {
  const firstNonZeroOrderQty = 1;
  const unitsForSelectionArray = unitsForSelection.split(',');
  const lowestOrdQty = unitsForSelectionArray.length > 0 ? unitsForSelectionArray[firstNonZeroOrderQty] : 0;
  const lowestOrdQtyPrice = unitprice * lowestOrdQty;

  const prodNameDesc = (<ProductName
    name={name} description={description}
    quantitySelected={quantitySelected} maxUnitsAvailableToOrder={maxUnitsAvailableToOrder}
    totQuantityOrdered={totQuantityOrdered} previousOrdQty={previousOrdQty} />);

  const imageRow = (<img src={image_path?image_path:"/veggies/no-image.jpg"} alt="" className="item-image no-aliasing-image img-responsive" />);

  return (
    <Col sm={6} className="no-padding product-item">
      <Col xs={8} xsOffset={2} sm={4} smOffset={0}>
        {imageRow}
      </Col>

      <Col xs={12} sm={8}>
       <Row>
          <Col xs={12}>
            {prodNameDesc}
          </Col>

          <Col xs={12}>
            <h4> {`${displayUnitOfSale(lowestOrdQty, unit)}, ${formatMoney(lowestOrdQtyPrice, accountSettings)}`} </h4>
          </Col>

          <Col xs={12}>
            <QuantitySelector
              onChange={onChange}
              unit={unit}
              unitprice={unitprice}
              controlName={productId}
              quantitySelected={quantitySelected}
              values={unitsForSelectionArray}
              maxUnitsAvailableToOrder={maxUnitsAvailableToOrder}
            />
          </Col>
      </Row>
      </Col>
    </Col>
  );
};

ProductForNonAdmin.defaultProps = {
  description: '',
  unitsForSelection: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
};

ProductForNonAdmin.propTypes = {
  productId: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  unit: PropTypes.string.isRequired,
  unitprice: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  maxUnitsAvailableToOrder: PropTypes.number.isRequired,
  totQuantityOrdered: PropTypes.number.isRequired,
  quantitySelected: PropTypes.number.isRequired,
  previousOrdQty: PropTypes.number.isRequired,
  description: PropTypes.string,
  image_path: PropTypes.string,
  unitsForSelection: PropTypes.array,
  isMobile: PropTypes.bool.isRequired,
};

/*
ProductForNonAdmin.propTypes = {
  values: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  controlName: PropTypes.string.isRequired,
  quantitySelected: PropTypes.number,
}; */

export default ProductForNonAdmin;
