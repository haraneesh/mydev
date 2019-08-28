import React from 'react';
import PropTypes from 'prop-types';
import { Button, Row, Col, Panel, Modal } from 'react-bootstrap';
import { formatMoney } from 'accounting-js';
import { accountSettings } from '../../../../modules/settings';
import { calculateWalletBalanceInRs } from '../../../../modules/both/walletHelpers';

const displayWalletSummary = (amountInWalletInRs) => {
  let textClassName = '';

  if (amountInWalletInRs > 0) {
    textClassName = 'text-primary';
  }

  if (amountInWalletInRs < 0) {
    textClassName = 'text-danger';
  }

  return (
    <div>
      <h4 className={textClassName}> {`${formatMoney(amountInWalletInRs, accountSettings)}`} </h4>
    </div>
  );
};


const AddToWallet = ({ userWallet, numberOfAwaitingPayments }) => {
  
  const walletBalanceInRs =  calculateWalletBalanceInRs(userWallet);
  return (
  <Panel>
    <Row>
      <Col xs={6} sm={5}>
        <h4>Wallet Balance</h4>
      </Col>
      <Col xs={6} sm={4}>
        {(userWallet) ? (displayWalletSummary(walletBalanceInRs)) : (<h4> -- </h4>)}
      </Col>
      <Col xs={12} sm={3} className="text-right">
        <Button bsStyle="primary" href="/mywallet">
          Add Money
        </Button>
      </Col>
    </Row>
    <Row>
    <Col xs={12}>
      { numberOfAwaitingPayments > 2 && walletBalanceInRs < 0 && (<p className='text-danger'>  Did you know you can pay us online, now? </p>) }
    </Col>
    </Row>
  </Panel>
  );
}

AddToWallet.defaultProps = {
  numberOfAwaitingPayments: 0,
}

AddToWallet.propTypes = {
  userWallet: PropTypes.object.isRequired,
  numberOfAwaitingPayments: PropTypes.number,
};

export default AddToWallet;
