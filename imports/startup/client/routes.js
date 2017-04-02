/* eslint-disable max-len */

import React from 'react';
import { render } from 'react-dom';
import { Router, Route, Redirect, IndexRoute, browserHistory } from 'react-router';
import { Meteor } from 'meteor/meteor';
import App from '../../ui/layouts/App.js';
import Recipes from '../../ui/pages/recipes/Recipes';
/*Recipes*/
import NewRecipe from '../../ui/pages/recipes/NewRecipe';
import EditRecipe from '../../ui/containers/recipes/EditRecipe';
import ViewRecipe from '../../ui/containers/recipes/ViewRecipe';
/*order*/
import { MyOrders } from '../../ui/pages/orders/MyOrders'
//import ViewOrderDetails  from '../../ui/containers/orders/ViewOrderDetails'
import EditOrderDetails  from '../../ui/containers/orders/EditOrder'
import Order from '../../../imports/ui/pages/orders/Order'
/*productLists*/
import { ProductLists } from '../../ui/pages/productLists/ProductLists'
import ViewProductListDetails from '../../ui/containers/productLists/ViewProductListDetails' 
/*miscellaneous*/
import Index from '../../ui/pages/Index.js';
import Login from '../../ui/pages/Login.js';
//import NotFound from '../../ui/pages/NotFound.js';
import RecoverPassword from '../../ui/pages/RecoverPassword.js';
import ResetPassword from '../../ui/pages/ResetPassword.js';
import Signup from '../../ui/pages/Signup.js';
/*admin*/
import { ProductsAdmin } from '../../ui/pages/products-admin'
import { AllOrders } from '../../ui/pages/admin/AllOrders'

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
        <Route name="recipes" path="/recipes" component={ Recipes } onEnter={ authenticate } />
        <Route name="newRecipe" path="/recipes/new" component={ NewRecipe } onEnter={ authenticate } />
        <Route name="editRecipe" path="/recipes/:_id/edit" component={ EditRecipe } onEnter={ authenticate } />
        <Route name="viewRecipe" path="/recipes/:_id" component={ ViewRecipe } onEnter={ authenticate } />

        /* Order */
        <Route name="EditOrderDetails" path="/order/:_id" component={ EditOrderDetails } onEnter={ authenticate } />
        <Route name="order" path="/order" component={ Order } onEnter={ authenticate } />

        /* Product */
        <Route name="products-admin" path="/admin/products" component={ ProductsAdmin } onEnter={ authenticate } />

        /* Admin */
         /* ProductLists */
        <Route name="products-admin" path="/productLists/:_id/edit" component={ ProductsAdmin } onEnter={ authenticate } />
        <Route name="viewProductListDetails" path="/productLists/:_id" component={ ViewProductListDetails } onEnter={ authenticate } />
        <Route name="productLists" path="/productLists" component={ ProductLists } onEnter={ authenticate } />
        
        /* Orders */
        <Route name="allOrders" path="/allorders" component= { AllOrders } onEnter = { authenticate } />

        /* Access */
        <Route name="login" path="/login" component={ Login } />
        <Route name="recover-password" path="/recover-password" component={ RecoverPassword } />
        <Route name="reset-password" path="/reset-password/:token" component={ ResetPassword } />
        <Route name="signup" path="/signup" component={ Signup } />

        /* Page not found */
        <Redirect from='*' to='/' />

      </Route>
    </Router>,
    document.getElementById('react-root')
  );
});
