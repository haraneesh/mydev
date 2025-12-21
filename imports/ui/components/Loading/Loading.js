import React from 'react';

import './Loading.scss';

const Loading = () => {
  return (
    <div className="Loader-Container">
      <div className="Loader-Bar" />
      <div className="Loader-Content">
        <h2 style={{ color: '#976A4B' }}>Suvai Loading...</h2>
      </div>
    </div>
  );
};

export default Loading;
