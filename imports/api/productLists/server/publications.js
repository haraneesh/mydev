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


Meteor.publish('productOrderList.view', (str) => {
 // const ttoday = new Date(str)
 check(str, Number) 
 
 return ProductLists.find()
})
