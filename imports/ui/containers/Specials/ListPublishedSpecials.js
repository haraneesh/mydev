import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';
import Specials from '../../../api/Specials/Specials';
import ListSpecials from '../../pages/Specials/ListSpecials';
import { Loading } from '../../components/Loading/Loading';
import constants from '../../../modules/constants';

const composer = (params, onData) => {
  const subscription = Meteor.subscribe('specials.listPublishedStatus', constants.PublishStatus.Published.name);
  if (subscription.ready()) {
    const specials = Specials.find({}, { sort: { displayOrder: 1 } }).fetch();
    onData(null, { specials, history: params.history });
  }
};

export default composeWithTracker(composer, Loading)(ListSpecials);
