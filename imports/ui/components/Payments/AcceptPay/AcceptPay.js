import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import {
  FormGroup, InputGroup, FormControl, Row, Col, Panel,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { formatMoney } from 'accounting-js';
import { Roles } from 'meteor/alanning:roles';
import Loading from '../../Loading/Loading';
import { formValChange } from '../../../../modules/validate';
import { accountSettings } from '../../../../modules/settings';
import constants from '../../../../modules/constants';
import PayTMButton from '../PayTM/PayTMButton';

import { calculateWalletBalanceInRs } from '../../../../modules/both/walletHelpers';

function calculateGateWayFee(amount) {
  return (amount * 0.02);
}

function prepareState(wallet) {
  let balanceAmountClass = '';

  const netAmountInWalletInRs = calculateWalletBalanceInRs(wallet);

  switch (true) {
    case (netAmountInWalletInRs > 0):
      balanceAmountClass = 'text-success';
      break;
    case (netAmountInWalletInRs < 0):
      balanceAmountClass = 'text-danger';
      break;
    default:
      balanceAmountClass = '';
  }

  const amtToChrg = ((netAmountInWalletInRs < 0) ? (-1 * netAmountInWalletInRs) : 500);

  return {
    amountToChargeInRs: amtToChrg,
    balanceAmountClass,
    netAmountInWalletInRs,
    gateWayFee: calculateGateWayFee(amtToChrg),
    isError: {
      amountToChargeInRs: '',
    },
  };
}

function AcceptPay({ userWallet, loggedInUser }) {
  const [walletState, setWalletState] = useState(prepareState(userWallet));

  function amountToChargeOnChange(event) {
    const { isError } = walletState;
    const newErrorState = formValChange(event, { ...isError });

    const newWalletState = { ...walletState };

    newWalletState.amountToChargeInRs = event.target.value;
    newWalletState.isError = newErrorState.isError;
    newWalletState.gateWayFee = calculateGateWayFee(event.target.value);

    setWalletState(newWalletState);
  }

  function paymentResponseSuccess(error, result) {
    if (error) {
      toast.error(error.reason);
    } else {
      toast.success('Payment has been successfully processed');
    }
  }

  const { isError } = walletState;

  return (
    <div>

      {walletState.paymentInProcess && (<Loading />)}
      <Panel>
        <Row>
          <Col xs={6} sm={5} className="text-right">
            <h4 style={{ paddingRight: '5px' }}>Wallet Balance</h4>
          </Col>
          <Col xs={6} sm={7} className="text-left">
            <h4 className={walletState.balanceAmountClass}>
              {`${formatMoney(walletState.netAmountInWalletInRs, accountSettings)}`}
            </h4>
          </Col>
        </Row>
      </Panel>

      <Panel>

        <div className="panel-heading" style={{ borderRadius: '4px', fontWeight: 'bold' }}>
          <div>UPI or Debit card - 0 fee </div>
        </div>

        <form
          onSubmit={(event) => event.preventDefault()}
        >
          <FormGroup validationState={isError.amountToChargeInRs.length > 0 ? 'error' : ''}>
            <Col xs={12} sm={8} smOffset={1} style={{ marginBottom: '1rem' }} className="rowRightSpacing">
              <InputGroup>
                <InputGroup.Addon>Rs.</InputGroup.Addon>
                <FormControl
                  type="number"
                  name="amountToChargeInRs"
                  value={walletState.amountToChargeInRs}
                  placeholder="500"
                  onChange={amountToChargeOnChange}
                />
              </InputGroup>
              {isError.amountToChargeInRs.length > 0 && (
                <span className="control-label">{isError.amountToChargeInRs}</span>
              )}
            </Col>
            <Col xs={12} sm={3} className="text-right-xs">
              <PayTMButton
                buttonText={(walletState.netAmountInWalletInRs > 0) ? 'Add Money' : 'Pay Now'}
                showOptionsWithFee={false}
                paymentDetails={{
                  moneyToChargeInRs: walletState.amountToChargeInRs,
                  description: 'Add to Wallet',
                  prefill: {
                    firstName: loggedInUser.profile.name.first,
                    lastName: loggedInUser.profile.name.last,
                    email: loggedInUser.emails[0].address,
                    mobile: loggedInUser.profile.whMobilePhone,
                  },
                  notes: {
                    address: loggedInUser.profile.deliveryAddress,
                  },
                }}
                paymentResponseSuccess={paymentResponseSuccess}
              />
            </Col>
          </FormGroup>
        </form>
        {/* } <Row>
          <Col xs={12} className="text-center" style={{ paddingTop: '1em' }}>
            <img alt="UPI options" style={{ maxWidth: '300px', width: '100%' }} src="/about/paymentOptions.png?v4" />
          </Col>
              </Row> */}
      </Panel>

      { (Roles.userIsInRole(loggedInUser, constants.Roles.customer.name)) && (
        <Panel>

          <div className="panel-heading" style={{ borderRadius: '4px', fontWeight: 'bold' }}>
            <div>NetBanking or Credit Card - 2% transaction fee </div>
          </div>

          <form
            onSubmit={(event) => event.preventDefault()}
          >
            <FormGroup validationState={isError.amountToChargeInRs.length > 0 ? 'error' : ''}>
              <Col xs={12} sm={8} smOffset={1} style={{ marginBottom: '1rem' }} className="rowRightSpacing">
                <InputGroup>
                  <InputGroup.Addon>Rs.</InputGroup.Addon>
                  <FormControl
                    type="number"
                    name="amountToChargeInRs"
                    value={walletState.amountToChargeInRs}
                    placeholder="500"
                    onChange={amountToChargeOnChange}
                  />
                </InputGroup>
                <p>
                  <small>
                    Transaction Fee
                    {`: ${formatMoney(walletState.gateWayFee, accountSettings)}, extra`}
                  </small>
                </p>
                {isError.amountToChargeInRs.length > 0 && (
                <span className="control-label">{isError.amountToChargeInRs}</span>
                )}
              </Col>
              <Col xs={12} sm={3} className="text-right-xs">
                <PayTMButton
                  buttonText={(walletState.netAmountInWalletInRs > 0) ? 'Add Money' : 'Pay Now'}
                  showOptionsWithFee
                  paymentDetails={{
                    moneyToChargeInRs: walletState.amountToChargeInRs + walletState.gateWayFee,
                    description: 'Add to Wallet',
                    prefill: {
                      firstName: loggedInUser.profile.name.first,
                      lastName: loggedInUser.profile.name.last,
                      email: loggedInUser.emails[0].address,
                      mobile: loggedInUser.profile.whMobilePhone,
                    },
                    notes: {
                      address: loggedInUser.profile.deliveryAddress,
                    },
                  }}
                  paymentResponseSuccess={paymentResponseSuccess}
                />
              </Col>
            </FormGroup>
          </form>
          {/*
          <Row>
            <Col xs={12} className="text-center" style={{ paddingTop: '1em' }}>
              <img alt="Banks and Cards" style={{ maxWidth: '300px', width: '100%' }} src="/about/banks.png?v1" />
            </Col>
          </Row> */}
        </Panel>
      )}
    </div>
  );
}

AcceptPay.defaultProps = {
  loggedInUser: Meteor.user(),
};

AcceptPay.propTypes = {
  userWallet: PropTypes.shape({
    unused_retainer_payments_InPaise: PropTypes.number.isRequired,
    unused_credits_receivable_amount_InPaise: PropTypes.number.isRequired,
    outstanding_receivable_amount_InPaise: PropTypes.number.isRequired,
  }).isRequired,
  loggedInUser: PropTypes.object,
};

export default AcceptPay;
