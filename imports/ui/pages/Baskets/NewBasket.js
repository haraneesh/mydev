import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import Products from '../../../api/Products/Products';
import Loading from '../../components/Loading/Loading';
import BasketEditor from '../../components/Baskets/BasketEditor';


const NewBasket = ({ loading, history, products, loggedInUser }) => {
  const newBasket = { products: [] };

  if (loading) {
    return (<Loading />);
  }
  return (

    <BasketEditor
      history={history}
      basketDetails={newBasket}
      allProducts={products}
      loggedInUser={loggedInUser}
    />
  );
};

NewBasket.propTypes = {
  history: PropTypes.object.isRequired,
};

export default withTracker((args) => {
  const prdSubscription = Meteor.subscribe('products.list');
  const products = Products.find().fetch();

  return {
    loading: !prdSubscription.ready(),
    products,
    loggedInUser: args.loggedInUser,
  };
})(NewBasket);
