import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import { ReactiveVar } from 'meteor/reactive-var';
import { withTracker } from 'meteor/react-meteor-data';
import Icon from '../Icon/Icon';
import './ToolBar.scss';

import { dMessages } from '../../apps/dynamicRoutes';

import { useStore, GlobalStores } from '../../stores/GlobalStore';

import { useCartState } from '../../stores/ShoppingCart';

const fontProps = {
  fontWeight: '700',
  textAlign: 'center',
  display: 'none',
};

const reactVar = new ReactiveVar(
  {
    lastFetchDateTime: new Date(),
  },
);

const PreLoad = [dMessages];

const ToolBar = ({
  history, countOfUnreadNotifications, authenticated, isAdmin, globalStatuses, appName, match,
}) => {
  const [numberOfAwaitingPayments, _] = useStore(GlobalStores.paymentNotification.name);

  const cartState = useCartState();
  const totalProductsInCount = cartState.newCartCountOfItems;

  useEffect(() => {
    if (appName !== 'messages') {
      const reactVarTemp = reactVar.get();
      if (globalStatuses && globalStatuses.lastVisitedMessageApp
        && (reactVarTemp.lastFetchDateTime.toUTCString()
        !== globalStatuses.lastVisitedMessageApp.toUTCString())) {
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
      history.push('/cart');
    } else {
      history.push('/neworder');
      // history.push('/neworder/selectbasket');
    }
  }

  function onMessageIconClick(isAdmin) {
    if (isAdmin) {
      history.push('/messagesadmin');
    } else {
      history.push('/messages');
    }
  }

  if (authenticated) {
    return (
      <div id="toolBar" className="toolBar text-center">
        <div className="col box3">
          <Button variant="white" onClick={() => { history.push('/myorders'); }}>
            <Icon icon="home" type="mt" className="fs-1" />
            <span style={fontProps}>Home</span>
          </Button>
        </div>

        <div className="col box1">
          <Button variant="white" onClick={() => { onMessageIconClick(isAdmin); }}>
            { /* <Icon icon="comment" /> */}
            <Icon icon="forum" type="mt" className={`fs-2 ${(match.url === '/messages') ? 'text-primary' : ''}`} />
            <div style={fontProps}>Message</div>
            {(appName !== 'messages') && (countOfUnreadNotifications > 0) && (
            <b className="alertMenu shoppingCartBubble">
              {countOfUnreadNotifications}
            </b>
            )}
          </Button>
        </div>
        { /* <div className="col box2">
          <Button variant="white" onClick={() => { history.push('/recipes'); }}>
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
          <Button variant="white" onClick={() => { history.push('/mywallet'); }}>
            <Icon icon="currency_rupee" type="mt" className="fs-2" />
            { (numberOfAwaitingPayments > 0) && (
            <b className="alertMenu alertBubble"> </b>
            )}
            <span style={fontProps}>Wallet</span>
          </Button>
        </div>
      </div>
    );
  }
  return (<div />);
};

ToolBar.defaultProps = {
  countOfUnreadNotifications: 0,
};

ToolBar.propTypes = {
  history: PropTypes.bool.isRequired,
  countOfUnreadNotifications: PropTypes.bool,
};

/*
export default withTracker((args) => ({
  history: args.history,
  loading: false,
  countOfUnreadNotifications: 0,
}))(ToolBar); */

const CountOfMessages = new Mongo.Collection('countOfUnreadMsgs');

export default withTracker((args) => {
  const reactVarTemp = reactVar.get();

  const subscription = Meteor.subscribe('messages.notifications', reactVarTemp.lastFetchDateTime.toUTCString());
  return {
    history: args.history,
    loading: !subscription.ready(),
    countOfUnreadNotifications: CountOfMessages.find({}).fetch().length,
  };
})(ToolBar);
