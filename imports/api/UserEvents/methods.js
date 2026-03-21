import UserEvents from './UserEvents';
import { Emitter, Events } from '../Events/events';

Emitter.on(Events.NAV_PLACEORDER_LANDING, async ({ userId }) => {
  const lastRecord = await UserEvents.find({
    eventType: Events.NAV_PLACEORDER_LANDING,
    owner: userId,
  },
  {
    sort: { createdAt: -1 },
    limit: 1,
  }).fetchAsync();

  if (lastRecord[0]) {
    const now = new Date();
    const lastEntryDate = lastRecord[0].createdAt;
    const difference = (now - lastEntryDate) / 1000;

    // 10 minutes
    if (difference < 600) {
      return;
    }
  }

  const userIdToLog = (userId) || 'NotLogged';

  await UserEvents.insertAsync(
    {
      eventType: Events.NAV_PLACEORDER_LANDING,
      owner: userIdToLog,
    },
  );
});
