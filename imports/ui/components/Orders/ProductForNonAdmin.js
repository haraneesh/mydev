import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import {
  Row, Col, FormControl, Panel, Button, Glyphicon,
} from 'react-bootstrap';
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
        <option value={value} key={`option-${index}`}>
          {' '}
          {`${displayUnitOfSale(selectValue, unit)} ${cost}`}
          {' '}
        </option>
      );
    })}
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
  <div className="row">
    <Col xs={10} className="no-padding">
      <FormControl name={controlName} onChange={onChange} componentClass="select" value={quantitySelected}>
        {values.map((selectValue, index) => (
          <option value={parseFloat(selectValue)} key={`option-${index}`}>
            {' '}
            {displayUnitOfSale(selectValue, unit)}
            {' '}
          </option>
        ))}
      </FormControl>
    </Col>
    <Col xs={2} className="no-padding">
      <Glyphicon
        style={{ paddingLeft: '35%', paddingTop: '10px' }}
        glyph="trash"
        onClick={() => { onChange({ target: { name: controlName, value: 0 } }); }}
      />
    </Col>
  </div>
);

const ProductName = ({
  name,
  description,
  quantitySelected,
  maxUnitsAvailableToOrder,
  totQuantityOrdered,
  previousOrdQty,
  sliderView,
}) => (
  <div className="productNameDesc">
    <p className="product-name"><strong>{name}</strong></p>
    {/* (quantitySelected > 0) && (
      (!sliderView && (
      <InformProductUnavailability
        maxUnitsAvailableToOrder={maxUnitsAvailableToOrder}
        excessQtyOrdered={
        calcExcessQtyOrdered(maxUnitsAvailableToOrder,
          totQuantityOrdered, previousOrdQty, quantitySelected)
      }
      />
      ))
    ) */}
    {!sliderView && !!description && <p><small>{description}</small></p>}
  </div>
);

const AddToCart = ({
  values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  onChange,
  unit,
  unitprice,
  controlName,
  quantitySelected,
  maxUnitsAvailableToOrder,
}) => {
  const target = { name: controlName, value: 0 };
  if (quantitySelected === 0) {
    target.value = parseFloat(values[1]);
    return (
      <div className="addToCart text-center-xs">
        <Button className="btn-block btn-success" name={controlName} onClick={() => { onChange({ target }); }}> Add To Cart</Button>
      </div>
    );
  }

  /*
  return (<div className="removeFromCart text-center-xs">
    <Button name={controlName} className="btn-block" onClick={() => { onChange({ target }); }}> Remove From Cart</Button>
  </div>);
  */

  return (
    <QuantitySelector
      onChange={onChange}
      unit={unit}
      unitprice={unitprice}
      controlName={controlName}
      quantitySelected={quantitySelected}
      values={values}
      maxUnitsAvailableToOrder={maxUnitsAvailableToOrder}
    />
  );
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
  isBasket,
  removedDuringCheckout,
  sliderView,
}) => {
  const firstNonZeroOrderQty = 1;
  const unitsForSelectionArray = unitsForSelection.split(',');
  const lowestOrdQty = unitsForSelectionArray.length > 0
    ? unitsForSelectionArray[firstNonZeroOrderQty] : 0;
  const lowestOrdQtyPrice = unitprice * lowestOrdQty;

  const prodNameDesc = (
    <ProductName
      name={name}
      description={description}
      quantitySelected={quantitySelected}
      maxUnitsAvailableToOrder={maxUnitsAvailableToOrder}
      totQuantityOrdered={totQuantityOrdered}
      previousOrdQty={previousOrdQty}
      sliderView
    />
  );
  const imagePath = Meteor.settings.public.Product_Images + image;
  const imageRow = (<img src={imagePath} alt="" className="item-image no-aliasing-image img-responsive" />);

  if (checkout) {
    return (
      <Panel>
        <Row>
          <Col xs={6} sm={9} style={{ paddingRight: '0px' }}>
            { removedDuringCheckout ? (
              <s>
                {' '}
                {name}
                {' '}
              </s>
            ) : name }
          </Col>
          <div className="col" style={{ paddingLeft: '10px' }}>
            <Col xs={12} className="no-padding">
              {!isBasket && (
              <Col xs={12} className="no-padding">
                {formatMoney(
                  unitprice * quantitySelected,
                  accountSettings,
                )}
              </Col>
              )}
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
          </div>
        </Row>
      </Panel>
    );
  }

  if (sliderView) {
    return (
      <div className="product-item">
        <Col xs={4} className="item-image-container">
          {!!image && image.indexOf('blank_image.png') < 0 && imageRow}
        </Col>

        <Col xs={8}>
          <Row>
            <Col xs={12}>
              {prodNameDesc}
            </Col>
            <Col xs={12}>
              <p>
                {' '}
                {`${displayUnitOfSale(lowestOrdQty, unit)}, ${formatMoney(lowestOrdQtyPrice, accountSettings)}`}
                {' '}
              </p>
            </Col>
            <Col xs={9} sm={12}>
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
      </div>
    );
  }

  return (
    <Row className="product-item">
      <Col xs={12} className="item-image-container">
        {!!image && image.indexOf('blank_image.png') < 0 && imageRow}
      </Col>

      <Col xs={12}>
        <Row>
          <Col xs={12}>
            {prodNameDesc}
          </Col>

          <Col xs={12}>
            <p>
              {' '}
              {`${displayUnitOfSale(lowestOrdQty, unit)}, ${formatMoney(lowestOrdQtyPrice, accountSettings)}`}
              {' '}
            </p>
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

    </Row>
  );
};

ProductForNonAdmin.defaultProps = {
  checkout: false,
  description: '',
  unitsForSelection: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  removedDuringCheckout: false,
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
  removedDuringCheckout: PropTypes.bool,
};

/*
ProductForNonAdmin.propTypes = {
  values: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  controlName: PropTypes.string.isRequired,
  quantitySelected: PropTypes.number,
}; */

export default ProductForNonAdmin;
