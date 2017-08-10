import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';
import Specials from '../../../api/Specials/Specials';
import EditAllSpecials from '../../pages/Specials/EditAllSpecials';
import { Loading } from '../../components/Loading/Loading';

const composer = (params, onData) => {
  const subscription = Meteor.subscribe('specials.list');

  if (subscription.ready()) {
    const specials = Specials.find().fetch();
    onData(null, { specials, history: params.history });
  }
};

export default composeWithTracker(composer, Loading)(EditAllSpecials);
