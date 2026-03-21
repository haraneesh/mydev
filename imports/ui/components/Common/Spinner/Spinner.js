import React from 'react';
// import './Spinner.scss';

function Spinner() {
  return (
    <span className="spinner-border spinner-border-sm mx-2" role="status" aria-hidden="true" />
  );
  /* return (
    <svg className="spinner ms-1" viewBox="0 0 50 50">
      <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5" />
    </svg>
  ); */
}

export default Spinner;
