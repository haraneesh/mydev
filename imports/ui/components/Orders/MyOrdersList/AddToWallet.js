import PropTypes from 'prop-types';
import React from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { FaWallet } from 'react-icons/fa';

import { formatMoney } from 'accounting-js';
import { useNavigate } from 'react-router-dom';
import { calculateWalletBalanceInRs } from '../../../../modules/both/walletHelpers';
import { accountSettings } from '../../../../modules/settings';

const formatAmount = (amount) => {
  const amountNum = typeof amount === 'number' ? amount : 0;
  return (
    <span>
      {formatMoney(amountNum / 100, accountSettings)}
    </span>
  );
};

const AddToWallet = ({ userWallet }) => {
  const walletBalanceInRs = calculateWalletBalanceInRs(userWallet);
  const navigate = useNavigate();

  if (!userWallet) {
    return null;
  }

  const {
    unused_credits_receivable_amount_InPaise = 0,
    unused_retainer_payments_InPaise = 0,
    outstanding_receivable_amount_InPaise = 0,
  } = userWallet;

  // Calculate due amount (positive value of outstanding_receivable_amount_InPaise)
  const dueAmount = Math.max(0, outstanding_receivable_amount_InPaise);
  
  // Calculate wallet balance as sum of retainer payments and credits
  const walletBalance = (unused_retainer_payments_InPaise + unused_credits_receivable_amount_InPaise) / 100;
  
  // Check if due amount is critical (when outstanding is greater than available balance)
  const isDueAmountCritical = outstanding_receivable_amount_InPaise > 0;

  return (
    <Card className="mb-4 mx-auto col-lg-8 col-sm-10 col-12">
      <Card.Body className="p-3">
        <Row className="align-items-center">
          {/* Left Column - Wallet Icon */}
          <Col xs="auto" className="pe-0">
            <div className="p-3 rounded-circle">
              <FaWallet className="text-primary" size={48} />
            </div>
          </Col>
          
          {/* Right Column - Due Amount and Wallet Balance */}
          <Col className="ps-3 ps-sm-4">
            {dueAmount > 0 && (
              <>
                <Row className="mb-2 g-0">
                  <Col xs={6} className="pe-2">
                    <span className="fw-medium">Invoice Dues:</span>
                  </Col>
                  <Col xs={6} className="text-end">
                    <span className={`fw-medium ${dueAmount > 0 ? 'text-danger' : ''}`}>
                      {formatAmount(dueAmount)}
                    </span>
                  </Col>
                </Row>
                
                <Row className="mb-2 g-0">
                  <Col xs={6} className="pe-2">
                    <span className="fw-medium">Wallet Balance:</span>
                  </Col>
                  <Col xs={6} className="text-end">
                    <span>
                      {formatAmount(walletBalance * 100)}
                    </span>
                  </Col>
                </Row>
                

              </>
            )}
            
            {!dueAmount && (
              <Row className="mb-0 g-0">
                <Col xs={6} className="pe-2">
                  <span className="fw-medium">Wallet Balance:</span>
                </Col>
                <Col xs={6} className="text-end">
                  <span className={walletBalance < 0 ? 'text-danger' : ''}>
                    {formatAmount(walletBalance * 100, walletBalance < 0)}
                  </span>
                </Col>
              </Row>
            )}
          </Col>
        </Row>

  
        <div className="d-flex justify-content-end mt-4">
          <Button
            variant={walletBalanceInRs >= 0 ? 'primary' : 'secondary'}
            onClick={() => {
              navigate('/openinvoices');
            }}
            className="px-4"
          >
            {walletBalanceInRs >= 0 ? 'Add to Wallet' : 'Pay Invoice Dues'}
          </Button>
        </div>

      </Card.Body>
    </Card>
  );
};

AddToWallet.propTypes = {
  userWallet: PropTypes.object,
};

export default AddToWallet;
