import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import { DateTime } from 'luxon';
import { Orders } from '../Orders/Orders';
import { daysInWeek } from '../../modules/helpers';
import getActiveItemsFromZoho from '../ZohoSyncUps/zohoItems';
import addPOOrderedQty from './zohoPurchaseOrders';
import getInvoicesFromZoho from './zohoInvoices';
import constants from '../../modules/constants';
import rateLimit from '../../modules/rate-limit';
import handleMethodException from '../../modules/handle-method-exception';

// import daysSummary from './daysSummary';

// import { configure, getLogger } from 'log4js';

const getPreviousOrdersByProduct = async (val, forDate, nextDate, label) => {
  // const forDateIst = new Date(forDate);
  // forDateIst.setHours(0, 0, 0, 0);
  const orders = await Orders.find({
    createdAt:
    {
      $gte: forDate.toJSDate(),
      $lt: nextDate.toJSDate(),
    },
    'customer_details.role': constants.Roles.customer.name,
  }).fetchAsync();

  const returnValue = orders.reduce((acc, order) => {
    acc = order.products.reduce((map, product) => {
      if (!map[product._id]) {
        map[product._id] = {
          name: product.name,
          unitOfSale: product.unitOfSale,
        };
      }

      if (map[product._id][label]) {
        map[product._id][label].orderQuantity += product.quantity;
      } else {
        map[product._id][label] = {
          orderQuantity: product.quantity,
        };
      }
      return map;
    }, acc);
    return acc;
  }, val);

  return returnValue;
};

async function customerOrderPreferences() {
  const orders = await Orders.find({
    $or: [
      { order_status: constants.OrderStatus.Pending.name },
      { order_status: constants.OrderStatus.Processing.name },
      { order_status: constants.OrderStatus.Awaiting_Fulfillment.name },
    ],
  }).fetchAsync();

  const orderPreferences = [];

  for (const order of orders) {
    const user = await Meteor.users.findOneAsync({ _id: order.customer_details._id });
    orderPreferences.push(
      {
        name: order.customer_details.name,
        orderStatus: constants.OrderStatus[order.order_status].display_value,
        mobilePhone: order.customer_details.mobilePhone,
        collectRecyclablesWithThisDelivery: (order.collectRecyclablesWithThisDelivery === true)
          ? 'Yes'
          : 'No',
        payCashWithThisDelivery: (order.payCashWithThisDelivery === true)
          ? 'Yes'
          : 'No',
        packingPreference: constants.PackingPreferences[user.settings.packingPreference].displayName,
        issuesWithPreviousOrder: order.issuesWithPreviousOrder,
        comments: order.comments,
      },
    );  
  }


  return orderPreferences.sort((a, b) => {
    const nameA = a.packingPreference.toUpperCase(); // ignore upper and lowercase
    const nameB = b.packingPreference.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    // names must be equal
    return 0;
  });
}

const addStockOnHand = async (productsHash) => {
  const itemsListFromZoho = await getActiveItemsFromZoho();

  return itemsListFromZoho.reduce((map, item) => {
    if (map[item.item_id]) {
      map[item.item_id].stockOnHand = item.stock_on_hand;
    }

    return map;
  }, productsHash);
};

const getProductsFrmAwaitingFullOrders = async () => {
  const awaitingFullFillMentOrders = await Orders.find({ order_status: constants.OrderStatus.Awaiting_Fulfillment.name }).fetchAsync();
  let returnValue = {};
  if (awaitingFullFillMentOrders) {
    returnValue = awaitingFullFillMentOrders.reduce((acc, order) => {
      acc = order.products.reduce((map, product) => {
        if (map[product.zh_item_id]) {
          map[product.zh_item_id].orderQuantity = map[product.zh_item_id].orderQuantity + product.quantity;
        } else {
          map[product.zh_item_id] = {
            orderQuantity: product.quantity,
            name: product.name,
            unitOfSale: product.unitOfSale,
          };
        }
        return map;
      }, acc);
      return acc;
    }, {});
  }
  return returnValue;
};

/*
const writeFile = (pendingProductsHash) => {
  const logger = getLogger();
  configure({
    appenders: { cheese: { type: 'file', filename: 'final.log' } },
    categories: { default: { appenders: ['cheese'], level: 'debug' } },
  });
  logger.level = 'debug';
  logger.debug(pendingProductsHash);
};
*/

