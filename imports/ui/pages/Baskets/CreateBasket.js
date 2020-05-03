import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { Orders } from '../../../api/Orders/Orders';
import BasketEditor from '../../components/Baskets/BasketEditor';
import Loading from '../../components/Loading/Loading';
import { withTracker } from 'meteor/react-meteor-data';


const CreateBasket = ({ history, selectedOrder, loggedInUser, loading }) => {

  return !loading ? (
    <BasketEditor
      history={history}
      basketDetails={{ products: selectedOrder.products }}
      allProducts={selectedOrder.products}
      loggedInUser={loggedInUser}
    />

  ) : <Loading />;
};


CreateBasket.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  loggedInUser: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default withTracker((args) => {
  const subscription = Meteor.subscribe('orders.orderDetails', args.match.params.orderId);

  const order = Orders.findOne({ _id: args.match.params.orderId });

  return {
    loading: !subscription.ready(),
    selectedOrder: order,
    history: args.history,
    loggedInUser: args.loggedInUser,
  };
})(CreateBasket);
