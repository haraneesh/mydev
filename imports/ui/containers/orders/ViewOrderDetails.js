import { Meteor } from 'meteor/meteor'
import { composeWithTracker } from 'react-komposer'
import Orders from '../../../api/orders/orders';
import ProductsOrderList from '../../components/orders/ProductsOrderList'
import Loading from '../../components/Loading'

/*const composer = ({ params }, onData) => {
  const subscription = Meteor.subscribe('orders.view', params._id)
   if (subscription.ready()) {
      const order = Orders.findOne();
      onData(null, { order });
    }
}

export default composeWithTracker(composer, Loading)(ProductsOrderList);*/
