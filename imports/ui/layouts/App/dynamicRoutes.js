import Loadable from 'react-loadable';
import { lazy } from 'react';
import Loading from '../../components/Loading/Loading';

function SuvaiLoadable(opts) {
  return Loadable(Object.assign({
    loading: Loading,
  }, opts));
}

const ReactLazyPreload = importStatement => {
  const Component = lazy(importStatement);
  Component.preload = importStatement;
  return Component;
};

/* admin */
// import { ProductsAdmin } from '../pages/products-admin';
export const dProductsAdmin = lazy(() => import('../../pages/ProductsAdmin/ProductsAdmin'));
/*
export const dProductsAdmin = SuvaiLoadable({
  loader: () => import('../../pages/ProductsAdmin/ProductsAdmin'),
});
*/

export const dZohoSyncUp = lazy(() => import('../../pages/Admin/ZohoSyncUp'));
/* export const dZohoSyncUp = SuvaiLoadable({
  loader: () => import('../../pages/Admin/ZohoSyncUp'),
}); */

/* productLists */
// import { ProductLists } from '../pages/productLists/ProductLists';
export const dProductLists = lazy(() => import('../../pages/ProductLists/ProductLists'));

/*export const dProductLists = SuvaiLoadable({
  loader: () => import('../../pages/ProductLists/ProductLists'),
});*/

// import { AllOrders } from '../pages/admin/AllOrders';
export const dAllOrders = lazy(() => import('../../pages/Admin/AllOrdersNew'));
/*
export const dAllOrders = SuvaiLoadable({
  loader: () => import('../../pages/Admin/AllOrdersNew'),
});
*/

// import ViewProductListDetails from '../containers/productLists/ViewProductListDetails';
export const dViewProductListDetails = SuvaiLoadable({
  loader: () => import('../../containers/ProductLists/ViewProductListDetails'),
});

export const dMyWallet = lazy(() => import('../../pages/Wallet/MyWallet'));

/*
export const dMyWallet = SuvaiLoadable({
  loader: () => import('../../pages/Wallet/MyWallet'),
}); */


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
export const dRecipesHome = lazy(() => import('../../pages/Recipes/RecipesHome'));

export const dRecipes = lazy(() => import('../../pages/Recipes/Recipes'));

export const dNewRecipe = lazy(() => import('../../pages/Recipes/NewRecipe'));

export const dEditRecipe = lazy(() => import('../../pages/Recipes/EditRecipe'));

export const dViewRecipe = lazy(() => import('../../pages/Recipes/ViewRecipe'));

export const dRecipesByCategory = lazy(() => import('../../pages/Recipes/RecipesByCategory'));
/* export const dViewRecipe = SuvaiLoadable({
  loader: () => import('../../containers/Recipes/ViewRecipe'),
}); */

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

// Basket

export const dBaskets = SuvaiLoadable({
  loader: () => import('../../pages/Baskets/Baskets'),
});

export const dViewBasket = SuvaiLoadable({
  loader: () => import('../../pages/Baskets/ViewBasket'),
});

export const dEditBasket = SuvaiLoadable({
  loader: () => import('../../pages/Baskets/EditBasket'),
});

export const dNewBasket = SuvaiLoadable({
  loader: () => import('../../pages/Baskets/NewBasket'),
});

export const dCreateBasket = SuvaiLoadable({
  loader: () => import('../../pages/Baskets/CreateBasket'),
});

// Messages
export const dMessages = ReactLazyPreload(() => import('../../pages/Messages/MessageHome/Messages'));

/*
export const dMessages = SuvaiLoadable({
  loader: () => import('../../pages/Messages/MessageHome/Messages'),
});*/

export const dEditMessage = lazy(() => import('../../pages/Messages/EditMessage/EditMessage'));

/*
export const dEditMessage = SuvaiLoadable({
  loader: () => import('../../pages/Messages/EditMessage/EditMessage'),
});*/

export const dAdminAllMessages = lazy(() => import('../../pages/Messages/AdminAllMessages/AdminAllMessages'));

/*
export const dAdminAllMessages = SuvaiLoadable({
  loader: () => import('../../pages/Messages/AdminAllMessages/AdminAllMessages'),
}); */
