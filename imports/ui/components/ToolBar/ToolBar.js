import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
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
  history, countOfUnreadNotifications, authenticated, isAdmin, globalStatuses, appName,
}) => {
  const [numberOfAwaitingPayments, _] = useStore(GlobalStores.paymentNotification.name);

  const hideBottom = -70;
  let bottom = hideBottom;
  let intervalID = 0;

  function show() {
    const toolBar = document.getElementById('toolBar');
    if (toolBar !== null) {
      toolBar.style.display = 'flex';

      bottom = parseInt(toolBar.style.bottom, 10);
      if (bottom < 0) {
        bottom += 10;
        toolBar.style.bottom = `${bottom}px`;
      } else {
        clearInterval(intervalID);
      }
    }
  }

  function reset() {
    clearInterval(intervalID);
    bottom = hideBottom;
    const toolBar = document.getElementById('toolBar');
    if (toolBar !== null) {
      toolBar.style.display = 'none';
      toolBar.style.bottom = `${bottom}px`;
    }
  }

  function bringUp() {
    clearInterval(intervalID);
    intervalID = setInterval(show, 20);
  }

  let lastScrollTop = 0;
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

  if (authenticated) {
    return (
      <div id="toolBar" className="toolBar container-fluid text-center">
        <div className="box box1">
          <Button bsStyle="link" onClick={() => { onMessageIconClick(isAdmin); }}>
            <Icon icon="comment" />
            <span style={fontProps}>Message</span>
            {(appName !== 'messages') && (countOfUnreadNotifications > 0) && (
            <b className="alertMenu shoppingCartBubble">
              {countOfUnreadNotifications}
            </b>
            )}
          </Button>
        </div>
        <div className="box box2">
          <Button bsStyle="link" onClick={() => { history.push('/recipes'); }}>
            <Icon icon="utensils" />
            <span style={fontProps}>Recipes</span>
          </Button>
        </div>
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
            { (numberOfAwaitingPayments > 0) && (
            <b className="alertMenu alertBubble">
              .
            </b>
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
