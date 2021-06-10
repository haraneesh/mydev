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
    (Meteor.settings.public.ShowReturnBottles) && (
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
        Gentle reminder, please return
        {' '}
        {highLightText('all glass bottles')}
        {' '}
        and
        {' '}
        {highLightText('crates')}
        {' '}
        to the delivery person.
      </small>
    </Alert>
    )
  );
}

export default ReturnAlerts;
