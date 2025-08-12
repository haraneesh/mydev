import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
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
import Spinner from 'react-bootstrap/Spinner';
import Loading from '/imports/ui/components/Loading/Loading';
import { FaChevronRight, FaCheckCircle, FaWallet } from 'react-icons/fa';
import Modal from 'react-bootstrap/Modal';
import { accountSettings } from '/imports/modules/settings';
import PropTypes from 'prop-types';

const UnpaidInvoices = ({ loggedInUser, userWallet }) => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
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

  const handlePayClick = () => {
    if (selectedInvoices.length === 0) {
      toast.warning('Please select at least one invoice to pay.');
      return;
    }
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    setShowPaymentModal(false);
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
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <Container fluid>
      {/* Wallet Balance Section */}
      <Row className="my-4">
        <Col xs={12} md={8} lg={6} className="mx-auto">
          <Card className="mb-4">
            <Card.Body className="p-3">
              <Row className="align-items-center">
                {/* Left Column - Wallet Icon */}
                <Col xs="auto" className="pe-0">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                    <FaWallet className="text-primary" size={24} />
                  </div>
                </Col>
                
                {/* Right Column - Due Amount and Wallet Balance */}
                <Col className="ps-3 ps-sm-6">
                  {userWallet?.outstanding_receivable_amount_InPaise > 0 ? (
                    <>
                      <Row className="mb-2 g-0">
                        <Col xs={6} className="pe-2">
                          <span className="fw-medium">Due Amount:</span>
                        </Col>
                        <Col xs={6} className="text-end">
                          <span className="fw-medium">
                            {formatMoney(userWallet.outstanding_receivable_amount_InPaise / 100, accountSettings)}
                          </span>
                        </Col>
                      </Row>
                      
                      <Row className="mb-2 g-0">
                        <Col xs={6} className="pe-2">
                          <span className="fw-medium">Wallet Balance:</span>
                        </Col>
                        <Col xs={6} className="text-end">
                          <span className={userWallet?.balance < 0 ? 'text-danger' : ''}>
                            {userWallet ? formatMoney(userWallet.balance || 0, accountSettings) : formatMoney(0, accountSettings)}
                          </span>
                        </Col>
                      </Row>
                      
                      <Row className="mb-0 g-0 border-top pt-2">
                        <Col xs={6} className="pe-2">
                          <span className="fw-bold">Balance Due:</span>
                        </Col>
                        <Col xs={6} className="text-end">
                          <span className={userWallet.outstanding_receivable_amount_InPaise > ((userWallet.balance || 0)  * 100) ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                            {formatMoney(
                              Math.max(0, userWallet.outstanding_receivable_amount_InPaise / 100 - ((userWallet.balance || 0))), 
                              accountSettings
                            )}
                          </span>
                        </Col>
                      </Row>
                    </>
                  ) : (
                    <Row className="mb-0 g-0">
                      <Col xs={6} className="pe-2">
                        <span className="fw-medium">Wallet Balance:</span>
                      </Col>
                      <Col xs={6} className="text-end">
                        <span className={userWallet?.balance < 0 ? 'text-danger' : ''}>
                          {userWallet ? formatMoney(userWallet.balance || 0, accountSettings) : formatMoney(0, accountSettings)}
                        </span>
                      </Col>
                    </Row>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h2 className="px-2 pt-2 text-center">Unpaid Invoices</h2>
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
                    variant="secondary"
                    onClick={handlePayClick}
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

      {/* Payment Confirmation Modal */}
      <Modal show={showPaymentModal} onHide={() => !processing && setShowPaymentModal(false)} centered>
        <Modal.Header closeButton={!processing} closeVariant={processing ? 'white' : undefined}>
          <Modal.Title>Confirm Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <FaCheckCircle size={48} className="text-success mb-3" />
            <h4>Payment Summary</h4>
            <p className="text-muted">You are about to pay the following amount:</p>
            <h2 className="my-3">{formatMoney(calculateTotal(), accountSettings)}</h2>
            <p className="text-muted small">
              {selectedInvoices.length} invoice(s) selected
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowPaymentModal(false)}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirmPayment}
            disabled={processing}
          >
            {processing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Processing...
              </>
            ) : 'Confirm Payment'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

UnpaidInvoices.propTypes = {
  loggedInUser: PropTypes.object.isRequired,
  userWallet: PropTypes.object,
};

export default withTracker(() => {
  const userWallet = Meteor.subscribe('users.userWallet');
  const user = Meteor.user();
  
  return {
    loggedInUser: user,
    userWallet: user?.wallet || { balance: 0 },
  };
})(UnpaidInvoices);
