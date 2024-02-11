import { Meteor } from 'meteor/meteor';
import React from 'react';
import Alert from 'react-bootstrap/Alert';

const highLightText = (textToHighLight) => (
  <span style={{ color: '#EF0905' }}>
    {` ${textToHighLight} `}
  </span>
);

function ReturnAlerts() {
  return (
    (Meteor.settings.public.ShowAlerts) && (
      <Alert
        variant="light"
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
          Wish you and your family a very Happy Pongal.
        </small>
        <br />
        <small>
          On account of Pongal celebrations,
          there will be
          <span style={{ color: '#EF0905' }}>
            {' '}
            no
            {' '}
          </span>
          {' '}
          deliveries from
          <span style={{ color: '#EF0905' }}>
            {' '}
            Sunday
            {' '}
          </span>
          14
          <sup>th</sup>
          {' '}
          to
          <span style={{ color: '#EF0905' }}>
            {' '}
            Wednesday
            {' '}
          </span>
          17
          <sup>th</sup>
          {' ' }
          January.
        </small>
      </Alert>
    )
  );
}

export default ReturnAlerts;
