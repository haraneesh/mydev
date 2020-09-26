import React, { Suspense, lazy } from 'react';
import PropTypes from 'prop-types';
import { Switch, Redirect } from 'react-router-dom';

import SupplierAuthenticated from '../components/Routes/SupplierAuthenticated';
import Public from '../components/Routes/Public';

import { SupplierLayout } from '../layouts/Layouts';

import Footer from '../components/Footer/Footer';
import Terms from '../pages/Miscellaneous/Terms/Terms';
import Refund from '../pages/Miscellaneous/Refund/Refund';
import Privacy from '../pages/Miscellaneous/Privacy/Privacy';
import Profile from '../pages/Miscellaneous/Profile/Profile';
import About from '../pages/Miscellaneous/About/About';

/* Dynamic Components */

import Loading from '../components/Loading/Loading';

/* Suppliers */
const dSupplierOrders = lazy(() => import('../pages/Suppliers/SupplierOrders'));
const dSupplierOrderDetails = lazy(() => import('../pages/Suppliers/SupplierOrderDetails'));
// const dNewSupplier = lazy(() => import('../pages/Admin/Suppliers/NewSupplier/NewSupplier'));
// const dViewSupplier = lazy(() => import('../pages/Admin/Suppliers/ViewSupplier/ViewSupplier'));
// const dEditSupplier = lazy(() => import('../pages/Admin/Suppliers/EditSupplier/EditSupplier'));

const SupplierApp = (props) => (
  <>
    {!props.loading ? (
      <Suspense fallback={<Loading />}>
        <div className="App">

          <Switch>
            <SupplierAuthenticated routeName="My Orders" layout={SupplierLayout} exact path="/" component={dSupplierOrders} {...props} />
            <SupplierAuthenticated routeName="My Orders" layout={SupplierLayout} exact path="/myorders" component={dSupplierOrders} {...props} />
            <SupplierAuthenticated routeName="Order Detail" layout={SupplierLayout} exact path="/order/:id" component={dSupplierOrderDetails} {...props} />

            {/*
            <SupplierAuthenticated appName="supplier" routeName="My Orders" layout={SupplierLayout} exact path="/" component={MyOrders} {...props} />
            <SupplierAuthenticated appName="supplier" routeName="My Orders" layout={SupplierLayout} exact path="/myorders" component={MyOrders} {...props} />
            <SupplierAuthenticated appName="supplier" routeName="Messages" exact path="/messages" layout={SupplierLayout} component={dMessages} {...props} />
            <SupplierAuthenticated appName="supplier" routeName="Edit message" exact path="/messages/:_id/edit" layout={SupplierLayout} component={dEditMessage} {...props} />
            <SupplierAuthenticated appName="supplier" routeName="Messages Admin" exact path="/messagesAdmin" layout={SupplierLayout} component={dAdminAllMessages} {...props} />
            */}
            <SupplierAuthenticated appName="supplier" routeName="Profile" layout={SupplierLayout} exact path="/profile" component={Profile} {...props} />

            <Public exact routeName="About" layout={SupplierLayout} path="/about" component={About} {...props} />
            <Public routeName="Terms" layout={SupplierLayout} path="/pages/terms" component={Terms} {...props} />
            <Public routeName="Privacy" layout={SupplierLayout} path="/pages/privacy" component={Privacy} {...props} />
            <Public routeName="Refund" layout={SupplierLayout} path="/pages/refund" component={Refund} {...props} />

            {/* Page not found */}
            <Redirect from="*" to="/" />
          </Switch>
          <Footer />
        </div>
      </Suspense>
    ) : ''}
  </>
);

SupplierApp.propTypes = {
  loading: PropTypes.bool.isRequired,
};

export default SupplierApp;
