import 'moment-timezone';
import React from 'react';
import { Meteor } from 'meteor/meteor';
import moment from 'moment';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';

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
        <div className="ViewOrderDetails container-fluid">
          <Row>
            { viewInvoiceComponents }
          </Row>
          {((itemIds.length > 0) && (
          <Row className="bg-white p-2">
            <hr />
            <Col xs={12} className="py-2 px-sm-4">
              <h4 className="text-info"><b>NOT DELIVERED</b></h4>
            </Col>
            <NotInvoiced
              orderedNotInvoicedProductsHash={orderedNotInvoicedProductsHash}
              itemIds={itemIds}
            />
          </Row>
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
