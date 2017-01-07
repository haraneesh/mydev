import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import ProductLists from './productLists'
import Products  from '../../api/products/products'
import rateLimit from '../../modules/rate-limit'


export const upsertProductList = new ValidatedMethod({
  name: 'productLists.upsert',
  validate: new SimpleSchema({
    _id:{ type: String, optional:true},
    activeStartDateTime: { type: Date },
    activeEndDateTime: { type: Date },
  }).validator(),
  run(params) {
    if (!Roles.userIsInRole(this.userId, ['admin'])) {
      // user not authorized. do not publish secrets
      throw new Meteor.Error(403, "Access denied")
    }

    const startDate = params.activeStartDateTime
    const endDate = params.activeEndDateTime

    const overlappingProductList = ProductLists.findOne(
        {  $or: [
              { activeStartDateTime: { $gte: startDate ,  $lte: endDate }  },
              { activeEndDateTime: { $gte: startDate ,  $lte: endDate }  },
              ]
        },
      )

    if (overlappingProductList){
      throw new Meteor.Error(417, " Another Product List is active during this period. Product List was not created." )
    }

    const OrderableProducts = Products.find({availableToOrder: true}).fetch()
    const productListsId = params._id

    const productList = {
      activeStartDateTime: params.activeStartDateTime,
      activeEndDateTime: params.activeEndDateTime,
      products:OrderableProducts,
    }
    return ProductLists.upsert({ _id: productListsId }, { $set: productList })
  },
})

export const removeProductList = new ValidatedMethod({
  name: 'productLists.remove',
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  run({ _id }) {
    if (Roles.userIsInRole(this.userId, ['view-secrets','admin'])) {
      ProductLists.remove(_id)
    } else {
      // user not authorized. do not publish secrets
      throw new Meteor.Error(403, "Access denied")
    }
  },
})

export const updateProductListWithOrderId = new ValidatedMethod({
  name: 'productLists.updateProductListWithOrderId',
  validate: new SimpleSchema({
    orderId: { type: String },
    productListId: { type: String },
  }).validator(),
  run({ orderId, productListId }) {
      ProductLists.update( { _id:productListId }, { $addToSet:{ order_ids:orderId } })
  },
})


rateLimit({
  methods: [
    upsertProductList,
    removeProductList,
  ],
  limit: 5,
  timeRange: 1000,
})
