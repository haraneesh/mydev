import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import ProductLists from '../ProductLists';

Meteor.publish('productLists.list', function productListsList() { 
    return ProductLists.find({});
});

Meteor.publish('productList.view', function productListView(_id) {
  check(_id, String);
  return ProductLists.find(_id);
});


Meteor.publish('productOrderList.view', function productOrderListView(dateValue) {
  check(dateValue, Date);
  return ProductLists.find(
    { $and: [
              { activeStartDateTime: { $lte: dateValue } },
              { activeEndDateTime: { $gte: dateValue } },
    ],
    },
  );
});
