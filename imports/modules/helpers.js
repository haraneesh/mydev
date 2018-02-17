import { Meteor } from 'meteor/meteor';
import moment from 'moment';
// import 'moment-timezone';
import { formatMoney } from 'accounting-js';
import constants from './constants';
import { accountSettings, dateSettings } from './settings';


export function getDisplayDate(dateObject) {
  // return moment(dateObject).tz(dateSettings.timeZone).format(dateSettings.format);
  return moment(dateObject).local().format(dateSettings.format);
}

export function getNumDaysBetween (d1, d2) {
    var diff = Math.abs(d1.getTime() - d2.getTime());
    return diff / (1000 * 60 * 60 * 24);
  };

export function getDisplayShortDate(dateObject) {
  return moment(dateObject).local().format(dateSettings.shortFormat);
}

export function getDisplayDateTitle(startDateObj, EndDateObj) {
  return `${getDisplayDate(startDateObj)
              } - ${
            getDisplayDate(EndDateObj)}`;
}


export function getProductListStatus(activeStartDateTime, activeEndDateTime) {
  const today = moment().local();
  const productListStatus = today.isAfter(activeEndDateTime) ?
            constants.ProductListStatus.Expired.name
            : today.isBefore(activeStartDateTime) ?
                constants.ProductListStatus.Future.name
                    : constants.ProductListStatus.Active_Now.name;

  return productListStatus;
}

export function getFormattedMoney(money) {
  return formatMoney(money, accountSettings);
}

export function getLoggedInUserDisplayUserName() {
  const user = Meteor.user();
  const name = user && user.profile ? user.profile.name : '';
  return user ? `${name.first} ${name.last}` : '';
}

export function isLoggedInUserAdmin() {
  const loggedInUser = Meteor.user();
  if (loggedInUser && Roles.userIsInRole(loggedInUser, constants.Roles.admin.name)) {
    return true;
  }
  return false;
}
