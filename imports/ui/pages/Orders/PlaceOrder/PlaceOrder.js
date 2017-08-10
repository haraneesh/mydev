import React from 'react';
import PropTypes from 'prop-types';
import ProductsOrderList from '../../../containers/Orders/ProductsOrderList';

const PlaceOrder = ({ history }) => (
  <ProductsOrderList dateValue={new Date()} history={history} />
);

export default PlaceOrder;

PlaceOrder.propTypes = {
  history: PropTypes.object.isRequired,
};
