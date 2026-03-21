import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import CollectOrderPayment from '../../components/Cart/OrderPayment/CollectOrderPayment';
import constants from '../../../modules/constants';
import { cartActions, useCartState, useCartDispatch } from '../../stores/ShoppingCart';

const CollectOrderPaymentHome = ({
  history, loggedInUser, match, roles,
}) => (
  <CollectOrderPayment
    history={history}
    loggedInUser={loggedInUser}
    orderId={match.params.id}
    roles={roles}
  />
);

CollectOrderPaymentHome.propTypes = {
  history: PropTypes.object.isRequired,
  loggedInUser: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  roles: PropTypes.object.isRequired,
};

export default CollectOrderPaymentHome;
