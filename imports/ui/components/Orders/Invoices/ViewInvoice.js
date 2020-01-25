import React from 'react';
import { Row, Col, Panel, PanelGroup } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { Bert } from 'meteor/themeteorchef:bert';
import { formatMoney } from 'accounting-js';
import { getInvoice } from '../../../../api/Invoices/methods';
import { accountSettings } from '../../../../modules/settings';
import { displayUnitOfSale } from '../../../../modules/helpers';
import Loading from '../../Loading/Loading';

const DisplayOrderProducts = ({ products, total }) => (
  <PanelGroup className="order-details-products">
    <Panel>
      <Row>
        <Col xs={4}> <strong> Name </strong></Col>
        <Col xs={3} className="text-right-xs"> <strong> Rate </strong></Col>
        <Col xs={2} className="text-right-xs"> <strong> Qty </strong></Col>
        <Col xs={3} className="text-right"> <strong> Value </strong></Col>
      </Row>
    </Panel>
    {products.map((product) => {
      if (product.item_total > 0) {
        return (
          <Panel key={product.item_id}>
            <Row>
              <Col xs={4}>
                {`${product.name}, ${product.unit}`}<br />
                <small> {product.description} </small>
              </Col>
              <Col xs={3} className="text-right-xs">
                {`${formatMoney(product.rate, accountSettings)}`}
              </Col>
              <Col xs={2} className="text-right-xs">
                {`${displayUnitOfSale(product.quantity, product.unit)}`}
              </Col>
              <Col xs={3} className="text-right">
                {formatMoney(
                  product.rate * product.quantity,
                  accountSettings,
                )}
              </Col>
            </Row>
          </Panel>
        );
      }
    })}
    <Panel>
      <Row>
        <Col xs={12} className="text-right"> Amount:  <strong> {'  '} {formatMoney(total, accountSettings)} {'  '}</strong></Col>
      </Row>
    </Panel>
  </PanelGroup>
);

class ViewInvoice extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = { invoice: {} };
  }

  componentDidMount() {
    const invoiceId = this.props.invoiceId;

    getInvoice.call({ invoiceId }, (error, invoice) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        this.setState({ invoice });
      }
    });
  }

  render() {
    const invoice = this.state.invoice;
    return invoice.status ? (
      <div className="orderDetails">
        <Row>
          <Col xs={12}>
            <h4>
              {invoice.invoice_number} - <span className="text-muted"> {invoice.status} </span>
            </h4>
            { invoice.line_items && <DisplayOrderProducts products={invoice.line_items} total={invoice.total} /> }
          </Col>
        </Row>
        <div>
          {invoice.balance > 0 && <div className="panel-footer">
            <Row className="text-right">
              <Col xs={12}> 
                  <strong> 
                    {`Pending : ${ formatMoney(invoice.balance, accountSettings) }`}
                </strong>
              </Col>
            </Row>
          </div>}
        </div>
      </div>
    ) :
    (<Loading />);
  }
}

ViewInvoice.propTypes = {
  invoiceId: PropTypes.string.isRequired,
};

export default ViewInvoice;
