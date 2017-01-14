import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Orders from '../../orders/orders';

Meteor.publish('orders.list', function () {
   if (Roles.userIsInRole(this.userId, ['admin'])) {
     return Orders.find()
   }
})

Meteor.publish('orders.list.status', function(orderStatuses){
   check(orderStatuses,[String])
   if (Roles.userIsInRole(this.userId, ['admin'])) {
      return Orders.find(
        {  order_status:{ $in: orderStatuses }},
      )
   }
   else
   {
     return Orders.find(
         {  $and: [
              { order_status:{ $in: orderStatuses }},
              {'customer_details._id': this.userId },
            ]
        },
      )
   }
})

Meteor.publish('orders.mylist', function (){
    return Orders.find({'customer_details._id':this.userId})
}) 

Meteor.publish('orders.view', function (id){
  check(id, String)
   if (Roles.userIsInRole(this.userId, ['admin'])) {
      return Orders.find(id)
   }
   else
   {
      return Orders.find(
        {and: [
              { _id:id},
              {'customer_details._id': this.userId },
            ]
        }
      )
   }
})
