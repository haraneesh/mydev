import React from 'react';
import SendInvitation from '../../components/Invitations/SendInvitation';

const NewInvitation = ({ history }) => (
  <div className="send-invitation">
    <h3 className="page-header">Send Invitation</h3>
    <SendInvitation message=" new invitation " history={history} />
  </div>
);

export default NewInvitation;
