import { formatMoney } from 'accounting-js';
import PropTypes from 'prop-types';
import React from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { displayUnitOfSale } from '../../../../modules/helpers';
import { accountSettings } from '../../../../modules/settings';

// Format date string to a readable format
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateString; // Return the raw string if date parsing fails
  }
};

const DisplayOrderProducts = ({ products, total }) => (
  <Row className="order-details-products px-sm-4">
    <Row className="py-2">
      <Col xs={4}>
        <strong> Name </strong>
      </Col>
      <Col xs={3} className="text-right-xs">
        <strong> Rate </strong>
      </Col>
      <Col xs={2} className="text-right-xs">
        <strong> Qty </strong>
      </Col>
      <Col xs={3} className="text-right">
        <strong> Value </strong>
      </Col>
    </Row>
    {products.map((product) => {
      if (product.item_total > 0) {
        return (
          <Row key={product.item_id} className="py-2">
            <Col xs={4}>
              {`${product.name}, ${product.unit}`}
              <br />
            </Col>
            <Col xs={3} className="text-right-xs">
              {`${formatMoney(product.rate, accountSettings)}`}
            </Col>
            <Col xs={2} className="text-right-xs">
              {`${displayUnitOfSale(product.quantity, product.unit)}`}
            </Col>
            <Col xs={3} className="text-right">
              {formatMoney(product.rate * product.quantity, accountSettings)}
            </Col>
          </Row>
        );
      }
    })}

    <Row className="py-3 pe-2">
      <Col xs={12} className="text-right">
        Amount: <strong>{formatMoney(total, accountSettings)}</strong>
      </Col>
    </Row>
  </Row>
);



const ViewInvoice = ({ invoice }) => (
  <div>
    <h2 className="py-4 ps-2">
    {formatDate(invoice.date)}
    </h2>

  <div>
    <div className="card ">
      <div className="card-body">
        {/* Header with invoice number and status */}
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h3 className="h3 mb-2">Invoice #{invoice.invoice_number}</h3>
          </div>
          
          <span 
            className={`badge ${
              invoice.status === 'paid' 
                ? 'bg-success' 
                : invoice.status === 'unpaid' 
                  ? 'bg-warning text-dark' 
                  : 'bg-danger'
            }`}
          >
            {invoice.status?.toUpperCase() || 'UNKNOWN'}
          </span>
        </div>

        {/* Due date */}
        {invoice.due_date && (
          <p className=" mb-4">
            <i className="bi bi-calendar-check me-2"></i>
            Due: {formatDate(invoice.due_date)}
          </p>
        )}

        {/* Invoice content */}
        <div className="mt-4">
          {invoice.line_items && (
            <>
              <DisplayOrderProducts
                products={invoice.line_items}
                total={invoice.total}
              />

            </>
          )}
        </div>
      </div>
    </div>
  </div>
  </div>
);

ViewInvoice.propTypes = {
  invoice: PropTypes.object.isRequired,
};

export default ViewInvoice;
