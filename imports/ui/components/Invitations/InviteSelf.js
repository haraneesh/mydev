import { Meteor } from 'meteor/meteor';
import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import OtpInput from 'react-otp-input';
import { toast } from 'react-toastify';
import { formValChange, formValid } from '../../../modules/validate';
import Spinner from '../Common/Spinner/Spinner';

import { useNavigate } from 'react-router-dom';

export default function InviteSelf({ history }) {
  const defaultErrorState = {
    whMobilePhone: '',
    otp: '',
  };
  const [isError, setIsError] = useState(defaultErrorState);
  const [otpValue, setOTPValue] = useState('');
  const [isSendingSMSInProgress, setSendingSMSInProgress] = useState(false);
  const [isOTPValidationInProgress, setOTPValidationInProgress] =
    useState(false);
  const navigate = useNavigate();

  function sendInvitation(event) {
    // send fast2sms
    event.preventDefault();
    const phoneNumber = document.querySelector(
      'input[name="whMobilePhone"]',
    ).value;

    const newErrorState = formValChange(
      { target: { name: 'whMobilePhone', value: phoneNumber } },
      defaultErrorState,
    );
    setIsError(newErrorState.isError);

    if (formValid({ ...newErrorState })) {
      setSendingSMSInProgress(true);
      Meteor.call('invitation.sendOTP', phoneNumber, (error, result) => {
        if (error || result !== true) {
          toast.error(error.reason);
        } else {
          toast.success('OTP has been sent to your mobile number');
        }
        setSendingSMSInProgress(false);
      });
    }
  }

  function confirmOTP(event) {
    event.preventDefault();

    const newErrorState = formValChange(
      { target: { name: 'otp', value: otpValue } },
      defaultErrorState,
    );
    setIsError(newErrorState.isError);

    if (formValid({ ...newErrorState })) {
      setOTPValidationInProgress(true);
      Meteor.call('invitation.isValidOTP', otpValue, (error, result) => {
        if (error) {
          toast.error(error.reason);
        } else {
          navigate(`/invitations/${result.token}/`);
          // toast.success('OTP has been sent to your phone number');
        }
        setOTPValidationInProgress(false);
      });
    }
  }

  function updateOTPVal(otp) {
    setOTPValue(otp);
  }

  return (
    <div className="send-invitation">
      <Row>
        <Col xs={12}>
          <Row>
            <Form.Label>
              {' '}
              STEP 1. Enter Mobile Number to receive OTP{' '}
            </Form.Label>
            <p />
            <Form.Control
              type="tel"
              name="whMobilePhone"
              placeholder="10 digit number, example 9889899888"
              pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}"
            />
            {isError.whMobilePhone.length > 0 && (
              <span className="bg-white text-danger">
                {isError.whMobilePhone}
              </span>
            )}
            <p />
            <Button type="submit" variant="default" onClick={sendInvitation}>
              Send OTP {isSendingSMSInProgress && <Spinner />}
            </Button>
          </Row>
          <hr />
          <Row>
            <Form.Label>
              STEP 2. Enter OTP that was last sent to your Mobile Number
            </Form.Label>
            <p />

            <OtpInput
              value={otpValue}
              onChange={updateOTPVal}
              numInputs={4}
              isInputNum
              inputStyle={{ width: '3em', height: '3em' }}
              separator={<span>&nbsp;</span>}
            />

            {isError.otp.length > 0 && (
              <span className="bg-white text-danger">{isError.otp}</span>
            )}
            <p />
            <Button type="submit" variant="primary" onClick={confirmOTP}>
              Verify OTP {isOTPValidationInProgress && <Spinner />}
            </Button>
          </Row>
          <Row>
            <Col xs={12} className="text-center">
              <h4>
                <p>Do you have any questions?</p>
                <p>send us a Whatsapp Message or call us at </p>
                <a href="tel:+919361032849" className="text-primary">
                  +91 9361032849
                </a>
              </h4>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}
