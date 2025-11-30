import Loadable from 'react-loadable';
import { lazy } from 'react';
import Loading from '../components/Loading/Loading';

function SuvaiLoadable(opts) {
  return Loadable({ loading: Loading, ...opts });
}

/* admin */
export const dProductsAdmin = lazy(() => import('../pages/ProductsAdmin/ProductsAdmin'));

export const dZohoUpdateReturnables = lazy(() => import('../pages/Admin/ZohoUpdateReturnables'));

export const dZohoSyncUp = lazy(() => import('../pages/Admin/ZohoSyncUp'));

/* productLists */
export const dProductLists = lazy(() => import('../pages/ProductLists/ProductLists'));

export const dAllOrders = lazy(() => import('../pages/Admin/AllOrdersNew'));

export const dViewProductListDetails = SuvaiLoadable({
  loader: () => import('../containers/ProductLists/ViewProductListDetails'),
});

export const dMyWallet = lazy(() => import('../pages/Wallet/MyWallet'));

/* Users */
export const dUsers = lazy(() => import('../pages/Admin/Users/UsersHome/Users'));
export const dUserDetails = lazy(() => import('../pages/Admin/Users/UserDetails/UserDetails'));


/* Invitations */

export const dInvitations = lazy(() => import('../pages/Invitations/Invitations'));

export const dNewInvitation = lazy(() => import('../pages/Invitations/NewInvitation'));

// import ProfileUpdate from
export const dProfileUpdate = lazy(() => import('../pages/Users/ProfileUpdate'));

// import ProfileUpdate from

export const dVision = lazy(() => import('../pages/Miscellaneous/Vision/Vision'));

export const dHealthPrinciples = lazy(() => import('../pages/Miscellaneous/Health/Principles/Principles'));

export const dHealthFAQ = lazy(() => import('../pages/Miscellaneous/Health/FAQ/FAQ'));

// Reports

export const dReportsHome = lazy(() => import('../pages/Reports/ReportsHome/ReportsHome'));

// Reconcile Products

export const dReconcileInventory = lazy(() => import('../pages/ReconcileInventory/ReconcileInventory'));

export const dReconcileInventoryList = lazy(() => import('../pages/ReconcileInventory/ReconcileInventoryList'));

// Approve User Sign Ups
export const dApproveUserSignUps = lazy(() => import('../pages/Miscellaneous/ApproveSignUps'));

// Messages
export const dMessagesHome = lazy(() => import('../pages/Messages/Messages'));

// Invoice View
export const dViewInvoice = lazy(() => import('../components/Orders/Invoices/ViewInvoice'));

// Send Message To Users (Admin)
export const dSendMessageToUsers = lazy(() => import('../pages/Admin/SendMessageToUsers'));

// Notification Subscribers (Admin)
export const dNotificationSubscribers = lazy(() => import('../pages/Admin/NotificationSubscribers'));
