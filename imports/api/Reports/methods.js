import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { DateTime } from 'luxon';
import { Orders } from '../Orders/Orders';
import getActiveItemsFromZoho from '../ZohoSyncUps/zohoItems';
import addPOOrderedQty from './zohoPurchaseOrders';
import getInvoicesFromZoho from './zohoInvoices';
import constants from '../../modules/constants';
import rateLimit from '../../modules/rate-limit';
import handleMethodException from '../../modules/handle-method-exception';
// import daysSummary from './daysSummary';

// import { configure, getLogger } from 'log4js';

const getPreviousOrdersByProduct = (val, forDate, nextDate, label) => {
  // const forDateIst = new Date(forDate);
  // forDateIst.setHours(0, 0, 0, 0);
  const orders = Orders.find({
    createdAt:
    {
      $gte: forDate.toJSDate(),
      $lt: nextDate.toJSDate(),
    },
  }).fetch();

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

const addStockOnHand = (productsHash) => {
  const itemsListFromZoho = getActiveItemsFromZoho();

  return itemsListFromZoho.reduce((map, item) => {
    if (map[item.item_id]) {
      map[item.item_id].stockOnHand = item.stock_on_hand;
    }

    return map;
  }, productsHash);
};

const getProductsFrmAwaitingFullOrders = () => {
  const awaitingFullFillMentOrders = Orders.find({ order_status: constants.OrderStatus.Awaiting_Fulfillment.name }).fetch();
  let returnValue = {};
  if (awaitingFullFillMentOrders) {
    returnValue = awaitingFullFillMentOrders.reduce((acc, order) => {
      acc = order.products.reduce((map, product) => {
        if (map[product.zh_item_id]) {
          map[product.zh_item_id].orderQuantity = map[product.zh_item_id].orderQuantity
                    + product.quantity;
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
  'reports.generateDaysSummary': function generateDaySummary() {
    // check(day, Date);
    if (!Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
      // user not authorized. do not publish secrets
      handleMethodException('Access denied', 403);
    }
    try {
      // const pendingProductsHash = daysSummary;

      let awaitingFullFillmentProductsHash = getProductsFrmAwaitingFullOrders();
      if (Object.keys(awaitingFullFillmentProductsHash).length > 0) {
        awaitingFullFillmentProductsHash = addStockOnHand(awaitingFullFillmentProductsHash);
        awaitingFullFillmentProductsHash = addPOOrderedQty(awaitingFullFillmentProductsHash);
      }
      //  writeFile(awaitingFullFillmentProductsHash);

      return awaitingFullFillmentProductsHash;
    } catch (exception) {
      handleMethodException(exception);
    }
    return { };
  },
  'reports.getInvoices': function getInvoices() {
    if (!Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
      // user not authorized. do not publish secrets
      handleMethodException('Access denied', 403);
    }
    try {
      return getInvoicesFromZoho();
    } catch (exception) {
      handleMethodException(exception);
    }
    return { };
  },
  'reports.getPreviousSalesByProduct': function getPreviousSalesByProduct() {
    if (!Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
      // user not authorized. do not publish secrets
      handleMethodException('Access denied', 403);
    }
    try {
      const lastWeekSameDay = DateTime.now().setZone('Asia/Kolkata').minus({ days: 6 }).set({ hour: 0, minute: 0, second: 0 });
      const lastWeekNextDay = DateTime.now().setZone('Asia/Kolkata').minus({ days: 5 }).set({ hour: 0, minute: 0, second: 0 });

      const twoWeekSameDay = DateTime.now().setZone('Asia/Kolkata').minus({ days: 13 }).set({ hour: 0, minute: 0, second: 0 });
      const twoWeekNextDay = DateTime.now().setZone('Asia/Kolkata').minus({ days: 12 }).set({ hour: 0, minute: 0, second: 0 });

      let val = getPreviousOrdersByProduct({}, lastWeekSameDay, lastWeekNextDay, 'firstWeek');
      val = getPreviousOrdersByProduct(val, twoWeekSameDay, twoWeekNextDay, 'secondWeek');

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
  ],
  limit: 5,
  timeRange: 1000,
});
