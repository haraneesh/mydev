import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'react-bootstrap';
import { BrowserRouter as Router, Switch, Redirect } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Roles } from 'meteor/alanning:roles';
import Authenticated from '../../components/Routes/Authenticated';
import AdminAuthenticated from '../../components/Routes/AdminAuthenticated';
import PlaceOrderAuthenticated from '../../components/Routes/PlaceOrderAuthenticated';
import NotAuthenticated from '../../components/Routes/NotAuthenticated';
import Public from '../../components/Routes/Public';
/*
import Documents from '../../pages/Documents/DocumentHome/Documents';
import NewDocument from '../../pages/Documents/NewDocument/NewDocument';
import ViewDocument from '../../pages/Documents/ViewDocument/ViewDocument';
import EditDocument from '../../pages/Documents/EditDocument/EditDocument';
import Index from '../../pages/Miscellaneous/Index/Index';
*/

import Footer from '../../components/Footer/Footer';
import Terms from '../../pages/Miscellaneous/Terms/Terms';
import Refund from '../../pages/Miscellaneous/Refund/Refund';
import Privacy from '../../pages/Miscellaneous/Privacy/Privacy';
import Signup from '../../pages/Miscellaneous/Signup/Signup';
import Login from '../../pages/Miscellaneous/Login/Login';
import Logout from '../../pages/Miscellaneous/Logout/Logout';
import VerifyEmail from '../../pages/Miscellaneous/VerifyEmail';
import RecoverPassword from '../../pages/Miscellaneous/RecoverPassword/RecoverPassword';
import ResetPassword from '../../pages/Miscellaneous/ResetPassword/ResetPassword';
import Profile from '../../pages/Miscellaneous/Profile/Profile';
import About from '../../pages/Miscellaneous/About/About';

/* order */
// import PlaceOrder from '../../pages/Orders/PlaceOrder/PlaceOrder';
import PlaceOrder from '../../pages/Orders/PlaceNewOrder/PlaceNewOrder';
import SelectBasket from '../../pages/Orders/PlaceNewOrder/SelectBasket';

import MyOrders from '../../pages/Orders/MyOrders/MyOrders';
// import EditOrderDetails from '../../containers/Orders/EditOrder';
import EditOrderDetails from '../../pages/Orders/EditOrderDetails/EditOrderDetails';

import Cart from '../../pages/Cart/CartHome';
import SuccessOrderPlaced from '../../pages/Cart/SuccessOrderPlaced';
/* layout */
import { OrderLayout, MainLayout } from '../Layouts';

import ReconcileInventoryList from '../../pages/ReconcileInventory/ReconcileInventoryList';

import Analytics from 'analytics-node';

/*
import dBaskets from '../../pages/Baskets/Baskets';

import dViewBasket from '../../pages/Baskets/ViewBasket';

import dEditBasket from '../../pages/Baskets/EditBasket';

import dNewBasket from '../../pages/Baskets/NewBasket';

import dCreateBasket from '../../pages/Baskets/CreateBasket'; */

/* Dynamic Components */
import {
  dProductsAdmin,
  dProductLists,
  dViewProductListDetails,
  dInvitations,
  dNewInvitation,
  dRecipesHome,
  dRecipes,
  dNewRecipe,
  dEditRecipe,
  dViewRecipe,
  dSuppliers,
  dNewSupplier,
  dViewSupplier,
  dEditSupplier,
  dListSpecials,
  dEditAllSpecials,
  dAllOrders,
  dVision,
  dHealthPrinciples,
  dHealthFAQ,
  dProfileUpdate,
  dZohoSyncUp,
  dBaskets,
  dCreateBasket,
  dViewBasket,
  dEditBasket,
  dNewBasket,
  dReportsHome,
  dReconcileInventory,
  dReconcileInventoryList,
  dApproveUserSignUps,
  dMessages,
  dEditMessage,
  dAdminAllMessages,

}
  from './dynamicRoutes';

import VerifyEmailAlert from '../../components/VerifyEmailAlert/';

import dMyWallet from '../../pages/Wallet/MyWallet';

import { CartProvider } from '../../stores/ShoppingCart';

import './App.scss';


const analytics = new Analytics(Meteor.settings.public.analyticsSettings.segmentIo.writeKey);

