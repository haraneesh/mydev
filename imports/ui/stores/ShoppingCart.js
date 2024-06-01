import React from 'react';
import { saveInLocalStore, getFromLocalStore, removeFromLocalStore } from './localStorage';

import OrderCommon from '../../modules/both/orderCommon';

import { calculateBulkDiscount } from '../../modules/helpers';

const { costOfReturnable } = OrderCommon;

const StoreConstants = {
  CART: 'CARTV10',
  previousVersions: ['CART'],
};

const retHashQtyWithDiscount = (unitsForSelection) => {
  // Step 1: Split the string by ','
  const subElements = unitsForSelection.split(',');

  // Initialize an empty object to store the key-value pairs
  const keyValuePairs = {};

  // Step 2 & 3: Split each sub-element by '=' and create the hash
  subElements.forEach((subElement) => {
    const [key, value] = subElement.split('=');
    keyValuePairs[key] = value ? value.replace('%', '') : 0;
  });

  return keyValuePairs;
};

const getTotalBillAmountAndCount = (selectedProducts) => {
  let totalBillAmount = 0;
  let countOfItems = 0;
  Object.keys(selectedProducts).forEach((key) => {
    const qty = selectedProducts[key].quantity ? selectedProducts[key].quantity : 0;
    const prd = selectedProducts[key];
    prd.quantitySelected = qty;
    totalBillAmount += calculateBulkDiscount(prd);

    // include the returnables selected
    const { associatedReturnables } = selectedProducts[key];
    if (associatedReturnables && associatedReturnables.quantity > 0) {
      const { returnableUnitsForSelection } = associatedReturnables;
      totalBillAmount += costOfReturnable(returnableUnitsForSelection, qty).retQtySelectedPrice * 1;
    }
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
  deliveryPincode: '600087', // change to '' to start showing the Pincode form
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
  const { activeCartId } = cartState;
  return cartState.carts[activeCartId];
};

// Reducer Cart Actions
const cartActions = {
  setDeliveryPinCode: 'SET_DELIVERY_PIN_CODE',
  setActiveCart: 'SET_ACTIVE_CART',
  emptyCart: 'EMPTY_CART',
  updateCart: 'UPDATE_CART',
  activateCart: 'NEW_CART',
  setCartComments: 'SET_COMMENTS',
  orderFlowComplete: 'ORDER_FLOW_COMPLETE',
  setIssuesWithPreviousOrder: 'SET_ISSUES_WITH_PREVIOUS_ORDER',
  setPayCashWithThisDelivery: 'SET_PAY_CASH_WITH_THIS_DELIVERY',
  setCollectRecyclablesWithThisDelivery: 'SET_COLLECT_RECYCLABLES_WITH_THIS_DELIVERY',
};

// Reducer
const cartReducer = (currentState, action) => {
  const cartId = currentState.activeCartId;
  const newState = { ...currentState };
  // let newStateCart = newState.carts[cartId];
  switch (action.type) {
    case cartActions.setDeliveryPinCode: {
      newState.carts[cartId].deliveryPincode = action.payload.deliveryPincode;
      break;
    }
    case cartActions.setCartComments: {
      newState.carts[cartId].comments = action.payload.comments;
      break;
    }
    case cartActions.setIssuesWithPreviousOrder: {
      newState.carts[cartId].issuesWithPreviousOrder = action.payload.issuesWithPreviousOrder;
      break;
    }
    case cartActions.setPayCashWithThisDelivery: {
      newState.carts[cartId].payCashWithThisDelivery = action.payload.payCashWithThisDelivery;
      break;
    }
    case cartActions.setCollectRecyclablesWithThisDelivery: {
      newState.carts[cartId].collectRecyclablesWithThisDelivery = action.payload.collectRecyclablesWithThisDelivery;
      break;
    }
    case cartActions.setActiveCart: {
      const newActiveCartId = action.payload.activeCartId;
      const { selectedProducts } = action.payload;
      const {
        comments,
        payCashWithThisDelivery,
        issuesWithPreviousOrder,
        collectRecyclablesWithThisDelivery,
      } = action.payload;
      const { basketId } = action.payload;
      const { deliveryPincode } = action.payload;
      newState.activeCartId = newActiveCartId;
      const { totalBillAmount, countOfItems } = getTotalBillAmountAndCount(selectedProducts);
      newState.carts[newActiveCartId] = {
        productsInCart: selectedProducts,
        totalBillAmount,
        countOfItems,
        lastUpdateDate: new Date(),
        comments,
        basketId,
        deliveryPincode,
        issuesWithPreviousOrder,
        payCashWithThisDelivery,
        collectRecyclablesWithThisDelivery,
      };
      break;
    }
    case cartActions.activateCart: {
      const activeCartId = action.payload.cartIdToActivate;
      newState.activeCartId = activeCartId;
      break;
    }
    case cartActions.emptyCart: {
      newState.carts[cartId] = emptyCart;
      break;
    }
    case cartActions.updateCart: {
      const { product } = action.payload;
      const productsInCart = { ...currentState.carts[cartId].productsInCart };
      const basketId = currentState.carts[cartId].basketId || action.payload.basketId;
      productsInCart[product._id] = product;
      if (!(parseFloat(product.quantity) > 0)) {
        delete productsInCart[product._id];
      }
      const { totalBillAmount, countOfItems } = getTotalBillAmountAndCount(productsInCart);
      newState.carts[cartId] = {
        productsInCart,
        totalBillAmount,
        countOfItems,
        lastUpdateDate: new Date(),
        comments: currentState.carts[cartId].comments,
        basketId,
        deliveryPincode: currentState.carts[cartId].deliveryPincode,
        issuesWithPreviousOrder: currentState.carts[cartId].issuesWithPreviousOrder,
        payCashWithThisDelivery: currentState.carts[cartId].payCashWithThisDelivery,
        collectRecyclablesWithThisDelivery: currentState.carts[cartId].collectRecyclablesWithThisDelivery,
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
    <CartStateContext.Provider
      value={{
        cart: getActiveCart(state),
        newCartCountOfItems: state.carts.NEW.countOfItems,
        activeCartId: state.activeCartId,
      }}
    >
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
