import React, { useEffect } from 'react';
import { useHistory } from 'react-router';

function ShowInterest() {
  const history = useHistory();

  useEffect(() => {
    history.push('/about');
  }, []);

  return (
    <div className="ShowInterest"> At Show Interest Page </div>
  );
}

export default ShowInterest;
