import React from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Alert from 'react-bootstrap/Alert';
import { toast } from 'react-toastify';
import constants from '../../../modules/constants';
//import { removeInvitation } from '../../../api/Invitations/methods';

const _handleRevokeInvitation = async (e, invitationId) => {
  event.preventDefault();
  if (confirm('Are you sure about revoking this invitation? This is permanent.')) {
     
      try {
        const data = await Meteor.callAsync('invitations.remove',{_id:invitationId}); 
        toast.success('Invitation has been revoked');
        // render data
      } catch (error) {
        // render error
        toast.error(error.reason);
      }
  }
};

const InvitationList = ({ invitations }) => {
  let rowList;
  if (invitations.length > 0) {
    rowList = invitations.map(({ _id, email, invitation_status }) => (
      <Row key={`invitation-${_id}`}>
        <Col sm={6} xs={12}>
          {' '}
          <b>{email}</b>
        </Col>
        <Col sm={3} xs={6}>
          {' '}
          <Badge>
            {' '}
            {invitation_status}
            {' '}
          </Badge>
        </Col>
        <Col sm={3} xs={6}>
          <p>
            {
          (invitation_status === constants.InvitationStatus.Sent.name)
            ? <Button size="sm" onClick={(e) => _handleRevokeInvitation(e, _id)}> Revoke </Button> : ' '
          }
          </p>
        </Col>
      </Row>
    ));

    return (
      <Row>
        { rowList }
      </Row>
    );
  }
  return (<Alert variant="info">You are yet to invite your friends.</Alert>);
};

InvitationList.propTypes = {
  invitations: PropTypes.array,
};

export default InvitationList;
