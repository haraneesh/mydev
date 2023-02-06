import React from 'react';
import Alert from 'react-bootstrap/Alert';

const NotFound = () => (
  <div className="NotFound py-4 offset-sm-1 col-sm-10">
    <Alert variant="warning">
      <p>
        <strong>Error [404]</strong>
        :
        {' '}
        {window.location.pathname}
        {' '}
        does not exist.
      </p>
    </Alert>
  </div>
);

export default NotFound;
