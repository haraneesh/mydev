import PropTypes from 'prop-types';
import React from 'react';
import { Route, Routes, redirect } from 'react-router-dom';
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
import UnpaidInvoices from '../pages/Invoices/UnpaidInvoices';

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
  dViewInvoice,
  dViewProductListDetails,
  dVision,
  dZohoSyncUp,
  dUsers,
  dUserDetails,
  dReportsHome
} from './dynamicRoutes';

import { InvoiceViewWrapper } from '../components/Orders/Invoices/InvoiceViewWrapper';

import dApproveUserSignUps from '../pages/Miscellaneous/ApproveSignUps';

import RouteNames from './RouteNames';

import VerifyEmailAlert from '../components/VerifyEmailAlert';

import dMyWallet from '../pages/Wallet/MyWallet';

import { CartProvider } from '../stores/ShoppingCart';

import ReturnAlerts from '../components/Alerts/ReturnAlerts';
import ShowAlerts from '../components/Alerts/ShowAlerts';
import PwaInstallPopupIOS from '../components/PwaInstallPopupIOS';

const App = (props) => (
  <>
    {!props.loading ? (
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
            {/* <Authenticated routeName="My_Orders" layout={MainLayout} exact path="/" component={MyOrders} {...props} /> */}

            <Route
              path="/"
              element={
                <Public
                  routeName="Cart"
                  layout={OrderLayout}
                  component={Cart}
                  {...props}
                />
              }
            />

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
            <Route
              path="/unpaid-invoices"
              element={
                <Authenticated
                  routeName="Unpaid_Invoices"
                  layout={MainLayout}
                  component={UnpaidInvoices}
                  {...props}
                />
              }
            />
            {/*
          <Authenticated routeName="Documents" exact path="/documents" component={Documents} {...props} />
          <Authenticated routeName="New document" exact path="/documents/new" component={NewDocument} {...props} />
          <Authenticated routeName="View document" exact path="/documents/:_id" component={ViewDocument} {...props} />
          <Authenticated routeName="Edit document" exact path="/documents/:_id/edit" component={EditDocument} {...props} />
          <Authenticated routeName="Profile" exact path="/profile" component={Profile} {...props} />
          */}
            <Route
              path="/profile"
              element={
                <Authenticated
                  routeName="Profile"
                  layout={MainLayout}
                  component={Profile}
                  {...props}
                />
              }
            />

            {/* Invitations */}
            <Route
              path="/invitations"
              element={
                <Authenticated
                  routeName="My_Invitations"
                  layout={MainLayout}
                  component={dInvitations}
                  {...props}
                />
              }
            />

            <Route
              path="/invitations/new"
              element={
                <Authenticated
                  routeName="New_Invitation"
                  layout={MainLayout}
                  component={dNewInvitation}
                  {...props}
                />
              }
            />

            {/* Sign Up */}
            <Route
              path="/invitations/:token"
              element={
                <Public
                  routeName="Accept_Invitation"
                  layout={MainLayout}
                  component={SignUp}
                  {...props}
                />
              }
            />

            <Route
              path="/signup"
              element={
                <NotAuthenticated
                  routeName={RouteNames.SIGNUP}
                  layout={MainLayout}
                  component={SignUp}
                  {...props}
                />
              }
            />

            <Route
              path="/approvesignups"
              element={
                <AdminAuthenticated
                  routeName="Approve_Sign_Ups"
                  layout={MainLayout}
                  component={dApproveUserSignUps}
                  {...props}
                />
              }
            />

            {/* Self Sign Up
              <Public routeName="Accept_Invitation" layout={MainLayout} path="/invitations/:token" component={SelfSignUp} {...props} />
              <NotAuthenticated routeName={RouteNames.SIGNUP} layout={MainLayout} path="/signup" component={InviteSelf} {...props} />
              Self Sign Up */}

            {/* Signups */}
            <Route
              path="/login"
              element={
                <NotAuthenticated
                  routeName="Login"
                  layout={MainLayout}
                  component={Login}
                  {...props}
                />
              }
            />

            <Route
              path="/logout"
              element={
                <NotAuthenticated
                  routeName="Logout"
                  layout={MainLayout}
                  component={Logout}
                  {...props}
                />
              }
            />

            {/* Order */}
            <Route
              path="/invoices/:id"
              element={
                <Authenticated
                  routeName="View_Invoice"
                  layout={MainLayout}
                  component={InvoiceViewWrapper}
                  {...props}
                />
              }
            />
            <Route
              path="/order/success/:orderId?"
              element={
                <Public
                  routeName="Order_Success"
                  layout={MainLayout}
                  component={SuccessOrderPlaced}
                  {...props}
                />
              }
            />

            <Route
              path="/order/:_id"
              element={
                <Authenticated
                  routeName="Edit_Order_Details"
                  layout={OrderLayout}
                  component={EditOrderDetails}
                  {...props}
                />
              }
            />

            <Route
              path="/neworder/selectbasket"
              element={
                <Authenticated
                  routeName="Choose_Basket_Prefill"
                  layout={OrderLayout}
                  component={SelectBasket}
                  {...props}
                />
              }
            />

            <Route
              path="/neworder/product/:productName"
              element={
                <Public
                  routeName="Place_Order_Product_Details"
                  layout={OrderLayout}
                  component={PlaceOrder}
                  {...props}
                />
              }
            />

            <Route
              path="/neworder"
              element={
                <Public
                  routeName="Place_Order_Product"
                  layout={OrderLayout}
                  component={PlaceOrder}
                  {...props}
                />
              }
            />

            {/* Page not found */}
            <Route
              path="*"
              element={
                <Public
                  routeName="Place_Order_Product"
                  layout={OrderLayout}
                  component={PlaceOrder}
                  {...props}
                />
              }
            />

            {/* <Public
                exact
                routeName="Place_Order_Category"
                path="/neworder/category/:category"
                layout={OrderLayout}
                component={PlaceOrder}
                {...props}
              /> */}

            <Route
              path="/neworder/category/:category/subcategory/:subcategory"
              element={
                <Public
                  routeName="Place_Order_Category_subCategory"
                  layout={OrderLayout}
                  component={PlaceOrder}
                  {...props}
                />
              }
            />

            {/* Users */}
            <Route
              path="/allusers"
              element={
                <AdminAuthenticated
                  routeName="Users"
                  layout={MainLayout}
                  component={dUsers}
                  {...props}
                />
              }
            />

            <Route
              path="/allusers/:userMobilePhone"
              element={
                <AdminAuthenticated
                  routeName="User_Details"
                  layout={MainLayout}
                  component={dUserDetails}
                  {...props}
                />
              }
            />
            {/* Update Other User's Profile */}
            <Route
              path="/updateProfile"
              element={
                <AdminAuthenticated
                  routeName="Update_Profile"
                  layout={MainLayout}
                  component={dProfileUpdate}
                  {...props}
                />
              }
            />

            <Route
              path="/updateProfile/:userMobilePhone"
              element={
                <AdminAuthenticated
                  routeName="Update_Profile"
                  layout={MainLayout}
                  component={dProfileUpdate}
                  {...props}
                />
              }
            />

            {/* CartHome */}
            <Route
              path="/collectPay"
              element={
                <Public
                  routeName="CollectPayment"
                  layout={OrderLayout}
                  component={CollectOrderPaymentHome}
                  {...props}
                />
              }
            />

            <Route
              path="/cart/:id?"
              element={
                <Public
                  routeName="Cart"
                  layout={OrderLayout}
                  component={Cart}
                  {...props}
                />
              }
            />

            <Route
              path="/orderspecials"
              element={
                <Public
                  routeName="Order Specials"
                  layout={MainLayout}
                  component={OrderSpecials}
                  {...props}
                />
              }
            />

            {/* Messages */}

            <Route
              path="/messages"
              element={
                <Authenticated
                  routeName="Messages"
                  layout={MainLayout}
                  component={dMessagesHome}
                  {...props}
                />
              }
            />
            {/* Accept Payment */}
            <Route
              path="/mywallet"
              element={
                <Authenticated
                  routeName="My_Wallet"
                  layout={MainLayout}
                  component={dMyWallet}
                  {...props}
                />
              }
            />
            {/* Product */}

            <Route
              path="/products"
              element={
                <AdminAuthenticated
                  routeName="View_Products_Admin"
                  layout={MainLayout}
                  component={dProductsAdmin}
                  {...props}
                />
              }
            />

            {/* Admin */
            /* ProductLists */}
            <Route
              path="/productLists/:_id/edit"
              element={
                <AdminAuthenticated
                  routeName="Edit_Products_Admin"
                  layout={MainLayout}
                  component={dProductsAdmin}
                  {...props}
                />
              }
            />

            <Route
              path="/productLists/:_id"
              element={
                <AdminAuthenticated
                  routeName="View_Product_List_Details_Admin"
                  layout={MainLayout}
                  component={dViewProductListDetails}
                  {...props}
                />
              }
            />

            <Route
              path="/productLists"
              element={
                <AdminAuthenticated
                  routeName="View_Product_Lists_Admin"
                  layout={MainLayout}
                  component={dProductLists}
                  {...props}
                />
              }
            />

            {/* Orders
          <Route routeName="View All Orders Admin" path="/allorders" component={AllOrders} onEnter={authenticate} /> */}

            <Route
              path="/allorders"
              element={
                <AdminAuthenticated
                  routeName="View_All_Orders_Admin"
                  layout={MainLayout}
                  component={dAllOrders}
                  {...props}
                />
              }
            />
            {/* Zoho Sync */}
            <Route
              path="/zohoSync"
              element={
                <AdminAuthenticated
                  routeName="Zoho_Sync"
                  layout={MainLayout}
                  component={dZohoSyncUp}
                  {...props}
                />
              }
            />
            {/* end admin */}

            {/* <Public exact routeName="About" path="/" component={About} {...props} /> */}

            <Route
              path="/about"
              element={
                <Public
                  routeName="About"
                  layout={MainLayout}
                  component={About}
                  {...props}
                />
              }
            />

            <Route
              path="/verify-email/:token"
              element={
                <Public
                  routeName="Verify_Email"
                  layout={MainLayout}
                  component={VerifyEmail}
                />
              }
            />

            <Route
              path="/recover-password"
              element={
                <Public
                  routeName="Recover_Password"
                  layout={MainLayout}
                  component={RecoverPassword}
                />
              }
            />

            <Route
              path="/reset-password/:token"
              element={
                <Public
                  routeName="Reset_Password"
                  layout={MainLayout}
                  component={ResetPassword}
                />
              }
            />

            <Route
              path="/pages/terms"
              element={
                <Public
                  routeName="Terms"
                  layout={MainLayout}
                  component={Terms}
                  {...props}
                />
              }
            />

            <Route
              path="/pages/privacy"
              element={
                <Public
                  routeName="Privacy"
                  layout={MainLayout}
                  component={Privacy}
                  {...props}
                />
              }
            />

            <Route
              path="/pages/refund"
              element={
                <Public
                  routeName="Refund"
                  layout={MainLayout}
                  component={Refund}
                  {...props}
                />
              }
            />

            <Route
              path="/vision"
              element={
                <Public
                  routeName="Vision"
                  layout={MainLayout}
                  component={dVision}
                  {...props}
                />
              }
            />

            <Route
              path="/healthprinciples"
              element={
                <Public
                  routeName="Health_Principles"
                  layout={MainLayout}
                  component={dHealthPrinciples}
                  {...props}
                />
              }
            />

            <Route
              path="/healthfaq"
              element={
                <Public
                  routeName="Health_Principles_FAQ"
                  layout={MainLayout}
                  component={dHealthFAQ}
                  {...props}
                />
              }
            />
            {/* Ad */}
            <Route
              path="/interest/:adType"
              element={
                <Public
                  routeName={RouteNames.ADINTEREST}
                  layout={MainLayout}
                  component={ShowInterest}
                  {...props}
                />
              }
            />
            {/* Admin Reports */}
            <Route
              path="/reports"
              element={
                <AdminAuthenticated
                  routeName="Reports_Home"
                  layout={MainLayout}
                  component={dReportsHome}
                  {...props}
                />
              }
            />

            {/* Reconcile Products */}
            <Route
              path="/reconcileInventoryList"
              element={
                <AdminAuthenticated
                  routeName="Reconcile_Inventory_List"
                  layout={MainLayout}
                  component={ReconcileInventoryList}
                  {...props}
                />
              }
            />

            <Route
              element={
                <AdminAuthenticated
                  routeName="Reconcile_Inventory"
                  layout={MainLayout}
                  path="/reconcileInventory"
                  component={dReconcileInventory}
                  {...props}
                />
              }
            />
          </Routes>
          <Footer {...props} />
        </CartProvider>
      </div>
    ) : (
      ''
    )}
  </>
);

App.propTypes = {
  loading: PropTypes.bool.isRequired,
};

export default App;
