import { formatMoney } from 'accounting-js';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import Table from 'react-bootstrap/Table';
import {
  FaCheckCircle,
  FaChevronRight,
  FaCreditCard,
  FaExternalLinkAlt,
  FaQrcode,
  FaRupeeSign,
  FaWallet,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { accountSettings } from '/imports/modules/settings';
import Loading from '/imports/ui/components/Loading/Loading';
import { formValChange } from '../../../modules/validate';
import { calculateGateWayFee } from '../../../modules/both/walletHelpers';
import PaymentConfirmationModal from '../../components/Payments/AcceptPayFromUnPaidInvoices/PaymentConfirmationModal';
import PayTMButton from '../../components/Payments/PayTM/PayTMButton';

const UnpaidInvoices = ({ walletLoading, loggedInUser, userWallet }) => {
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

  // Pay from wallet: apply available credits/payments to selected invoices
  const handlePayFromWallet = async () => {
    if (selectedInvoices.length === 0) {
      toast.warning('Please select at least one invoice to pay.');
      return;
    }
    try {
      setProcessing(true);
      const invoicesPayload = invoices
        .filter((invoice) => selectedInvoices.includes(invoice._id))
        .map((inv) => ({
          invoice_id: inv.invoice_id,
          amount: Number(inv.balance) || 0,
        }))
        .filter((x) => x.invoice_id && x.amount > 0);

      if (invoicesPayload.length === 0) {
        toast.info('No payable amount found for selected invoices.');
        setProcessing(false);
        return;
      }

      const res = await Meteor.callAsync('payments.payFromWallet', {
        invoices: invoicesPayload,
      });

      if (res?.message === 'success') {
        toast.success('Wallet payment applied successfully');
      } else {
        toast.info(res?.message || 'Completed with messages');
      }
    } catch (error) {
      console.error('Pay from wallet failed:', error);
      toast.error(error?.reason || error?.message || 'Failed to pay from wallet');
    } finally {
      // Always refresh invoices after completion; wallet updates via subscription
      await fetchUnpaidInvoices();
      setProcessing(false);
    }
  };


  // Calculate total amount of selected invoices
  const calculateTotal = () => {
    if (!invoices || !selectedInvoices || selectedInvoices.length === 0)
      return 0;

    return invoices
      .filter((invoice) => selectedInvoices.includes(invoice._id))
      .reduce((sum, invoice) => {
        const amount =
          parseFloat(invoice.balance) || 0;
        return sum + amount;
      }, 0)
      .toFixed(2);
  };

  // Format currency with proper type handling
  const formatCurrency = (amount) => {
    const numericAmount =
      typeof amount === 'string' ? parseFloat(amount) : amount;
    return formatMoney(numericAmount || 0, accountSettings);
  };

  // Get payment amount as number
  const getPaymentAmount = (withFee = false) => {
    const minAmount = calculateTotal();
    const enteredAmount = parseFloat(customAmount);
    const baseAmount =
      customAmount && !isNaN(enteredAmount) && enteredAmount >= minAmount
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
    const total =
      baseAmount !== null
        ? parseFloat(baseAmount)
        : parseFloat(calculateTotal());
    const fee = Math.ceil(total * 2.3) / 100;
    return parseFloat((total + fee).toFixed(2));
  };

  const [invoices, setInvoices] = useState([]);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showFee, setShowFee] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const navigate = useNavigate();

  // Function to fetch open invoices
  const fetchUnpaidInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const result = await Meteor.callAsync('invoices.getUnpaidInvoices');
      const unpaidInvoices = result || [];
      setInvoices(unpaidInvoices);
      // Select all invoices by default
      setSelectedInvoices(unpaidInvoices.map((invoice) => invoice._id));
      return unpaidInvoices;
    } catch (error) {
      console.error('Error fetching open invoices:', error);
      toast.error('Failed to load open invoices. Please try again.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchUnpaidInvoices();
  }, [fetchUnpaidInvoices]);

  // Handle payment success
  const paymentResponseSuccess = async (result) => {
    toast.success('Payment has been successfully processed');
    setShowPaymentModal(false);
    // Refresh the invoices list
    await fetchUnpaidInvoices();
  };

  const handleSelectInvoice = (invoiceId, isChecked) => {
    setSelectedInvoices((prev) =>
      isChecked ? [...prev, invoiceId] : prev.filter((id) => id !== invoiceId),
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedInvoices(invoices.map((invoice) => invoice._id));
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

  // Show loading state while subscription is not ready
  if (walletLoading || !userWallet) {
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
                  <div className="p-3 rounded-circle">
                    <FaWallet className="text-primary" size={48} />
                  </div>
                </Col>

                {/* Right Column - Due Amount and Wallet Balance */}
                <Col className="ps-3 ps-sm-6">
                  <>
                    {userWallet?.outstanding_receivable_amount_InPaise > 0 && (
                      <Row className="mb-2 g-0">
                        <Col xs={6} className="pe-2">
                          <span className="fw-medium">Invoice Dues:</span>
                        </Col>
                        <Col xs={6} className="text-end">
                          <span className="fw-medium text-danger">
                            {formatMoney(
                              userWallet.outstanding_receivable_amount_InPaise / 100,
                              accountSettings,
                            )}
                          </span>
                        </Col>
                      </Row>
                    )}
                    <Row className="mb-2 g-0">
                      <Col xs={6} className="pe-2">
                        <span className="fw-medium">Wallet Balance:</span>
                      </Col>
                      <Col xs={6} className="text-end">
                        <span className={userWallet?.balance < 0 ? 'text-danger' : ''}>
                          {userWallet
                            ? formatMoney(userWallet.balance || 0, accountSettings)
                            : formatMoney(0, accountSettings)}
                        </span>
                      </Col>
                    </Row>
                  </>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h2 className="px-2 pt-2 text-center">Open Invoices</h2>
      <Row className="my-4">
        <Col xs={12}>
          {invoices.length === 0 ? (
            <Alert variant="info" className="text-center">
              You don't have any open invoices.
            </Alert>
          ) : (
            <>
            <Card>
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <Form.Check
                          type="checkbox"
                          checked={
                            selectedInvoices.length === invoices.length &&
                            invoices.length > 0
                          }
                          onChange={handleSelectAll}
                          className="m-0"
                        />
                      </th>
                      <th>Date</th>
                      <th>Invoice</th>
                      <th>Balance</th>
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
                            onChange={(e) =>
                              handleSelectInvoice(invoice._id, e.target.checked)
                            }
                            className="m-0"
                          />
                        </td>
                        <td>{new Date(invoice.date).toLocaleDateString()}</td>
                        <td>{invoice.invoice_number || ''}</td>
                        <td>
                          {formatMoney(invoice.balance || 0, accountSettings)}
                        </td>
                        <td>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() =>
                              navigate(`/invoices/${invoice.invoice_id}`)
                            }
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
                <div className="p-3 rounded">
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
            </Card> 
              {invoices.length > 0 && (
                <div className="d-flex justify-content-end">
                 
                    <Button
                      variant="primary"
                      onClick={handlePayFromWallet}
                      disabled={processing || selectedInvoices.length === 0}
                      className="me-2 mt-2"
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
                        'PAY FROM WALLET'
                      )}
                    </Button>
                
                  <Button
                    variant="secondary"
                    onClick={handlePayClick}
                    disabled={processing || selectedInvoices.length === 0}
                    className="ms-2 mt-2"
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
      <PaymentConfirmationModal
        show={showPaymentModal}
        onHide={() => !processing && setShowPaymentModal(false)}
        processing={processing}
        calculateTotal={calculateTotal}
        formatCurrency={formatCurrency}
        getPaymentAmount={getPaymentAmount}
        isCustomAmountValid={isCustomAmountValid}
        paymentResponseSuccess={paymentResponseSuccess}
        selectedInvoicesCount={selectedInvoices.length}
        loggedInUser={loggedInUser}
        customAmount={customAmount}
        setCustomAmount={setCustomAmount}
        invoicesToPay={invoices
          .filter((invoice) => selectedInvoices.includes(invoice._id))
          .map(({ _id, invoice_id, balance }) => ({
            _id,
            invoice_id,
            total: parseFloat(balance) || 0,
          }))}
      />
    </Container>
  );
};

UnpaidInvoices.propTypes = {
  loggedInUser: PropTypes.object.isRequired,
  userWallet: PropTypes.object,
};

export default withTracker(() => {
  const userWalletSub = Meteor.subscribe('users.userWallet');
  const user = Meteor.user();
  const walletLoading = !userWalletSub.ready();
  
  // Calculate the wallet balance by summing unused_credits_receivable_amount_InPaise and unused_retainer_payments_InPaise
  const wallet = user?.wallet || {};
  const balanceInPaise = (wallet.unused_credits_receivable_amount_InPaise || 0) + 
                        (wallet.unused_retainer_payments_InPaise || 0);
  
  // Convert paise to rupees and create the wallet object with the calculated balance
  const userWallet = {
    ...wallet,
    balance: balanceInPaise / 100, // Convert paise to rupees
  };

  return {
    walletLoading,
    loggedInUser: user,
    userWallet,
  };
})(UnpaidInvoices);
