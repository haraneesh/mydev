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
          Suvai is closed on Friday, 19th for casting our valuable votes.
        </small>
        <br />
        <small>
          So,
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
            Friday
            {' '}
          </span>
          19
          <sup>th</sup>
         {/* {' '}
          to
          <span style={{ color: '#EF0905' }}>
            {' '}
            Wednesday
            {' '}
          </span>
          17
          <sup>th</sup>
          {' ' }
      Friday.*/}
        </small>
      </Alert>
    )
  );
}

export default ReturnAlerts;
