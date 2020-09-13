import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import { withTracker } from 'meteor/react-meteor-data';
import { Alert } from 'react-bootstrap';
import { Roles } from 'meteor/alanning:roles';
import RecommendationsCollection from '../../../../api/Recommendations/Recommendations';
import ProductLists from '../../../../api/ProductLists/ProductLists';
import { getProductUnitPrice } from '../../../../modules/helpers';
import constants from '../../../../modules/constants';
import Loading from '../../../components/Loading/Loading';
import ProductsOrderMain from '../../../components/Orders/ProductsOrderMain/ProductsOrderMain';
import { cartActions, useCartDispatch } from '../../../stores/ShoppingCart';

const PlaceNewOrder = ({
  dateValue, name, products, productListId, history, basketId, loggedInUser,
}) => {
  const [isBasketLoading, setIsLoading] = useState(true);
  const cartDispatch = useCartDispatch();

  const updateNewCart = (productsInBasket, productsInProductList) => {
    cartDispatch({ type: cartActions.emptyCart });

    const inBasketProductsHash = {};
    productsInBasket.forEach((product) => {
      inBasketProductsHash[product._id] = product;
    });

    let productCount = 0;
    productsInProductList.forEach((product) => {
      if (inBasketProductsHash[product._id]) {
        productCount += 1;
        product.quantity = inBasketProductsHash[product._id].quantity;
        cartDispatch({ type: cartActions.updateCart, payload: { product, basketId } });
      }
    });

    Bert.alert(`${productCount} products were added to cart from basket.`, 'success');
  };

  useEffect(() => {
    cartDispatch({ type: cartActions.activateCart, payload: { cartIdToActivate: 'NEW', basketId } });
    if (basketId) {
      setIsLoading(true);
      Meteor.call('baskets.getOne', basketId,
        (error, basketDetails) => {
          if (error) {
            Bert.alert(error.reason, 'danger');
          } else {
            updateNewCart(basketDetails.products, products, basketId);
            setIsLoading(false);
          }
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  switch (true) {
    case isBasketLoading:
      return <Loading />;
    default:
      return (
        <div className="OrderHomePage">
          <ProductsOrderMain
            products={products}
            history={history}
            productListId={productListId}
            name={name}
            dateValue={dateValue}
            loggedInUser={loggedInUser}
            basketId={basketId}
          />
        </div>
      );
  }
};

const PlaceNewOrderWrapper = (props) => (props.loading ? (<Loading />)
  : (<PlaceNewOrder {...props} />));

PlaceNewOrder.defaultProps = {
  basketId: '',
};

PlaceNewOrder.propTypes = {
  loggedInUser: PropTypes.object.isRequired,
  products: PropTypes.arrayOf(PropTypes.object).isRequired,
  productListId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  basketId: PropTypes.string,
  dateValue: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withTracker((args) => {
  // const recSubscription = Meteor.subscribe('recommendations.view');

  const prdSubscription = Meteor.subscribe('productOrderList.view');

  // const recommendations = RecommendationsCollection.find().fetch();

  const productList = ProductLists.findOne();
  const prds = (productList) ? productList.products : [];
  const productListId = (productList) ? productList._id : '';
  const products = getProductUnitPrice(
    Roles.userIsInRole(
      args.loggedInUserId,
      constants.Roles.shopOwner.name,
    ),
    prds,
  );

  return {
    // loading: !recSubscription.ready() || !prdSubscription.ready(),
    // recommendations,
    loading: !prdSubscription.ready(),
    productListId,
    products,
    name: args.name,
    history: args.history,
    dateValue: args.date,
    loggedInUser: args.loggedInUser,
    basketId: args.match.params.basketId,
  };
})(PlaceNewOrderWrapper);
