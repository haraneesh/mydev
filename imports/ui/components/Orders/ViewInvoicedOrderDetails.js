import React from 'react';
import { Row, Col, Label, Pager, Panel } from 'react-bootstrap';
import moment from 'moment';
import 'moment-timezone';
import PropTypes from 'prop-types';
import { dateSettings } from '../../../modules/settings';
import constants from '../../../modules/constants';
import ViewInvoice from './Invoices/ViewInvoice';

class ViewInvoicedOrderDetails extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.goBack = this.goBack.bind(this);
    this.state = { order: this.props.order };
  }

  goBack(e) {
    e.preventDefault();
    this.props.history.goBack();
  }

  render() {
    const order = this.props.order;

    const viewInvoiceComponents = order.invoices.map(({ zhInvoiceId }) => (
      <ViewInvoice invoiceId={zhInvoiceId} key={zhInvoiceId} />
    ));

    return (
      <div className="ViewOrderDetails ">
        <div className="page-header">
          <Row>
            <Col xs={12}>
              <h3 className="pull-left">
                {' '}
                {moment(order.createdAt)
                  .tz(dateSettings.timeZone)
                  .format(dateSettings.format)}
                {' '}
              </h3>
            </Col>
          </Row>
        </div>
        <Panel>
          
            <Col xs={12}>
              <Label bsStyle={constants.OrderStatus[order.order_status].label}>
                {constants.OrderStatus[order.order_status].display_value}
              </Label>
            </Col>
          
          { viewInvoiceComponents }
        </Panel>
        <Pager>
          <Pager.Item previous onClick={this.goBack}>← Back</Pager.Item>
        </Pager>
      </div>
    );
  }
}

ViewInvoicedOrderDetails.propTypes = {
  order: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default ViewInvoicedOrderDetails;
