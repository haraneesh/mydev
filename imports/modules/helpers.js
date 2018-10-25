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

export function getNumDaysBetween(d1, d2) {
  const diff = Math.abs(d1.getTime() - d2.getTime());
  return diff / (1000 * 60 * 60 * 24);
}

export function getDisplayShortDate(dateObject) {
  return moment(dateObject).local().format(dateSettings.shortFormat);
}

export function getDayWithoutTime(dateObject) {
  return moment(dateObject).local().format(dateSettings.dayWithoutTime);
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

export const extractNumber = (x, base) => {
  const parsed = parseInt(x, base);
  if (isNaN(parsed)) { return 0; }
  return parsed;
};

export const extractString = x => x.replace(/[^a-zA-Z]/g, '');

export const padWhiteSpace = (pad, str, padLeft) => {
  if (typeof str === 'undefined') { return pad; }
  if (padLeft) {
    return (pad + str).slice(-pad.length);
  }
  return (str + pad).substring(0, pad.length);
};

export function displayUnitOfSale(numOfUnits, unit) {
  if (numOfUnits === '0') { return ''; }

  const value = numOfUnits * extractNumber(unit);
  const lowerCaseUnitValue = extractString(unit).toLowerCase();
  let retValue = `${value} ${lowerCaseUnitValue}`;

  switch (true) {
    case (lowerCaseUnitValue === 'kg'):
      retValue = value < 1 ? `${value * 1000} g` : retValue;
      break;
    case (lowerCaseUnitValue === 'kl'):
      retValue = value < 1 ? `${value * 1000} L` : retValue;
      break;
    case (lowerCaseUnitValue === 'g' || lowerCaseUnitValue === 'gram' || lowerCaseUnitValue === 'grams'):
      // retValue = value >= 1000 ? `${value / 1000} Kg` : retValue;
      if (value >= 1000) {
        retValue = `${value / 1000} Kg`;
      } else if (value < 0) {
        retValue = `${value * 1000} mg`;
      }
      break;
    case (lowerCaseUnitValue === 'l' || lowerCaseUnitValue === 'litre' || lowerCaseUnitValue === 'litres' || lowerCaseUnitValue === 'liter' || lowerCaseUnitValue === 'liters'):
      // retValue = value >= 1000 ? `${value / 1000} Kl` : retValue;
      if (value >= 1000) {
        retValue = `${value / 1000} Kl`;
      } else if (value < 0) {
        retValue = `${value * 1000} ml`;
      }
      break;
    case (lowerCaseUnitValue === 'ml'):
      retValue = value >= 1000 ? `${value / 1000} L` : retValue;
      break;
    case (lowerCaseUnitValue === 'mg'):
      retValue = value >= 1000 ? `${value / 1000} G` : retValue;
      break;
    default:
  }

  return retValue;
}

export const retMultiSelectValueInArr = (options) => {
  const result = [];

  for (let index = 0; index < options.length; index += 1) {
    const option = options[index];
    if (option.value.trim() !== constants.SELECT_EMPTY_VALUE) {
      result.push(option.value);
    }
  }

  return result;
};