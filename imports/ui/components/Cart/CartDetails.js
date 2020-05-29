import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Panel, Button } from 'react-bootstrap';
import { Bert } from 'meteor/themeteorchef:bert';
import { upsertOrder } from '../../../api/Orders/methods';
import { isLoggedInUserAdmin } from '../../../modules/helpers';
import constants from '../../../modules/constants';
import { ListProducts, OrderComment, OrderFooter, OrderOnBehalf } from './CartCommon';
import { cartActions, useCartState, useCartDispatch } from '../../stores/ShoppingCart';
import Loading from '../Loading/Loading';

const CartDetails = ({ history, orderId, loggedInUser, roles }) => {
  const cartState = useCartState();
  const cartDispatch = useCartDispatch();
  const refComment = useRef();
  const refReceivedType = useRef();
  const refOnBehalfMemberPhone = useRef();
  const emptyDeletedProductsState = { countOfItems: 0, cart: {} };
  const [deletedProducts, setDeletedProducts] = useState(emptyDeletedProductsState);
  const [onBehalfUser, setOnBehalfUser] = useState({ isNecessary: !orderId && roles.includes(constants.Roles.admin.name) });

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

  const onUserPhoneNumberChange = () => {
    const { current } = refOnBehalfMemberPhone;
    if (current.value) {
      const mobileNumber = current.value;
      Meteor.call('users.find', { mobileNumber }, (error, user) => {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          const onBehalfUserTemp = { ...onBehalfUser };
          onBehalfUserTemp.user = user;
          setOnBehalfUser(onBehalfUserTemp);
        }
      });
    }
  };

  const updateProductQuantity = (e) => {
    const productId = e.target.name;
    const quantity = parseFloat(e.target.value);
    const product = cartState.cart.productsInCart[productId] ?
      cartState.cart.productsInCart[productId] : deletedProducts.cart[productId];
    product.quantity = quantity;
    delete product.removedDuringCheckout;
    updateDeletedProducts(quantity, productId, product);
    cartDispatch({ type: cartActions.updateCart, payload: { product } });
  };

  const handleOrderSubmit = () => {
    const { current } = refReceivedType;
    if (onBehalfUser.isNecessary) {
      if (!constants.OrderReceivedType.allowedValues.includes(current.value)) {
        const onBehalfUserTemp = { ...onBehalfUser };
        onBehalfUserTemp.selectedReceivedMethodError = true;
        setOnBehalfUser(onBehalfUserTemp);
        return;
      }

      if (!onBehalfUser.user) {
        const onBehalfUserTemp = { ...onBehalfUser };
        onBehalfUserTemp.user = '';
        setOnBehalfUser(onBehalfUserTemp);
        return;
      }
    }

    if (loggedInUser) {
      const products = [];

      Object.keys(cartState.cart.productsInCart).map((key) => {
        products.push(cartState.cart.productsInCart[key]);
      });

      const order = {
        products,
        _id: orderId && orderId !== 'NEW' ? orderId : '',
        comments: cartState.cart.comments ? cartState.cart.comments : '',
        loggedInUserId: loggedInUser._id,
      };

      if (onBehalfUser.isNecessary) {
        order.loggedInUserId = onBehalfUser.user._id;
        order.onBehalf = {
          postUserId: loggedInUser._id,
          orderReceivedAs: (onBehalfUser.isNecessary) ? current.value : '',
        };
      }


      upsertOrder.call(order, (error, order) => {
        const confirmation = 'Your Order has been placed';
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          cartDispatch({ type: cartActions.orderFlowComplete });
          Bert.alert(confirmation, 'success');
          history.push(`/order/success/${(order.insertedId) ? order.insertedId : orderId}`);
        }
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
            <h3 className="page-header">{'Your Cart'}</h3>
          </Col>
          <Col xs={12}>
            <Panel>
              <h4> Cart is Empty! </h4>
              <Button style={{ marginBottom: '2.5em', marginRight: '.5em' }} onClick={() => { history.push('/neworder/selectbasket'); }}>Add Items</Button>
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
              <ListProducts products={cartState.cart.productsInCart} deletedProducts={deletedProducts.cart} updateProductQuantity={updateProductQuantity} isMobile isAdmin={isLoggedInUserAdmin()} isShopOwner={Roles.userIsInRole(loggedInUser, constants.Roles.shopOwner.name)} />
              <Row>
                <Col xs={6} className="text-left">
                  <Button style={{ marginBottom: '2.5em', marginLeft: '.5em' }} onClick={() => { clearCart(); }}>Clear Cart</Button>
                </Col>
                <Col xs={6} className="text-right">
                  <Button style={{ marginBottom: '2.5em', marginRight: '.5em' }} onClick={() => { handleAddItems(); }}>Add Items</Button>
                </Col>
              </Row>
              <OrderComment refComment={refComment} onCommentChange={handleCommentChange} />
              {onBehalfUser.isNecessary && (<OrderOnBehalf
                onUserPhoneNumberChange={onUserPhoneNumberChange}
                selectedUser={onBehalfUser.user}
                refOnBehalfMemberPhone={refOnBehalfMemberPhone}
                refReceivedType={refReceivedType}
                selectedReceivedMethodError={onBehalfUser.selectedReceivedMethodError}
              />)}
              <OrderFooter
                totalBillAmount={cartState.cart.totalBillAmount}
                onButtonClick={() => { handleOrderSubmit(cartState); }}
                submitButtonName={orderId ? 'Update Order' : 'Place Order'}
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
