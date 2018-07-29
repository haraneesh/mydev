import React from 'react';
import PropTypes from 'prop-types';
import { Button, Row, Col, Panel } from 'react-bootstrap';
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
    <h4 className={textClassName}> {`${formatMoney(amountInWalletInRs, accountSettings)}`} </h4>
  );
};

const AddToWallet = ({ userWallet }) => (
  <Panel>
    <Row>
      <Col xs={6} sm={5}>
        <h4>Wallet Balance</h4>
      </Col>
      <Col xs={6} sm={4}>
        {(userWallet) ? (displayWalletSummary(calculateWalletBalanceInRs(userWallet))) : (<h4> -- </h4>)}
      </Col>
      <Col xs={12} sm={3} className="text-right">
        { /* <Button bsStyle="primary" href="/mywallet">
          Add Money
        </Button> */ }
      </Col>
    </Row>
  </Panel>
);

AddToWallet.propTypes = {
  userWallet: PropTypes.object.isRequired,
};

export default AddToWallet;
