import UserEvents from './UserEvents';
import { Emitter, Events } from '../Events/events';

Emitter.on(Events.NAV_PLACEORDER_LANDING, ({ userId }) => {
  const lastRecord = UserEvents.find({
    eventType: Events.NAV_PLACEORDER_LANDING,
    owner: userId,
  },
  {
    sort: { createdAt: -1 },
    limit: 1,
  }).fetch();

  if (lastRecord[0]) {
    const now = new Date();
    const lastEntryDate = lastRecord[0].createdAt;
    const difference = (now - lastEntryDate) / 1000;

    // 10 minutes
    if (difference < 600) {
      return;
    }
  }

  UserEvents.insert(
    {
      eventType: Events.NAV_PLACEORDER_LANDING,
      owner: userId,
    },
  );
});

Emitter.on(Events.ORDER_CREATED, ({ userId }) => {
  UserEvents.insert(
    {
      eventType: Events.ORDER_CREATED,
      owner: userId,
    },
  );
});
