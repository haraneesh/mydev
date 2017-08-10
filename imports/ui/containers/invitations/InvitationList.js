import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import Invitations from '../../../api/Invitations/Invitations';
import InvitationList from '../../components/Invitations/InvitationList';
import Loading from '../../components/Loading/Loading';

const composer = (params, onData) => {
  const subscription = Meteor.subscribe('invitations.list');
  if (subscription.ready()) {
    const invitations = Invitations.find().fetch();
    onData(null, { invitations, history: params.history });
  }
};

export default composeWithTracker(composer, Loading)(InvitationList);
