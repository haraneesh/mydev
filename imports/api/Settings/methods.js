import Settings from './Settings';

// Import server methods for Settings (server-only)
if (Meteor.isServer) {
  import('./server/methods');
}

async function getValue(keyValue) {
  const keyRow = await Settings.findOneAsync({ key: keyValue });
  if (keyRow) { return keyRow.value; }
  return {};
}

async function setValue(keyValue, value) {
   Settings.upsertAsync({ key: keyValue }, { $set: { value } });
}

export default { getValue, setValue };
