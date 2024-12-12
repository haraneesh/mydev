import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';
import { Orders } from '../../../api/Orders/Orders';
import ManageAllOrders from '../../components/ProductsAdmin/ManageAllOrders';
import { Loading } from '../../components/Loading/Loading';
import constants from '../../../modules/constants';

const composer = (params, onData) => {
  const subscription = Meteor.subscribe('orders.list');

  if (subscription.ready()) {
    const orders = Orders.find({}, { sort: { createdAt: constants.Sort.DESCENDING } }).fetch();
    onData(null, { orders });
  }
};

export default composeWithTracker(composer, Loading)(ManageAllOrders);
