import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import ProductLists from '../productLists';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

Meteor.publish('productLists.list', () => {
    return ProductLists.find()
})

Meteor.publish('productList.view', (_id) => {
  check(_id, String)
  return ProductLists.find(_id)
})


Meteor.publish('productOrderList.view', function (dateValue){
  check(dateValue, Date)
  return ProductLists.find(
        {  $and: [
              { activeStartDateTime: { $lte: dateValue }  },
              { activeEndDateTime: { $gte: dateValue }  },
              ]
        },
      )
})
