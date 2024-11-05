import React from 'react';
import { useTracker, useSubscribe } from 'meteor/react-meteor-data'; 
import Invitations from '../../../api/Invitations/Invitations';
import InvitationList from '../../components/Invitations/InvitationList';
import Loading from '../../components/Loading/Loading';

export default function (args) {
  const isLoading = useSubscribe('invitations.list');
  const invitations = useTracker(() => Invitations.find({}).fetch());
   if (isLoading()) {
    return (<Loading />);
   }

 return (<InvitationList invitations={invitations} />);
}
