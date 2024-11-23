import React from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
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
    submitHandler() {
      onSuccess();
    },
  });
};

class SendInvitation extends React.Component {
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
        this.props.navigate('/invitations');
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
              onSubmit={(event) => {
                event.preventDefault();
              }}
            >
              <Row>
                <label>Name</label>
                <Form.Control
                  type="text"
                  ref="name"
                  name="name"
                  placeholder="Divya Kumari"
                />
              </Row>
              <Row>
                <label> Email </label>
                <Form.Control
                  type="email"
                  ref="email"
                  name="email"
                  placeholder="divyaKumari@gmail.com"
                />
              </Row>
              <Button
                type="submit"
                variant="primary"
                onClick={this.handleSubmit}
              >
                Invite
              </Button>
            </form>
          </Col>
        </Row>
      </div>
    );
  }
}

export default function (props) {
  const navigate = useNavigate();
  return <SendInvitation {...props} navigate={navigate} />;
}
