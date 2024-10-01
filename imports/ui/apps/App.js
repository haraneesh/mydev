import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import { Switch, Redirect } from 'react-router-dom';
import Authenticated from '../components/Routes/Authenticated';
import AdminAuthenticated from '../components/Routes/AdminAuthenticated';
import PlaceOrderAuthenticated from '../components/Routes/PlaceOrderAuthenticated';
import NotAuthenticated from '../components/Routes/NotAuthenticated';
import Public from '../components/Routes/Public';
/*
import Documents from '../pages/Documents/DocumentHome/Documents';
import NewDocument from '../pages/Documents/NewDocument/NewDocument';
import ViewDocument from '../pages/Documents/ViewDocument/ViewDocument';
import EditDocument from '../pages/Documents/EditDocument/EditDocument';
import Index from '../pages/Miscellaneous/Index/Index';
*/

import Footer from '../components/Footer/Footer';
import Terms from '../pages/Miscellaneous/Terms/Terms';
import Refund from '../pages/Miscellaneous/Refund/Refund';
import Privacy from '../pages/Miscellaneous/Privacy/Privacy';
// import SelfSignUp from '../pages/Miscellaneous/SignUp/SelfSignUp'; -- self sign up
import SignUp from '../pages/Miscellaneous/Signup/SignUp';
import InviteSelf from '../pages/Invitations/InviteSelf';
import ShowInterest from '../pages/Miscellaneous/ShowInterest/ShowInterest';
import Login from '../pages/Miscellaneous/Login/Login';
import Logout from '../pages/Miscellaneous/Logout/Logout';
import VerifyEmail from '../pages/Miscellaneous/VerifyEmail';
import RecoverPassword from '../pages/Miscellaneous/RecoverPassword/RecoverPassword';
import ResetPassword from '../pages/Miscellaneous/ResetPassword/ResetPassword';
import Profile from '../pages/Miscellaneous/Profile/Profile';
import About from '../pages/Miscellaneous/About/About';

/* order */
// import PlaceOrder from '../pages/Orders/PlaceOrder/PlaceOrder';
import PlaceOrder from '../pages/Orders/PlaceNewOrder/PlaceNewOrder';
import CollectOrderPaymentHome from '../pages/Cart/CollectOrderPaymentHome';
import OrderSpecials from '../pages/Orders/OrderSpecials/OrderSpecials';
import SelectBasket from '../pages/Orders/PlaceNewOrder/SelectBasket';

import MyOrders from '../pages/Orders/MyOrders/MyOrders';
// import EditOrderDetails from '../containers/Orders/EditOrder';
import EditOrderDetails from '../pages/Orders/EditOrderDetails/EditOrderDetails';

import Cart from '../pages/Cart/CartHome';
import SuccessOrderPlaced from '../pages/Cart/SuccessOrderPlaced';
/* layout */
import {
  OrderLayout, RecipeLayout, MainLayout,
} from '../layouts/Layouts';

import ReconcileInventoryList from '../pages/ReconcileInventory/ReconcileInventoryList';

import RecipesHome from '../pages/Recipes/RecipesHome';
import MessagesHome from '../pages/Messages/MessageHome/Messages';

/*
import dBaskets from '../pages/Baskets/Baskets';

import dViewBasket from '../pages/Baskets/ViewBasket';

import dEditBasket from '../pages/Baskets/EditBasket';

import dNewBasket from '../pages/Baskets/NewBasket';

import dCreateBasket from '../pages/Baskets/CreateBasket';

import dProfileUpdate from '../pages/Users/ProfileUpdate'; */

/* Dynamic Components */
import {
  dProductsAdmin,
  dProductLists,
  dViewProductListDetails,
  dInvitations,
  dNewInvitation,
  dRecipes,
  dNewRecipe,
  dEditRecipe,
  dViewRecipe,
  dRecipesByCategory,
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
  // razorPayChargesInPaisedZohoSyncUp,
  dBaskets,
  dCreateBasket,
  dViewBasket,
  dEditBasket,
  dNewBasket,
  dReportsHome,
  dReconcileInventory,
  dReconcileInventoryList,
  // dApproveUserSignUps,
  // dMessages,
  dEditMessage,
  dAdminAllMessages,
  dZohoSyncUp,
  dUsers,
  dUserDetails,
}
  from './dynamicRoutes';

