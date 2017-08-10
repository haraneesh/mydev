import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import Orders from '../../../api/Orders/Orders';
import MyOrderList from '../../components/Orders/MyOrdersList';
import { Loading } from '../../components/Loading/Loading';
import constants from '../../../modules/constants';

const composer = (params, onData) => {
  const subscription = Meteor.subscribe('orders.mylist', () => {
    const orders = Orders.find({}, { sort: { createdAt: constants.Sort.DESCENDING } }).fetch();
    onData(null, { orders, history: params.history });
  });
};

export default composeWithTracker(composer, Loading)(MyOrderList);
