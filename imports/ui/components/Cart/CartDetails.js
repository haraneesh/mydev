import React, { useEffect, useState, useRef } from 'react';
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { toast } from 'react-toastify';
import Icon from '../Icon/Icon';
import { upsertOrder } from '../../../api/Orders/methods';
import { isLoggedInUserAdmin } from '../../../modules/helpers';
import constants from '../../../modules/constants';
import OnBehalf from '../OnBehalf/OnBehalf';
import {
  ListProducts, OrderComment, PrevOrderComplaint, OrderFooter,
} from './CartCommon';
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
        issuesWithPreviousOrder: cartState.cart.issuesWithPreviousOrder || '',
        payCashWithThisDelivery: cartState.cart.payCashWithThisDelivery || false,
        collectRecyclablesWithThisDelivery: cartState.cart.collectRecyclablesWithThisDelivery || false,
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
    if (loggedInUser) {
      if (orderId) { history.push(`/order/${orderId}`); } else { history.push('/neworder/'); }
    } else {
      history.push('/orderspecials/');
    }
  };

  const handleCommentChange = (e) => {
    cartDispatch({ type: cartActions.setCartComments, payload: { comments: e.target.value } });
  };

  const handleIssuesWithPreviousOrderChange = (e) => {
    cartDispatch({ type: cartActions.setIssuesWithPreviousOrder, payload: { issuesWithPreviousOrder: e.target.value } });
  };

  const handlePayCashWithThisDeliveryChange = (value) => {
    cartDispatch({ type: cartActions.setPayCashWithThisDelivery, payload: { payCashWithThisDelivery: value } });
  };

  const handleCollectRecyclablesWithThisDeliveryChange = (value) => {
    cartDispatch({ type: cartActions.setCollectRecyclablesWithThisDelivery, payload: { collectRecyclablesWithThisDelivery: value } });
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
        <Row className="m-3">
          <Col xs={12}>
            <h2 className="py-4 text-center">Your Cart</h2>
          </Col>
          <Col className="bg-white m-3 p-3">
            <h4 className="pb-2"> Cart is Empty! </h4>
            <Button className="mb-2" onClick={() => { handleAddItems(); }}> Add Items</Button>
          </Col>
        </Row>
      );
    }
    default: {
      return (
        <Row>
          <Col xs={12}>
            <h2 className="py-4 text-center">{orderId ? 'Update Order' : 'Your Cart'}</h2>
          </Col>

          <Card className="mb-5">
            <ListProducts
              products={cartState.cart.productsInCart}
              deletedProducts={deletedProducts.cart}
              updateProductQuantity={updateProductQuantity}
              isMobile
              isAdmin={isLoggedInUserAdmin()}
              isShopOwner={Roles.userIsInRole(loggedInUser, constants.Roles.shopOwner.name)}
            />
            <Row>
              <Col
                sm={11}
                xs={12}
                className="text-right text-center-xs"
                style={{
                  marginBottom: '2.5em',
                }}
              >
                <Button
                  onClick={() => { handleAddItems(); }}
                  style={{
                    marginRight: '.5em',
                  }}
                >
                  <Icon icon="add" type="mts" />
                  <span>Add Items</span>
                </Button>

                <Button
                  onClick={() => { clearCart(); }}
                  style={{ marginRight: '.5em' }}
                >
                  Clear Cart
                </Button>
              </Col>
            </Row>

            {!isOrderAmountGreaterThanMinimum(cartState.cart.totalBillAmount) && (
              <div className="offset-1 col-10 alert alert-info py-3">
                {Meteor.settings.public.CART_ORDER.MINIMUMCART_ORDER_MSG}
              </div>
            )}

            {(Meteor.settings.public.ShowReturnBottles) && (
              <div className="row alert alert-info py-3">
                <p className="offset-sm-1">
                  Let's Reduce, Renew and Recycle.
                  <br />
                  Please return
                  <span style={{ color: '#EF0905' }}>
                    {' all glass '}
                  </span>
                  bottles and crates to the delivery person.
                </p>
              </div>
            )}

            <OrderComment refComment={refComment} onCommentChange={handleCommentChange} />

            <PrevOrderComplaint
              onPrevOrderComplaintChange={handleIssuesWithPreviousOrderChange}
              prevOrderComplaint={cartState.cart.issuesWithPreviousOrder}
            />

            {onBehalfUser.isNecessary && (
              <OnBehalf
                onSelectedChange={onSelectedChange}
                showMandatoryFields={onBehalfUserInfoError}
              />
            )}

            {(isOrderBeingUpdated) && <Loading />}

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
              payCash={cartState.cart.payCashWithThisDelivery}
              collectRecyclables={cartState.cart.collectRecyclablesWithThisDelivery}
              onPayCash={handlePayCashWithThisDeliveryChange}
              onCollectRecyclables={handleCollectRecyclablesWithThisDeliveryChange}
            />
          </Card>
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
