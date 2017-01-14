import { Meteor } from 'meteor/meteor'
import { composeWithTracker } from 'react-komposer'
import Orders from '../../../api/orders/orders';
import ViewOrderDetails from '../../components/orders/ViewOrderDetails'
import Loading from '../../components/Loading'

const composer = ({ params }, onData) => {
  debugger;
  const subscription = Meteor.subscribe('orders.view', params._id)
   if (subscription.ready()) {
      const order = Orders.findOne();
      onData(null, { order });
    }
}
export default composeWithTracker(composer, Loading)(ViewOrderDetails);
