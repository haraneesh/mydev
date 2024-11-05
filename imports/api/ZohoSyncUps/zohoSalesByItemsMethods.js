/*
https://books.zoho.com/api/v3/reports/salesbyitem
Params and values allowed:
from_date=YYYY-MM-DD
to_date=YYYY-MM-DD
organization_id=****
authtoken=****
*/

import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Meteor } from 'meteor/meteor';
import constants from '../../modules/constants';
import handleMethodException from '../../modules/handle-method-exception';
import rateLimit from '../../modules/rate-limit.js';
import Products from '../Products/Products';
import zh from './ZohoBooks';
import { syncUpConstants } from './ZohoSyncUps';
import {
  getZhDisplayDate,
  retResponse,
  updateSyncAndReturn,
} from './zohoCommon';

async function updateReturnableDetails(details, product) {
  for (const salesDetail of details) {
    const usr = await Meteor.users.findOneAsync({
      zh_contact_id: salesDetail.customer_id,
    });
    if (usr) {
      const productReturnables = usr.productReturnables
        ? usr.productReturnables
        : {};
      productReturnables[product._id] = {
        productName: product.name,
        quantitySold: salesDetail.quantity_sold,
        image_path: product.image_path,
        zh_unit: salesDetail.unit,
        zh_amount: salesDetail.amount,
        zh_averagePrice: salesDetail.average_price,
      };
      await Meteor.users.updateAsync(usr._id, { $set: { productReturnables } });
    }
  }
}

const getSalesDetailsByItemFromZoho = new ValidatedMethod({
  name: 'reports.getSalesDetailsByItemFromZoho',
  validate() {},
  async run() {
    try {
      const today = new Date();
      const fromYear = new Date();
      fromYear.setFullYear(today.getFullYear() - 5);
      const successResp = [];
      const errorResp = [];

      if (Meteor.isServer) {
        const returnableProducts = await Products.find(
          { type: constants.ReturnProductType.name },
          {
            fields: {
              _id: 1,
              sku: 1,
              zh_item_id: 1,
              name: 1,
              image_path: 1,
            },
          },
        ).fetchAsync();

        for (const product of returnableProducts) {
          let page = 1;
          let hasMorePages = true;

          while (hasMorePages) {
            const r = await zh.getRecordsByParams(
              'reports/salesdetailsbyitem',
              {
                from_date: getZhDisplayDate(fromYear),
                to_date: getZhDisplayDate(today),
                item_id: product.zh_item_id,
                per_page: 1000,
                page,
              },
            );
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
        }

        return await updateSyncAndReturn(
          'salesdetailsbyitem',
          successResp,
          errorResp,
          today,
          syncUpConstants.salesDetailsByItemFromZoho,
        );
      }
    } catch (exception) {
      handleMethodException(exception);
    }
  },
});

export default getSalesDetailsByItemFromZoho;

rateLimit({
  methods: [getSalesDetailsByItemFromZoho],
  limit: 5,
  timeRange: 1000,
});
