import React, { useEffect, useState, useRef } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import {
  Row, Col, Panel, Button, Alert,
} from 'react-bootstrap';
import { Roles } from 'meteor/alanning:roles';
import { toast } from 'react-toastify';
import { upsertOrder } from '../../../api/Orders/methods';
import { isLoggedInUserAdmin } from '../../../modules/helpers';
import constants from '../../../modules/constants';
import OnBehalf from '../OnBehalf/OnBehalf';
import { ListProducts, OrderComment, OrderFooter } from './CartCommon';
import { cartActions, useCartState, useCartDispatch } from '../../stores/ShoppingCart';
import Loading from '../Loading/Loading';

const isOrderAmountGreaterThanMinimum = (orderAmt) => {
  if (
    Meteor.settings.public.CART_ORDER.MINIMUM_ORDER_AMT <= orderAmt
      || isLoggedInUserAdmin()
  ) {
    return true;
  }
  return false;
};

const CartDetails = ({
  history, orderId, loggedInUser, roles,
}) => {
  const cartState = useCartState();
  const cartDispatch = useCartDispatch();
  const refComment = useRef();
  const emptyDeletedProductsState = { countOfItems: 0, cart: {} };
  const [onBehalfUserInfoError, setOnBehalfUserInfoError] = useState(false);
  const [deletedProducts, setDeletedProducts] = useState(emptyDeletedProductsState);
  const [onBehalfUser, setOnBehalfUser] = useState({
    isNecessary: !orderId && roles.includes(constants.Roles.admin.name), user: {},
  });
  const [isOrderBeingUpdated, setOrderUpdated] = useState(false);

  const activeCartId = (!orderId || orderId === 'NEW') ? 'NEW' : orderId;
  if (cartState.activeCartId !== activeCartId) {
    cartDispatch({ type: cartActions.activateCart, payload: { cartIdToActivate: activeCartId } });
  }

  const updateDeletedProducts = (quantity, productId, product) => {
    const deletedProductsList = { ...deletedProducts };
    if (quantity > 0) {
      if (deletedProducts.cart[productId]) {
        delete deletedProductsList.cart[productId];
        deletedProductsList.countOfItems -= 1;
      }
    } else {
      deletedProductsList.cart[productId] = product;
      deletedProductsList.cart[productId].removedDuringCheckout = true;
      deletedProductsList.countOfItems += 1;
    }
    setDeletedProducts(deletedProductsList);
  };

  const updateProductQuantity = (e) => {
    const productId = e.target.name;
    const quantity = parseFloat(e.target.value);
    const product = cartState.cart.productsInCart[productId]
      ? cartState.cart.productsInCart[productId] : deletedProducts.cart[productId];
    product.quantity = quantity;
    delete product.removedDuringCheckout;
    updateDeletedProducts(quantity, productId, product);
    cartDispatch({ type: cartActions.updateCart, payload: { product } });
  };

  const onSelectedChange = (newObject) => {
    const onBehalfUserTemp = { ...onBehalfUser };
    onBehalfUserTemp.user = newObject.user;
    onBehalfUserTemp.orderReceivedAs = newObject.orderReceivedAs;
    setOnBehalfUser(onBehalfUserTemp);
  };

  const handleOrderSubmit = () => {
    if (onBehalfUser.isNecessary && !(
      constants.OrderReceivedType.allowedValues.includes(onBehalfUser.orderReceivedAs)
        && 'profile' in onBehalfUser.user)
    ) {
      setOnBehalfUserInfoError(true);
      return;
    }

    if (loggedInUser) {
      const products = [];

      Object.keys(cartState.cart.productsInCart).map((key) => {
        products.push(cartState.cart.productsInCart[key]);
      });

      const order = {
        products,
        _id: orderId && orderId !== 'NEW' ? orderId : '',
        comments: cartState.cart.comments || '',
        basketId: cartState.cart.basketId || '',
        loggedInUserId: loggedInUser._id,
      };

      if (onBehalfUser.isNecessary) {
        order.loggedInUserId = onBehalfUser.user._id;
        order.onBehalf = {
          postUserId: loggedInUser._id,
          orderReceivedAs: onBehalfUser.orderReceivedAs,
        };
      }

      setOrderUpdated(true);
      upsertOrder.call(order, (error, order) => {
        const confirmation = 'Your Order has been placed';
        if (error) {
          toast.error(error.reason);
        } else {
          cartDispatch({ type: cartActions.orderFlowComplete });
          toast.success(confirmation);
          history.push(`/order/success/${(order.insertedId) ? order.insertedId : orderId}`);
        }
        setOrderUpdated(false);
      });
    } else {
      // Sign up

    }
  };

  const clearCart = () => {
    if (confirm('All the items in the cart will be removed, do you want to continue?')) {
      cartDispatch({ type: cartActions.emptyCart });
      setDeletedProducts(emptyDeletedProductsState);
    }
  };

  const handleAddItems = () => {
    if (orderId) { history.push(`/order/${orderId}`); } else { history.push('/neworder/'); }
  };

  const handleCommentChange = (e) => {
    cartDispatch({ type: cartActions.setCartComments, payload: { comments: e.target.value } });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const { current } = refComment;
    if (current) {
      current.value = cartState.cart.comments || ''; // comments={cartState.cart.comments || ''}
    }
  });

  switch (true) {
    case (!cartState.cart): {
      history.push('/');
      return (<Loading />);
    }
    case (cartState.cart.countOfItems === 0 && deletedProducts.countOfItems === 0 && !!orderId): {
      history.push(`/order/${orderId}`);
      return (<div />);
    }
    case (!orderId && cartState.cart.countOfItems === 0 && deletedProducts.countOfItems === 0): {
      return (
        <Row>
          <Col xs={12}>
            <h3 className="page-header">Your Cart</h3>
          </Col>
          <Col xs={12}>
            <Panel>
              <h4> Cart is Empty! </h4>
              <Button style={{ marginBottom: '2.5em', marginRight: '.5em' }} onClick={() => { history.push('/neworder/selectbasket'); }}> Add Items</Button>
            </Panel>
          </Col>
        </Row>
      );
    }
    default: {
      return (
        <Row>
          <Col xs={12}>
            <h3 className="page-header">{orderId ? 'Update Order' : 'Your Cart'}</h3>
          </Col>

          <Col xs={12}>
            <Panel>
              <ListProducts
                products={cartState.cart.productsInCart}
                deletedProducts={deletedProducts.cart}
                updateProductQuantity={updateProductQuantity}
                isMobile
                isAdmin={isLoggedInUserAdmin()}
                isShopOwner={Roles.userIsInRole(loggedInUser, constants.Roles.shopOwner.name)}
              />
              <Row>
                <Col xs={6} className="text-left">
                  <Button
                    style={{ marginBottom: '2.5em', marginLeft: '.5em' }}
                    onClick={() => { clearCart(); }}
                  >
                    Clear Cart
                  </Button>
                </Col>
                <Col xs={6} className="text-right">
                  <Button
                    style={{ marginBottom: '2.5em', marginRight: '.5em' }}
                    onClick={() => { handleAddItems(); }}
                  >
                    <i className="fa fa-plus" />
                    {' Add Items'}
                  </Button>
                </Col>
              </Row>
              <OrderComment refComment={refComment} onCommentChange={handleCommentChange} />
              {onBehalfUser.isNecessary && (
              <OnBehalf
                onSelectedChange={onSelectedChange}
                showMandatoryFields={onBehalfUserInfoError}
              />
              )}
              {(isOrderBeingUpdated) && <Loading />}
              {!isOrderAmountGreaterThanMinimum(cartState.cart.totalBillAmount) && (
              <Alert>
                {Meteor.settings.public.CART_ORDER.MINIMUMCART_ORDER_MSG}
              </Alert>
              )}

              {(Meteor.settings.public.ShowReturnBottles) && (
              <div className="row well">
                <p>
                  Let's Reduce, Renew and Recycle.
                  <br />
                  Please return glass oil bottles and crates to the delivery person.
                </p>
              </div>
              )}

              <OrderFooter
                totalBillAmount={cartState.cart.totalBillAmount}
                onButtonClick={() => { handleOrderSubmit(cartState); }}
                submitButtonName={
                    isOrderBeingUpdated ? 'Order Being Placed ...'
                      : orderId ? 'Update Order'
                        : 'Place Order'
                }
                showWaiting={
                  isOrderBeingUpdated
                  || !(isOrderAmountGreaterThanMinimum(cartState.cart.totalBillAmount))
                }
                history={history}
                orderId={orderId}
              />
            </Panel>
          </Col>
        </Row>
      );
    }
  }
};

CartDetails.defaultProps = {
  loggedUserId: Meteor.userId(),
};

CartDetails.propTypes = {
  history: PropTypes.object.isRequired,
  orderId: PropTypes.string.isRequired,
  loggedUserId: PropTypes.string,
  loggedInUser: PropTypes.object.isRequired,
  roles: PropTypes.array.isRequired,
};

export default CartDetails;
