import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';
import { Orders } from '../../../api/Orders/Orders';
import ProductsOrderList from '../../components/Orders/ProductsOrderList';
import Loading from '../../components/Loading/Loading';

/* const composer = ({ match }, onData) => {
  const subscription = Meteor.subscribe('orders.view', match.params._id)
   if (subscription.ready()) {
      const order = Orders.findOne();
      onData(null, { order });
    }
}

export default composeWithTracker(composer, Loading)(ProductsOrderList);*/
