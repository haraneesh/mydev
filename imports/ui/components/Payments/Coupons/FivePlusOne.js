import React from 'react';
import Row from 'react-bootstrap/Row';

const FivePlusOne = () => (
  <div className="bg-body rounded border border-warning border-4 border-opacity-75 p-3">
    <Row>
      <div className="col-12 col-sm-4">
        ... Card image ...
      </div>
      <div className="col">
        <h6 className="text-warning pb-3">Your are eligible for a cash card! </h6>
        <p>Thank you for being a loyal Suvai customer.</p>
        <p>If you recharge your wallet with Rs 5000, Suvai will add another Rs 1000.</p>
        <div>
          <button type="button" className="btn btn-warning text-white px-5">
            ADD
          </button>
        </div>
      </div>
    </Row>
  </div>
);

export default FivePlusOne;
