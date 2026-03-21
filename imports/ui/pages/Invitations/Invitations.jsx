import React from 'react';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InvitationList from '../../containers/Invitations/InvitationList';

const Invitations = ({ history }) => (
  <div className="Invitations">
    <Row>
      <Col xs={12}>
        <div className="py-4 ps-2 clearfix">
          <h2 className="pull-left col-7" style={{ display: 'inline-flex' }}>Invitations</h2>
          <Button
            variant="secondary"
            className="pull-right"
            href="/invitations/new"
          >
            Send Invitation

          </Button>
        </div>
        <InvitationList history={history} />
      </Col>
    </Row>
  </div>
);

export default Invitations;
