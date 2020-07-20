const accountSettings = {
  symbol: 'Rs. ', // default currency symbol is '$'
};

const dateSettings = {
  format: 'dddd, D MMM YYYY',
  shortFormat: 'dddd, D MMM',
  zhPayDateFormat: 'YYYY-MM-DD',
  dayWithoutTime: 'DD-MM-YYYY',
  timeZone: 'Asia/Kolkata',
};

const dateSettingsWithTime = {
  format: 'dddd, MMMM Do YYYY, h:mm:ss a',
  timeZone: 'Asia/Kolkata',
};

export {
  accountSettings,
  dateSettings,
  dateSettingsWithTime,
};