Meteor.methods({
  'reports.generateDaysSummary': async function generateDaySummary() {
    // check(day, Date);
    const isAdmin = await Roles.userIsInRoleAsync(this.userId, constants.Roles.admin.name);
    if (!isAdmin) {
      // user not authorized. do not publish secrets
      handleMethodException('Access denied', 403);
    }
    try {
      // const pendingProductsHash = daysSummary;

      let awaitingFullFillmentProductsHash = await getProductsFrmAwaitingFullOrders();
      if (Object.keys(awaitingFullFillmentProductsHash).length > 0) {
        awaitingFullFillmentProductsHash = await addStockOnHand(awaitingFullFillmentProductsHash);
        awaitingFullFillmentProductsHash = await addPOOrderedQty(awaitingFullFillmentProductsHash);
      }
      //  writeFile(awaitingFullFillmentProductsHash);

      return awaitingFullFillmentProductsHash;
    } catch (exception) {
      handleMethodException(exception);
    }
    return { };
  },
  'reports.getInvoices': async function getInvoices() {
    const isAdmin = await Roles.userIsInRoleAsync(this.userId, constants.Roles.admin.name);

    if (!isAdmin) {
      // user not authorized. do not publish secrets
      handleMethodException('Access denied', 403);
    }
    try {
      return await getInvoicesFromZoho();
    } catch (exception) {
      handleMethodException(exception);
    }
    return { };
  },
  'reports.getAllUsers': async function getAllUsers() {
    const isAdmin = await Roles.userIsInRoleAsync(this.userId, constants.Roles.admin.name);

    if (!isAdmin) {
      // user not authorized. do not publish secrets
      handleMethodException('Access denied', 403);
    }

    try {
      return await Meteor.users.find({}, { fields: { services: 0, _id: 0 } }).fetchAsync();
    } catch (exception) {
      handleMethodException(exception);
    }
    return [];
  },
  'reports.reportCustomerOrderPreferences': async function reportCustomerOrderPreferences() {

    const isAdmin = await Roles.userIsInRoleAsync(this.userId, constants.Roles.admin.name);

    if (!isAdmin) {
      // user not authorized. do not publish secrets
      handleMethodException('Access denied', 403);
    }

    try {
      return await customerOrderPreferences();
    } catch (exception) {
      handleMethodException(exception);
    }
    return [];
  },
  'reports.getPreviousSalesByProduct': async function getPreviousSalesByProduct(reportForDayInWeek) {
    check(reportForDayInWeek, String);

    const allDaysInWeek = daysInWeek();
    const todayDayInWeek = DateTime.now().setZone('Asia/Kolkata').weekdayLong;

    const todayDayInWeekNum = allDaysInWeek.findIndex((currentValue) => {
      if (todayDayInWeek === currentValue) {
        return true;
      }
      return false;
    });

    const isAdmin = await Roles.userIsInRoleAsync(this.userId, constants.Roles.admin.name);
    if (!isAdmin) {
      // user not authorized. do not publish secrets
      handleMethodException('Access denied', 403);
    }

    const incr = (todayDayInWeekNum > reportForDayInWeek)
      ? todayDayInWeekNum - reportForDayInWeek
      : 7 - (reportForDayInWeek - todayDayInWeekNum);

    try {
      const lastWeekSameDay = DateTime.now().setZone('Asia/Kolkata').minus({ days: (incr) }).set({ hour: 0, minute: 0, second: 0 });
      const lastWeekNextDay = DateTime.now().setZone('Asia/Kolkata').minus({ days: (incr - 1) }).set({ hour: 0, minute: 0, second: 0 });

      const twoWeekSameDay = DateTime.now().setZone('Asia/Kolkata').minus({ days: (incr + 7) }).set({ hour: 0, minute: 0, second: 0 });
      const twoWeekNextDay = DateTime.now().setZone('Asia/Kolkata').minus({ days: (incr + 6) }).set({ hour: 0, minute: 0, second: 0 });

      let val = await getPreviousOrdersByProduct({}, lastWeekSameDay, lastWeekNextDay, 'firstWeek');
      val = await getPreviousOrdersByProduct(val, twoWeekSameDay, twoWeekNextDay, 'secondWeek');

      return {
        val,
        day: lastWeekSameDay.weekdayLong,
      };
    } catch (exception) {
      handleMethodException(exception);
    }
    return { };
  },
});

rateLimit({
  methods: [
    'reports.generateDaysSummary',
    'reports.getInvoices',
    'reports.getPreviousSalesByProduct',
    'reports.reportCustomerOrderPreferences',
    'reports.getAllUsers',
  ],
  limit: 5,
  timeRange: 1000,
});
