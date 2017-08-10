import Loadable from 'react-loadable';
import Loading from '../../components/Loading/Loading';

function SuvaiLoadable(opts) {
  return Loadable(Object.assign({
    loading: Loading,
  }, opts));
}

/* admin*/
// import { ProductsAdmin } from '../pages/products-admin';
export const dProductsAdmin = SuvaiLoadable({
  loader: () => import('../../pages/ProductsAdmin/ProductsAdmin'),
});

export const dZohoSyncUp = SuvaiLoadable({
  loader: () => import('../../pages/Admin/ZohoSyncUp'),
});

/* productLists*/
// import { ProductLists } from '../pages/productLists/ProductLists';
export const dProductLists = SuvaiLoadable({
  loader: () => import('../../pages/ProductLists/ProductLists'),
});

// import { AllOrders } from '../pages/admin/AllOrders';
export const dAllOrders = SuvaiLoadable({
  loader: () => import('../../pages/Admin/AllOrders'),
});

// import ViewProductListDetails from '../containers/productLists/ViewProductListDetails';
export const dViewProductListDetails = SuvaiLoadable({
  loader: () => import('../../containers/ProductLists/ViewProductListDetails'),
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

/* Recipes*/
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

//import ProfileUpdate from 
export const dProfileUpdate = SuvaiLoadable({
  loader: () => import('../../pages/Users/ProfileUpdate'),
});

//import ProfileUpdate from 
export const dVision = SuvaiLoadable({
  loader: () => import('../../pages/Miscellaneous/Vision/Vision'),
});