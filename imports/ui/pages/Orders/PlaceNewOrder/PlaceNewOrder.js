import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { withTracker } from 'meteor/react-meteor-data';
import RecommendationsCollection from '../../../../api/Recommendations/Recommendations';
import ProductLists from '../../../../api/ProductLists/ProductLists';
import { getProductUnitPrice } from '../../../../modules/helpers';
import constants from '../../../../modules/constants';
import Loading from '../../../components/Loading/Loading';
import ProductsOrderMain from '../../../components/Orders/ProductsOrderMain/ProductsOrderMain';
import { cartActions, useCartDispatch } from '../../../stores/ShoppingCart';


const PlaceNewOrder = ({ dateValue, name, products, productListId, history, basketId }) => {

  const [isBasketLoading, setIsLoading] = useState(true);
  const cartDispatch = useCartDispatch();

  const updateNewCart = (productsInBasket, productsInProductList) => {
    cartDispatch({ type: cartActions.emptyCart, payload: { basketId } });

    const inBasketProductsHash = {};
    productsInBasket.forEach((product) => {
      inBasketProductsHash[product._id] = product;
    });

    productsInProductList.forEach((product) => {
      if (inBasketProductsHash[product._id]) {
        product.quantity = inBasketProductsHash[product._id].quantity;
        cartDispatch({ type: cartActions.updateCart, payload: { product } });
      }
    })
  }

  useEffect(() => {
    cartDispatch({ type: cartActions.activateCart, payload: { cartIdToActivate: 'NEW', basketId } })
    if (basketId) {
      setIsLoading(true);
      Meteor.call('baskets.getOne', basketId,
        (error, basketDetails) => {
          if (error) {
            Bert.alert(error.reason, 'danger');
          } else {
            updateNewCart(basketDetails.products, products, basketId)
            setIsLoading(false);
          }
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  return (!isBasketLoading ? (<div className="OrderHomePage">

    <ProductsOrderMain
      products={products}
      history={history}
      productListId={productListId}
      name={name}
      dateValue={dateValue}
    />

  </div>) : <Loading />)
}

const PlaceNewOrderWrapper = props => props.loading ? (<Loading />) :
  (<PlaceNewOrder {...props} />);

PlaceNewOrder.propTypes = {
  loading: PropTypes.bool.isRequired,
  products: PropTypes.arrayOf(PropTypes.object).isRequired,
  productListId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  dateValue: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withTracker((args) => {
  // const recSubscription = Meteor.subscribe('recommendations.view');

  const prdSubscription = Meteor.subscribe('productOrderList.view', args.date);

  // const recommendations = RecommendationsCollection.find().fetch();

  const productList = ProductLists.findOne();
  const prds = (productList) ? productList.products : [];
  const productListId = (productList) ? productList._id : '';
  const products = getProductUnitPrice(Roles.userIsInRole(args.loggedInUserId, constants.Roles.customer.name), prds);


  return {
    // loading: !recSubscription.ready() || !prdSubscription.ready(),
    // recommendations,
    loading: !prdSubscription.ready(),
    productListId,
    products,
    name: args.name,
    history: args.history,
    dateValue: args.date,
    basketId: args.match.params.basketId
  };
})(PlaceNewOrderWrapper);
