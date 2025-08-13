import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { formatMoney } from 'accounting-js';
import InputGroup from 'react-bootstrap/InputGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import { formValChange } from '../../../modules/validate';
import PayTMButton from '../../components/Payments/PayTM/PayTMButton';
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
import { FaChevronRight, FaCheckCircle, FaWallet, FaCreditCard, FaRupeeSign, FaQrcode, FaExternalLinkAlt } from 'react-icons/fa';
import Modal from 'react-bootstrap/Modal';
import { accountSettings } from '/imports/modules/settings';
import PropTypes from 'prop-types';

const UnpaidInvoices = ({ loggedInUser, userWallet }) => {
  // State for payment amount input
  const [walletState, setWalletState] = useState({
    amountToChargeInRs: '0',
    isError: { amountToChargeInRs: '' },
    gateWayFee: 0,
  });
  const [textValue, setTextValue] = useState('0');

  // Handle amount input change
  const amountToChargeOnChange = (value) => {
    const { isError } = walletState;
    const e = {
      target: {
        name: 'amountToChargeInRs',
        value: value.toString(),
      },
    };

    setTextValue(value);

    const newErrorState = formValChange(e, { ...isError });

    const newWalletState = { ...walletState };

    newWalletState.amountToChargeInRs = e.target.value;
    newWalletState.isError = newErrorState.isError;
    newWalletState.gateWayFee = calculateGateWayFee(e.target.value);

    setWalletState(newWalletState);
  };

  // Calculate gateway fee
  const calculateGateWayFee = (amount) => {
    const amt = parseFloat(amount) || 0;
    return Math.ceil(amt * 2.3) / 100; // 2.3% fee
  };

  // Calculate total amount of selected invoices
  const calculateTotal = () => {
    if (!invoices || !selectedInvoices || selectedInvoices.length === 0) return 0;
    
    return invoices
      .filter(invoice => selectedInvoices.includes(invoice._id))
      .reduce((sum, invoice) => {
        const amount = parseFloat(invoice.amount) || parseFloat(invoice.total) || 0;
        return sum + amount;
      }, 0)
      .toFixed(2);
  };
  

  
  // Format currency with proper type handling
  const formatCurrency = (amount) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return formatMoney(numericAmount || 0, accountSettings);
  };
  
  // Get payment amount as number
  const getPaymentAmount = (withFee = false) => {
    const minAmount = calculateTotal();
    const enteredAmount = parseFloat(customAmount);
    const baseAmount = (customAmount && !isNaN(enteredAmount) && enteredAmount >= minAmount) 
      ? enteredAmount 
      : minAmount;
    return withFee ? calculateTotalWithFee(baseAmount) : baseAmount;
  };
  
  // Check if custom amount is valid
  const isCustomAmountValid = () => {
    if (!customAmount) return true; // Use default amount if no custom amount
    const amount = parseFloat(customAmount);
    return !isNaN(amount) && amount >= calculateTotal();
  };
  
  // Calculate total with gateway fee (2.3%)
  const calculateTotalWithFee = (baseAmount = null) => {
    const total = baseAmount !== null ? parseFloat(baseAmount) : parseFloat(calculateTotal());
    const fee = Math.ceil(total * 2.3) / 100;
    return parseFloat((total + fee).toFixed(2));
  };
  
  // Format payment amount as string
  const getPaymentAmountString = (withFee = false) => {
    return withFee ? calculateTotalWithFee().toString() : calculateTotal().toString();
  };

  // Function to fetch unpaid invoices
  const fetchUnpaidInvoices = async () => {
    try {
      setLoading(true);
      const result = await Meteor.callAsync('invoices.getUnpaidInvoices');
      const unpaidInvoices = result || [];
      setInvoices(unpaidInvoices);
      setSelectedInvoices(unpaidInvoices.map(invoice => invoice._id));
    } catch (error) {
      console.error('Error fetching unpaid invoices:', error);
      toast.error('Failed to load unpaid invoices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle payment success
  const paymentResponseSuccess = (result) => {
    toast.success('Payment has been successfully processed');
    setShowPaymentModal(false);
    // Refresh the invoices list
    fetchUnpaidInvoices();
  };

  const [invoices, setInvoices] = useState([]);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showFee, setShowFee] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
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



  const handlePayClick = () => {
    if (selectedInvoices.length === 0) {
      toast.warning('Please select at least one invoice to pay.');
      return;
    }
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    try {
      setProcessing(true);
      const amountToPay = parseFloat(customAmount) || calculateTotal();
      
      if (isNaN(amountToPay) || amountToPay < calculateTotal()) {
        toast.error('Please enter a valid amount greater than or equal to the minimum required');
        setProcessing(false);
        return;
      }
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
      <Modal 
        show={showPaymentModal} 
        onHide={() => !processing && setShowPaymentModal(false)} 
        centered
        size="lg"
      >
        <Modal.Header closeButton={!processing} closeVariant={processing ? 'white' : undefined}>
        </Modal.Header>
        <Modal.Body className="p-4">
          {/* Payment Summary */}
          <div className="text-center mb-4">
            <FaCheckCircle size={48} className="text-success mb-3" />
            <h4 className="mb-3">Payment Summary</h4>
            <div className="d-flex justify-content-center align-items-center mb-3">
              <span className="h3 mb-0 me-2">Rs</span>
              <input
                type="number"
                className="form-control form-control-lg text-center d-inline-block"
                style={{ maxWidth: '200px' }}
                min={calculateTotal()}
                step="10"
                value={customAmount || calculateTotal()}
                onChange={(e) => setCustomAmount(e.target.value)}
                onFocus={(e) => e.target.select()}
              />
            </div>
            <p className="small mb-2">
              {selectedInvoices.length} invoice(s) selected 
            </p>
            <p className="small">
              <span className={parseFloat(customAmount || calculateTotal()) < parseFloat(calculateTotal()) ? 'text-danger' : 'text-muted'}>
                Minimum: {formatCurrency(calculateTotal())}
              </span>
            </p>
          </div>

          {/* Payment Methods */}
          <div className="payment-methods mt-4">
            {/* Scan and Pay with any UPI App */}
            <Card className="mb-3">
              <Card.Body>
                <Row className="align-items-center">
                  <Col xs={12} md={8}>
                    <h6 className="mb-2">
                      <FaQrcode className="me-2 text-primary" />
                      Scan and Pay with any UPI App
                    </h6>
                    <p className="text-muted small mb-0">
                      Scan the QR code with any UPI app to complete your payment.
                      Please note it may take up to 2 business days to reflect in your account.
                    </p>
                  </Col>
                  <Col xs={12} md={4} className="mt-3 mt-md-0 text-center">
                    <div className="d-flex flex-column align-items-center">
                      <img 
                        src="/pay/scan-pay-upi.jpg" 
                        alt="Scan to Pay with UPI" 
                        className="img-fluid mb-2"
                        style={{ maxHeight: '200px' }}
                      />
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* UPI Payment Option */}
            <Card className="mb-3">
              <Card.Body>
                <Row className="align-items-center">
                  <Col xs={12} md={8}>
                    <h6 className="mb-2">
                      <FaRupeeSign className="me-2 text-primary" />
                      UPI or Debit card,<span className="underline">No fee</span>
                    </h6>
                  </Col>
                  <Col xs={12} md={4} className="mt-3 mt-md-0 text-md-end">
                    <div className="d-grid gap-2">
                      <div className="d-flex flex-column w-100">
                        <div className="mb-1 text-center">
                          {formatCurrency(getPaymentAmount(false))}
                        </div>
                        <div className="mb-1 text-center">
                        <PayTMButton
                          buttonText={
                            processing ? 'Processing...' : 'Pay via UPI'
                          }
                          showOptionsWithFee={false}
                          paymentDetails={{
                            moneyToChargeInRs: getPaymentAmount(false),
                            description: `Payment for ${selectedInvoices.length} invoice(s)`,
                            prefill: {
                              firstName: loggedInUser?.profile?.name?.first || '',
                              lastName: loggedInUser?.profile?.name?.last || '',
                              email: loggedInUser?.emails?.[0]?.address || '',
                              mobile: loggedInUser?.profile?.whMobilePhone || ''
                            },
                            cartTotalBillAmount: parseFloat(getPaymentAmount(false))
                          }}
                          paymentResponseSuccess={paymentResponseSuccess}
                          disabled={processing || !isCustomAmountValid()}
                        />
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Card/NetBanking Option */}
            <Card>
              <Card.Body>
                <Row className="align-items-center">
                  <Col xs={12} md={8}>
                    <h6 className="mb-2">
                      <FaCreditCard className="me-2 text-primary" />
                      Credit Card or NetBanking, 2.3% transaction fee 
                    </h6>
                  </Col>
                  <Col xs={12} md={4} className="mt-3 mt-md-0 text-md-end">
                    <div className="d-grid gap-2">
                      <div className="d-flex flex-column w-100">
                        <div className="mb-1 text-center">
                          {formatCurrency(getPaymentAmount(true))}
                        </div>
                        <div className="mb-1 text-center">
                        <PayTMButton
                          buttonText={
                            processing ? 'Processing...' : 'Pay By Card'
                          }
                          showOptionsWithFee={true}
                          paymentDetails={{
                            moneyToChargeInRs: getPaymentAmount(true),
                            description: `Payment for ${selectedInvoices.length} invoice(s)`,
                            prefill: {
                              firstName: loggedInUser?.profile?.name?.first || '',
                              lastName: loggedInUser?.profile?.name?.last || '',
                              email: loggedInUser?.emails?.[0]?.address || '',
                              mobile: loggedInUser?.profile?.whMobilePhone || ''
                            },
                            cartTotalBillAmount: parseFloat(getPaymentAmount(true))
                          }}
                          paymentResponseSuccess={paymentResponseSuccess}
                          disabled={processing || !isCustomAmountValid()}
                        />
                        </div>
                        </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </div>
        </Modal.Body>
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
