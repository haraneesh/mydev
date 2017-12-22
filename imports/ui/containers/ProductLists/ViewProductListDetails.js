import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';
import ProductLists from '../../../api/ProductLists/ProductLists';
import ViewProductListDetails from '../../components/ProductLists/ViewProductListDetails';
import Loading from '../../components/Loading/Loading';

const composer = ({ match, history }, onData) => {
  const subscription = Meteor.subscribe('productList.view', match.params._id);

  if (subscription.ready()) {
    const productList = ProductLists.findOne();
    onData(null, { productList, history });
  }
};

export default composeWithTracker(composer, Loading)(ViewProductListDetails);
