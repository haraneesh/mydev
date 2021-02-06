import React from 'react';
import { toast } from 'react-toastify';
import {
  Button, FormGroup, ControlLabel, FormControl, Col, Row,
} from 'react-bootstrap';
import { sendInvitation } from '../../../api/Invitations/methods';

const validateSendInvitationForm = (onSuccess) => {
  $('form[name="form-send-Invitation"]').validate({
    rules: {
      name: {
        required: true,
      },
      email: {
        required: true,
        email: true,
      },
    },
    messages: {
      name: {
        required: 'Please enter the name of the invitee',
      },
      email: {
        required: 'Please enter a valid email id.',
        email: 'An email address must be in the format of name@domain.com',
      },
    },
    submitHandler() { onSuccess(); },
  });
};

export default class SendInvitation extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.sendInvitation = this.sendInvitation.bind(this);
  }

  handleSubmit(event) {
    validateSendInvitationForm(this.sendInvitation);
  }

  sendInvitation() {
    const invitation = {
      name: document.querySelector('input[name="name"]').value,
      email: document.querySelector('input[name="email"]').value,
    };

    sendInvitation.call(invitation, (error, success) => {
      if (error) {
        toast.error(error.reason);
      } else {
        const message = `${invitation.name} has been invited!`;
        toast.success(message);
        this.props.history.push('/invitations');
      }
    });
  }

  render() {
    return (
      <div className="send-invitation">
        <Row>
          <Col xs={12} sm={6} md={4}>
            <form
              name="form-send-Invitation"
              className="form-send-invitation"
              onSubmit={(event) => { event.preventDefault(); }}
            >
              <FormGroup>
                <ControlLabel>Name</ControlLabel>
                <FormControl
                  type="text"
                  ref="name"
                  name="name"
                  placeholder="Divya Kumari"
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel> Email </ControlLabel>
                <FormControl
                  type="email"
                  ref="email"
                  name="email"
                  placeholder="divyaKumari@gmail.com"
                />
              </FormGroup>
              <Button type="submit" bsStyle="primary" onClick={this.handleSubmit}>Invite</Button>
            </form>
          </Col>
        </Row>
      </div>
    );
  }
}
