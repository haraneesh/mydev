import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import { Roles } from 'meteor/alanning:roles';
import { withTracker } from 'meteor/react-meteor-data';
import { Panel, Col, Button } from 'react-bootstrap';
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
  const [showMainOrder, setShowMainOrder] = useState(false);
  const cartDispatch = useCartDispatch();

  const basketSelectDetails = useRef({
    countOfBasketProductsAddedToCart: 0,
    countOfProductsInBasket: 0,
  });

  const updateNewCart = (productsInBasket, productsInProductList) => {
    cartDispatch({ type: cartActions.emptyCart });

    const inBasketProductsHash = {};
    productsInBasket.forEach((product) => {
      inBasketProductsHash[product._id] = product;
    });

    productsInProductList.forEach((product) => {
      if (inBasketProductsHash[product._id]) {
        basketSelectDetails.current.countOfBasketProductsAddedToCart += 1;
        product.quantity = inBasketProductsHash[product._id].quantity;
        cartDispatch({ type: cartActions.updateCart, payload: { product, basketId } });
      }
    });
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
            basketSelectDetails.current.countOfProductsInBasket = basketDetails.products.length;
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
    case !isBasketLoading
      && !showMainOrder
      && basketId !== ''
      && (basketSelectDetails.current.countOfProductsInBasket - basketSelectDetails.current.countOfBasketProductsAddedToCart) > 0:
      return (
        <div className="OrderHomePage">
          <Panel>
            <p>
              Suvai attempts to have freshest seasonal food.
              So we do not always have all the items all the time.
            </p>
            <p>
              {`${basketSelectDetails.current.countOfProductsInBasket - basketSelectDetails.current.countOfBasketProductsAddedToCart} 
          products in your basket are available today and have been added to the cart.
          We encourage you to try our other products. 
          `}
            </p>
            <Col xs={12} className="text-center">
              <Button bsStyle="primary" onClick={() => { setShowMainOrder(true); }}>
                Place Order &#9660;
              </Button>
            </Col>
          </Panel>
        </div>
      );
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

  const prdSubscription = Meteor.subscribe('productOrderList.view', args.date);

  // const recommendations = RecommendationsCollection.find().fetch();

  const productList = ProductLists.findOne();
  const prds = (productList) ? productList.products : [];
  const productListId = (productList) ? productList._id : '';
  const products = getProductUnitPrice(Roles.userIsInRole(args.loggedInUserId, constants.Roles.shopOwner.name), prds);

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
