import Loadable from 'react-loadable';
import Loading from '../../components/Loading/Loading';

function SuvaiLoadable(opts) {
  return Loadable(Object.assign({
    loading: Loading,
  }, opts));
}

/* admin */
// import { ProductsAdmin } from '../pages/products-admin';
export const dProductsAdmin = SuvaiLoadable({
  loader: () => import('../../pages/ProductsAdmin/ProductsAdmin'),
});

export const dZohoSyncUp = SuvaiLoadable({
  loader: () => import('../../pages/Admin/ZohoSyncUp'),
});

/* productLists */
// import { ProductLists } from '../pages/productLists/ProductLists';
export const dProductLists = SuvaiLoadable({
  loader: () => import('../../pages/ProductLists/ProductLists'),
});

// import { AllOrders } from '../pages/admin/AllOrders';
export const dAllOrders = SuvaiLoadable({
  loader: () => import('../../pages/Admin/AllOrdersNew'),
});

// import ViewProductListDetails from '../containers/productLists/ViewProductListDetails';
export const dViewProductListDetails = SuvaiLoadable({
  loader: () => import('../../containers/ProductLists/ViewProductListDetails'),
});

export const dMyWallet = SuvaiLoadable({
  loader: () => import('../../pages/Wallet/MyWallet'),
});


/* Invitations */
// import Invitations from '../pages/invitations/Invitations';
export const dInvitations = SuvaiLoadable({
  loader: () => import('../../pages/Invitations/Invitations'),
});

// import NewInvitation from '../pages/invitations/NewInvitation';
export const dNewInvitation = SuvaiLoadable({
  loader: () => import('../../pages/Invitations/NewInvitation'),
});

/* Suppliers */
export const dSuppliers = SuvaiLoadable({
  loader: () => import('../../pages/Suppliers/SuppliersHome/Suppliers'),
});

export const dNewSupplier = SuvaiLoadable({
  loader: () => import('../../pages/Suppliers/NewSupplier/NewSupplier'),
});

export const dViewSupplier = SuvaiLoadable({
  loader: () => import('../../pages/Suppliers/ViewSupplier/ViewSupplier'),
});

export const dEditSupplier = SuvaiLoadable({
  loader: () => import('../../pages/Suppliers/EditSupplier/EditSupplier'),
});


/* Recipes */
export const dRecipesHome = SuvaiLoadable({
  loader: () => import('../../pages/Recipes/RecipesHome'),
});
// import Recipes from '../pages/recipes/Recipes';
export const dRecipes = SuvaiLoadable({
  loader: () => import('../../pages/Recipes/Recipes'),
});

// import NewRecipe from '../pages/recipes/NewRecipe';
export const dNewRecipe = SuvaiLoadable({
  loader: () => import('../../pages/Recipes/NewRecipe'),
});

// import EditRecipe from '../containers/recipes/EditRecipe';
export const dEditRecipe = SuvaiLoadable({
  loader: () => import('../../containers/Recipes/EditRecipe'),
});

// import ViewRecipe from '../containers/recipes/ViewRecipe';
export const dViewRecipe = SuvaiLoadable({
  loader: () => import('../../containers/Recipes/ViewRecipe'),
});

/* specials */
// import ListSpecials from '../containers/specials/ListPublishedSpecials';
export const dListSpecials = SuvaiLoadable({
  loader: () => import('../../containers/Specials/ListPublishedSpecials'),
});


// import EditAllSpecials from '../containers/specials/EditAllSpecials';
export const dEditAllSpecials = SuvaiLoadable({
  loader: () => import('../../containers/Specials/EditAllSpecials'),
});

// import ProfileUpdate from
export const dProfileUpdate = SuvaiLoadable({
  loader: () => import('../../pages/Users/ProfileUpdate'),
});

// import ProfileUpdate from
export const dVision = SuvaiLoadable({
  loader: () => import('../../pages/Miscellaneous/Vision/Vision'),
});

export const dHealthPrinciples = SuvaiLoadable({
  loader: () => import('../../pages/Miscellaneous/Health/Principles/Principles'),
});

export const dHealthFAQ = SuvaiLoadable({
  loader: () => import('../../pages/Miscellaneous/Health/FAQ/FAQ'),
});

// Reports
export const dReportsHome = SuvaiLoadable({
  loader: () => import('../../pages/Reports/ReportsHome/ReportsHome'),
});

// Reconcile Products
export const dReconcileInventory = SuvaiLoadable({
  loader: () => import('../../pages/ReconcileInventory/ReconcileInventory'),
});

export const dReconcileInventoryList = SuvaiLoadable({
  loader: () => import('../../pages/ReconcileInventory/ReconcileInventoryList'),
});

export const dApproveUserSignUps = SuvaiLoadable({
  loader: () => import('../../pages/Miscellaneous/ApproveSignUps'),
});
