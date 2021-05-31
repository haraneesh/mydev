/* eslint-disable max-len, no-return-assign */

import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import { formatMoney } from 'accounting-js';
import { accountSettings } from '../../../modules/settings';
import { extractNumber, extractString } from '../../../modules/helpers';
import { calcExcessQtyOrdered, InformProductUnavailability } from './ProductFunctions';

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
    } = this.props;

    return (
      <Col sm={12} className="no-padding product-item">
        <Col sm={!isBasket ? 5 : 8}>
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
            <span className="input-group-addon">{`${extractString(unit)}`}</span>
          </div>
        </Col>
        {!isBasket && (
          <Col sm={4} className="text-right-not-xs">
            <h4>
              {formatMoney(unitprice, accountSettings)}
              <span className="text-muted">{` ${'x'} `}</span>
              {this.state.quantitySelected}
            </h4>
          </Col>
        )}
      </Col>
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
