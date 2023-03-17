import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { formatMoney } from 'accounting-js';
import AcceptPay from '../../Payments/AcceptPay/AcceptPay';
import { accountSettings } from '../../../../modules/settings';
import { useCartState } from '../../../stores/ShoppingCart';
import {
  prepareState, calculateWalletBalanceInRs, newWallet,
} from '../../../../modules/both/walletHelpers';

function CollectOrderPayment({ loggedInUser, callFuncAfterPay }) {
  const cartState = useCartState();
  const [walletState, setWalletState] = useState(prepareState(loggedInUser.wallet));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setWalletState(prepareState(loggedInUser.wallet));
  }, [loggedInUser.wallet]);

  function retWalletAdjustedAndBalanceToPay(wallet) {
    const tmpWallet = newWallet(
      {
        wallet,
        add_outstanding_receivable_amount_InPaise: cartState.cart.totalBillAmount * 100,
      },
    );

    const balanceToPay = -1 * calculateWalletBalanceInRs(tmpWallet);

    return {
      adjustedWallet: tmpWallet,
      balanceToPay,
    };
  }

  const { adjustedWallet, balanceToPay } = retWalletAdjustedAndBalanceToPay(loggedInUser.wallet);

  function callCollectPayFuncAfterPay(updatedWallet) {
    const val = retWalletAdjustedAndBalanceToPay(updatedWallet);

    if (val.balanceToPay <= 0) {
      callFuncAfterPay({ action: 'ADDEDTOWALLETMORETHANBALANCE' });
    }
  }

  return (
    <Row>
      <Col xs={12}>
        <h2 className="py-4 text-center">Payment</h2>
      </Col>

      <div className="bg-white card p-2 pt-5 pb-5 mb-5 py-4">
        <div className="col col-sm-8 h4 offset-sm-1">
          <div className="card-header p-3 text-start">
            <small className="text-uppercase"> Total Pay </small>
          </div>

          <div className="card-body">
            <Table responsive className="border-white">
              <tbody>
                <tr>
                  <td>Wallet Balance</td>
                  <td>
                    <span className={walletState.balanceAmountClass}>
                      {`${formatMoney(walletState.netAmountInWalletInRs, accountSettings)}`}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Total Order Amount</td>
                  <td>
                    {`${formatMoney(cartState.cart.totalBillAmount, accountSettings)}`}
                  </td>
                </tr>
                { (balanceToPay <= 0) && (
                  <tr>
                    <td><b>To Pay</b></td>
                    <td>
                      {`${formatMoney(0, accountSettings)}`}
                    </td>
                  </tr>
                )}

                { (balanceToPay > 0 /* active cart not set */) && (
                  <tr>
                    <td><b>To Pay</b></td>
                    <td>
                      {`${formatMoney(balanceToPay, accountSettings)}`}
                    </td>
                  </tr>
                )}

              </tbody>
            </Table>
          </div>

          <div className="card">

            {(balanceToPay > 0) && (
              <>
                <div className="card-header p-3 text-start">
                  <small className="text-uppercase"> Payment Options </small>
                </div>
                <div className="card-body">
                  <AcceptPay
                    loggedInUser={loggedInUser}
                    userWallet={adjustedWallet}
                    showWalletBalance={false}
                    callCollectPayFuncAfterPay={callCollectPayFuncAfterPay}
                  />

                  <div>
                    <Row><span className="text-center text-muted mt-5">   - - - - -   OR   - - - - -   </span></Row>
                    <div className="py-4">
                      <div className="offset-sm-1">

                        <h6 className="py-3"> 3. Pay Later </h6>
                        <div className="text-right-xs mt-4">
                          <Button variant="primary" onClick={() => { callFuncAfterPay({ action: 'PAYONDELIVERY' }); }}> Pay On Delivery </Button>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            {(balanceToPay <= 0) && (

              <div className="text-right m-4">
                <Button className="px-3" variant="secondary" onClick={() => { callFuncAfterPay({ action: 'DEDUCTFROMWALLET' }); }}> Place Order </Button>
              </div>

            )}
          </div>
        </div>

        <div className="bg-white card p-2 py-4">
          <div className="col col-sm-8 h4 offset-sm-1">

            <div className="card-header p-3 text-start">
              <small className="text-uppercase">  BACK TO CART </small>
            </div>

            <div className="card-body">
              <Button className="px-5" variant="primary" onClick={() => { callFuncAfterPay({ action: 'BACKTOCART' }); }}>
                &#x2190; Update Cart
              </Button>
            </div>
          </div>
        </div>

      </div>
    </Row>
  );
}

CollectOrderPayment.propTypes = {
  loggedInUser: PropTypes.object.isRequired,
  callFuncAfterPay: PropTypes.func.isRequired,
};

export default CollectOrderPayment;
