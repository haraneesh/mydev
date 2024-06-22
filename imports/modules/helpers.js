import { Meteor } from 'meteor/meteor';
import moment from 'moment';
import { formatMoney } from 'accounting-js';
import { Roles } from 'meteor/alanning:roles';
// import 'moment-timezone';
import constants from './constants';
import { accountSettings, dateSettings } from './settings';

export function isCustomer(userId) {
  return Roles.userIsInRole(userId, constants.Roles.customer.name);
}

export function isDeviceMobile() {
  return window.screen.width < constants.ScreenWidths.ipad.width;
}

// https://www.indiapost.gov.in/vas/pages/findpincode.aspx
export function isChennaiPinCode(pinCode) {
  const chennaiPinCodes = Meteor.settings.public.pinCodes.allowedCodes;

  if (chennaiPinCodes.includes(pinCode)) {
    return true;
  }
  return false;
}

export function toTitleCase(str) {
  // Remove leading and trailing white spaces
  let trimmedStr = str.trim();

  // Replace multiple spaces with a single space
  trimmedStr = trimmedStr.replace(/\s+/g, ' ');

  // Convert to title case
  return trimmedStr.toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export function daysInWeek() {
  const weekday = new Array(7);
  weekday[0] = 'Sunday';
  weekday[1] = 'Monday';
  weekday[2] = 'Tuesday';
  weekday[3] = 'Wednesday';
  weekday[4] = 'Thursday';
  weekday[5] = 'Friday';
  weekday[6] = 'Saturday';

  return weekday;
}

export function getDeliveryDay(date) {
  const hour = date.getHours(); // 0 to 23
  const day = date.getDay(); // 0 for Sunday to 6

  const weekday = daysInWeek();

  if (day === 0 || (day === 6 && hour > 10)) {
    return weekday[1];
  }
  if (hour < 11) {
    return `Today (${weekday[day]})`;
  }
  return `Tomorrow (${weekday[day + 1]})`;
}
const retHashQtyWithDiscount = (unitsForSelection) => {
  // Step 1: Split the string by ','
  const subElements = unitsForSelection.split(',');

  // Initialize an empty object to store the key-value pairs
  const keyValuePairs = {};

  // Step 2 & 3: Split each sub-element by '=' and create the hash
  subElements.forEach((subElement) => {
    const [key, value] = subElement.split('=');
    keyValuePairs[key] = value ? value.replace('%', '') : 0;
  });

  return keyValuePairs;
};
function findLastSmallest(inputValue, object) {
  let lastSmallestKey = null;

  // Get the keys of the object and sort them in descending order
  const sortedKeys = Object.keys(object).sort((a, b) => parseFloat(b) - parseFloat(a));

  if (inputValue < sortedKeys[sortedKeys.length - 1]) {
    return sortedKeys[sortedKeys.length - 1];
  }
  // Iterate through the sorted keys
  sortedKeys.forEach((key) => {
    // Convert key to number (assuming keys are numbers)
    const keyNumber = parseFloat(key);

    // If the key is smaller than the input value and it's the last smallest one found
    if (keyNumber < inputValue && (lastSmallestKey === null || keyNumber > lastSmallestKey)) {
      lastSmallestKey = keyNumber;
    }
  });

  return lastSmallestKey;
}
export function calculateBulkDiscount(product) {
  let qty = product.quantitySelected ? product.quantitySelected : 0;
  const hashQtyDisc = retHashQtyWithDiscount(product.unitsForSelection);
  const prdSelectionPrice = qty * product.unitprice;

  if (!(qty in hashQtyDisc)) {
    qty = findLastSmallest(qty, hashQtyDisc);
  }

  return prdSelectionPrice * (1 - (hashQtyDisc[qty] / 100));

  // return prdSelectionPrice;
}
export function getProductUnitPrice(isShopOwnerPrice, productsArray) {
  if (!isShopOwnerPrice) {
    return productsArray.filter((product) => product.availableToOrder === true);
  }

  const products = [];

  productsArray.filter((product) => product.availableToOrderWH === true).forEach((product) => {
    const prd = product;

    if (prd.sourceSuppliers
      && prd.sourceSuppliers.length > 0
      && prd.sourceSuppliers[0].marginPercentage) {
      prd.unitprice = prd.wSaleBaseUnitPrice
      * (1 + (prd.sourceSuppliers[0].marginPercentage / 100));
    } else {
      prd.unitprice = prd.wSaleBaseUnitPrice;
    }

    if (prd.unitprice > 0) {
      products.push(prd);
    }
  });
  return products;
}

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
  const productListStatus = today.isAfter(activeEndDateTime)
    ? constants.ProductListStatus.Expired.name
    : today.isBefore(activeStartDateTime)
      ? constants.ProductListStatus.Future.name
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

export const extractString = (x) => x.replace(/[^a-zA-Z]/g, '');

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
