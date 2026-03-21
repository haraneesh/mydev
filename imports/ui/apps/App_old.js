import PropTypes from 'prop-types';
import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import AdminAuthenticated from '../components/Routes/AdminAuthenticated';
import Authenticated from '../components/Routes/Authenticated';
import NotAuthenticated from '../components/Routes/NotAuthenticated';
import PlaceOrderAuthenticated from '../components/Routes/PlaceOrderAuthenticated';
import Public from '../components/Routes/Public';
/*
import Documents from '../pages/Documents/DocumentHome/Documents';
import NewDocument from '../pages/Documents/NewDocument/NewDocument';
import ViewDocument from '../pages/Documents/ViewDocument/ViewDocument';
import EditDocument from '../pages/Documents/EditDocument/EditDocument';
import Index from '../pages/Miscellaneous/Index/Index';
*/

import Footer from '../components/Footer/Footer';
import InviteSelf from '../pages/Invitations/InviteSelf';
import About from '../pages/Miscellaneous/About/About';
import Login from '../pages/Miscellaneous/Login/Login';
import Logout from '../pages/Miscellaneous/Logout/Logout';
import Privacy from '../pages/Miscellaneous/Privacy/Privacy';
import Profile from '../pages/Miscellaneous/Profile/Profile';
import RecoverPassword from '../pages/Miscellaneous/RecoverPassword/RecoverPassword';
import Refund from '../pages/Miscellaneous/Refund/Refund';
import ResetPassword from '../pages/Miscellaneous/ResetPassword/ResetPassword';
import ShowInterest from '../pages/Miscellaneous/ShowInterest/ShowInterest';
// import SelfSignUp from '../pages/Miscellaneous/SignUp/SelfSignUp'; -- self sign up
import SignUp from '../pages/Miscellaneous/SignUp/SignUp';
import Terms from '../pages/Miscellaneous/Terms/Terms';
import VerifyEmail from '../pages/Miscellaneous/VerifyEmail';

import CollectOrderPaymentHome from '../pages/Cart/CollectOrderPaymentHome';
import OrderSpecials from '../pages/Orders/OrderSpecials/OrderSpecials';
/* order */
// import PlaceOrder from '../pages/Orders/PlaceOrder/PlaceOrder';
import PlaceOrder from '../pages/Orders/PlaceNewOrder/PlaceNewOrder';
import SelectBasket from '../pages/Orders/PlaceNewOrder/SelectBasket';

// import EditOrderDetails from '../containers/Orders/EditOrder';
import EditOrderDetails from '../pages/Orders/EditOrderDetails/EditOrderDetails';
import MyOrders from '../pages/Orders/MyOrders/MyOrders';

/* layout */
import { MainLayout, OrderLayout, RecipeLayout } from '../layouts/Layouts';
import Cart from '../pages/Cart/CartHome';
import SuccessOrderPlaced from '../pages/Cart/SuccessOrderPlaced';

import ReconcileInventoryList from '../pages/ReconcileInventory/ReconcileInventoryList';

