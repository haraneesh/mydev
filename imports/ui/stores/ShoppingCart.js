import React from 'react';
import { saveInLocalStore, getFromLocalStore, removeFromLocalStore } from './localStorage';

const StoreConstants = {
  CART: 'CARTV10',
  previousVersions: ['CART'],
};

const getTotalBillAmountAndCount = (selectedProducts) => {
  let totalBillAmount = 0;
  let countOfItems = 0;
  Object.keys(selectedProducts).forEach((key) => {
    const qty = selectedProducts[key].quantity ? selectedProducts[key].quantity : 0;
    totalBillAmount += qty * selectedProducts[key].unitprice;
    countOfItems += 1;
  });
  return { totalBillAmount, countOfItems };
};

const emptyCart = {
  productsInCart: {},
  totalBillAmount: 0,
  countOfItems: 0,
  comments: '',
  lastUpdateDate: new Date(),
};

const initializeCart = () => {
  // clear previous version of cart Objects
  removeFromLocalStore(StoreConstants.previousVersions[0]);

  const newCartObject = getFromLocalStore(StoreConstants.CART);

  if (newCartObject) {
    return {
      activeCartId: 'NEW',
      carts: {
        NEW: newCartObject,
      },
    };
  }

  return {
    activeCartId: 'NEW',
    carts: {
      NEW: emptyCart,
    },
  };
};

const getActiveCart = (cartState) => {
  const activeCartId = cartState.activeCartId;
  return cartState.carts[activeCartId];
};

// Reducer Cart Actions
const cartActions = {
  setActiveCart: 'SET_ACTIVE_CART',
  emptyCart: 'EMPTY_CART',
  updateCart: 'UPDATE_CART',
  activateCart: 'NEW_CART',
  setCartComments: 'SET_COMMENTS',
  orderFlowComplete: 'ORDER_FLOW_COMPLETE',
};

// Reducer
const cartReducer = (currentState, action) => {
  const cartId = currentState.activeCartId;
  const newState = { ...currentState };
  switch (action.type) {
    case cartActions.setCartComments: {
      newState.carts[cartId].comments = action.payload.comments;
      break;
    }
    case cartActions.setActiveCart: {
      const newActiveCartId = action.payload.activeCartId;
      const selectedProducts = action.payload.selectedProducts;
      const comments = action.payload.comments;
      newState.activeCartId = newActiveCartId;
      const { totalBillAmount, countOfItems } = getTotalBillAmountAndCount(selectedProducts);
      newState.carts[newActiveCartId] = {
        productsInCart: selectedProducts,
        totalBillAmount,
        countOfItems,
        lastUpdateDate: new Date(),
        comments,

      };
      break;
    }
    case cartActions.activateCart: {
      newState.activeCartId = action.payload.cartIdToActivate;
      break;
    }
    case cartActions.emptyCart: {
      newState.carts[cartId] = emptyCart;
      break;
    }
    case cartActions.updateCart: {
      const product = action.payload.product;
      const productsInCart = { ...currentState.carts[cartId].productsInCart };
      productsInCart[product._id] = product;
      if (product.quantity === 0) {
        delete productsInCart[product._id];
      }
      const { totalBillAmount, countOfItems } = getTotalBillAmountAndCount(productsInCart);
      newState.carts[cartId] = {
        productsInCart,
        totalBillAmount,
        countOfItems,
        lastUpdateDate: new Date(),
        comments: currentState.carts[cartId].comments,
      };
      break;
    }
    case cartActions.orderFlowComplete: {
      if (cartId === 'NEW') {
        newState.carts[cartId] = emptyCart;
      }

      break;
    }
    default:
      throw new Error('Not a valid action to cart reducer');
  }
  if (newState.activeCartId === 'NEW') {
    saveInLocalStore(StoreConstants.CART, newState.carts.NEW);
  }
  return newState;
};


// Context Provider
const CartStateContext = React.createContext();
const CartDispatchContext = React.createContext();

const CartProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer(cartReducer, emptyCart, initializeCart);
  return (
    <CartStateContext.Provider value={{ cart: getActiveCart(state), newCartCountOfItemsForMenu: state.carts.NEW.countOfItems, activeCartId: state.activeCartId }}>
      <CartDispatchContext.Provider value={dispatch}>
        {children}
      </CartDispatchContext.Provider>
    </CartStateContext.Provider>
  );
};

function useCartState() {
  const context = React.useContext(CartStateContext);
  if (context === undefined) {
    throw new Error('useCartState must be used within a CartProvider');
  }
  return context;
}

function useCartDispatch() {
  const context = React.useContext(CartDispatchContext);
  if (context === undefined) {
    throw new Error('useCartDispatch must be used within a CartProvider');
  }
  return context;
}

export {
  CartProvider,
  CartStateContext,
  CartDispatchContext,
  useCartState,
  useCartDispatch,
  cartActions,
};
