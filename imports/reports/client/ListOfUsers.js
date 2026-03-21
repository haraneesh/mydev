import React from 'react';
import { formatMoney } from 'accounting-js';
import ReactDOMServer from 'react-dom/server';
import moment from 'moment';
import { dateSettings } from '../../modules/settings';
import constants from '../../modules/constants';
import 'moment-timezone';

// ------ Download Order Summary------- //
const userListCSV = (users) => {
  const csv = [];
  csv.push(
    'Phone Number,'
    + 'Name,'
    + 'Email,'
    + 'Delivery Address,'
    + 'Account Status,'
    + 'Send product photos,'
    + 'Packing Preference,',
  );
  users.forEach((user) => {
    const {
      profile,
      emails,
      status,
      settings,
    } = user;

    const removeNewLine = profile.deliveryAddress.replace(/\n/g, ' ');
    csv.push(
      `${profile.whMobilePhone},`
        + `${profile.name.first} ${profile.name.last},`
        + `${(emails && emails[0] && emails[0].address) ? emails[0].address : ''},`
        + `${removeNewLine.replace(/,/g, ' ')},`
        + `${status.accountStatus},`
        + `${constants.ProductUpdatePreferences[settings.productUpdatePreference].displayName},`
        + `${(constants.PackingPreferences[settings.packingPreference].displayName)},`,
    );
  });

  return csv;
};

const downloadUserList = (users, dateValue) => {
  const csv = userListCSV(users);
  const element = document.createElement('a');

  element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csv.join('\r\n'))}`);
  element.setAttribute('download', `UserList_${moment(dateValue).tz(dateSettings.timeZone).format(dateSettings.dayWithoutTime)}.csv`);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
};

export default downloadUserList;
