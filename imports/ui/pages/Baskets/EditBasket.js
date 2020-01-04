import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import BasketEditor from '../../components/Baskets/BasketEditor';
import Loading from '../../components/Loading/Loading';


const EditBasketDetails = ({ match, history }) => {
  const basketId = match.params.basketId;
  const [isBasketLoading, setIsBasketLoading] = useState(true);
  const [basket, setBasket] = useState({});

  useEffect(() => {
    if (basketId) {
      Meteor.call('baskets.get', basketId,
          (error, existingBasket) => {
            if (error) {
              Bert.alert(error.reason, 'danger');
            } else {
              setBasket(existingBasket);
              setIsBasketLoading(false);
            }
          });
    } else {
      setIsBasketLoading(false);
    }
  }, []);

  return !isBasketLoading ? (
    <BasketEditor
      history={history}
      existingBasket={basket}
    />

    ) : <Loading />;
};


EditBasketDetails.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default EditBasketDetails;
