import React from 'react';
import { browserHistory } from 'react-router'
import { Bert } from 'meteor/themeteorchef:bert';
import { sendInvitation  } from '../../../api/invitations/methods'
import { Button, FormGroup, ControlLabel, FormControl, Col, Row  } from 'react-bootstrap';

const validateSendInvitationForm = ( onSuccess ) => {
      $('form[name="form-send-Invitation"]').validate({
        rules: {
            name:{
                required:true,
            },
            email: {
                required: true,
                email:true
            },
        },
        messages: {
            name:{
                required: 'Please enter the name of the invitee'
            },
            email: {
                required: 'Please enter a valid email id.',
                email: "An email address must be in the format of name@domain.com"
            },
        },
        submitHandler() { onSuccess() },
    });
  }

export default class SendInvitation extends React.Component {
   constructor (props, context){
     super(props, context)
     this.handleSubmit = this.handleSubmit.bind(this)
     this.sendInvitation = this.sendInvitation.bind(this)
  }

  componentDidMount() {
      setTimeout(() => { $('input[name="name"]').focus(); }, 0);
  }

  handleSubmit(event) {
    validateSendInvitationForm( this.sendInvitation );
  }
  
  sendInvitation(){

    const invitation = {
        name: $('input[name="name"]').val(),
        email: $('input[name="email"]').val()
    }

    sendInvitation.call(invitation, (error, success) => {
        if (error) {
           Bert.alert(error.reason, 'danger');
        } else {  
           const message = `${invitation.name} has been invited!`
           Bert.alert(message, 'success')
           browserHistory.push('/invitations')
        }
    });
  }

  render(){
    return(
        <div className="send-invitation">
          <Row>
            <Col xs={ 12 } sm={ 6 } md={ 4 }>
                <form
                    name = "form-send-Invitation"
                    className="form-send-invitation"
                    onSubmit = { (event)=>{event.preventDefault()} }
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
                <Button type="submit" bsStyle="primary"  onClick={ this.handleSubmit }>Invite</Button>
                </form>
            </Col>
          </Row>
        </div>
   )
 }
}

