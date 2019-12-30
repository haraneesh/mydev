import React from 'react';
import PropTypes from 'prop-types';
import CartDetails from '../../components/Cart/CartDetails';

const CartHome = ({ history, loggedInUser, match }) => (
  <CartDetails history={history} loggedInUser={loggedInUser} orderId={match.params.id} />
);

CartHome.propTypes = {
  history: PropTypes.object.isRequired,
  loggedInUser: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};

export default CartHome;
