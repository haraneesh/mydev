import PropTypes from 'prop-types';
import React from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import { formatMoney } from 'accounting-js';
import { useNavigate } from 'react-router-dom';
import { calculateWalletBalanceInRs } from '../../../../modules/both/walletHelpers';
import { accountSettings } from '../../../../modules/settings';
import { GlobalStores, useStore } from '../../../stores/GlobalStore';

const displayWalletSummary = (amountInWalletInRs) => {
  let textClassName = '';

  if (amountInWalletInRs > 0) {
    textClassName = 'text-success';
  }

  if (amountInWalletInRs < 0) {
    textClassName = 'text-danger';
  }

  return (
    <div>
      <h4 className={textClassName}>
        {`${formatMoney(amountInWalletInRs, accountSettings)}`}
      </h4>
    </div>
  );
};

const updateGlobalStore = (walletBalanceInRs, numberOfAwaitingPayments) => {
  const [currentValue, setPaymentNotification] = useStore(
    GlobalStores.paymentNotification.name,
  );
  if (currentValue !== numberOfAwaitingPayments && walletBalanceInRs < 0) {
    setPaymentNotification(numberOfAwaitingPayments);
  }
};

const AddToWallet = ({ userWallet, numberOfAwaitingPayments = 0 }) => {
  const walletBalanceInRs = calculateWalletBalanceInRs(userWallet);
  const navigate = useNavigate();
  updateGlobalStore(walletBalanceInRs, numberOfAwaitingPayments);

  return (
    <Card>
      <Card.Body>
        <Row className="px-2">
          <Col xs={6} sm={5}>
            <h4 style={{ paddingRight: '5px' }}>Wallet Balance</h4>
          </Col>
          <Col xs={6} sm={4} className="text-right-xs">
            {userWallet
              ? displayWalletSummary(walletBalanceInRs)
              : displayWalletSummary(0)}
          </Col>
          <Col xs={12} sm={3} className="text-right">
            <Button
              variant="secondary"
              onClick={() => {
                navigate('/mywallet');
              }}
            >
              {walletBalanceInRs >= 0 ? 'Pay Advance' : 'Pay Due'}
            </Button>
          </Col>
        </Row>
        <p className="text-info text-center small pt-3">
          Only delivered orders are considered.
        </p>
      </Card.Body>
    </Card>
  );
};

AddToWallet.propTypes = {
  userWallet: PropTypes.object.isRequired,
  numberOfAwaitingPayments: PropTypes.number,
};

export default AddToWallet;
