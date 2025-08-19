import PropTypes from 'prop-types';
import React from 'react';
import { Card, Col, Modal, Row } from 'react-bootstrap';
import {
  FaCheckCircle,
  FaCreditCard,
  FaQrcode,
  FaRupeeSign,
} from 'react-icons/fa';
import PayTMButton from '../PayTM/PayTMButton';

const PaymentConfirmationModal = ({
  show,
  onHide,
  processing,
  calculateTotal,
  formatCurrency,
  getPaymentAmount,
  isCustomAmountValid,
  paymentResponseSuccess,
  selectedInvoicesCount,
  loggedInUser,
  customAmount,
  setCustomAmount,
  invoicesToPay,
}) => {
  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header
        closeButton={!processing}
        closeVariant={processing ? 'white' : undefined}
      ></Modal.Header>
      <Modal.Body className="p-4">
        {/* Payment Summary */}
        <div className="text-center mb-4">
          <FaCheckCircle size={48} className="text-success mb-3" />
          <h4 className="mb-3">Payment Summary</h4>
          <h6 className="mb-2">Surplus payments will be saved in your wallet for your next purchase.</h6>
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
              disabled={processing}
            />
          </div>
          <p className="small mb-2">
            {selectedInvoicesCount} invoice(s) selected
          </p>
          <p className="small">
            <span
              className={
                parseFloat(customAmount || calculateTotal()) <
                parseFloat(calculateTotal())
                  ? 'text-danger'
                  : 'text-muted'
              }
            >
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
                <Col xs={12} md={7}>
                  <h6 className="mb-2">
                    <FaQrcode className="me-2 text-primary" />
                    Scan and Pay with any UPI App
                  </h6>
                  <p className="text-muted small mb-0">
                    Scan the QR code with any UPI app to complete your payment.
                    Please note it may take up to 2 business days to reflect in
                    your account.
                  </p>
                </Col>
                <Col xs={12} md={5} className="mt-3 mt-md-0 text-center">
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
                <Col xs={12} md={7}>
                  <h6 className="mb-2">
                    <FaRupeeSign className="me-2 text-primary" />
                    UPI or Debit card, <span className="underline">No fee</span>
                  </h6>
                </Col>
                <Col xs={12} md={5} className="mt-3 mt-md-0 text-md-end">
                  <div className="d-grid gap-2">
                    <div className="d-flex flex-column w-100">
                      <div className="mb-1 text-center">
                        {formatCurrency(getPaymentAmount(false))}
                      </div>
                      <div className="mb-1 text-center">
                        <PayTMButton
                          buttonText={
                            processing ? 'Processing...' : 'Pay UPI, DEBIT CARD'
                          }
                          invoicesToPay={invoicesToPay}
                          showOptionsWithFee={false}
                          paymentDetails={{
                            moneyToChargeInRs: getPaymentAmount(false),
                            description: `Payment for ${selectedInvoicesCount} invoice(s)`,
                            prefill: {
                              firstName:
                                loggedInUser?.profile?.name?.first || '',
                              lastName: loggedInUser?.profile?.name?.last || '',
                              email: loggedInUser?.emails?.[0]?.address || '',
                              mobile:
                                loggedInUser?.profile?.whMobilePhone || '',
                            },
                            cartTotalBillAmount: parseFloat(
                              getPaymentAmount(false),
                            ),
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
                <Col xs={12} md={7}>
                  <h6 className="mb-2">
                    <FaCreditCard className="me-2 text-primary" />
                    Credit Card or NetBanking, <br/>
                    <span className="ps-4"> 2.3% transaction fee</span>
                  </h6>
                </Col>
                <Col xs={12} md={5} className="mt-3 mt-md-0 text-md-end">
                  <div className="d-grid gap-2">
                    <div className="d-flex flex-column w-100">
                      <div className="mb-1 text-center">
                        {formatCurrency(getPaymentAmount(true))}
                      </div>
                      <div className="mb-1 text-center">
                        <PayTMButton
                          buttonText={
                            processing ? 'Processing...' : 'Pay NET, CREDIT CARD '
                          }
                          invoicesToPay={invoicesToPay}
                          showOptionsWithFee={true}
                          paymentDetails={{
                            moneyToChargeInRs: getPaymentAmount(true),
                            description: `Payment for ${selectedInvoicesCount} invoice(s)`,
                            prefill: {
                              firstName:
                                loggedInUser?.profile?.name?.first || '',
                              lastName: loggedInUser?.profile?.name?.last || '',
                              email: loggedInUser?.emails?.[0]?.address || '',
                              mobile:
                                loggedInUser?.profile?.whMobilePhone || '',
                            },
                            cartTotalBillAmount: parseFloat(
                              getPaymentAmount(true),
                            ),
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
  );
};

PaymentConfirmationModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  processing: PropTypes.bool.isRequired,
  calculateTotal: PropTypes.func.isRequired,
  formatCurrency: PropTypes.func.isRequired,
  getPaymentAmount: PropTypes.func.isRequired,
  isCustomAmountValid: PropTypes.func.isRequired,
  paymentResponseSuccess: PropTypes.func.isRequired,
  selectedInvoicesCount: PropTypes.number.isRequired,
  loggedInUser: PropTypes.object.isRequired,
  customAmount: PropTypes.string,
  setCustomAmount: PropTypes.func.isRequired,
};

export default PaymentConfirmationModal;
