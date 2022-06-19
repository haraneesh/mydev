import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import ProductLists from '../ProductLists';
import { getActiveProductList } from '../commonFunctions';

Meteor.publish('productLists.list', () => ProductLists.find({}, {
  sort: { updatedAt: -1 },
  limit: 10,
}));

Meteor.publish('productList.view', (_id) => {
  check(_id, String);
  return ProductLists.find(_id,
    {
      products: 1,
      activeStartDateTime: 0,
      activeEndDateTime: 0,
      createdAt: 0,
      updatedAt: 0,
      order_ids: 0,
    });
});

Meteor.publish('productOrderList.viewByDate', (dateValue) => {
  check(dateValue, Date);
  return ProductLists.find(
    {
      $and: [
        { activeStartDateTime: { $lte: dateValue } },
        { activeEndDateTime: { $gte: dateValue } },
      ],
    },
  );
});

Meteor.publish('productOrderList.view', () => getActiveProductList());
