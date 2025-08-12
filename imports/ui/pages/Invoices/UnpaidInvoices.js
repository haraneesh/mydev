import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { formatMoney } from 'accounting-js';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Alert from 'react-bootstrap/Alert';
import Loading from '/imports/ui/components/Loading/Loading';
import { FaChevronRight } from 'react-icons/fa';
import { accountSettings } from '/imports/modules/settings';

const UnpaidInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnpaidInvoices = async () => {
      try {
        setLoading(true);
        const result = await Meteor.callAsync('invoices.getUnpaidInvoices');
        const unpaidInvoices = result || [];
        setInvoices(unpaidInvoices);
        // Select all invoices by default
        setSelectedInvoices(unpaidInvoices.map(invoice => invoice._id));
      } catch (error) {
        console.error('Error fetching unpaid invoices:', error);
        toast.error('Failed to load unpaid invoices. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUnpaidInvoices();
  }, []);

  const handleSelectInvoice = (invoiceId, isChecked) => {
    setSelectedInvoices(prev => 
      isChecked 
        ? [...prev, invoiceId] 
        : prev.filter(id => id !== invoiceId)
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedInvoices(invoices.map(invoice => invoice._id));
    } else {
      setSelectedInvoices([]);
    }
  };

  const calculateTotal = () => {
    return invoices
      .filter(invoice => selectedInvoices.includes(invoice._id))
      .reduce((sum, invoice) => sum + (invoice.total || 0), 0);
  };

  const handlePaySelected = async () => {
    if (selectedInvoices.length === 0) {
      toast.warning('Please select at least one invoice to pay.');
      return;
    }

    if (window.confirm(`Are you sure you want to pay the selected ${selectedInvoices.length} invoice(s)?`)) {
      try {
        setProcessing(true);
        const result = await Meteor.callAsync('invoices.payInvoices', { invoiceIds: selectedInvoices });
        
        if (result.success) {
          toast.success('Payment processed successfully!');
          // Refresh the list
          const updatedInvoices = await Meteor.callAsync('invoices.getUnpaidInvoices');
          setInvoices(updatedInvoices || []);
          setSelectedInvoices([]);
        } else {
          throw new Error(result.error || 'Payment failed');
        }
      } catch (error) {
        console.error('Error processing payment:', error);
        toast.error(error.reason || error.message || 'Failed to process payment. Please try again.');
      } finally {
        setProcessing(false);
      }
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <Container fluid>
      <h2 className="px-2 pt-4 text-center">Unpaid Invoices</h2>
      <Row className="my-4 bg-body">
        <Col xs={12}>
          {invoices.length === 0 ? (
            <Alert variant="info" className="text-center">
              You don't have any unpaid invoices.
            </Alert>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <Form.Check
                          type="checkbox"
                          checked={selectedInvoices.length === invoices.length && invoices.length > 0}
                          onChange={handleSelectAll}
                          className="m-0"
                        />
                      </th>
                      <th>Date</th>
                      <th>Balance</th>
                      <th>Amount</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice._id} className="align-middle">
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={selectedInvoices.includes(invoice._id)}
                            onChange={(e) => handleSelectInvoice(invoice._id, e.target.checked)}
                            className="m-0"
                          />
                        </td>
                        <td>
                          {new Date(invoice.date).toLocaleDateString()}
                        </td>
                        <td>
                          {formatMoney(invoice.balance || invoice.total || 0, accountSettings)}
                        </td>
                        <td>
                          {formatMoney(invoice.total || 0, accountSettings)}
                        </td>
                        <td>
                          <Button 
                            variant="link" 
                            size="sm" 
                            onClick={() => navigate(`/invoices/${invoice.invoice_id}`)}
                            className="p-0 text-muted"
                          >
                            <FaChevronRight />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              
              {selectedInvoices.length > 0 && (
                <div className="p-3 pb-0 rounded">
                  <Row className="align-items-center">
                    <Col md={8}>
                      <h5 className="mb-0">
                        {selectedInvoices.length} invoice(s) selected
                      </h5>
                    </Col>
                    <Col md={4} className="text-md-end">
                      <h5 className="mb-0">
                        Total: {formatMoney(calculateTotal(), accountSettings)}
                      </h5>
                    </Col>
                  </Row>
                </div>
              )}
              
              {invoices.length > 0 && (
                <div className="d-flex justify-content-end m-2">
                  <Button
                    variant="primary"
                    onClick={handlePaySelected}
                    disabled={selectedInvoices.length === 0 || processing}
                  >
                    {processing ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Processing...
                      </>
                    ) : (
                      `Pay Selected (${selectedInvoices.length})`
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default UnpaidInvoices;
