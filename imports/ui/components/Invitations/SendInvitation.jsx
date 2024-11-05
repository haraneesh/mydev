import { Meteor } from 'meteor/meteor';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';

import { formValChange, formValid } from '../../../modules/validate';

export default function SendInvitation() {
  const [isError, setIsError] = useState({
    whMobilePhone: '',
  });

  async function sendInvitation(phoneNumber) {

    try{
    const getJoinLink = await Meteor.callAsync('invitation.getInvitation', phoneNumber);
    const msg = encodeURI(`${Meteor.settings.public.MessageInvitation} ${getJoinLink}`);
    const handle = window.open(`https://wa.me/91${phoneNumber}?text=${msg}`);
    if (!handle){
      toast.error('We are unable to launch a new window, please check your browser settings and try again.');
    }
    } catch(error) {
      toast.error(error.reason);
    }
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
            <Row className="my-3">
              <label> Mobile Phone Number </label>
              <Form.Control
                type="tel"
                name="whMobilePhone"
                placeholder="9889899888"
                pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}"
              />
              {isError.whMobilePhone.length > 0 && (
              <span className="bg-white text-danger">{isError.whMobilePhone}</span>
              )}
            </Row>
            <Button type="submit" onClick={handleSubmit}> Invite </Button>
          </form>
        </Col>
      </Row>
    </div>
  );
}
