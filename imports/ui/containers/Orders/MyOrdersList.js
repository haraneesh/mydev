import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import Orders from '../../../api/Orders/Orders';
import MyOrderList from '../../components/Orders/MyOrdersList/MyOrdersList';
import { Loading } from '../../components/Loading/Loading';
import constants from '../../../modules/constants';

const composer = (params, onData) => {
  const subscription = Meteor.subscribe('orders.mylist');

  if (subscription.ready()) {
    const orders = Orders.find(
      {},
      { sort: { createdAt: constants.Sort.DESCENDING } },
    ).fetch();
    onData(null, {
      orders,
      history: params.history,
      loggedInUser: params.loggedInUser,
    });
  }
};


export default composeWithTracker(composer, Loading)(MyOrderList);