import dApproveUserSignUps from '../pages/Miscellaneous/ApproveSignUps';

import RouteNames from './RouteNames';

import VerifyEmailAlert from '../components/VerifyEmailAlert';

import dMyWallet from '../pages/Wallet/MyWallet';

import { CartProvider } from '../stores/ShoppingCart';

import Loading from '../components/Loading/Loading';

import ReturnAlerts from '../components/Alerts/ReturnAlerts';
import ShowAlerts from '../components/Alerts/ShowAlerts';
import PwaInstallPopupIOS from '../components/PwaInstallPopupIOS';

const App = (props) => (
  <>
    {!props.loading ? (
      <Suspense fallback={<Loading />}>
        <div className="App">
          { props.authenticated && (<ShowAlerts />) }
          { props.authenticated && (<ReturnAlerts />) }
          {props.authenticated && (
            <PwaInstallPopupIOS
              delay={3}
              lang="en"
              appIcon="apple-touch-icon-precomposed.png"
            />
          )}
          {/* props.authenticated && (
        <VerifyEmailAlert
          {...props}
        />
      ) */ }
          <CartProvider>
            <Switch>
              {/* <Authenticated routeName="My_Orders" layout={MainLayout} exact path="/" component={MyOrders} {...props} /> */}
              <Public exact routeName="Cart" path="/" layout={OrderLayout} component={Cart} {...props} />
              <Authenticated routeName="My_Orders" layout={MainLayout} exact path="/myorders" component={MyOrders} {...props} />
              {/*
          <Authenticated routeName="Documents" exact path="/documents" component={Documents} {...props} />
          <Authenticated routeName="New document" exact path="/documents/new" component={NewDocument} {...props} />
          <Authenticated routeName="View document" exact path="/documents/:_id" component={ViewDocument} {...props} />
          <Authenticated routeName="Edit document" exact path="/documents/:_id/edit" component={EditDocument} {...props} />
          <Authenticated routeName="Profile" exact path="/profile" component={Profile} {...props} />
          */}
              <Authenticated routeName="Profile" layout={MainLayout} exact path="/profile" component={Profile} {...props} />

              {/* Recipes */}
              <Authenticated exact routeName="Recipes_Home" layout={RecipeLayout} path="/recipes" component={RecipesHome} {...props} />
              <Authenticated exact routeName="View_Recipes_by_Category" layout={RecipeLayout} path="/recipes/bycategory/:category" component={dRecipesByCategory} {...props} />
              <Authenticated exact routeName="View_Recipes_by_Tag" layout={RecipeLayout} path="/recipes/bytag/:tag" component={dRecipesByCategory} {...props} />
              <AdminAuthenticated exact routeName="New_Recipe" layout={RecipeLayout} path="/recipes/new" component={dNewRecipe} {...props} />
              <AdminAuthenticated exact routeName="Edit_Recipe" layout={RecipeLayout} path="/recipes/:_id/edit" component={dEditRecipe} {...props} />
              <Authenticated routeName="View_Recipe" layout={RecipeLayout} path="/recipes/:_id" component={dViewRecipe} {...props} />

              {/* Suppliers */}
              <Authenticated exact routeName="Suppliers" layout={MainLayout} path="/suppliers" component={dSuppliers} {...props} />
              <Authenticated exact routeName="New_Supplier" layout={MainLayout} path="/suppliers/new" component={dNewSupplier} {...props} />
              <Authenticated exact routeName="View_Supplier" layout={MainLayout} path="/suppliers/:_id" component={dViewSupplier} {...props} />
              <Authenticated exact routeName="Edit_Supplier" layout={MainLayout} path="/suppliers/:_id/edit" component={dEditSupplier} {...props} />

              {/* Invitations */}
              <Authenticated exact routeName="My_Invitations" layout={MainLayout} path="/invitations" component={dInvitations} {...props} />
              <Authenticated exact routeName="New_Invitation" layout={MainLayout} path="/invitations/new" component={dNewInvitation} {...props} />

              {/* Sign Up */}
              <Public routeName="Accept_Invitation" layout={MainLayout} path="/invitations/:token" component={SignUp} {...props} />
              <NotAuthenticated routeName={RouteNames.SIGNUP} layout={MainLayout} path="/signup" component={SignUp} {...props} />
              <AdminAuthenticated exact routeName="Approve_Sign_Ups" layout={MainLayout} path="/approvesignups" component={dApproveUserSignUps} {...props} />

              {/* Self Sign Up
              <Public routeName="Accept_Invitation" layout={MainLayout} path="/invitations/:token" component={SelfSignUp} {...props} />
              <NotAuthenticated routeName={RouteNames.SIGNUP} layout={MainLayout} path="/signup" component={InviteSelf} {...props} />
              Self Sign Up */}

              {/* Signups */}
              <NotAuthenticated routeName="Login" layout={MainLayout} path="/login" component={Login} {...props} />
              <NotAuthenticated routeName="Logout" layout={MainLayout} path="/logout" component={Logout} {...props} />

              {/* Specials */}
              <Authenticated exact routeName="View_Specials" layout={MainLayout} path="/specials" component={dListSpecials} {...props} />
              <AdminAuthenticated exact routeName="Edit_Specials" layout={MainLayout} path="/specials/edit" component={dEditAllSpecials} {...props} />

              {/* Order */}
              <PlaceOrderAuthenticated exact routeName="Order_Success" layout={MainLayout} path="/order/success/:orderId?" component={SuccessOrderPlaced} {...props} />
              <Authenticated exact routeName="Edit_Order_Details" layout={OrderLayout} path="/order/:_id" component={EditOrderDetails} {...props} />
              <Authenticated exact routeName="Choose_Basket_Prefill" path="/neworder/selectbasket" layout={OrderLayout} component={SelectBasket} {...props} />
              <Public exact routeName="Place_Order_Category" path="/neworder/category/:category" layout={OrderLayout} component={PlaceOrder} {...props} />
              <Public exact routeName="Place_Order_Category_subCategory" path="/neworder/category/:category/subcategory/:subcategory" layout={OrderLayout} component={PlaceOrder} {...props} />
              <Public exact routeName="Place_Order" path="/neworder/:basketId?" layout={OrderLayout} component={PlaceOrder} {...props} />

              {/* Users */}
              <AdminAuthenticated exact routeName="Users" layout={MainLayout} path="/allusers" component={dUsers} {...props} />
              <AdminAuthenticated exact routeName="User_Details" layout={MainLayout} path="/allusers/:userMobilePhone" component={dUserDetails} {...props} />
              {/* Update Other User's Profile */}
              <AdminAuthenticated exact routeName="Update_Profile" layout={MainLayout} path="/updateProfile" component={dProfileUpdate} {...props} />
              <AdminAuthenticated exact routeName="Update_Profile" layout={MainLayout} path="/updateProfile/:userMobilePhone" component={dProfileUpdate} {...props} />

              {/* Basket */}
              <Authenticated exact routeName="Baskets" layout={MainLayout} path="/baskets" component={dBaskets} {...props} />
              <Authenticated exact routeName="New_Basket" layout={MainLayout} path="/baskets/new" component={dNewBasket} {...props} />
              <Authenticated exact routeName="View_Basket" layout={MainLayout} path="/baskets/:_id" component={dViewBasket} {...props} />
              <Authenticated exact routeName="Edit_Basket" layout={MainLayout} path="/baskets/:_id/edit" component={dEditBasket} {...props} />
              <Authenticated routeName="Create_Basket_From_Order" path="/createBasket/:orderId" layout={MainLayout} component={dCreateBasket} {...props} />

              {/* CartHome */}
              <Public routeName="CollectPayment" path="/collectPay" layout={OrderLayout} component={CollectOrderPaymentHome} {...props} />
              <Public routeName="Cart" path="/cart/:id?" layout={OrderLayout} component={Cart} {...props} />
              <Public routeName="Order Specials" path="/orderspecials" layout={MainLayout} component={OrderSpecials} {...props} />

              {/* Accept Payment */}
              <Authenticated exact routeName="My_Wallet" layout={MainLayout} path="/mywallet" component={dMyWallet} {...props} />
              {/* Product */}
              <AdminAuthenticated exact routeName="View_Products_Admin" layout={MainLayout} path="/products" component={dProductsAdmin} {...props} />

              <Authenticated appName="messages" routeName="Messages" exact path="/messages" layout={MainLayout} component={MessagesHome} {...props} />
              <Authenticated appName="messages" routeName="Edit_Message" exact path="/messages/:_id/edit" layout={MainLayout} component={dEditMessage} {...props} />
              <AdminAuthenticated appName="messages" routeName="Messages_Admin" exact path="/messagesAdmin" layout={MainLayout} component={dAdminAllMessages} {...props} />

              {/* Admin */
            /* ProductLists */}
              <AdminAuthenticated exact routeName="Edit_Products_Admin" layout={MainLayout} path="/productLists/:_id/edit" component={dProductsAdmin} {...props} />
              <AdminAuthenticated exact routeName="View_Product_List_Details_Admin" layout={MainLayout} path="/productLists/:_id" component={dViewProductListDetails} {...props} />
              <AdminAuthenticated exact routeName="View_Product_Lists_Admin" layout={MainLayout} path="/productLists" component={dProductLists} {...props} />

              {/* Orders
          <Route routeName="View All Orders Admin" path="/allorders" component={AllOrders} onEnter={authenticate} /> */}

              <AdminAuthenticated exact routeName="View_All_Orders_Admin" layout={MainLayout} path="/allorders" component={dAllOrders} {...props} />
              {/* Zoho Sync */}
              <AdminAuthenticated exact routeName="Zoho_Sync" layout={MainLayout} path="/zohoSync" component={dZohoSyncUp} {...props} />
              {/* end admin */}

              {/* <Public exact routeName="About" path="/" component={About} {...props} /> */}
              <Public exact routeName="About" layout={MainLayout} path="/about" component={About} {...props} />
              <Public routeName="Verify_Email" layout={MainLayout} path="/verify-email/:token" component={VerifyEmail} />
              <Public routeName="Recover_Password" layout={MainLayout} path="/recover-password" component={RecoverPassword} />
              <Public routeName="Reset_Password" layout={MainLayout} path="/reset-password/:token" component={ResetPassword} />
              <Public routeName="Terms" layout={MainLayout} path="/pages/terms" component={Terms} {...props} />
              <Public routeName="Privacy" layout={MainLayout} path="/pages/privacy" component={Privacy} {...props} />
              <Public routeName="Refund" layout={MainLayout} path="/pages/refund" component={Refund} {...props} />
              <Public exact routeName="Vision" layout={MainLayout} path="/vision" component={dVision} {...props} />
              <Public exact routeName="Health_Principles" layout={MainLayout} path="/healthprinciples" component={dHealthPrinciples} {...props} />
              <Public exact routeName="Health_Principles_FAQ" layout={MainLayout} path="/healthfaq" component={dHealthFAQ} {...props} />
              { /* Ad */ }
              <Public exact routeName={RouteNames.ADINTEREST} layout={MainLayout} path="/interest/:adType" component={ShowInterest} {...props} />
              { /* Admin Reports */}
              <AdminAuthenticated exact routeName="Reports_Home" layout={MainLayout} path="/reports" component={dReportsHome} {...props} />

              {/* Reconcile Products */}
              <AdminAuthenticated exact routeName="Reconcile_Inventory_List" layout={MainLayout} path="/reconcileInventoryList" component={ReconcileInventoryList} {...props} />
              <AdminAuthenticated exact routeName="Reconcile_Inventory" layout={MainLayout} path="/reconcileInventory" component={dReconcileInventory} {...props} />

              {/* Page not found */}
              <Redirect from="*" to="/" />
            </Switch>
            <Footer {...props} />
          </CartProvider>
        </div>
      </Suspense>
    ) : ''}
  </>
);

App.propTypes = {
  loading: PropTypes.bool.isRequired,
};

export default App;
