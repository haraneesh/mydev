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
          Dear Suvaineers,
          {' '}
          <br />
          Wish you and your family a very happy Deepavali.
        </small>
        <br />
        <small>
          On account of celebrations,
          there will be
          <span style={{ color: '#EF0905' }}>
            {' '}
            no
            {' '}
          </span>
          {' '}
          deliveries on
          <span style={{ color: '#EF0905' }}>
            {' '}
            Monday
            {' '}
          </span>
          24
          <sup>th</sup>
          {' '}
          and
          <span style={{ color: '#EF0905' }}>
            {' '}
            Tuesday
            {' '}
          </span>
          25
          <sup>th</sup>
         {' '}
          Oct.
        </small>
      </Alert>
    )
  );
}

export default ReturnAlerts;
