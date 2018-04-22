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
    { values.map((selectValue, index) => (
      <option value={selectValue} key={`option-${index}`} > {displayUnitOfSale(selectValue, unit)} </option>
      ))
    }
  </FormControl>
  );

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
}) => (
  <Row>
    <Col sm={5}>
      <h4 className="product-name"><strong>{name}</strong></h4>
      { (quantitySelected > 0) && <InformProductUnavailability
        maxUnitsAvailableToOrder={maxUnitsAvailableToOrder}
        excessQtyOrdered={
          calcExcessQtyOrdered(maxUnitsAvailableToOrder,
            totQuantityOrdered, previousOrdQty, quantitySelected)
          }
      /> }
      <h4><small>{description}</small></h4>
    </Col>

    <Col sm={4}>
      <h4> {`${unit}, ${formatMoney(unitprice, accountSettings)}`} </h4>
    </Col>

    <Col sm={3}>
      <QuantitySelector
        onChange={onChange}
        unit={unit}
        unitprice={unitprice}
        controlName={productId}
        quantitySelected={quantitySelected}
        values={unitsForSelection.split(',')}
        maxUnitsAvailableToOrder={maxUnitsAvailableToOrder}
      />
    </Col>
  </Row>
);

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
  unitsForSelection: PropTypes.array,
};

/*
ProductForNonAdmin.propTypes = {
  values: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  controlName: PropTypes.string.isRequired,
  quantitySelected: PropTypes.number,
}; */

export default ProductForNonAdmin;
