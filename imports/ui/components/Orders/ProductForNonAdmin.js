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

import OrderCommon from '../../../modules/both/orderCommon';

const { costOfReturnable } = OrderCommon;

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
    <Col xs={10} className="ps-2 ps-sm-3">
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

function onReturnableAdd(e, onChange, value) {
  // onChange({ target: { name: controlName, value: 0 } });
  const v = value;
  if (!e.target.checked) {
    v.returnableProductQty = 0;
  }
  onChange(e, v);
}
const AddReturnable = ({
  onChange, sliderView, quantitySelected, associatedReturnables, includeReturnables, parentProductId,
  retQtySelected, retQtySelectedPrice, isCheckOut,
}) => {
  if (includeReturnables) {
    return (
      <div className="ps-2 ps-sm-3">
        {(!isCheckOut) && (
        <div className="row justify-content-center">
          +
        </div>
        )}
        <div className="form-check">
          <label className="form-check-label text-left" htmlFor="addReturnCheck">
            {`In ${associatedReturnables.name}`}
            <br />
            {(!isCheckOut) ? `Rs ${retQtySelectedPrice} Extra` : ''}
          </label>
          <input
            type="checkbox"
            className="form-check-input"
            id="addReturnCheck"
            autoComplete="off"
            checked={associatedReturnables.quantity && associatedReturnables.quantity > 0}
            onChange={(e) => {
              onReturnableAdd(e, onChange,
                {
                  isReturnable: true,
                  parentProductId,
                  parentProductQty: quantitySelected,
                  returnableProductId: associatedReturnables._id,
                  returnableProductQty: retQtySelected,
                });
            }}
          />
        </div>
      </div>
    );
  }
  return (<div />);
};

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
  associatedReturnables,
  includeReturnables,
  sliderView,
  retQtySelected,
  retQtySelectedPrice,
}) => {
  const target = { name: controlName, value: 0 };
  if (quantitySelected === 0) {
    target.value = parseFloat(values[1]);
    return (
      <div className="addToCart text-center-xs">
        <Button
          className="btn-block btn-success"
          name={controlName}
          onClick={() => {
            onChange({ target }, {
              isReturnable: false,
            });
          }}
        >
          {' '}
          Add To Cart
        </Button>
      </div>
    );
  }

  /*
  return (<div className="removeFromCart text-center-xs">
    <Button name={controlName} className="btn-block" onClick={() => { onChange({ target }); }}> Remove From Cart</Button>
  </div>);
  */

  return (
    <>
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
      <AddReturnable
        onChange={onChange}
        quantitySelected={quantitySelected}
        sliderView={sliderView}
        includeReturnables={includeReturnables}
        associatedReturnables={associatedReturnables}
        parentProductId={controlName}
        retQtySelected={retQtySelected}
        retQtySelectedPrice={retQtySelectedPrice}
      />
    </>
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
  associatedReturnables,
  includeReturnables,
  sliderView,
}) => {
  const firstNonZeroOrderQty = 1;
  const unitsForSelectionArray = unitsForSelection.split(',');
  const lowestOrdQty = unitsForSelectionArray.length > 0
    ? unitsForSelectionArray[firstNonZeroOrderQty] : 0;
  const lowestOrdQtyPrice = unitprice * lowestOrdQty;

  const { retQtySelected, retQtySelectedPrice } = includeReturnables
    ? costOfReturnable(associatedReturnables.returnableUnitsForSelection, quantitySelected)
    : { retQtySelected: 0, retQtySelectedPrice: 0 };

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
  const useImg = (!image || (!!image && image.indexOf('blank_image') > 0)) ? 'blank.jpg' : image;
  const imagePath = `${Meteor.settings.public.Product_Images}${useImg}?${Meteor.settings.public.Product_Images_Version}`;
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
        { !removedDuringCheckout && (
        <Row className="addCartButton">
          <Col xs={6} sm={9} style={{ paddingRight: '0px' }}>
            <AddReturnable
              onChange={onChange}
              quantitySelected={quantitySelected}
              sliderView={sliderView}
              includeReturnables={includeReturnables}
              associatedReturnables={associatedReturnables}
              parentProductId={productId}
              retQtySelected={retQtySelected}
              retQtySelectedPrice={retQtySelectedPrice}
              isCheckOut
            />
          </Col>
          <div className="col" style={{ paddingLeft: '10px' }}>
            { ((checkout && associatedReturnables.quantity && associatedReturnables.quantity > 0)) ? (
              <span>
                {`Rs. ${retQtySelectedPrice}`}
              </span>
            ) : '' }
          </div>
        </Row>
        )}
      </Row>
    );
  }

  if (sliderView) {
    return (
      <div className="product-item text-center text-center row">
        {!!image && useImg.indexOf('blank.jpg') < 0 && (
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
            associatedReturnables={associatedReturnables}
            includeReturnables={includeReturnables}
            sliderView
            retQtySelected={retQtySelected}
            retQtySelectedPrice={retQtySelectedPrice}
          />
        </Col>
      </div>
    );
  }

  return (
    <div className="product-item text-center my-2">
      <Col xs={12} className="item-image-container">
        {imageRow}
      </Col>

      <Col xs={12}>
        <div style={{ minHeight: '5em' }}>
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
        </div>
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
            associatedReturnables={associatedReturnables}
            includeReturnables={includeReturnables}
            retQtySelected={retQtySelected}
            retQtySelectedPrice={retQtySelectedPrice}

          />
        </Col>
      </Col>
    </div>
  );
};

ProductForNonAdmin.defaultProps = {
  checkout: false,
  description: '',
  unitsForSelection: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  removedDuringCheckout: false,
  associatedReturnables: {},
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
  associatedReturnables: PropTypes.object,
};

/*
ProductForNonAdmin.propTypes = {
  values: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  controlName: PropTypes.string.isRequired,
  quantitySelected: PropTypes.number,
}; */

export default ProductForNonAdmin;
