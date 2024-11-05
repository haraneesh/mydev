import { Roles } from 'meteor/alanning:roles';
import { Meteor } from 'meteor/meteor';
import { useSubscribe, withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Loading from '/imports/ui/components/Loading/Loading';
import ProductsOrderFromDetails from '/imports/ui/components/Orders/ProductOrderFromDetails/ProductOrderFromDetails';
import SelectDeliveryLocation from '/imports/ui/components/Orders/ProductsOrderCommon/SelectDeliveryLocation';
import ProductsOrderMain from '/imports/ui/components/Orders/ProductsOrderMain/ProductsOrderMain';
import ProductLists from '../../../../api/ProductLists/ProductLists';
import RecommendationsCollection from '../../../../api/Recommendations/Recommendations';
import constants from '../../../../modules/constants';
import { getProductUnitPrice } from '../../../../modules/helpers';
import {
  cartActions,
  useCartDispatch,
  useCartState,
} from '../../../stores/ShoppingCart';

const PlaceNewOrder = (props) => {
  const {
    dateValue,
    name,
    products,
    productListId,
    history,
    basketId,
    loggedInUser,
    category,
    subCategory,
    productName,
  } = props;

  const [isBasketLoading, setIsLoading] = useState(true);
  const cartDispatch = useCartDispatch();
  const cartState = useCartState();

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
        cartDispatch({
          type: cartActions.updateCart,
          payload: { product, basketId },
        });
      }
    });

    toast.success(`${productCount} products were added to cart from basket.`);
  };

  useEffect(() => {
    let deliveryPincode = '';
    switch (true) {
      case cartState.cart && !!cartState.cart.deliveryPincode:
        deliveryPincode = cartState.cart.deliveryPincode;
        break;
      case loggedInUser &&
        loggedInUser.profile &&
        !!loggedInUser.profile.deliveryPincode:
        deliveryPincode = loggedInUser.profile.deliveryPincode;
        break;
      default:
        deliveryPincode = '';
    }

    cartDispatch({
      type: cartActions.activateCart,
      payload: { cartIdToActivate: 'NEW', basketId },
    });
    cartDispatch({
      type: cartActions.setDeliveryPinCode,
      payload: { deliveryPincode },
    });

    if (basketId) {
      setIsLoading(true);
      Meteor.call('baskets.getOne', basketId, (error, basketDetails) => {
        if (error) {
          toast.error(error.reason);
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
    case !!productName:
      return (
        <>
          <SelectDeliveryLocation
            loggedInUser={loggedInUser}
            history={history}
          />
          <ProductsOrderFromDetails
            products={products}
            history={history}
            productName={productName}
            name={name}
            dateValue={dateValue}
            loggedInUser={loggedInUser}
          />
        </>
      );
    default:
      return (
        <div className="OrderHomePage">
          <SelectDeliveryLocation
            loggedInUser={loggedInUser}
            history={history}
          />
          <ProductsOrderMain
            products={products}
            history={history}
            productListId={productListId}
            name={name}
            dateValue={dateValue}
            loggedInUser={loggedInUser}
            basketId={basketId}
            category={category}
            subCategory={subCategory}
          />
        </div>
      );
  }
};

const PlaceNewOrderWrapper = (props) =>
  props.loading ? <Loading /> : <PlaceNewOrder {...props} />;

PlaceNewOrder.defaultProps = {
  basketId: '',
  category: '',
  subCategory: '',
  productName: '',
};

PlaceNewOrder.propTypes = {
  loggedInUser: PropTypes.object.isRequired,
  products: PropTypes.arrayOf(PropTypes.object).isRequired,
  productListId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  basketId: PropTypes.string,
  dateValue: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  category: PropTypes.string,
  subCategory: PropTypes.string,
  productName: PropTypes.string,
};

export default withTracker((args) => {
  // const recSubscription = Meteor.subscribe('recommendations.view');
  // const prdSubscription = Meteor.subscribe('productOrderList.view');
  const isLoading = useSubscribe('productOrderList.view');
  // const recommendations = RecommendationsCollection.find().fetch();

  const productList = ProductLists.findOne();
  const prds = productList ? productList.products : [];
  const productListId = productList ? productList._id : '';
  const products = getProductUnitPrice(
    Roles.userIsInRole(args.loggedInUserId, constants.Roles.shopOwner.name),
    prds,
  );

  return {
    // loading: !recSubscription.ready() || !prdSubscription.ready(),
    // recommendations,
    loading: isLoading(),
    productListId,
    products,
    name: args.name,
    history: args.history,
    dateValue: args.date,
    loggedInUser: args.loggedInUser,
    basketId: args.match.params.basketId,
    productName: args.match.params.productName,
    category: args.match.params.category,
    subCategory: args.match.params.subcategory,
  };
})(PlaceNewOrderWrapper);
