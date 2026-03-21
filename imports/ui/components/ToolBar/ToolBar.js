import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { withTracker } from 'meteor/react-meteor-data';
import { ReactiveVar } from 'meteor/reactive-var';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Icon from '../Icon/Icon';
import './ToolBar.scss';

import { dMessages } from '../../apps/dynamicRoutes';
import { useNavigate } from 'react-router-dom';
import { useCartState } from '../../stores/ShoppingCart';
import { calculateWalletBalanceInRs } from '../../../modules/both/walletHelpers';

const fontProps = {
  fontWeight: '700',
  textAlign: 'center',
  display: 'none',
};

const reactVar = new ReactiveVar({
  lastFetchDateTime: new Date(),
});

const ToolBar = ({
  countOfUnreadNotifications = 0,
  authenticated,
  isAdmin,
  globalStatuses,
  appName,
  match,
  userWallet,
}) => {
  const walletBalanceInRs = userWallet ? calculateWalletBalanceInRs(userWallet) : 0;
  const showWalletAlert = walletBalanceInRs < 0;

  const cartState = useCartState();
  const navigate = useNavigate();
  const totalProductsInCount = cartState.newCartCountOfItems;

  useEffect(() => {
    if (appName !== 'messages') {
      const reactVarTemp = reactVar.get();
      if (
        globalStatuses &&
        globalStatuses.lastVisitedMessageApp &&
        reactVarTemp.lastFetchDateTime.toUTCString() !==
          globalStatuses.lastVisitedMessageApp.toUTCString()
      ) {
        reactVar.set({
          lastFetchDateTime: globalStatuses.lastVisitedMessageApp,
        });
      }
    }
  });

  // element should be replaced with the actual target element on
  // which you have applied scroll, use window in case of no target element.
  // Credits: "https://github.com/qeremy/so/blob/master/so.dom.js#L426"

  /* let lastScrollTop = 0;
  window.addEventListener('scroll', () => {
    const st = window.pageYOffset || document.documentElement.scrollTop;
    if (st > lastScrollTop) {
    // downscroll code
      reset();
    } else {
    // upscroll code
      bringUp();
    }
    lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
  }, false); */

  function onCartIconClick() {
    if (totalProductsInCount > 0) {
      navigate('/cart');
    } else {
      navigate('/neworder');
      // navigate('/neworder/selectbasket');
    }
  }

  function onMessageIconClick(isAdmin) {
    if (isAdmin) {
      // navigate('/messagesadmin');
      window.open(`https://web.whatsapp.com/`, '_blank');
    } else {
      navigate('/messages');
    }
  }

  if (authenticated) {
    return (
      <div id="toolBar" className="toolBar text-center">
        <div className="col box3">
          <Button
            variant="white"
            onClick={() => {
              navigate('/myorders');
            }}
          >
            <Icon icon="home" type="mt" className="fs-1" />
            <span style={fontProps}>Home</span>
          </Button>
        </div>

        <div className="col box1">
          <Button
            variant="white"
            onClick={() => {
              onMessageIconClick(isAdmin);
            }}
          >
            {/* <Icon icon="comment" /> */}
            <Icon
              icon="forum"
              type="mt"
              className={`fs-2 ${match.url === '/messages' ? 'text-primary' : ''}`}
            />
            <div style={fontProps}>Message</div>
            {appName !== 'messages' && countOfUnreadNotifications > 0 && (
              <b className="alertMenu shoppingCartBubble">
                {countOfUnreadNotifications}
              </b>
            )}
          </Button>
        </div>
        {/* <div className="col box2">
          <Button variant="white" onClick={() => { navigate('/recipes'); }}>
            <Icon icon="restaurant" type="mt" className="fs-2" />
            <span style={fontProps}>Recipes</span>
          </Button>
            </div> */}
        <div className="col box4">
          <Button variant="white" onClick={onCartIconClick}>
            <Icon icon="local_mall" type="mt" className="fs-2" />
            {/* (totalProductsInCount > 0) && (
            <b className="alertMenu shoppingCartBubble">
              {totalProductsInCount}
            </b>
            ) */}
            <span style={fontProps}>Cart</span>
          </Button>
        </div>
        <div className="col box5">
          <Button
            variant="white"
            onClick={() => {
              navigate('/openinvoices');
            }}
          >
            <Icon icon="currency_rupee" type="mt" className="fs-2" />
            {showWalletAlert && (
              <b className="alertMenu alertBubble"> </b>
            )}
            <span style={fontProps}>Wallet</span>
          </Button>
        </div>
      </div>
    );
  }
  return <div />;
};

ToolBar.propTypes = {
  countOfUnreadNotifications: PropTypes.number,
  userWallet: PropTypes.object,
  authenticated: PropTypes.bool,
  isAdmin: PropTypes.bool,
  globalStatuses: PropTypes.object,
  appName: PropTypes.string,
  match: PropTypes.object,
};

export default ToolBar;
