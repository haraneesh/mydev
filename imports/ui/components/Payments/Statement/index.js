import { Meteor } from 'meteor/meteor';
import React, { useState } from 'react';
import {
  Alert, Row, Col, Panel,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import VerifyEmailAlert from '../../VerifyEmailAlert';
import constants from '../../../../modules/constants';
import Loading from '../../Loading/Loading';

const periodSelector = (name, displayValue, selectFunction) => (
  <Col xs={6} sm={4} className="rowTopSpacing">
    <div>
      <input
        type="radio"
        id={name}
        value={name}
        name="periodSelect"
        onClick={() => { selectFunction(name); }}
      />
      <label htmlFor={name}>{`${displayValue}`}</label>
    </div>
  </Col>
);

const ShowStatement = ({
  loggedInUserId, emailVerified, emailAddress, history,
}) => {
  const [isStatementstLoading, setIsLoading] = useState(false);
  const [emailSentTo, setEmailSentTo] = useState('');
  const [periodSelected, setPeriodSelected] = useState('');

  const setPeriod = (period) => {
    setPeriodSelected(period);
  };

  const sendStatement = () => {
    setIsLoading(true);
    Meteor.call('customer.sendStatement', {
      periodSelected,
    }, (error, retMessage) => {
      setIsLoading(false);
      if (error) {
        toast.error(error.reason);
      } else if (retMessage.messageType === 'EmailVerifyError') {
        toast.error(retMessage.message);
      } else {
        setEmailSentTo(retMessage.emailAddress);
      }
    });
  };

  return (
    <Panel style={{ padding: '1rem' }}>

      { (emailSentTo !== '') && (
        <Alert bsStyle="success">
          Your statement was successfully sent to
          {' '}
          <b>
            {' '}
            { emailSentTo }
          </b>
          . Please check.
        </Alert>
      )}
      <h4>
        Statement is a consolidated view of all your transactions with Suvai.
      </h4>
      {(!emailVerified) && (
        <div>
          <p>Please verify your email address to receive your statements.</p>
          <VerifyEmailAlert
            loggedInUserId={loggedInUserId}
            emailVerified={emailVerified}
            emailAddress={emailAddress}
            history={history}
          />
        </div>
      )}

      { (emailVerified) && (
        <div>
          <Row>
            { Object.keys(constants.StatementPeriod).map((period) => (
              periodSelector(
                constants.StatementPeriod[period].name,
                constants.StatementPeriod[period].display_value,
                setPeriod,
              )
            ))}
          </Row>
          <Row className="buttonRowSpacing">
            <button className="btn btn-sm btn-default" onClick={sendStatement}> Email Statement </button>
          </Row>
        </div>
      )}
      {!!isStatementstLoading && (<Loading />)}
    </Panel>
  );
};

export default ShowStatement;
