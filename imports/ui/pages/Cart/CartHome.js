import PropTypes from 'prop-types';
import React from 'react';
import CartDetails from '../../components/Cart/CartDetails';

const CartHome = (args) => {
  const { loggedInUser, match, roles } = args;
  return (
    <CartDetails
      loggedInUser={loggedInUser}
      orderId={match.params.id}
      roles={roles}
    />
  );
};

CartHome.propTypes = {
  loggedInUser: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  roles: PropTypes.array.isRequired,
};

export default CartHome;
