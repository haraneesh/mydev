import { Meteor } from 'meteor/meteor';
import React, { useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';

function ReturnAlerts() {
  const [alertHTML, setAlertHTML] = useState('<div></div>');

  useEffect(() => {
    if (Meteor.settings.public.ShowAlerts) {
      Meteor.call('utility.getAlertHTML', (error, alrtHTML) => {
        if (!error) {
          setAlertHTML(alrtHTML);
        }
      });
    }
  }, []);

  return (
    Meteor.settings.public.ShowAlerts && (
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
        <div
          className="Content"
          dangerouslySetInnerHTML={{ __html: alertHTML }}
        />
      </Alert>
    )
  );
}

export default ReturnAlerts;
