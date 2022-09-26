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
          Wish you a very happy Ganapathy Pooja.
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
            Wednesday
            {' '}
          </span>
          31
          <sup>st</sup>
          {' '}
          Aug.
          {/* and
          <span style={{ color: '#EF0905' }}>
            {' '}
            Thursday
            {' '}
          </span>
      1st Sept. */}
        </small>
      </Alert>
    )
  );
}

export default ReturnAlerts;
