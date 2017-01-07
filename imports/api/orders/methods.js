import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import Orders from './orders'
import ProductLists from '../productLists/productLists'
import rateLimit from '../../modules/rate-limit'

export const upsertOrder = new ValidatedMethod({
  name: 'orders.upsert',
  validate: Orders.schema.validator(),
  run(order) {
    const orderId = order._id
    delete order._id
    return Orders.upsert({ _id: orderId }, { $set: order })
  },
})

export const removeOrder = new ValidatedMethod({
  name: 'order.remove',
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  run({ _id }) {
    Orders.remove(_id)
  },
})

export const updateOrderStatus = new ValidatedMethod({
  name: 'orders.updateOrderStatus',
  validate: new SimpleSchema ({
    orderIds:{ type: [String] },
    updateToStatus: { type:String }
  }).validator(),
  run({orderIds, updateToStatus}) {
    if (!Roles.userIsInRole(this.userId, ['admin'])) {
      // user not authorized. do not publish secrets
      throw new Meteor.Error(403, "Access denied")
    }
    return Orders.update ({ _id: {$in: orderIds}  }, { $set: { order_status: updateToStatus }},{multi:true})
  },
})

rateLimit({
  methods: [
    upsertOrder,
    removeOrder,
    updateOrderStatus,
  ],
  limit: 5,
  timeRange: 1000,
})
