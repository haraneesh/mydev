import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import DisplayProductLists from '../../components/ProductLists/ProductLists';
import ProductLists from '../../../api/ProductLists/ProductLists';
import { Loading } from '../components/Loading/Loading';
import constants from '../../../modules/constants';

const composer = (params, onData) => {
  const subscription = Meteor.subscribe('productLists.list');
  if (subscription.ready()) {
    const productLists = ProductLists.find({},
      { sort: { activeStartDateTime: constants.Sort.DESCENDING } }).fetch();
    onData(null, { productLists, history: params.history });
  }
};

export default composeWithTracker(composer, Loading)(DisplayProductLists);
