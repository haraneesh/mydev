import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { toast } from 'react-toastify';
import { formatMoney } from 'accounting-js';
import { Roles } from 'meteor/alanning:roles';
import Dropdown from 'react-bootstrap/Dropdown';
import Loading from '../../Loading/Loading';
import { formValChange } from '../../../../modules/validate';
import { accountSettings } from '../../../../modules/settings';
import constants from '../../../../modules/constants';
import PayTMButton from '../PayTM/PayTMButton';

import { calculateGateWayFee, prepareState, SignUpForDiscountMessage } from '../../../../modules/both/walletHelpers';

function AcceptPay({
  userWallet, loggedInUser, showWalletBalance, callCollectPayFuncAfterPay, cartTotalBillAmount,
}) {
  const userWalletBeforeUpdate = prepareState(userWallet);
  const [walletState, setWalletState] = useState(userWalletBeforeUpdate);
  const [textValue, setTextValue] = useState(userWalletBeforeUpdate.amountToChargeInRs);

  useEffect(() => {
    setWalletState(prepareState(userWallet));
  }, [userWallet]);

  function amountToChargeOnChange(value) {
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
  }

  function paymentResponseSuccess(result) {
    if (callCollectPayFuncAfterPay) { callCollectPayFuncAfterPay(result); }
    toast.success('Payment has been successfully processed');
  }

  function calculateTotalAmountWithGatewayFee(wallet) {
    const { amountToChargeInRs, gateWayFee } = wallet;
    const amtToCharge = Math.ceil(
      (parseFloat(amountToChargeInRs) + parseFloat(gateWayFee)) * 100,
    ) / 100;
    return (amtToCharge).toString();
  }

  function simulatePayment() {
    Meteor.call('payment.paytm.simulatePayment', (err, result) => {
      if (callCollectPayFuncAfterPay) {
        const tresult = result;
        tresult.unused_credits_receivable_amount_InPaise = '9999999';
        callCollectPayFuncAfterPay(tresult);
      }
      toast.success('Payment has been successfully processed');
    });
  }

  const { isError } = walletState;

  function optionValuesForWalletUpdate() {
    const maxWalletAddAmt = (userWalletBeforeUpdate.amountToChargeInRs < 10000)
      ? 10000 : Math.ceil(userWalletBeforeUpdate.amountToChargeInRs);

    const chargeOptions = [];
    if (userWalletBeforeUpdate.amountToChargeInRs > 0) {
      chargeOptions.push(
        <option value={userWalletBeforeUpdate.amountToChargeInRs}>
          {userWalletBeforeUpdate.amountToChargeInRs}
        </option>,
      );
    }
    for (let i = 500; i <= maxWalletAddAmt; i += 500) {
      if (userWalletBeforeUpdate.amountToChargeInRs < i) {
        chargeOptions.push(<option value={i}>{i}</option>);
      }
    }
    return chargeOptions;
  }

  function dropDownValuesForWalletUpdate() {
    const maxWalletAddAmt = (userWalletBeforeUpdate.amountToChargeInRs < 10000)
      ? 10000 : Math.ceil(userWalletBeforeUpdate.amountToChargeInRs);

    const chargeOptions = [];
    if (userWalletBeforeUpdate.amountToChargeInRs > 0) {
      chargeOptions.push(
        <Dropdown.Item onClick={() => {
          amountToChargeOnChange(userWalletBeforeUpdate.amountToChargeInRs);
        }}
        >
          {userWalletBeforeUpdate.amountToChargeInRs}
        </Dropdown.Item>,
      );
    }
    for (let i = 500; i <= maxWalletAddAmt; i += 500) {
      if (userWalletBeforeUpdate.amountToChargeInRs < i) {
        chargeOptions.push(
          <Dropdown.Item onClick={() => {
            amountToChargeOnChange(i);
          }}
          >
            {i}
          </Dropdown.Item>,
        );
      }
    }
    return chargeOptions;
  }

  return (
    <div>
      {walletState.paymentInProcess && (<Loading />)}
      {(!!showWalletBalance) && (
      <Card className="py-4 my-4">
        <Row>
          <Col xs={12} className="text-center">
            <h4 className="m-2">
              {`Wallet Balance is${' '}`}
              <span className={walletState.balanceAmountClass}>
                {`${formatMoney(walletState.netAmountInWalletInRs, accountSettings)}`}
              </span>
            </h4>
            <p className="text-info small">
              Only delivered orders are considered.
            </p>
          </Col>
        </Row>
      </Card>
      )}
      <div className="p-2 py-4 bg-white">
        <Row>
          <Col xs={12} sm={11} className="offset-sm-1">
            <h6 className="py-3">
              1. Scan and Pay with any Bharath QR/UPI app,
              <span className="underline"> No fee</span>
            </h6>
            <p>
              Do
              {' '}
              <b className="text-warning">share</b>
              {' '}
              your SODEXO card number with us before you pay for the first time.
            </p>
            <Row>
              <Col xs={6} sm={6} className="text-center">
                <h4>UPI</h4>
                <img src="/pay/scan-pay-upi.jpg" style={{ width: '100%', maxWidth: '20em' }} alt="Scan and Pay via UPI" />
              </Col>
              <Col xs={6} sm={6} className="text-center">
                <h4>SODEXO</h4>
                <img src="/pay/scan-pay-sodexo.jpg" style={{ width: '100%', maxWidth: '20em' }} alt="Scan and Pay via Sodexo" />
              </Col>
            </Row>

          </Col>
        </Row>

        <Row><span className="text-center text-muted bg-white mb-5 pt-4">   - - - - -   OR   - - - - -   </span></Row>

        <Row>
          <Col xs={12} sm={11} className="offset-sm-1">
            <h6 className="py-3">
              2. UPI or Debit card,
              <span className="underline"> No fee</span>
            </h6>

            <Form.Group validationState={isError.amountToChargeInRs.length > 0 ? 'error' : ''}>
              <Col xs={12} sm={8} smOffset={1} style={{ marginBottom: '1rem' }} className="pr-2">
                {/* <SignUpForDiscountMessage wallet={loggedInUser.wallet} /> */}
                <InputGroup>
                  <InputGroup.Text>Rs.</InputGroup.Text>
                  <input
                    type="text"
                    className="form-control"
                    value={textValue}
                    onChange={(e) => { amountToChargeOnChange(e.target.value); }}
                  />
                  <Dropdown align="end">
                    <Dropdown.Toggle
                      variant="outline-primary"
                      style={{
                        fontSize: '1.5em',
                        paddingTop: '0.2em',
                      }}
                    />
                    <Dropdown.Menu className="border border-primary">
                      <div style={{ maxHeight: '10em', overflow: 'scroll' }}>
                        {dropDownValuesForWalletUpdate()}
                      </div>
                    </Dropdown.Menu>
                  </Dropdown>

                </InputGroup>
                {isError.amountToChargeInRs.length > 0 && (
                  <span className="small text-info">{isError.amountToChargeInRs}</span>
                )}
              </Col>
              <Col xs={12} sm={3} className="text-right-xs">
                {/* <button onClick={simulatePayment}> Test Payment </button> */}
                <PayTMButton
                  buttonText={(walletState.netAmountInWalletInRs >= 0) ? 'Pay Advance' : 'Pay Due'}
                  showOptionsWithFee={false}
                  paymentDetails={{
                    cartTotalBillAmount,
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
            </Form.Group>

            {/* } <Row>
          <Col xs={12} className="text-center" style={{ paddingTop: '1em' }}>
            <img alt="UPI options" style={{ maxWidth: '300px', width: '100%' }} src="/about/paymentOptions.png?v4" />
          </Col>
              </Row> */}
          </Col>
        </Row>
      </div>

      { (Roles.userIsInRole(loggedInUser, constants.Roles.customer.name)) && (
        <>
          <div className="p-2 py-4 bg-white">
            <Row><span className="text-center text-muted bg-white mb-5">   - - - - -   OR   - - - - -   </span></Row>
            <Row>
              <Col xs={12} sm={11} className="offset-sm-1">

                <h6 className="py-3">
                  <div>3. NetBanking or Credit Card, 2% transaction fee </div>
                </h6>

                <Form.Group validationState={isError.amountToChargeInRs.length > 0 ? 'error' : ''}>
                  <Col xs={12} sm={8} smOffset={1} style={{ marginBottom: '1rem' }} className="pr-2">
                    {/* <SignUpForDiscountMessage wallet={loggedInUser.wallet} /> */}
                    <InputGroup>
                      <InputGroup.Text>Rs.</InputGroup.Text>
                      <input
                        type="text"
                        className="form-control"
                        value={textValue}
                        onChange={(e) => { amountToChargeOnChange(e.target.value); }}
                      />
                      <Dropdown align="end">
                        <Dropdown.Toggle
                          variant="outline-primary"
                          style={{
                            fontSize: '1.5em',
                            paddingTop: '0.2em',
                          }}
                        />
                        <Dropdown.Menu className="border border-primary">
                          <div style={{ maxHeight: '10em', overflow: 'scroll' }}>
                            {dropDownValuesForWalletUpdate()}
                          </div>
                        </Dropdown.Menu>
                      </Dropdown>

                    </InputGroup>
                    <p>
                      <small>
                        Transaction Fee
                        {`: ${formatMoney(walletState.gateWayFee, accountSettings)}, extra`}
                      </small>
                    </p>
                    {isError.amountToChargeInRs.length > 0 && (
                      <span className="small text-info">{isError.amountToChargeInRs}</span>
                    )}
                  </Col>
                  <Col xs={12} sm={3} className="text-right-xs">
                    <PayTMButton
                      buttonText={(walletState.netAmountInWalletInRs >= 0) ? 'Pay Advance' : 'Pay Due'}
                      showOptionsWithFee
                      paymentDetails={{
                        cartTotalBillAmount,
                        moneyToChargeInRs: calculateTotalAmountWithGatewayFee(walletState),
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
                </Form.Group>

                {/*
          <Row>
            <Col xs={12} className="text-center" style={{ paddingTop: '1em' }}>
              <img alt="Banks and Cards" style={{ maxWidth: '300px', width: '100%' }} src="/about/banks.png?v1" />
            </Col>
          </Row> */}
              </Col>
            </Row>
          </div>
        </>
      )}
    </div>
  );
}

AcceptPay.defaultProps = {
  loggedInUser: Meteor.user(),
  showWalletBalance: true,
  callCollectPayFuncAfterPay: null,
  cartTotalBillAmount: 0,
};

AcceptPay.propTypes = {
  showWalletBalance: PropTypes.bool,
  cartTotalBillAmount: PropTypes.string,
  userWallet: PropTypes.shape({
    unused_retainer_payments_InPaise: PropTypes.number.isRequired,
    unused_credits_receivable_amount_InPaise: PropTypes.number.isRequired,
    outstanding_receivable_amount_InPaise: PropTypes.number.isRequired,
  }).isRequired,
  loggedInUser: PropTypes.object,
  callCollectPayFuncAfterPay: PropTypes.func,
};

export default AcceptPay;
