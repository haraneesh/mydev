import { Orders } from './Orders';
import { Emitter, Events } from '../Events/events';

Orders.hookOptions.after.update = { fetchPrevious: false };

Orders.after.insert((userId, doc) => {
  Emitter.emit(Events.SHOPKEEPER_ORDER_INSERTED, { userId, order: doc });
});

Orders.after.update((userId, doc) => {
  Emitter.emit(Events.SHOPKEEPER_ORDER_UPDATED, { userId, order: doc });
}, { fetchPrevious: false });

Orders.after.remove((userId, doc) => {
  Emitter.emit(Events.SHOPKEEPER_ORDER_REMOVED, { userId, order: doc });
});
