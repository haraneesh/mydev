import { composeWithTracker } from 'react-komposer'
import Orders from '../../../api/orders/orders'
import MyOrderList from '../../components/orders/MyOrdersList'
import { Loading } from '../../components/Loading'
import { Meteor } from 'meteor/meteor'
import constants from '../../../modules/constants'

const composer = (params, onData) => {
    const subscription = Meteor.subscribe('orders.mylist', function(){
        const orders = Orders.find({}, {sort: { createdAt: constants.Sort.DESCENDING }}).fetch()
        onData(null, { orders })
    })
}

export default composeWithTracker(composer, Loading)(MyOrderList)
