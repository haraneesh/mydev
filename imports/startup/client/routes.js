/* eslint-disable max-len */

import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { Meteor } from 'meteor/meteor';
import App from '../../ui/layouts/App.js';
import Documents from '../../ui/pages/Documents.js';
import Veggies from '../../ui/pages/Veggies.js';
/*Documents*/
import NewDocument from '../../ui/pages/NewDocument.js';
import EditDocument from '../../ui/containers/EditDocument';
import ViewDocument from '../../ui/containers/ViewDocument';
/*order*/
import { MyOrders } from '../../ui/pages/orders/MyOrders'
import ViewOrderDetails  from '../../ui/containers/orders/ViewOrderDetails'
import Order from '../../../imports/ui/pages/orders/Order'
/*products*/
import { ProductsAdmin } from '../../ui/pages/products-admin'
import { Cart } from '../../ui/pages/cart'
/*productLists*/
import { ProductLists } from '../../ui/pages/productLists/ProductLists'
import ViewProductListDetails from '../../ui/containers/productLists/ViewProductListDetails' 
/*miscellaneous*/
import Index from '../../ui/pages/Index.js';
import Login from '../../ui/pages/Login.js';
import NotFound from '../../ui/pages/NotFound.js';
import RecoverPassword from '../../ui/pages/RecoverPassword.js';
import ResetPassword from '../../ui/pages/ResetPassword.js';
import Signup from '../../ui/pages/Signup.js';

const authenticate = (nextState, replace) => {
  if (!Meteor.loggingIn() && !Meteor.userId()) {
    replace({
      pathname: '/login',
      state: { nextPathname: nextState.location.pathname },
    });
  }
};

Meteor.startup(() => {
  render(
    <Router history={ browserHistory }>
      <Route path="/" component={ App }>
        /*<IndexRoute name="index" component={ Index } onEnter={ authenticate } />*/
        <IndexRoute name="myOrders" component={ MyOrders } onEnter={ authenticate } />

        /* Documents */
        <Route name="documents" path="/documents" component={ Documents } onEnter={ authenticate } />
        <Route name="newDocument" path="/documents/new" component={ NewDocument } onEnter={ authenticate } />
        <Route name="editDocument" path="/documents/:_id/edit" component={ EditDocument } onEnter={ authenticate } />
        <Route name="viewDocument" path="/documents/:_id" component={ ViewDocument } onEnter={ authenticate } />

        /* Order */
        <Route name="viewOrderDetails" path="/order/:_id" component={ ViewOrderDetails } onEnter={ authenticate } />
        <Route name="order" path="/order" component={ Order } onEnter={ authenticate } />

        /* ProductLists */
        <Route name="viewProductListDetails" path="/productLists/:_id" component={ ViewProductListDetails } onEnter={ authenticate } />
        <Route name="productLists" path="/productLists" component={ ProductLists } onEnter={ authenticate } />

        /* Product */
        <Route name="products-admin" path="/admin/products" component={ ProductsAdmin } onEnter={ authenticate } />
        <Route name="cart" path="/cart" component={ Cart } onEnter={ authenticate } />

        /* Access */
        <Route name="login" path="/login" component={ Login } />
        <Route name="recover-password" path="/recover-password" component={ RecoverPassword } />
        <Route name="reset-password" path="/reset-password/:token" component={ ResetPassword } />
        <Route name="signup" path="/signup" component={ Signup } />
        <Route path="*" component={ NotFound } />
      </Route>
    </Router>,
    document.getElementById('react-root')
  );
});
