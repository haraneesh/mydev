import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import Orders from './orders'
import ProductLists from '../productLists/productLists'
import rateLimit from '../../modules/rate-limit.js'

export const upsertOrder = new ValidatedMethod({
  name: 'orders.upsert',
  validate: Orders.schema.validator(),
  run({order, productId}) {
    const orderId = order._id
    delete order._id
    return Orders.upsert({ _id: orderId }, { $set: order })
   // if (orderId)ProductLists.upsert ({_id:productId},{ $push:{orderId}})

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

rateLimit({
  methods: [
    upsertOrder,
    removeOrder,
  ],
  limit: 5,
  timeRange: 1000,
})
