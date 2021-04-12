import Settings from './Settings';

function getValue(keyValue) {
  const keyRow = Settings.findOne({ key: keyValue });
  if (keyRow) { return keyRow.value; }
  return {};
}

function setValue(keyValue, value) {
  Settings.upsert({ key: keyValue }, { $set: { value } });
}

export default { getValue, setValue };
