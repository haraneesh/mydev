/* eslint-disable max-len, no-return-assign */

import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import { formatMoney } from 'accounting-js';
import { accountSettings } from '../../../modules/settings';
import { calcExcessQtyOrdered, InformProductUnavailability } from './ProductFunctions';

class ProductForAdmin extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.handleWeightChange = this.handleWeightChange.bind(this);
    this.state = {
      quantitySelected: this.props.quantitySelected,
    };
  }

  handleWeightChange() {
    const { productId, unit } = this.props;
    const weight = this.productWeight.value;
    const quantitySelected = weight / this.roughScale(unit, 10);

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

  componentWillReceiveProps(nextProps) {
    if (nextProps.quantitySelected === this.props.quantitySelected) {
      return;
    }
    this.setState({
      quantitySelected: nextProps.quantitySelected,
    });
  }

  roughScale(x, base) {
    const parsed = parseInt(x, base);
    if (isNaN(parsed)) { return 0; }
    return parsed;
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
    } = this.props;

    return (
      <Row>
        <Col sm={6}>
          <h4 className="product-name"><strong>{`${name} ${unit}`}</strong></h4>
          { (this.state.quantitySelected > 0) && <InformProductUnavailability
            maxUnitsAvailableToOrder={maxUnitsAvailableToOrder}
            excessQtyOrdered={
              calcExcessQtyOrdered(maxUnitsAvailableToOrder,
                totQuantityOrdered,
                previousOrdQty,
                this.state.quantitySelected)
              }
          /> }
          <h4><small>{description}</small></h4>
        </Col>

        <Col sm={3}>
          <div className="input-group">
            <input
              type="number"
              name={productId}
              ref={productWeight => (this.productWeight = productWeight)}
              className="form-control"
              value={this.roughScale(unit, 10) * this.state.quantitySelected}
              onChange={this.handleWeightChange}
            />
            <span className="input-group-addon">{`${unit.replace(/[^a-zA-Z]/g, '')}`}</span>
          </div>
        </Col>

        <Col sm={3} className="text-right-not-xs">
          <h4>{formatMoney(unitprice, accountSettings)}
            <span className="text-muted">{` ${'x'} `}</span>
            {this.state.quantitySelected}
          </h4>
        </Col>
      </Row>
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
