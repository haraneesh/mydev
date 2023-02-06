import React from 'react';
import SendInvitation from '../../components/Invitations/SendInvitation';

const NewInvitation = ({ history }) => (
  <div className="send-invitation ps-1">
    <h3 className="py-4 offset-sm-1">Send Invitation</h3>
    <SendInvitation message=" new invitation " history={history} />
  </div>
);

export default NewInvitation;
