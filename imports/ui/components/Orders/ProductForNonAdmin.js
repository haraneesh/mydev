import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Row, Col, FormControl, Panel, Button, Glyphicon } from 'react-bootstrap';
import { formatMoney } from 'accounting-js';
import { calcExcessQtyOrdered, InformProductUnavailability } from './ProductFunctions';
import { accountSettings } from '../../../modules/settings';
import { displayUnitOfSale } from '../../../modules/helpers';

const QuantitySelectorWithPrice = ({
  values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  onChange,
  unit,
  unitprice,
  controlName,
  quantitySelected,
}) => (
  <FormControl name={controlName} onChange={onChange} componentClass="select" value={quantitySelected}>
    {values.map((selectValue, index) => {
      const value = parseFloat(selectValue);
      const cost = formatMoney(value * unitprice, accountSettings);
      return (
        <option value={value} key={`option-${index}`} > {`${displayUnitOfSale(selectValue, unit)} ${cost}`} </option>
      );
    },
      )
    }
  </FormControl>
  );

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
        <option value={parseFloat(selectValue)} key={`option-${index}`} > {displayUnitOfSale(selectValue, unit)} </option>
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
);

const AddToCart = ({
  values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  onChange,
  controlName,
  quantitySelected,
}) => {
  const target = { name: controlName, value: 0 };
  if (!quantitySelected) {
    target.value = values[1];
    return (<div className="addToCart text-center-xs">
      <Button className="btn-block btn-success" name={controlName} onClick={() => { onChange({ target }); }}> Add To Cart</Button>
    </div>);
  }

  return (<div className="removeFromCart text-center-xs">
    <Button name={controlName} className="btn-block" onClick={() => { onChange({ target }); }}> Remove From Cart</Button>
  </div>);
};

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
  image,
  checkout,
  removedDuringCheckout,
}) => {
  const firstNonZeroOrderQty = 1;
  const unitsForSelectionArray = unitsForSelection.split(',');
  const lowestOrdQty = unitsForSelectionArray.length > 0 ? unitsForSelectionArray[firstNonZeroOrderQty] : 0;
  const lowestOrdQtyPrice = unitprice * lowestOrdQty;

  const prodNameDesc = (<ProductName
    name={name}
    description={description}
    quantitySelected={quantitySelected}
    maxUnitsAvailableToOrder={maxUnitsAvailableToOrder}
    totQuantityOrdered={totQuantityOrdered}
    previousOrdQty={previousOrdQty}
  />);
  const imagePath = Meteor.settings.public.Product_Images + image;
  const imageRow = (<img src={imagePath} alt="" className="item-image no-aliasing-image img-responsive" />);

  if (checkout) {
    return (
      <Panel>
        <Row>
          <Col xs={6} sm={9} style={{ paddingRight: '0px' }}>
            { removedDuringCheckout ? (<s> {name} </s>) : name }
          </Col>
          <Col xs={6} sm={3} style={{ paddingLeft: '10px' }}>
            <Col xs={12} className="no-padding">
              <Col xs={12} className="no-padding">
                {formatMoney(
                      unitprice * quantitySelected,
                      accountSettings,
                )}
              </Col>
              <Col xs={10} className="no-padding">
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
              <Col xs={2} className="no-padding">
                <Glyphicon
                  style={{ paddingLeft: '35%', paddingTop: '10px' }}
                  glyph="trash"
                  onClick={() => { onChange({ target: { name: productId, value: 0 } }); }}
                />
              </Col>
            </Col>
          </Col>
        </Row>
      </Panel>
    );
  }

  return (
    <Col sm={12} md={6} className="no-padding product-item">
      <Col xs={12} sm={4} smOffset={0}>
        {!!image && imageRow}
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
            {/* <QuantitySelector
              onChange={onChange}
              unit={unit}
              unitprice={unitprice}
              controlName={productId}
              quantitySelected={quantitySelected}
              values={unitsForSelectionArray}
              maxUnitsAvailableToOrder={maxUnitsAvailableToOrder}
            /> */}
            <AddToCart
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
  checkout: false,
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
  image: PropTypes.string,
  unitsForSelection: PropTypes.array,
  checkout: PropTypes.bool,
};

/*
ProductForNonAdmin.propTypes = {
  values: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  controlName: PropTypes.string.isRequired,
  quantitySelected: PropTypes.number,
}; */

export default ProductForNonAdmin;
