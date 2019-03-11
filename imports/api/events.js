import EventEmitter from 'events';

const Emitter = new EventEmitter();

const Events = {
    NAV_PLACEORDER_LANDING: 'nav_placeorder_landing',
    ORDER_CREATED: 'order_created'
};

export { Emitter, Events }