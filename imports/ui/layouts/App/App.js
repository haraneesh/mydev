import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router, Switch, Redirect } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { Roles } from 'meteor/alanning:roles';
import Authenticated from '../../components/Routes/Authenticated';
import AdminAuthenticated from '../../components/Routes/AdminAuthenticated';
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
import Privacy from '../../pages/Miscellaneous/Privacy/Privacy';
import Signup from '../../pages/Miscellaneous/Signup/Signup';
import Login from '../../pages/Miscellaneous/Login/Login';
import Logout from '../../pages/Miscellaneous/Logout/Logout';
import RecoverPassword from '../../pages/Miscellaneous/RecoverPassword/RecoverPassword';
import ResetPassword from '../../pages/Miscellaneous/ResetPassword/ResetPassword';
import Profile from '../../pages/Miscellaneous/Profile/Profile';
import About from '../../pages/Miscellaneous/About/About';

/* order */
import PlaceOrder from '../../pages/Orders/PlaceOrder/PlaceOrder';
import MyOrders from '../../pages/Orders/MyOrders/MyOrders';
import EditOrderDetails from '../../containers/Orders/EditOrder';

/* layout */
import { OrderLayout, MainLayout } from '../Layouts';


/* Dynamic Components */
import
{ dProductsAdmin,
dProductLists,
dViewProductListDetails,
dInvitations,
dNewInvitation,
dRecipes,
dNewRecipe,
dEditRecipe,
dViewRecipe,
dListSpecials,
dEditAllSpecials,
dAllOrders,
dVision,
dProfileUpdate,
dZohoSyncUp }
from './dynamicRoutes';

import './App.scss';

const App = props => (
  <Router>
    {!props.loading ? <div className="App">
        <Switch>
          <Authenticated exact routeName="My Orders" layout={MainLayout} path="/" component={MyOrders} {...props} />
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
          <Authenticated exact routeName="View All Recipes" layout={MainLayout} path="/recipes" component={dRecipes} {...props} />
          <AdminAuthenticated exact routeName="New Recipe" layout={MainLayout} path="/recipes/new" component={dNewRecipe} {...props} />
          <AdminAuthenticated exact routeName="EditRecipe" layout={MainLayout} path="/recipes/:_id/edit" component={dEditRecipe} {...props} />
          <Authenticated routeName="View Recipe" path="/recipes/:_id" component={dViewRecipe} {...props} />

          {/* Invitations */}
          <Authenticated exact routeName="My Invitations" layout={MainLayout} path="/invitations" component={dInvitations} {...props} />
          <Authenticated exact routeName="New Invitation" layout={MainLayout} path="/invitations/new" component={dNewInvitation} {...props} />
          <Public routeName="Accept Invitation" layout={MainLayout} path="/invitations/:token" component={Signup} {...props} />

          {/* Specials */}
          <Authenticated exact routeName="View Specials" layout={MainLayout} path="/specials" component={dListSpecials} {...props} />
          <AdminAuthenticated exact routeName="Edit Specials" layout={MainLayout} path="/specials/edit" component={dEditAllSpecials} {...props} />

          {/* Order */}
          <Authenticated exact routeName="Edit Order Details" layout={MainLayout} path="/order/:_id" component={EditOrderDetails} {...props} />
          <Authenticated routeName="Place Order" path="/order" layout={OrderLayout} component={PlaceOrder} {...props} />

          {/* Product */}
          <AdminAuthenticated exact routeName="View Products Admin" layout={MainLayout} path="/admin/products" component={dProductsAdmin} {...props} />

          {/* Admin */
         /* ProductLists */}
          <AdminAuthenticated exact routeName="Edit Products Admin" layout={MainLayout} path="/productLists/:_id/edit" component={dProductsAdmin} {...props} />
          <AdminAuthenticated exact routeName="View Product List Details Admin" layout={MainLayout} path="/productLists/:_id" component={dViewProductListDetails} {...props} />
          <AdminAuthenticated exact routeName="View Product Lists Admin" layout={MainLayout} path="/productLists" component={dProductLists} {...props} />

          {/* Orders
          <Route routeName="View All Orders Admin" path="/allorders" component={AllOrders} onEnter={authenticate} /> */}

          <AdminAuthenticated exact routeName="View All Orders Admin" layout={MainLayout} path="/allorders" component={dAllOrders} {...props} />
          {/* Zoho Sync */}
          <AdminAuthenticated exact routeName="Zoho Sync" layout={MainLayout} path="/admin/zohoSync" component={dZohoSyncUp} {...props} />
          {/* end admin */}
          <NotAuthenticated routeName="Signup" layout={MainLayout} path="/signup" component={Signup} {...props} />
          <NotAuthenticated routeName="Login" layout={MainLayout} path="/login" component={Login} {...props} />
          <NotAuthenticated routeName="Logout" layout={MainLayout} path="/logout" component={Logout} {...props} />
          {/* <Public exact routeName="About" path="/" component={About} {...props} /> */}
          <Public exact routeName="About" layout={MainLayout} path="/about" component={About} {...props} />
          <Public routeName="Recover Password" layout={MainLayout} path="/recover-password" component={RecoverPassword} />
          <Public routeName="Reset Password" layout={MainLayout} path="/reset-password/:token" component={ResetPassword} />
          <Public routeName="Terms" layout={MainLayout} path="/pages/terms" component={Terms} />
          <Public routeName="Privacy" layout={MainLayout} path="/pages/privacy" component={Privacy} />
          <Public exact routeName="Vision" layout={MainLayout} path="/vision" component={dVision} {...props} />
          {/* Page not found */}
          <Redirect from="*" to="/" />
        </Switch>
      <Footer />
    </div> : ''}
  </Router>
);

App.propTypes = {
  loading: PropTypes.bool.isRequired,
};

const getUserName = name => ({
  string: name,
  object: `${name.first} ${name.last}`,
}[typeof name]);

export default createContainer(() => {
  const loggingIn = Meteor.loggingIn();
  const user = Meteor.user();
  const userId = Meteor.userId();
  const loading = !Roles.subscription.ready();
  const name = user && user.profile && user.profile.name && getUserName(user.profile.name);
  const emailAddress = user && user.emails && user.emails[0].address;

  return {
    loading,
    loggingIn,
    authenticated: !loggingIn && !!userId,
    name: name || emailAddress,
    roles: !loading && Roles.getRolesForUser(userId),
    loggedInUserId: userId,
  };
}, App);