import React, { useState } from 'react';
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
import Loading from '../../Loading/Loading';
import { formValChange } from '../../../../modules/validate';
import { accountSettings } from '../../../../modules/settings';
import constants from '../../../../modules/constants';
import PayTMButton from '../PayTM/PayTMButton';

import { calculateGateWayFee, prepareState, SignUpForDiscountMessage } from '../../../../modules/both/walletHelpers';

function AcceptPay({
  userWallet, loggedInUser, showWalletBalance, callFuncAfterPay,
}) {
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
      // if (callFuncAfterPay) { callFuncAfterPay({ action: 'ADDEDTOWALLET' }); }
      toast.success('Payment has been successfully processed');
    }
  }

  function calculateTotalAmountWithGatewayFee(wallet) {
    const { amountToChargeInRs, gateWayFee } = wallet;
    const amtToCharge = Math.ceil(
      (parseFloat(amountToChargeInRs) + parseFloat(gateWayFee)) * 100,
    ) / 100;
    return (amtToCharge).toString();
  }

  const { isError } = walletState;

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
              Wallet Balance is adjusted only after order delivery.
            </p>
          </Col>
        </Row>
      </Card>
      )}
      <div className="p-2 py-4 bg-white">
        <Row>
          <Col xs={12} sm={11} className="offset-sm-1">
            <h6 className="py-3">
              1. UPI or Debit card,
              <span className="underline"> No fee</span>
            </h6>

            <form
              onSubmit={(event) => event.preventDefault()}
            >
              <Form.Group validationState={isError.amountToChargeInRs.length > 0 ? 'error' : ''}>
                <Col xs={12} sm={8} smOffset={1} style={{ marginBottom: '1rem' }} className="pr-2">
                  {/* <SignUpForDiscountMessage wallet={loggedInUser.wallet} /> */}
                  <InputGroup>
                    <InputGroup.Text>Rs.</InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="amountToChargeInRs"
                      value={walletState.amountToChargeInRs}
                      placeholder="5000"
                      onChange={amountToChargeOnChange}
                    />
                  </InputGroup>
                  {isError.amountToChargeInRs.length > 0 && (
                  <span className="small text-info">{isError.amountToChargeInRs}</span>
                  )}
                </Col>
                <Col xs={12} sm={3} className="text-right-xs">
                  <PayTMButton
                    buttonText={(walletState.netAmountInWalletInRs >= 0) ? 'Add To Wallet' : 'Pay Now'}
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
              </Form.Group>
            </form>
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
                  <div>2. NetBanking or Credit Card, 2% transaction fee </div>
                </h6>

                <form
                  onSubmit={(event) => event.preventDefault()}
                >
                  <Form.Group validationState={isError.amountToChargeInRs.length > 0 ? 'error' : ''}>
                    <Col xs={12} sm={8} smOffset={1} style={{ marginBottom: '1rem' }} className="pr-2">
                      {/* <SignUpForDiscountMessage wallet={loggedInUser.wallet} /> */}
                      <InputGroup>
                        <InputGroup.Text>Rs.</InputGroup.Text>
                        <Form.Control
                          type="number"
                          name="amountToChargeInRs"
                          value={walletState.amountToChargeInRs}
                          placeholder="5000"
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
                      <span className="small text-info">{isError.amountToChargeInRs}</span>
                      )}
                    </Col>
                    <Col xs={12} sm={3} className="text-right-xs">
                      <PayTMButton
                        buttonText={(walletState.netAmountInWalletInRs >= 0) ? 'Add To Wallet' : 'Pay Now'}
                        showOptionsWithFee
                        paymentDetails={{
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
                </form>
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
  callFuncAfterPay: null,
};

AcceptPay.propTypes = {
  showWalletBalance: PropTypes.bool,
  userWallet: PropTypes.shape({
    unused_retainer_payments_InPaise: PropTypes.number.isRequired,
    unused_credits_receivable_amount_InPaise: PropTypes.number.isRequired,
    outstanding_receivable_amount_InPaise: PropTypes.number.isRequired,
  }).isRequired,
  loggedInUser: PropTypes.object,
  callFuncAfterPay: PropTypes.func,
};

export default AcceptPay;