/* Dynamic Components */
import {
  dAllOrders,
  dHealthFAQ,
  dHealthPrinciples,
  dInvitations,
  dMessagesHome,
  dNewInvitation,
  dProductLists,
  dProductsAdmin,
  dProfileUpdate,
  dReconcileInventory,
  dReconcileInventoryList,
  // razorPayChargesInPaisedZohoSyncUp,
  dReportsHome,
  dUserDetails,
  dUsers,
  dViewProductListDetails,
  dVision,
  dZohoSyncUp,
} from './dynamicRoutes';

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
          {props.authenticated && <ShowAlerts />}
          {props.authenticated && <ReturnAlerts />}
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
      ) */}
          <CartProvider>
            <Routes>
              <Route element={<MainLayout />}>
                {/* <Authenticated routeName="My_Orders" layout={MainLayout}  path="/" component={MyOrders} {...props} /> */}
                <Route
                  path="/myorders"
                  element={
                    <Authenticated
                      routeName="My_Orders"
                      layout={MainLayout}
                      component={MyOrders}
                      {...props}
                    />
                  }
                />
                {/*
          <Authenticated routeName="Documents"  path="/documents" component={Documents} {...props} />
          <Authenticated routeName="New document"  path="/documents/new" component={NewDocument} {...props} />
          <Authenticated routeName="View document"  path="/documents/:_id" component={ViewDocument} {...props} />
          <Authenticated routeName="Edit document"  path="/documents/:_id/edit" component={EditDocument} {...props} />
          <Authenticated routeName="Profile"  path="/profile" component={Profile} {...props} />
          */}
                <Authenticated
                  routeName="Profile"
                  layout={MainLayout}
                  path="/profile"
                  component={Profile}
                  {...props}
                />

                {/* Invitations */}
                <Authenticated
                  routeName="My_Invitations"
                  layout={MainLayout}
                  path="/invitations"
                  component={dInvitations}
                  {...props}
                />
                <Authenticated
                  routeName="New_Invitation"
                  layout={MainLayout}
                  path="/invitations/new"
                  component={dNewInvitation}
                  {...props}
                />

                {/* Sign Up */}
                <Public
                  routeName="Accept_Invitation"
                  layout={MainLayout}
                  path="/invitations/:token"
                  component={SignUp}
                  {...props}
                />
                <NotAuthenticated
                  routeName={RouteNames.SIGNUP}
                  layout={MainLayout}
                  path="/signup"
                  component={SignUp}
                  {...props}
                />
                <AdminAuthenticated
                  routeName="Approve_Sign_Ups"
                  layout={MainLayout}
                  path="/approvesignups"
                  component={dApproveUserSignUps}
                  {...props}
                />

                {/* Self Sign Up
              <Public routeName="Accept_Invitation" layout={MainLayout} path="/invitations/:token" component={SelfSignUp} {...props} />
              <NotAuthenticated routeName={RouteNames.SIGNUP} layout={MainLayout} path="/signup" component={InviteSelf} {...props} />
              Self Sign Up */}

                {/* Signups */}
                <NotAuthenticated
                  routeName="Login"
                  layout={MainLayout}
                  path="/login"
                  component={Login}
                  {...props}
                />
                <NotAuthenticated
                  routeName="Logout"
                  layout={MainLayout}
                  path="/logout"
                  component={Logout}
                  {...props}
                />

                <PlaceOrderAuthenticated
                  routeName="Order_Success"
                  layout={MainLayout}
                  path="/order/success/:orderId?"
                  component={SuccessOrderPlaced}
                  {...props}
                />

                {/* Users */}
                <AdminAuthenticated
                  routeName="Users"
                  layout={MainLayout}
                  path="/allusers"
                  component={dUsers}
                  {...props}
                />
                <AdminAuthenticated
                  routeName="User_Details"
                  layout={MainLayout}
                  path="/allusers/:userMobilePhone"
                  component={dUserDetails}
                  {...props}
                />
                {/* Update Other User's Profile */}
                <AdminAuthenticated
                  routeName="Update_Profile"
                  layout={MainLayout}
                  path="/updateProfile"
                  component={dProfileUpdate}
                  {...props}
                />
                <AdminAuthenticated
                  routeName="Update_Profile"
                  layout={MainLayout}
                  path="/updateProfile/:userMobilePhone"
                  component={dProfileUpdate}
                  {...props}
                />

                <Public
                  routeName="Order Specials"
                  path="/orderspecials"
                  layout={MainLayout}
                  component={OrderSpecials}
                  {...props}
                />

                {/* Messages */}

                <Authenticated
                  routeName="Messages"
                  layout={MainLayout}
                  path="/messages"
                  component={dMessagesHome}
                  {...props}
                />
                {/* Accept Payment */}
                <Authenticated
                  routeName="My_Wallet"
                  layout={MainLayout}
                  path="/mywallet"
                  component={dMyWallet}
                  {...props}
                />
                {/* Product */}
                <AdminAuthenticated
                  routeName="View_Products_Admin"
                  layout={MainLayout}
                  path="/products"
                  component={dProductsAdmin}
                  {...props}
                />

                {/* Admin */
                /* ProductLists */}
                <AdminAuthenticated
                  routeName="Edit_Products_Admin"
                  layout={MainLayout}
                  path="/productLists/:_id/edit"
                  component={dProductsAdmin}
                  {...props}
                />
                <AdminAuthenticated
                  routeName="View_Product_List_Details_Admin"
                  layout={MainLayout}
                  path="/productLists/:_id"
                  component={dViewProductListDetails}
                  {...props}
                />
                <AdminAuthenticated
                  routeName="View_Product_Lists_Admin"
                  layout={MainLayout}
                  path="/productLists"
                  component={dProductLists}
                  {...props}
                />

                {/* Orders
          <Route routeName="View All Orders Admin" path="/allorders" component={AllOrders} onEnter={authenticate} /> */}

                <AdminAuthenticated
                  routeName="View_All_Orders_Admin"
                  layout={MainLayout}
                  path="/allorders"
                  component={dAllOrders}
                  {...props}
                />
                {/* Zoho Sync */}
                <AdminAuthenticated
                  routeName="Zoho_Sync"
                  layout={MainLayout}
                  path="/zohoSync"
                  component={dZohoSyncUp}
                  {...props}
                />
                {/* end admin */}

                {/* <Public  routeName="About" path="/" component={About} {...props} /> */}
                <Public
                  routeName="About"
                  layout={MainLayout}
                  path="/about"
                  component={About}
                  {...props}
                />
                <Public
                  routeName="Verify_Email"
                  layout={MainLayout}
                  path="/verify-email/:token"
                  component={VerifyEmail}
                />
                <Public
                  routeName="Recover_Password"
                  layout={MainLayout}
                  path="/recover-password"
                  component={RecoverPassword}
                />
                <Public
                  routeName="Reset_Password"
                  layout={MainLayout}
                  path="/reset-password/:token"
                  component={ResetPassword}
                />
                <Public
                  routeName="Terms"
                  layout={MainLayout}
                  path="/pages/terms"
                  component={Terms}
                  {...props}
                />
                <Public
                  routeName="Privacy"
                  layout={MainLayout}
                  path="/pages/privacy"
                  component={Privacy}
                  {...props}
                />
                <Public
                  routeName="Refund"
                  layout={MainLayout}
                  path="/pages/refund"
                  component={Refund}
                  {...props}
                />
                <Public
                  routeName="Vision"
                  layout={MainLayout}
                  path="/vision"
                  component={dVision}
                  {...props}
                />
                <Public
                  routeName="Health_Principles"
                  layout={MainLayout}
                  path="/healthprinciples"
                  component={dHealthPrinciples}
                  {...props}
                />
                <Public
                  routeName="Health_Principles_FAQ"
                  layout={MainLayout}
                  path="/healthfaq"
                  component={dHealthFAQ}
                  {...props}
                />
                {/* Ad */}
                <Public
                  routeName={RouteNames.ADINTEREST}
                  layout={MainLayout}
                  path="/interest/:adType"
                  component={ShowInterest}
                  {...props}
                />
                {/* Admin Reports */}
                <AdminAuthenticated
                  routeName="Reports_Home"
                  layout={MainLayout}
                  path="/reports"
                  component={dReportsHome}
                  {...props}
                />

                {/* Reconcile Products */}
                <AdminAuthenticated
                  routeName="Reconcile_Inventory_List"
                  layout={MainLayout}
                  path="/reconcileInventoryList"
                  component={ReconcileInventoryList}
                  {...props}
                />
                <AdminAuthenticated
                  routeName="Reconcile_Inventory"
                  layout={MainLayout}
                  path="/reconcileInventory"
                  component={dReconcileInventory}
                  {...props}
                />
              </Route>
              <Route element={<OrderLayout />}>
                {/* Order */}
                <Public
                  routeName="Cart"
                  path="/"
                  layout={OrderLayout}
                  component={Cart}
                  {...props}
                />

                <Authenticated
                  routeName="Edit_Order_Details"
                  layout={OrderLayout}
                  path="/order/:_id"
                  component={EditOrderDetails}
                  {...props}
                />
                <Authenticated
                  routeName="Choose_Basket_Prefill"
                  path="/neworder/selectbasket"
                  layout={OrderLayout}
                  component={SelectBasket}
                  {...props}
                />
                <Public
                  routeName="Place_Order_Product_Details"
                  path="/neworder/product/:productName"
                  layout={OrderLayout}
                  component={PlaceOrder}
                  {...props}
                />
                {/* <Public
                
                routeName="Place_Order_Category"
                path="/neworder/category/:category"
                layout={OrderLayout}
                component={PlaceOrder}
                {...props}
              /> */}
                <Public
                  routeName="Place_Order_Category_subCategory"
                  path="/neworder/category/:category/subcategory/:subcategory"
                  layout={OrderLayout}
                  component={PlaceOrder}
                  {...props}
                />
                <Public
                  routeName="Place_Order"
                  path="/neworder/:basketId?"
                  layout={OrderLayout}
                  component={PlaceOrder}
                  {...props}
                />
                {/* CartHome */}
                <Public
                  routeName="CollectPayment"
                  path="/collectPay"
                  layout={OrderLayout}
                  component={CollectOrderPaymentHome}
                  {...props}
                />
                <Public
                  routeName="Cart"
                  path="/cart/:id?"
                  layout={OrderLayout}
                  component={Cart}
                  {...props}
                />
              </Route>
            </Routes>

            <Footer {...props} />
          </CartProvider>
        </div>
      </Suspense>
    ) : (
      ''
    )}
  </>
);

App.propTypes = {
  loading: PropTypes.bool.isRequired,
};

export default App;
