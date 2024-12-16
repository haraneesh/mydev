import { Roles } from 'meteor/alanning:roles';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import React, { useEffect, useState, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { upsertOrder } from '../../../api/Orders/methods';
import constants from '../../../modules/constants';
import {
  isChennaiPinCode,
  isLoggedInUserAdmin,
} from '../../../modules/helpers';
import {
  cartActions,
  useCartDispatch,
  useCartState,
} from '../../stores/ShoppingCart';
import Icon from '../Icon/Icon';
import Loading from '../Loading/Loading';
import OnBehalf from '../OnBehalf/OnBehalf';
import {
  ListProducts,
  OrderComment,
  OrderFooter,
  PrevOrderComplaint,
} from './CartCommon';
import GetUserPhoneNumber from './GetUserPhoneNumber';
import CollectOrderPayment from './OrderPayment/CollectOrderPayment';

const isOrderAmountGreaterThanMinimum = (orderAmt) => {
  if (
    Meteor.settings.public.CART_ORDER.MINIMUM_ORDER_AMT <= orderAmt ||
    isLoggedInUserAdmin()
  ) {
    return true;
  }
  return false;
};

const CartDetails = ({ orderId, loggedInUser = Meteor.userId(), roles }) => {
  const cartState = useCartState();
  const cartDispatch = useCartDispatch();
  const refComment = useRef();
  const navigate = useNavigate();
  const emptyDeletedProductsState = { countOfItems: 0, cart: {} };
  const [onBehalfUserInfoError, setOnBehalfUserInfoError] = useState(false);
  const [successfullyPlacedOrderId, setSuccessfullyPlacedOrderId] =
    useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [getUserMobileNumber, setGetUserMobileNumber] = useState(false);
  const [deletedProducts, setDeletedProducts] = useState(
    emptyDeletedProductsState,
  );
  const [onBehalfUser, setOnBehalfUser] = useState({
    isNecessary: !orderId && roles.includes(constants.Roles.admin.name),
    user: {},
  });
  const [isOrderBeingUpdated, setOrderUpdated] = useState(false);

  const activeCartId = !orderId || orderId === 'NEW' ? 'NEW' : orderId;
  if (cartState.activeCartId !== activeCartId) {
    cartDispatch({
      type: cartActions.activateCart,
      payload: { cartIdToActivate: activeCartId },
    });
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

  const updateProductWithReturnableChoice = ({
    parentProductId,
    parentProductQty,
    returnableProductQty,
  }) => {
    const product = cartState.cart.productsInCart[parentProductId]
      ? cartState.cart.productsInCart[parentProductId]
      : deletedProducts.cart[parentProductId];

    product.quantity = parentProductQty;
    product.associatedReturnables.quantity = returnableProductQty;
    updateDeletedProducts(parentProductQty, parentProductId, product);
    cartDispatch({ type: cartActions.updateCart, payload: { product } });
  };

  const updateProductQuantity = (e, args) => {
    if (args && args.isReturnable) {
      const { parentProductId, parentProductQty, returnableProductQty } = args;
      updateProductWithReturnableChoice({
        parentProductId,
        parentProductQty,
        returnableProductQty,
      });
    } else {
      const productId = e.target.name;
      const quantity = parseFloat(e.target.value);
      const product = cartState.cart.productsInCart[productId]
        ? cartState.cart.productsInCart[productId]
        : deletedProducts.cart[productId];
      product.quantity = quantity;
      delete product.removedDuringCheckout;
      updateDeletedProducts(quantity, productId, product);
      cartDispatch({ type: cartActions.updateCart, payload: { product } });
    }
  };

  const onSelectedChange = (newObject) => {
    const onBehalfUserTemp = { ...onBehalfUser };
    onBehalfUserTemp.user = newObject.user;
    onBehalfUserTemp.orderReceivedAs = newObject.orderReceivedAs;
    setOnBehalfUser(onBehalfUserTemp);
  };

  const placeOrderSuvaiMobileNumber = ({userId}) => {
    setGetUserMobileNumber(false);
    placeOrder({loggedInUserId: userId, onBehalfUser: onBehalfUser});
  }

  const handleGetUserMobileNumberClose = () => {
    setGetUserMobileNumber(false);
  }

  const handleOrderSubmit = () => {
    if (
      onBehalfUser.isNecessary &&
      !(
        constants.OrderReceivedType.allowedValues.includes(
          onBehalfUser.orderReceivedAs,
        ) && 'profile' in onBehalfUser.user
      )
    ) {
      setOnBehalfUserInfoError(true);
      return;
    }

    if (!loggedInUser) {
      setGetUserMobileNumber(true);
    }

    if (loggedInUser) {
      placeOrder({loggedInUserId: loggedInUser._id, onBehalfUser: onBehalfUser});
    }
  };

  function placeOrder({loggedInUserId, onBehalfUser}){

    const products = [];

      Object.keys(cartState.cart.productsInCart).map((key) => {
        products.push(cartState.cart.productsInCart[key]);
      });

      const order = {
        products,
        _id: orderId && orderId !== 'NEW' ? orderId : '',
        comments: cartState.cart.comments || '',
        issuesWithPreviousOrder: cartState.cart.issuesWithPreviousOrder || '',
        payCashWithThisDelivery:
          cartState.cart.payCashWithThisDelivery || false,
        collectRecyclablesWithThisDelivery:
          cartState.cart.collectRecyclablesWithThisDelivery || false,
        basketId: cartState.cart.basketId || '',
        loggedInUserId: loggedInUserId,
        deliveryPincode: cartState.cart.deliveryPincode,
      };

      if (onBehalfUser.isNecessary) {
        order.loggedInUserId = onBehalfUser.user._id;
        order.onBehalf = {
          postUserId: loggedInUserId,
          orderReceivedAs: onBehalfUser.orderReceivedAs,
        };
      }

      setOrderUpdated(true);
      upsertOrder.call(order, (error, createdOrder) => {
        if (error) {
          toast.error(error.reason);
          setOrderUpdated(false);
        } else if (!isLoggedInUserAdmin() && loggedInUser) {
          toast.success('Order has been placed successfully!');

          setSuccessfullyPlacedOrderId(
            createdOrder.insertedId ? createdOrder.insertedId : orderId,
          );

          Meteor.call('customer.getUserWalletWithoutCheck', (error, succ) => {
            setOrderUpdated(false);
            if (error) {
              toast.error(error.reason);
            } else {
              setShowPaymentModal(true);
            }
            setOrderUpdated(false);
          });
          setShowPaymentModal(true);
          moveToOrderSubmitScreen();
        } 
        else{
          toast.success('Order has been placed successfully!');
          moveToOrderSubmitScreen();
        }
      });

  }

  const clearCart = () => {
    if (
      confirm(
        'All the items in the cart will be removed, do you want to continue?',
      )
    ) {
      cartDispatch({ type: cartActions.emptyCart });
      setDeletedProducts(emptyDeletedProductsState);
    }
  };

  const handleAddItems = () => {
    if (loggedInUser && orderId) {
      navigate(`/order/${orderId}`);
    } else {
      navigate('/neworder/');
    }
  };

  const handleCommentChange = (e) => {
    cartDispatch({
      type: cartActions.setCartComments,
      payload: { comments: e.target.value },
    });
  };

  const handleIssuesWithPreviousOrderChange = (e) => {
    cartDispatch({
      type: cartActions.setIssuesWithPreviousOrder,
      payload: { issuesWithPreviousOrder: e.target.value },
    });
  };

  const handlePayCashWithThisDeliveryChange = (value) => {
    cartDispatch({
      type: cartActions.setPayCashWithThisDelivery,
      payload: { payCashWithThisDelivery: value },
    });
  };

  const handleCollectRecyclablesWithThisDeliveryChange = (value) => {
    cartDispatch({
      type: cartActions.setCollectRecyclablesWithThisDelivery,
      payload: { collectRecyclablesWithThisDelivery: value },
    });
  };

  const moveToOrderSubmitScreen = () => {
    cartDispatch({ type: cartActions.orderFlowComplete });
    // navigate(`/order/cart/${successfullyPlacedOrderId}`);
    navigate(`/order/success/${successfullyPlacedOrderId || orderId}`);
  };

  const afterPaymentScreen = ({ action }) => {
    moveToOrderSubmitScreen();
  };

  useEffect(() => {
    const { current } = refComment;
    if (current) {
      current.value = cartState.cart.comments || ''; // comments={cartState.cart.comments || ''}
    }
  });

  switch (true) {
    case !cartState.cart: {
      return <Navigate to="/" replace={true} />;
    }
    case cartState.cart.countOfItems === 0 &&
      deletedProducts.countOfItems === 0 &&
      !!orderId: {
      return <Navigate to={`/order/${orderId}`} replace={true} />;
    }
    case !orderId &&
      cartState.cart.countOfItems === 0 &&
      deletedProducts.countOfItems === 0: {
      return <Navigate to="/neworder" replace={true} />;
    }
    case showPaymentModal:
      return (
        <CollectOrderPayment
          loggedInUser={loggedInUser}
          callFuncAfterPay={afterPaymentScreen}
        />
      );
    default: {
      return (
        <Row>
          <GetUserPhoneNumber 
            handlePlaceOrder={placeOrderSuvaiMobileNumber} 
            showMobileNumberForm={getUserMobileNumber}
            handleClose={handleGetUserMobileNumberClose}
            />
          <Col xs={12}>
            <h2 className="py-4 text-center">
              {orderId ? 'Update Order' : 'Your Cart'}
            </h2>
          </Col>
          <Card className="mt-3">
            <h3 className="card-header" style={{ textAlign: 'center' }}>
              {' '}
              Cart Details{' '}
            </h3>
            <ListProducts
              products={cartState.cart.productsInCart}
              deletedProducts={deletedProducts.cart}
              updateProductQuantity={updateProductQuantity}
              isMobile
              isAdmin={isLoggedInUserAdmin()}
              isShopOwner={Roles.userIsInRole(
                loggedInUser,
                constants.Roles.shopOwner.name,
              )}
              isDeliveryInChennai={isChennaiPinCode(
                cartState.cart.deliveryPincode,
              )}
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
                  variant="primary"
                  onClick={() => {
                    handleAddItems();
                  }}
                  style={{
                    marginRight: '.5em',
                  }}
                >
                  <Icon icon="add" type="mts" />
                  <span>Add Items</span>
                </Button>

                <Button
                  variant="info"
                  onClick={() => {
                    clearCart();
                  }}
                  style={{ marginRight: '.5em' }}
                >
                  Clear Cart
                </Button>
              </Col>
            </Row>

            {Meteor.settings.public.ShowReturnBottles && (
              <div className="row alert alert-info py-3">
                <p className="offset-sm-1">
                  Let's Reduce, Renew and Recycle.
                  <br />
                  Please return
                  <span style={{ color: '#EF0905' }}>{' all glass '}</span>
                  bottles and crates to the delivery person.
                </p>
              </div>
            )}

            {/*
            <PrevOrderComplaint
              onPrevOrderComplaintChange={handleIssuesWithPreviousOrderChange}
              prevOrderComplaint={cartState.cart.issuesWithPreviousOrder}
            />
            */}
            {isOrderBeingUpdated && <Loading />}
          </Card>
          <Card className="mb-5">
            {onBehalfUser.isNecessary && (
              <OnBehalf
                onSelectedChange={onSelectedChange}
                showMandatoryFields={onBehalfUserInfoError}
              />
            )}

            <OrderComment
              refComment={refComment}
              onCommentChange={handleCommentChange}
            />

            {!isOrderAmountGreaterThanMinimum(
              cartState.cart.totalBillAmount,
            ) && (
              <div className="offset-1 col-10 alert alert-info py-3 text-center">
                {Meteor.settings.public.CART_ORDER.MINIMUMCART_ORDER_MSG}
              </div>
            )}

            <OrderFooter
              totalBillAmount={cartState.cart.totalBillAmount}
              onButtonClick={() => {
                handleOrderSubmit(cartState);
              }}
              submitButtonName={
                isOrderBeingUpdated
                  ? 'Checking Wallet Balance ...'
                  : orderId
                    ? 'Update Order'
                    : 'Place Order →'
              }
              /*
              showWaiting={
                isOrderBeingUpdated ||
                !isOrderAmountGreaterThanMinimum(cartState.cart.totalBillAmount)
              }
              */
             showWaiting={isOrderBeingUpdated}
              orderId={orderId}
              payCash={cartState.cart.payCashWithThisDelivery}
              collectRecyclables={
                cartState.cart.collectRecyclablesWithThisDelivery
              }
              onPayCash={handlePayCashWithThisDeliveryChange}
              onCollectRecyclables={
                handleCollectRecyclablesWithThisDeliveryChange
              }
            />
          </Card>
        </Row>
      );
    }
  }
};

CartDetails.propTypes = {
  orderId: PropTypes.string,
  loggedUserId: PropTypes.string,
  loggedInUser: PropTypes.object,
  roles: PropTypes.array.isRequired,
};

export default CartDetails;
