import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import Invitations from '../../../api/invitations/invitations';
import InvitationList from '../../components/invitations/InvitationList';
import Loading from '../../components/Loading';

const composer = (params, onData) => {
  const subscription = Meteor.subscribe('invitations.list');
  if (subscription.ready()) {
    const invitations = Invitations.find().fetch();
    onData(null, { invitations });
  }
};

export default composeWithTracker(composer, Loading)(InvitationList);
