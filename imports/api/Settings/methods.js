import Settings from './Settings';

async function getValue(keyValue) {
  const keyRow = await Settings.findOneAsync({ key: keyValue });
  if (keyRow) { return keyRow.value; }
  return {};
}

async function setValue(keyValue, value) {
   Settings.upsertAsync({ key: keyValue }, { $set: { value } });
}

export default { getValue, setValue };
