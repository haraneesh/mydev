import React from 'react';
import Col from 'react-bootstrap/Col';
import SendInvitation from '../../components/Invitations/InviteSelf';

const InviteSelf = ({ history }) => (
  <div className="SignUp Absolute-Center is-Responsive offset-sm-1">
    <Col xs={12} sm={6} md={5} lg={4}>
      <h2 className="py-4">Sign up</h2>
      <SendInvitation message="Confirm your mobile" history={history} />
    </Col>
  </div>
);

export default InviteSelf;
