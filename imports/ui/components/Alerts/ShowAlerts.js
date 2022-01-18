import { Meteor } from 'meteor/meteor';
import React from 'react';
import { Alert } from 'react-bootstrap';

const highLightText = (textToHighLight) => (
  <span style={{ color: '#EF0905' }}>
    {` ${textToHighLight} `}
  </span>
);

function ReturnAlerts() {
  return (
    (Meteor.settings.public.ShowAlerts) && (
      <Alert
        bsStyle="danger"
        style={{
          color: '#3a2d29',
          margin: '0px',
          padding: '10px 5px',
          borderBottom: '5px solid #FF6D00',
          borderLeftWidth: '0px',
          textAlign: 'center',
        }}
      >
        <small>
          {' '}
          Wishing Suvaineers a very happy and healthy Pongal!
        </small>
        <br />
        <small>
          Since farmers celebrate Pongal grandly,
          <br />
          There will be
          <span style={{ color: '#EF0905' }}>
            {' '}
            no
            {' '}
          </span>
          {' '}
          deliveries from
          <span style={{ color: '#EF0905' }}>
            {' '}
            Friday
            {' '}
          </span>
          14th Jan up to, including
          <span style={{ color: '#EF0905' }}>
            {' '}
            Monday
            {' '}
          </span>
          17th Jan.
        </small>
      </Alert>
    )
  );
}

export default ReturnAlerts;
