import EventEmitter from 'event-emitter';

const Emitter = new EventEmitter();
const Events = {
  USER_PROFILE_UPDATED: 'user_profile_updated',
  NAV_PLACEORDER_LANDING: 'nav_placeorder_landing',
  SHOPKEEPER_ORDER_UPDATED: 'shopkeeper_order_updated',
  SHOPKEEPER_ORDER_INSERTED: 'shopkeeper_order_inserted',
  SHOPKEEPER_ORDER_REMOVED: 'shopkeeper_order_removed',
};

export { Emitter, Events };
