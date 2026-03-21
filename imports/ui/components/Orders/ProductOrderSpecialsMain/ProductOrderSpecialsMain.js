import { Meteor } from 'meteor/meteor';
import React, {
  useState, useEffect, useRef,
} from 'react';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import Loading from '../../Loading/Loading';
import ProductOrderSpecials, { NoProductsToOrder } from './ProductOrderSpecials';
import { cartActions, useCartState, useCartDispatch } from '../../../stores/ShoppingCart';
import SpecialOrderDeliveryDetails from './SpecialOrderDeliveryDetails';

import './ProductOrderSpecialsMain.scss';

const STATES = {
  showProducts: 'SHOWPROD',
  showDeliveryDetails: 'DELDETAILS',
  showOrderConfirmation: 'ORDERCONFIRM',
};

function ProductsOrderSpecialsMain({ history, loggedInUserId }) {
  const childRef = useRef();
  const cartState = useCartState();
  const cartDispatch = useCartDispatch();
  const [showState, setShowState] = useState(STATES.showProducts);
  const [isLoading, setIsLoading] = useState(true);
  const specialProducts = useRef([]);

  useEffect(() => {
    if (!loggedInUserId) {
      cartDispatch({ type: cartActions.emptyCart });
      Meteor.call('products.getSpecialsToOrder', (error, splProducts) => {
        if (error) {
          toast.error(error.reason);
        } else {
          specialProducts.current = { ...splProducts };
        }
        setIsLoading(false);
      });
    } else {
      history.push('/neworder');
    }
  }, []);

  if (isLoading) {
    return (<Loading />);
  }

  function userCreatedNowAddOrder(createdUser) {
    const products = [];

    Object.keys(cartState.cart.productsInCart).map((key) => {
      products.push(cartState.cart.productsInCart[key]);
    });

    const order = {
      products,
      _id: '',
      comments: cartState.cart.comments || '',
      // basketId: cartState.cart.basketId || '',
      loggedInUserId: createdUser._id,
    };

    setIsLoading(true);
    Meteor.call('orders.upsert', order, (error) => {
      if (error) {
        toast.error(error.reason);
      } else {
        cartDispatch({ type: cartActions.orderFlowComplete });
        toast.success('Order has been placed');
        setShowState(STATES.showOrderConfirmation);
        setIsLoading(false);
      }
    });
  }

  function placeOrder() {
    if (childRef.current.validateUserDetails()) {
      childRef.current.createUser(userCreatedNowAddOrder);
    }
  }

  const DeliveryDetails = () => (
    <div className="text-left bg-body p-2 ps-sm-4">
      <h3 className="py-4 col-md-8 col-lg-6"> Delivery Details </h3>
      <div className="col-md-8 col-lg-6">
        <SpecialOrderDeliveryDetails ref={childRef} />
        <br />
        <div className="text-right">
          <button
            type="button"
            className="btn btn-default"
            style={{ marginRight: '1em', minWidth: '10em' }}
            onClick={() => { setShowState(STATES.showProducts); }}
          >
            &#x2190; back
          </button>

          <button
            type="button"
            className="btn btn-block btn-primary"
            style={{ minWidth: '14em' }}
            onClick={placeOrder}
          >
            Place Order
          </button>
        </div>
      </div>

    </div>
  );

  const WhatsAppSupport = Meteor.settings.public.Support_Numbers.whatsapp;
  const OrderConfirm = () => (
    <div className="bg-body text-center pb-2">
      <h3 className="py-4"> Order Placed Successfully </h3>
      <div>
        <div>
          Thank you for placing your order with Suvai.
          <br />
          You can
          {' '}
          <span className="text-warning">Log In </span>
          {' '}
          to Suvai to track your order and pay online if you wish to.
          <br />

          <div className="col py-4">
            <button
              type="button"
              className="btn btn-primary"
              style={{ minWidth: '10em' }}
              onClick={() => { history.push('/login'); }}
            >
              Take me to Login
            </button>
          </div>
          <p>
            You can talk to us or send us a Whatsapp Message at
            <br />
            <h4>
              <a
                href={`tel:${WhatsAppSupport.replace(' ', '')}`}
                className="text-info"
              >
                {WhatsAppSupport}
              </a>
            </h4>
          </p>
        </div>
      </div>
    </div>
  );

  switch (true) {
    case (specialProducts.current.productListId === 'none'):
      return (<NoProductsToOrder history={history} />);
    case (showState === STATES.showDeliveryDetails):
      return (<DeliveryDetails />);
    case (showState === STATES.showOrderConfirmation):
      return (<OrderConfirm />);
    default:
      return (
        <ProductOrderSpecials
          products={specialProducts.current}
          placeOrder={
            () => { setShowState(STATES.showDeliveryDetails); }
            }
        />
      );
  }
}

ProductsOrderSpecialsMain.propTypes = {
  history: PropTypes.object.isRequired,
};

export default ProductsOrderSpecialsMain;
