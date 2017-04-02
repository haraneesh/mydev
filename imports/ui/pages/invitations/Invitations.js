import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import InvitationList from '../../containers/invitations/InvitationList';

const Invitations = () => (
  <div className="Invitations">
    <Row>
      <Col xs={ 12 }>
        <div className="page-header clearfix">
          <h3 className="pull-left">Invitations</h3>
          <Button
            bsStyle="primary"
            className="pull-right"
            href="/invitations/new"
          >Send Invitation</Button>
        </div>
        <InvitationList />
      </Col>
    </Row>
  </div>
);

export default Invitations;
