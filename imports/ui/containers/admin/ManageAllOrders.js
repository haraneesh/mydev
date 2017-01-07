import { composeWithTracker } from 'react-komposer'
import Orders from '../../../api/orders/orders'
import ManageAllOrders from '../../components/products-admin/ManageAllOrders'
import { Loading } from '../../components/Loading'
import { Meteor } from 'meteor/meteor'
import constants from '../../../modules/constants'

const composer = (params, onData) => {

  const subscription = Meteor.subscribe('orders.list')

  if (subscription.ready()) {
        const orders = Orders.find({}, {sort: { createdAt: constants.Sort.DESCENDING }}).fetch()
        onData(null, { orders })
    }
}

export default composeWithTracker(composer, Loading)(ManageAllOrders)
