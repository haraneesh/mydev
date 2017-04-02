import React from 'react';
import { Button, Alert, Table, Panel } from 'react-bootstrap';
import constants from '../../../modules/constants'

const InvitationList = ({ invitations }) => {
  
  let rowList
  if (invitations.length > 0){
      rowList = invitations.map( ({_id, email, invitation_status }) => (
          <tr>
            <td className = "text-left text-middle"><a href={`/invitations/${_id}`}> {email} </a></td>
            <td className = "text-left text-middle">{invitation_status}</td>
            <td>{ (invitation_status === constants.InvitationStatus.Sent.name)? <Button bsSize= "small" > Revoke </Button> : " " } </td>
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
  invitations: React.PropTypes.array,
};

export default InvitationList;
