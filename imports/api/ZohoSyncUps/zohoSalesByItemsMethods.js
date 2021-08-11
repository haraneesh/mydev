/*
https://books.zoho.com/api/v3/reports/salesbyitem
Params and values allowed:
from_date=YYYY-MM-DD
to_date=YYYY-MM-DD
organization_id=****
authtoken=****
*/

import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import zh from './ZohoBooks';
import { syncUpConstants } from './ZohoSyncUps';
import constants from '../../modules/constants';
import { updateSyncAndReturn, retResponse, getZhDisplayDate } from './zohoCommon';
import Products from '../Products/Products';
import rateLimit from '../../modules/rate-limit.js';
import handleMethodException from '../../modules/handle-method-exception';

function updateReturnableDetails(details, product) {
  details.forEach((salesDetail) => {
    const usr = Meteor.users.findOne({ zh_contact_id: salesDetail.customer_id });
    if (usr) {
      const productReturnables = (usr.productReturnables) ? usr.productReturnables : {};
      productReturnables[product._id] = {
        productName: product.name,
        quantitySold: salesDetail.quantity_sold,
        image_path: product.image_path,
        zh_unit: salesDetail.unit,
        zh_amount: salesDetail.amount,
        zh_averagePrice: salesDetail.average_price,
      };
      Meteor.users.update(usr._id, { $set: { productReturnables } });
    }
  });
}

const getSalesDetailsByItemFromZoho = new ValidatedMethod({
  name: 'reports.getSalesDetailsByItemFromZoho',
  validate() {},
  run() {
    try {
      const today = new Date();
      const fromYear = new Date();
      fromYear.setFullYear(today.getFullYear() - 5);
      const successResp = [];
      const errorResp = [];

      if (Meteor.isServer) {
        const returnableProducts = Products.find(
          { type: constants.ReturnProductType.name },
          {
            fields: {
              _id: 1, sku: 1, zh_item_id: 1, name: 1, image_path: 1,
            },
          },
        ).fetch();

        returnableProducts.forEach((product) => {
          let page = 1;
          let hasMorePages = true;

          while (hasMorePages) {
            const r = zh.getRecordsByParams('reports/salesdetailsbyitem', {
              from_date: getZhDisplayDate(fromYear),
              to_date: getZhDisplayDate(today),
              item_id: product.zh_item_id,
              per_page: 1000,
              page,
            });
            if (r.code === 0) {
              successResp.push(retResponse(r));
              updateReturnableDetails(r.sales, product);
              page += 1;
              hasMorePages = r.page_context.has_more_page;
            } else {
              const res = {
                code: r.code,
                message: `${r.message}`,
              };
              hasMorePages = false;
              errorResp.push(retResponse(res));
            }
          }
        });

        return updateSyncAndReturn('salesdetailsbyitem', successResp, errorResp, today, syncUpConstants.salesDetailsByItemFromZoho);
      }
    } catch (exception) {
      handleMethodException(exception);
    }
  },
});

export default getSalesDetailsByItemFromZoho;

rateLimit({
  methods: [
    getSalesDetailsByItemFromZoho,
  ],
  limit: 5,
  timeRange: 1000,
});
