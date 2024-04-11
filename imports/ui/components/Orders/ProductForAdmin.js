/* eslint-disable max-len, no-return-assign */

import React from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { formatMoney } from 'accounting-js';
import { accountSettings } from '../../../modules/settings';
import { extractNumber, extractString } from '../../../modules/helpers';
import { calcExcessQtyOrdered, InformProductUnavailability } from './ProductFunctions';
import OrderCommon from '../../../modules/both/orderCommon';

const { costOfReturnable } = OrderCommon;

const AddReturnable = ({
  onReturnableAdd, quantitySelected, associatedReturnables, includeReturnables, parentProductId,
  retQtySelected, retQtySelectedPrice, isCheckOut, onChange,
}) => {
  if (includeReturnables) {
    return (
      <div className="col justify-content-center">
        <div className="form-check ps-5">
          <label className="form-check-label text-left" htmlFor="addReturnCheck">
            <div>
              {`In ${associatedReturnables.name}`}
              {(!isCheckOut) ? `, Rs ${retQtySelectedPrice} Extra` : ''}
            </div>
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

class ProductForAdmin extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.handleWeightChange = this.handleWeightChange.bind(this);
    this.state = {
      quantitySelected: this.props.quantitySelected,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.quantitySelected === this.props.quantitySelected) {
      return;
    }
    this.setState({
      quantitySelected: nextProps.quantitySelected,
    });
  }

  handleWeightChange() {
    const { productId, unit } = this.props;
    const weight = this.productWeight.value;
    const quantitySelected = weight / extractNumber(unit, 10);

    const e = {
      target: {
        name: productId,
        value: quantitySelected,
      },
    };

    this.props.onChange(e);

    this.setState({
      quantitySelected,
    });
  }

  onReturnableAdd(e, onChange, value) {
    // onChange({ target: { name: controlName, value: 0 } });
    const v = value;
    if (!e.target.checked) {
      v.returnableProductQty = 0;
    }
    onChange(e, v);
  }

  render() {
    const {
      productId,
      name,
      description,
      unit,
      unitprice,
      maxUnitsAvailableToOrder,
      totQuantityOrdered,
      previousOrdQty,
      isBasket,
      checkout,
      associatedReturnables,
      includeReturnables,
    } = this.props;

    const { retQtySelected, retQtySelectedPrice } = includeReturnables
      ? costOfReturnable(associatedReturnables.returnableUnitsForSelection, this.state.quantitySelected)
      : { retQtySelected: 0, retQtySelectedPrice: 0 };

    return (
      <div className="pb-5 mx-4">
        <Row className="p-0 product-item">
          <Col sm={!isBasket ? 6 : 8}>
            <p className="product-name"><strong>{`${name} ${unit}`}</strong></p>
            {/* (this.state.quantitySelected > 0) && <InformProductUnavailability
            maxUnitsAvailableToOrder={maxUnitsAvailableToOrder}
            excessQtyOrdered={
              calcExcessQtyOrdered(maxUnitsAvailableToOrder,
                totQuantityOrdered,
                previousOrdQty,
                this.state.quantitySelected)
              }
            />
            <p><small>{description}</small></p> */}
          </Col>

          <Col sm={!isBasket ? 3 : 4}>
            <div className="input-group">
              <input
                type="number"
                name={productId}
                ref={(productWeight) => (this.productWeight = productWeight)}
                className="form-control"
                value={extractNumber(unit) * this.state.quantitySelected}
                onChange={this.handleWeightChange}
              />
              <span className="input-group-text">{`${extractString(unit)}`}</span>
            </div>
          </Col>
          {!isBasket && (
          <Col sm={3} className="text-right-not-xs">
            <p>
              {formatMoney(unitprice, accountSettings)}
              <span className="text-muted">{` ${'x'} `}</span>
              {this.state.quantitySelected}
            </p>
          </Col>
          )}
        </Row>
        {(includeReturnables && !!includeReturnables && checkout) && (
        <AddReturnable
          onChange={this.props.onChange}
          onReturnableAdd={this.onReturnableAdd}
          quantitySelected={this.state.quantitySelected}
          includeReturnables={includeReturnables}
          associatedReturnables={associatedReturnables}
          parentProductId={productId}
          retQtySelected={retQtySelected}
          retQtySelectedPrice={retQtySelectedPrice}
        />
        )}
      </div>
    );
  }
}

ProductForAdmin.defaultProps = {
  description: '',
};

ProductForAdmin.propTypes = {
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
};

export default ProductForAdmin;
