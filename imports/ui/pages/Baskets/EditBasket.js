import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { toast } from 'react-toastify';
import Products from '../../../api/Products/Products';
import BasketEditor from '../../components/Baskets/BasketEditor';
import Loading from '../../components/Loading/Loading';

const renderBasket = ({ products, basketId, history, loggedInUser }) => {

  const [isBasketLoading, setIsBasketLoading] = useState(true);
  const [basket, setBasket] = useState([]);

  useEffect(() => {
    if (basketId) {
      Meteor.call('baskets.getOne', basketId,
        (error, existingBasket) => {
          if (error) {
            toast.error(error.reason);
          } else {
            setBasket(existingBasket);
            setIsBasketLoading(false);
          }
        });
    } else {
      setIsBasketLoading(false);
    }
  }, []);

  return (!isBasketLoading ? (
    <BasketEditor
      history={history}
      basketDetails={basket}
      allProducts={products}
      loggedInUser={loggedInUser}
    />
  ) : <Loading />)
}

const EditBasketDetails = (args) => (
  !args.loading ? renderBasket({ ...args }) : <Loading />
);

EditBasketDetails.propTypes = {
  loading: PropTypes.bool.isRequired,
  basketId: PropTypes.string.isRequired,
  products: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  loggedInUser: PropTypes.object,
};

export default withTracker(({ match, loggedInUser, history }) => {

  const prdSubscription = Meteor.subscribe('products.list');
  const products = Products.find().fetch();

  return {
    loading: !prdSubscription.ready(),
    products,
    basketId: match.params._id,
    history: history,
    loggedInUser: loggedInUser,
  };
})(EditBasketDetails);

