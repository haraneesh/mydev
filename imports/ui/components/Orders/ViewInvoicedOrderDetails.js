import 'moment-timezone';
import React from 'react';
import { Meteor } from 'meteor/meteor';
import moment from 'moment';
import PropTypes from 'prop-types';
import {
  Row, Col, Label, Panel,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { dateSettings } from '../../../modules/settings';
import constants from '../../../modules/constants';
import ViewInvoice from './Invoices/ViewInvoice';
import NotInvoiced from './Invoices/NotInvoiced';
import Loading from '../Loading/Loading';

class ViewInvoicedOrderDetails extends React.Component {
  constructor(props, context) {
    super(props, context);
    const { order } = this.props;
    const orderedNotInvoicedProductsHash = {};

    order.products.forEach((product) => {
      if (product.zh_item_id) {
        orderedNotInvoicedProductsHash[product.zh_item_id] = product;
      }
    });
    this.state = { order, orderedNotInvoicedProductsHash, obtainedInvoices: [] };
  }

  componentDidMount() {
    const { invoices } = this.props.order;
    const invoiceIds = invoices.map((invoice) => invoice.zhInvoiceId);
    Meteor.call('invoices.getAll', invoiceIds, (error, obtainedInvoices) => {
      if (error) {
        toast.error(error.reason);
        // toast.error(error.reason);
      } else {
        const { orderedNotInvoicedProductsHash } = this.state;
        obtainedInvoices.forEach((obtainedInvoice) => {
          obtainedInvoice.line_items.forEach((item) => {
            delete orderedNotInvoicedProductsHash[item.item_id];
          });
        });
        this.setState({ obtainedInvoices, orderedNotInvoicedProductsHash });
      }
    });
  }

  render() {
    const { order } = this.props;
    const { obtainedInvoices, orderedNotInvoicedProductsHash } = this.state;
    const itemIds = Object.keys(orderedNotInvoicedProductsHash);

    if (obtainedInvoices.length > 0) {
      const viewInvoiceComponents = obtainedInvoices.map((obtainedInvoice) => (
        <ViewInvoice
          invoice={obtainedInvoice}
          key={obtainedInvoice.invoice_id}
          updateProductInvoiced={this.productOrderedButNotInvoiced}
        />
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
          {((itemIds.length > 0) && (
          <Panel>
            <Col xs={12}>
              <h4>Not Delivered</h4>
            </Col>
            <NotInvoiced
              orderedNotInvoicedProductsHash={orderedNotInvoicedProductsHash}
              itemIds={itemIds}
            />
          </Panel>
          ))}
        </div>
      );
    }

    return (<Loading />);
  }
}

ViewInvoicedOrderDetails.propTypes = {
  order: PropTypes.object.isRequired,
};

export default ViewInvoicedOrderDetails;
