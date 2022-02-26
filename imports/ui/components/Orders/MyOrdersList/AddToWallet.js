import React from 'react';
import PropTypes from 'prop-types';
import {
  Button, Row, Col, Panel,
} from 'react-bootstrap';
import { formatMoney } from 'accounting-js';
import { accountSettings } from '../../../../modules/settings';
import { useStore, GlobalStores } from '../../../stores/GlobalStore';
import { calculateWalletBalanceInRs } from '../../../../modules/both/walletHelpers';

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
  const [currentValue, setPaymentNotification] = useStore(GlobalStores.paymentNotification.name);
  if ((currentValue !== numberOfAwaitingPayments) && (walletBalanceInRs < 0)) {
    setPaymentNotification(numberOfAwaitingPayments);
  }
};

const AddToWallet = ({ userWallet, numberOfAwaitingPayments, history }) => {
  const walletBalanceInRs = calculateWalletBalanceInRs(userWallet);
  updateGlobalStore(walletBalanceInRs, numberOfAwaitingPayments);

  return (
    <Panel>
      <Row>
        <Col xs={6} sm={5}>
          <h4 style={{ paddingRight: '5px' }}>{(walletBalanceInRs < 0) ? 'To Pay' : 'Wallet Balance'}</h4>
        </Col>
        <Col xs={6} sm={4} className="text-right-xs">
          {(userWallet) ? (displayWalletSummary(walletBalanceInRs)) : (displayWalletSummary(0))}
        </Col>
        <Col xs={12} sm={3} className="text-right" style={{ paddingTop: '10px' }}>
          <Button bsStyle="primary" onClick={() => { history.push('/mywallet'); }}>
            {(walletBalanceInRs >= 0) ? 'Add To Wallet' : 'Pay Now'}
          </Button>
        </Col>
      </Row>
    </Panel>
  );
};

AddToWallet.defaultProps = {
  numberOfAwaitingPayments: 0,
};

AddToWallet.propTypes = {
  userWallet: PropTypes.object.isRequired,
  numberOfAwaitingPayments: PropTypes.number,
  history: PropTypes.object.isRequired,
};

export default AddToWallet;
