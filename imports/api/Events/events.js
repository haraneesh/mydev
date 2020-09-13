import EventEmitter from 'event-emitter';

const Emitter = new EventEmitter();
const Events = {
  USER_PROFILE_UPDATED: 'user_profile_updated',
  NAV_PLACEORDER_LANDING: 'nav_placeorder_landing',
  ORDER_CREATED: 'order_created',
};

export { Emitter, Events };
