import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import ShowBasketsToSelect from '../../../components/Orders/ShowBasketsToSelect/ShowBasketsToSelect';
import Loading from '../../../components/Loading/Loading';
import { useCartState } from '../../../stores/ShoppingCart';

const SelectBasket = ({ history }) => {
  const cartState = useCartState();
  const isCartFilled = () => cartState.newCartCountOfItems > 0;

  const [basketLists, setBasketList] = useState();
  const [isBasketListLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (!isCartFilled()) {
      setIsLoading(true);
      Meteor.call('baskets.getAll',
        (error, basketLists) => {
          if (error) {
            Bert.alert(error.reason, 'danger');
          } else if (basketLists.length > 0) {
            setBasketList(basketLists);
            setIsLoading(false);
          } else {
            history.push('/neworder');
          }
        });
    }
  }, []);

  switch (true) {
    case isCartFilled(): {
      history.push('/neworder');
      return null;
    }
    case isBasketListLoading: {
      return (<Loading />);
    }
    default: {
      return (<ShowBasketsToSelect history={history} basketLists={basketLists} />);
    }
  }
};

SelectBasket.propTypes = {
  history: PropTypes.object.isRequired,
};

export default SelectBasket;
