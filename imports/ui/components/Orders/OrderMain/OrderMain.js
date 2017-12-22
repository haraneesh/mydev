import React from 'react';
import { Panel, Col, Glyphicon } from 'react-bootstrap';
import PropTypes from 'prop-types';

import './OrderMain.scss';

class OrderMain extends React.Component {
  constructor(props) {
    super(props);
  }

    return (
        <div className="OrderMain">
            <Row>
            <Col xs={12}>
                <h3 className="page-header"> { formHeading }
              { this.displayCancelOrderButton(this.props.order_status) }
             </h3>
             { this.displayProductsAndSubmit(submitButtonName) }
            </Col>
            </Row>
        </div>
    );
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
