import { Meteor } from 'meteor/meteor';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import {
  Button, FormGroup, ControlLabel, FormControl, Col, Row,
} from 'react-bootstrap';
import { formValChange, formValid } from '../../../modules/validate';

export default function SendInvitation() {
  const [isError, setIsError] = useState({
    whMobilePhone: '',
  });

  function sendInvitation(phoneNumber) {
    Meteor.call('invitation.getInvitation', phoneNumber, (error, getJoinLink) => {
      if (error) {
        toast.error(error.reason);
      } else {
        const msg = encodeURI(`${Meteor.settings.public.MessageInvitation} ${getJoinLink}`);
        window.open(`https://wa.me/91${phoneNumber}?text=${msg}`);
      }
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const phoneNumber = document.querySelector('input[name="whMobilePhone"]').value;

    const newErrorState = formValChange({ target: { name: 'whMobilePhone', value: phoneNumber } }, isError);
    setIsError(newErrorState.isError);

    if (formValid({ ...newErrorState })) {
      sendInvitation(phoneNumber);
    }
  }

  return (
    <div className="send-invitation offset-sm-1">
      <Row>
        <Col xs={12} sm={6} md={4}>
          <form
            name="form-send-Invitation"
            className="form-send-invitation"
            onSubmit={(event) => { event.preventDefault(); }}
          >
            <FormGroup>
              <ControlLabel> Mobile Phone Number </ControlLabel>
              <FormControl
                type="tel"
                name="whMobilePhone"
                placeholder="9889899888"
                pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}"
              />
              {isError.whMobilePhone.length > 0 && (
              <span className="control-label">{isError.whMobilePhone}</span>
              )}
            </FormGroup>
            <Button type="submit" bsStyle="primary" onClick={handleSubmit}> Invite </Button>
          </form>
        </Col>
      </Row>
    </div>
  );
}
