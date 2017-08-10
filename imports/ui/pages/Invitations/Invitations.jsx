import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import InvitationList from '../../containers/Invitations/InvitationList';

const Invitations = ({ history }) => (
  <div className="Invitations">
    <Row>
      <Col xs={12}>
        <div className="page-header clearfix">
          <h3 className="pull-left">Invitations</h3>
          <Button
            bsStyle="primary"
            className="pull-right"
            href="/invitations/new"
          >Send Invitation</Button>
        </div>
        <InvitationList history={history} />
      </Col>
    </Row>
  </div>
);

export default Invitations;
