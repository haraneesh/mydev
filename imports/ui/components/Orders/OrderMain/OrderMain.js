import React from 'react';
import { Row, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';

import './OrderMain.scss';

class OrderMain extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="OrderMain">
              <h4> Your Previous Order </h4>
              <h4> Recommended Products </h4>
              <h4> Specials</h4>

      </div>
    );
  }
}

OrderMain.propTypes = {
  products: PropTypes.array.isRequired,
  orderId: PropTypes.string,
  order_status: PropTypes.string,
  comments: PropTypes.string,
  total_bill_amount: PropTypes.number,
  history: PropTypes.object.isRequired,
};

export default OrderMain;
