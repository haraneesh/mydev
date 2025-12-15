import React from 'react';
import PropTypes from 'prop-types';
import ListGroupItem from 'react-bootstrap/ListGroupItem';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const InvoiceListItem = ({ invoice }) => {
  const statusColors = {
    paid: 'success',
    unpaid: 'warning',
    draft: 'secondary',
    overdue: 'danger',
    sent: 'info',
    'partially_paid': 'primary',
    'viewed': 'info',
  };

  const formatDate = (dateString) => {
    try {
      // Use native formatting instead of date-fns which was crashing
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Get the invoice ID, falling back to _id if invoice_id is not available
  const invoiceId = invoice.invoice_id || invoice._id;
  
  // Safely get the status, defaulting to 'unknown' if not available
  const status = (invoice.status || 'unknown').toLowerCase();
  
  // Format the date, falling back to current date if not available
  const displayDate = formatDate(invoice.date || invoice.createdAt || new Date());
  
  // Format the amount, defaulting to 0 if not available
  const displayAmount = formatCurrency(invoice.total || 0);

  return (
    <ListGroupItem className="p-3">
      <Link 
        to={`/invoices/${invoiceId}`} 
        className="text-decoration-none text-dark d-block"
      >
        <Row className="align-items-center g-0">
          <Col xs={4} md={3} className="pe-2">
            <span 
              className={`badge bg-${statusColors[status] || 'secondary'} text-capitalize`}
              style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block', maxWidth: '100%' }}
            >
              {status.replace(/_/g, ' ')}
            </span>
          </Col>
          <Col xs={4} md={4} className="text-truncate pe-2">
            {displayDate}
          </Col>
          <Col xs={3} md={4} className="text-end pe-2">
            {displayAmount}
          </Col>
          <Col xs={1} className="text-end">
            <FaChevronRight className="text-muted" />
          </Col>
        </Row>
      </Link>
    </ListGroupItem>
  );
};

InvoiceListItem.propTypes = {
  invoice: PropTypes.shape({
    _id: PropTypes.string,
    invoice_id: PropTypes.string,
    status: PropTypes.string,
    date: PropTypes.oneOfType([
      PropTypes.string, 
      PropTypes.instanceOf(Date)
    ]),
    createdAt: PropTypes.oneOfType([
      PropTypes.string, 
      PropTypes.instanceOf(Date)
    ]),
    total: PropTypes.number,
    customer: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
    }),
  }).isRequired,
};

export default InvoiceListItem;