const App = props => (
  <Router>
    {!props.loading ? <div className="App">
      {/* props.authenticated && (<Alert bsStyle="danger" style={{ color: '#3a2d29', margin: '0px', padding: '10px 5px', borderBottom: '5px solid #FF6D00', borderLeftWidth: '0px', textAlign: 'center' }}>
        <small> Due to Mandate on Quarantine and rapidly changing situation, Suvai will have to suspend deliveries till <span style={{ color: '#EF0905' }}>31st March.</span>
        </small> <br />
        <small> Hope your are sufficiently stocked and are safe at home. </small>
        </Alert>) */}
      {/* props.authenticated && (
        <VerifyEmailAlert
          {...props}
        />
      ) */ }
      <CartProvider >
        <Switch>
          <Authenticated routeName="My Orders" layout={MainLayout} exact path="/" component={MyOrders} {...props} />
          <Authenticated routeName="My Orders" layout={MainLayout} exact path="/myorders" component={MyOrders} {...props} />
          {/*
          <Authenticated routeName="Documents" exact path="/documents" component={Documents} {...props} />
          <Authenticated routeName="New document" exact path="/documents/new" component={NewDocument} {...props} />
          <Authenticated routeName="View document" exact path="/documents/:_id" component={ViewDocument} {...props} />
          <Authenticated routeName="Edit document" exact path="/documents/:_id/edit" component={EditDocument} {...props} />
          <Authenticated routeName="Profile" exact path="/profile" component={Profile} {...props} />
          */}
          <Authenticated routeName="Profile" layout={MainLayout} exact path="/profile" component={Profile} {...props} />
          {/* Update Other User's Profile */}
          <AdminAuthenticated exact routeName="Update Profile" layout={MainLayout} path="/updateProfile" component={dProfileUpdate} {...props} />

          {/* Recipes */}
          <Authenticated exact routeName="Recipes Home" layout={MainLayout} path="/recipes" component={dRecipesHome} {...props} />
          <Authenticated exact routeName="View Recipes By Category" layout={MainLayout} path="/recipes/foodtype/:category" component={dRecipes} {...props} />
          <AdminAuthenticated exact routeName="New Recipe" layout={MainLayout} path="/recipes/new" component={dNewRecipe} {...props} />
          <AdminAuthenticated exact routeName="EditRecipe" layout={MainLayout} path="/recipes/:_id/edit" component={dEditRecipe} {...props} />
          <Authenticated routeName="View Recipe" layout={MainLayout} path="/recipes/:_id" component={dViewRecipe} {...props} />

          {/* Suppliers */}
          <Authenticated exact routeName="Suppliers" layout={MainLayout} path="/suppliers" component={dSuppliers} {...props} />
          <Authenticated exact routeName="New Supplier" layout={MainLayout} path="/suppliers/new" component={dNewSupplier} {...props} />
          <Authenticated exact routeName="View Supplier" layout={MainLayout} path="/suppliers/:_id" component={dViewSupplier} {...props} />
          <Authenticated exact routeName="Edit Supplier" layout={MainLayout} path="/suppliers/:_id/edit" component={dEditSupplier} {...props} />

          {/* Invitations */}
          <Authenticated exact routeName="My Invitations" layout={MainLayout} path="/invitations" component={dInvitations} {...props} />
          <Authenticated exact routeName="New Invitation" layout={MainLayout} path="/invitations/new" component={dNewInvitation} {...props} />
          <Public routeName="Accept Invitation" layout={MainLayout} path="/invitations/:token" component={Signup} {...props} />

          {/* Specials */}
          <Authenticated exact routeName="View Specials" layout={MainLayout} path="/specials" component={dListSpecials} {...props} />
          <AdminAuthenticated exact routeName="Edit Specials" layout={MainLayout} path="/specials/edit" component={dEditAllSpecials} {...props} />

          {/* Order */}
          <PlaceOrderAuthenticated exact routeName="Order Sucess" layout={MainLayout} path="/order/success/:orderId?" component={SuccessOrderPlaced} {...props} />
          <Authenticated exact routeName="Edit Order Details" layout={MainLayout} path="/order/:_id" component={EditOrderDetails} {...props} />
          <Authenticated exact routeName="Choose Basket Prefill" path="/neworder/selectbasket" layout={OrderLayout} component={SelectBasket} {...props} />
          <Authenticated exact routeName="Place Order" path="/neworder/:basketId?" layout={OrderLayout} component={PlaceOrder} {...props} />


          {/* Basket */}

          <Authenticated exact routeName="Baskets" layout={MainLayout} path="/baskets" component={dBaskets} {...props} />
          <Authenticated exact routeName="New Basket" layout={MainLayout} path="/baskets/new" component={dNewBasket} {...props} />
          <Authenticated exact routeName="View Basket" layout={MainLayout} path="/baskets/:_id" component={dViewBasket} {...props} />
          <Authenticated exact routeName="Edit Basket" layout={MainLayout} path="/baskets/:_id/edit" component={dEditBasket} {...props} />
          <Authenticated routeName="Create Basket From Order" path="/createBasket/:orderId" layout={MainLayout} component={dCreateBasket} {...props} />


          {/* CartHome */}
          <PlaceOrderAuthenticated routeName="Cart" path="/cart/:id?" layout={OrderLayout} component={Cart} {...props} />

          {/* Accept Payment */}
          <Authenticated exact routeName="My Wallet" layout={MainLayout} path="/mywallet" component={dMyWallet} {...props} />

          {/* Product */}
          <AdminAuthenticated exact routeName="View Products Admin" layout={MainLayout} path="/products" component={dProductsAdmin} {...props} />

          <Authenticated routeName="Messages" exact path="/messages" layout={MainLayout} component={dMessages} {...props} />
          <Authenticated routeName="Edit message" exact path="/messages/:_id/edit" layout={MainLayout} component={dEditMessage} {...props} />
          <AdminAuthenticated routeName="Messages Admin" exact path="/messagesAdmin" layout={MainLayout} component={dAdminAllMessages} {...props} />

          {/* Admin */
            /* ProductLists */}
          <AdminAuthenticated exact routeName="Edit Products Admin" layout={MainLayout} path="/productLists/:_id/edit" component={dProductsAdmin} {...props} />
          <AdminAuthenticated exact routeName="View Product List Details Admin" layout={MainLayout} path="/productLists/:_id" component={dViewProductListDetails} {...props} />
          <AdminAuthenticated exact routeName="View Product Lists Admin" layout={MainLayout} path="/productLists" component={dProductLists} {...props} />

          {/* Orders
          <Route routeName="View All Orders Admin" path="/allorders" component={AllOrders} onEnter={authenticate} /> */}

          <AdminAuthenticated exact routeName="View All Orders Admin" layout={MainLayout} path="/allorders" component={dAllOrders} {...props} />
          {/* Zoho Sync */}
          <AdminAuthenticated exact routeName="Zoho Sync" layout={MainLayout} path="/zohoSync" component={dZohoSyncUp} {...props} />
          {/* end admin */}
          <NotAuthenticated routeName="Signup" layout={MainLayout} path="/signup" component={Signup} {...props} />
          <NotAuthenticated routeName="Login" layout={MainLayout} path="/login" component={Login} {...props} />
          <NotAuthenticated routeName="Logout" layout={MainLayout} path="/logout" component={Logout} {...props} />
          <AdminAuthenticated exact routeName="Approve Sign Ups" layout={MainLayout} path="/approveSignUps" component={dApproveUserSignUps} {...props} />

          {/* <Public exact routeName="About" path="/" component={About} {...props} /> */}
          <Public exact routeName="About" layout={MainLayout} path="/about" component={About} {...props} />
          <Public routeName="Verify Email" layout={MainLayout} path="/verify-email/:token" component={VerifyEmail} />
          <Public routeName="Recover Password" layout={MainLayout} path="/recover-password" component={RecoverPassword} />
          <Public routeName="Reset Password" layout={MainLayout} path="/reset-password/:token" component={ResetPassword} />
          <Public routeName="Terms" layout={MainLayout} path="/pages/terms" component={Terms} {...props} />
          <Public routeName="Privacy" layout={MainLayout} path="/pages/privacy" component={Privacy} {...props} />
          <Public routeName="Refund" layout={MainLayout} path="/pages/refund" component={Refund} {...props} />
          <Public exact routeName="Vision" layout={MainLayout} path="/vision" component={dVision} {...props} />
          <Public exact routeName="Health Principles" layout={MainLayout} path="/healthprinciples" component={dHealthPrinciples} {...props} />
          <Public exact routeName="Health Principles FAQ" layout={MainLayout} path="/healthfaq" component={dHealthFAQ} {...props} />
          { /* Admin Reports */}
          <AdminAuthenticated exact routeName="Reports Home" layout={MainLayout} path="/reports" component={dReportsHome} {...props} />

          {/* Reconcile Products */}
          <AdminAuthenticated exact routeName="Reconcile Inventory List" layout={MainLayout} path="/reconcileInventoryList" component={ReconcileInventoryList} {...props} />
          <AdminAuthenticated exact routeName="Reconcile Inventory" layout={MainLayout} path="/reconcileInventory" component={dReconcileInventory} {...props} />

          {/* Page not found */}
          <Redirect from="*" to="/" />
        </Switch>
        <Footer />
      </CartProvider>
    </div > : ''}
  </Router >
);

App.propTypes = {
  loading: PropTypes.bool.isRequired,
};

const getUserName = name => ({
  string: name,
  object: `${name.first} ${name.last}`,
}[typeof name]);

export default withTracker(() => {
  const loggingIn = Meteor.loggingIn();
  const user = Meteor.user();
  const userId = Meteor.userId();
  const loading = !Roles.subscription.ready();
  const name = user && user.profile && user.profile.name && getUserName(user.profile.name);
  const emailAddress = user && user.emails && user.emails[0].address;
  const emailVerified = user && user.emails && user.emails[0].verified;
  const userSettings = user && user.settings && user.settings;

  return {
    loading,
    loggingIn,
    authenticated: !loggingIn && !!userId,
    name,
    emailAddress,
    emailVerified,
    date: new Date(),
    roles: !loading && Roles.getRolesForUser(userId),
    loggedInUserId: userId,
    loggedInUser: user,
    userSettings,
    analytics,
  };
})(App);
