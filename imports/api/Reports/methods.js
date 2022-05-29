import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { Orders } from '../Orders/Orders';
import getActiveItemsFromZoho from '../ZohoSyncUps/zohoItems';
import addPOOrderedQty from './zohoPurchaseOrders';
import getInvoicesFromZoho from './zohoInvoices';
import constants from '../../modules/constants';
import rateLimit from '../../modules/rate-limit';
import handleMethodException from '../../modules/handle-method-exception';
// import daysSummary from './daysSummary';

// import { configure, getLogger } from 'log4js';

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
});

rateLimit({
  methods: [
    'reports.generateDaysSummary',
    'reports.getInvoices',
  ],
  limit: 5,
  timeRange: 1000,
});
