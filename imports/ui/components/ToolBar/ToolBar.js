import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import Icon from '../Icon/Icon';
import './ToolBar.scss';

import { useStore, GlobalStores } from '../../stores/GlobalStore';

import { useCartState } from '../../stores/ShoppingCart';

const fontProps = {
  fontWeight: '700',
  textAlign: 'center',
  display: 'none',
};

const hideBottom = -70;
let bottom = hideBottom;
let intervalID = 0;

function show() {
  const toolBar = document.getElementById('toolBar');
  document.getElementById('toolBar').style.display = 'flex';
  bottom = parseInt(toolBar.style.bottom, 10);
  if (bottom < 0) {
    bottom += 10;
    toolBar.style.bottom = `${bottom}px`;
  } else {
    clearInterval(intervalID);
  }
}

function reset() {
  clearInterval(intervalID);
  bottom = hideBottom;
  document.getElementById('toolBar').style.display = 'none';
  document.getElementById('toolBar').style.bottom = `${bottom}px`;
}

function bringUp() {
  clearInterval(intervalID);
  intervalID = setInterval(show, 20);
}

const ToolBar = ({ history, authenticated, isAdmin }) => {
  let lastScrollTop = 0;
  const cartState = useCartState();
  const totalProductsInCount = cartState.newCartCountOfItems;

  // element should be replaced with the actual target element on
  // which you have applied scroll, use window in case of no target element.
  window.addEventListener('scroll', () => { // or window.addEventListener("scroll"....
    const st = window.pageYOffset || document.documentElement.scrollTop;
    // Credits: "https://github.com/qeremy/so/blob/master/so.dom.js#L426"
    if (st > lastScrollTop) {
    // downscroll code
      reset();
    } else {
    // upscroll code
      bringUp();
    }
    lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
  }, false);

  function onCartIconClick() {
    if (totalProductsInCount > 0) {
      history.push('/cart');
    } else {
      history.push('/neworder/selectbasket');
    }
  }

  function onMessageIconClick(isAdmin) {
    if (isAdmin) {
      history.push('/messagesadmin');
    } else {
      history.push('/messages');
    }
  }

  const [numberOfAwaitingPayments, _] = useStore(GlobalStores.paymentNotification.name);

  return (
    authenticated && (
    <div id="toolBar" className="toolBar container text-center">
      <div className="box box1">
        <Button bsStyle="link" onClick={() => { onMessageIconClick(isAdmin); }}>
          <Icon icon="comment" />
          <span style={fontProps}>Message</span>
        </Button>
      </div>
      {/* <div className="box box2">
        <Button bsStyle="link" onClick={() => { history.push('/recipes'); }}>
          <Icon icon="utensils" />
          <span style={fontProps}>Recipes</span>
        </Button>
    </div> */}
      <div className="box box3">
        <Button bsStyle="link" onClick={() => { history.push('/'); }}>
          <Icon icon="home" type="glyph" />
          <span style={fontProps}>Home</span>
        </Button>
      </div>
      <div className="box box4">
        <Button bsStyle="link" onClick={onCartIconClick}>
          <Icon icon="shopping-basket" />
          {(totalProductsInCount > 0) && (
          <b className="alertMenu shoppingCartBubble">
            {totalProductsInCount}
          </b>
          )}
          <span style={fontProps}>Cart</span>
        </Button>
      </div>
      <div className="box box5">
        <Button bsStyle="link" onClick={() => { history.push('/mywallet'); }}>
          <Icon icon="rupee-sign" />
          {(numberOfAwaitingPayments > 0) && (
          <b className="alertMenu alertBubble">
            .
          </b>
          )}
          <span style={fontProps}>Wallet</span>
        </Button>
      </div>
    </div>
    ));
};

ToolBar.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  history: PropTypes.bool.isRequired,
  authenticated: PropTypes.bool.isRequired,
};

export default ToolBar;
