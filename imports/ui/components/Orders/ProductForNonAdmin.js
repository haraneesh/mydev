import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { formatMoney } from 'accounting-js';
import Icon from '../Icon/Icon';
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
  <Form.Select name={controlName} onChange={onChange} value={quantitySelected}>
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
  </Form.Select>
);

const QuantitySelector = ({
  values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  onChange,
  unit,
  unitprice,
  controlName,
  quantitySelected,
  sliderView,
}) => (
  <div className="row justify-content-center">
    <Col xs={10} className="p-0">
      <Form.Select name={controlName} onChange={onChange} value={quantitySelected} className={sliderView ? 'btn-block w-75' : ''}>
        {values.map((selectValue, index) => (
          <option value={parseFloat(selectValue)} key={`option-${index}`}>
            {' '}
            {displayUnitOfSale(selectValue, unit)}
            {' '}
          </option>
        ))}
      </Form.Select>
    </Col>
    <Col xs={2} className="text-left ps-0">
      <Button
        variant="white"
        className="m-0 p-0 text-center"
        onClick={() => { onChange({ target: { name: controlName, value: 0 } }); }}
      >
        <Icon
          icon="delete"
          type="mt"
        />
      </Button>
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
    )
    {!sliderView && !!description && <p><small>{description}</small></p>}
    */}
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
  sliderView,
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
      sliderView={sliderView}
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
    />
  );
  const imagePath = `${Meteor.settings.public.Product_Images}${image}?${Meteor.settings.public.Product_Images_Version}`;
  const imageRow = (<img src={imagePath} alt="" className="item-image no-aliasing-image img-responsive" />);

  if (checkout) {
    return (
      <Row className="pb-4">
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
          <Col xs={12} className="p-0">
            {!isBasket && (
              <Col xs={12} className="p-0">
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
    );
  }

  if (sliderView) {
    return (
      <div className="product-item text-center text-center row">
        {!!image && image.indexOf('blank_image.png') < 0 && (
        <Col xs={5} className="text-center">
          {imageRow}
        </Col>
        )}
        <Col className="col text-center">
          <Row>
            <Col xs={12}>
              {prodNameDesc}
            </Col>
            <Col xs={12}>
              <p>
                {`${displayUnitOfSale(lowestOrdQty, unit)}, ${formatMoney(lowestOrdQtyPrice, accountSettings)}`}
              </p>
            </Col>

          </Row>
        </Col>

        <Col xs={12} className="addCartButton">
          <AddToCart
            onChange={onChange}
            unit={unit}
            unitprice={unitprice}
            controlName={productId}
            quantitySelected={quantitySelected}
            values={unitsForSelectionArray}
            maxUnitsAvailableToOrder={maxUnitsAvailableToOrder}
            sliderView
          />
        </Col>
      </div>
    );
  }

  return (
    <Row className="product-item text-center my-2">
      <Col xs={12} className="item-image-container">
        {!!image && image.indexOf('blank_image.png') < 0 && imageRow}
      </Col>

      <Col xs={12}>
        <Row style={{ minHeight: '7em' }}>
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
        </Row>
        <Col className="mx-auto">
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
