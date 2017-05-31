import React from 'react';
import { Button, Alert, Table, Panel } from 'react-bootstrap';
import constants from '../../../modules/constants'
import { removeInvitation } from '../../../api/invitations/methods.js'
import PropTypes from 'prop-types'

const _handleRevokeInvitation = (e, invitationId) =>{
    event.preventDefault()
   if (confirm('Are you sure about revoking this invitation? This is permanent.')) {
    removeInvitation.call({
      _id: invitationId,
    }, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger')
      } else {
        Bert.alert('Invitation has been revoked', 'success')
      }
    })
  }
}

const InvitationList = ({ invitations }) => {
  
  let rowList
  if (invitations.length > 0){
      rowList = invitations.map( ({_id, email, invitation_status }) => (
          <tr>
            <td className = "text-left text-middle"> {email}</td>
            <td className = "text-left text-middle">{invitation_status}</td>
            <td>{ (invitation_status === constants.InvitationStatus.Sent.name)? <Button bsSize= "small" onClick = {(e)=> _handleRevokeInvitation(e, _id)}> Revoke </Button> : " " } </td>
          </tr>
        )
      )

      return(
         <Panel>
            <Table striped bordered condensed hover>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
              { rowList }
              </tbody>
            </Table>
         </Panel>
    )
  } else {
    return (<Alert bsStyle="info">You are yet to invite your friends.</Alert>)
  }
}

InvitationList.propTypes = {
  invitations: PropTypes.array,
};

export default InvitationList;
