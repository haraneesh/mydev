import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ShowInterest() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/about');
  }, []);

  return <div className="ShowInterest"> At Show Interest Page </div>;
}

export default ShowInterest;
