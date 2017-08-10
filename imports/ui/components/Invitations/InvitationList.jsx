import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Button, Alert, Badge, Panel } from 'react-bootstrap';
import constants from '../../../modules/constants';
import { removeInvitation } from '../../../api/Invitations/methods';

const _handleRevokeInvitation = (e, invitationId) => {
  event.preventDefault();
  if (confirm('Are you sure about revoking this invitation? This is permanent.')) {
    removeInvitation.call({
      _id: invitationId,
    }, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Invitation has been revoked', 'success');
      }
    });
  }
};

const InvitationList = ({ invitations }) => {
  let rowList;
  if (invitations.length > 0) {
    rowList = invitations.map(({ _id, email, invitation_status }) => (
      <Row key={`invitation-${_id}`}>
        <Col sm={6} xs={12}> <b>{email}</b>
        </Col>
        <Col sm={3} xs={6}> <Badge> {invitation_status} </Badge>
        </Col>
        <Col sm={3} xs={6}>
          <p>
            {
          (invitation_status === constants.InvitationStatus.Sent.name) ?
            <Button bsSize="small" onClick={e => _handleRevokeInvitation(e, _id)}> Revoke </Button> : ' '
          }
          </p>
        </Col>
      </Row>
        ),
    );

    return (
      <Panel>
        { rowList }
      </Panel>
    );
  }
  return (<Alert bsStyle="info">You are yet to invite your friends.</Alert>);
};

InvitationList.propTypes = {
  invitations: PropTypes.array,
};

export default InvitationList;
