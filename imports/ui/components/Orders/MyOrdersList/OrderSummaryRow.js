import React from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col, Label, Glyphicon,
} from 'react-bootstrap';
import { formatMoney } from 'accounting-js';
import { accountSettings } from '../../../../modules/settings';
import orderCommon from '../../../../modules/both/orderCommon';
import { getDisplayShortDate } from '../../../../modules/helpers';
import { calculateWalletBalanceInRs } from '../../../../modules/both/walletHelpers';
import constants from '../../../../modules/constants';

import './OrderSummaryRow.scss';

const showPendingInvoiceAmount = (invoiceTotals, walletBalance) => {
  if (walletBalance < 0 && invoiceTotals && invoiceTotals.balanceInvoicedAmount > 0) {
    return true;
  }

  return false;
};

const getDisplayOrderStatus = (order_status, walletBalance) => {
  if (walletBalance >= 0
    && constants.OrderStatus[order_status].name === constants.OrderStatus.Awaiting_Payment.name) {
    return constants.OrderStatus.Completed.name;
  }

  return order_status;
};

const OrderSummaryRow = ({
  orderDate, orderAmount, userWallet,
  invoices, order_status,
}) => {
  const orderDateDisplay = getDisplayShortDate(orderDate);
  const walletBalance = calculateWalletBalanceInRs(userWallet);
  const invoiceTotals = orderCommon.getInvoiceTotals(invoices);
  const displayOrderStatus = order_status; // getDisplayOrderStatus(order_status, walletBalance);

  return (
    <Row>
      <Col xs={11}>
        <Row>
          <Col xs={12} sm={6} md={3} className="remLeftRightPad">
            <Label bsStyle={constants.OrderStatus[displayOrderStatus].label}>
              {constants.OrderStatus[displayOrderStatus].display_value}
            </Label>
          </Col>
          <Col xs={12} sm={6} md={3} className="remLeftRightPad">
            {orderDateDisplay}
          </Col>

          <Col xs={12} md={6}>
            <Row>
              <Col xs={6} className="remLeftRightPad row">
                <Col xs={12} sm={3} md={4} className="remLeftRightPad">
                  <span className="text-muted">Amount: </span>
                </Col>
                <Col xs={12} sm={9} md={8} className="remLeftRightPad">
                  {invoiceTotals
                    ? formatMoney(invoiceTotals.totalInvoicedAmount, accountSettings)
                    : formatMoney(orderAmount, accountSettings)}
                </Col>
              </Col>

              <Col xs={6} className="remLeftRightPad">
                <Row>
                  <Col xs={12} sm={3} md={4} className="remLeftRightPad">
                    {showPendingInvoiceAmount(invoiceTotals, walletBalance) ? (
                      <div>
                        <span className="text-muted">Pending: </span>
                      </div>
                    ) : (<div />)}
                  </Col>
                  <Col xs={12} sm={9} md={8} className="remLeftRightPad">
                    {showPendingInvoiceAmount(invoiceTotals, walletBalance) ? (
                      ` ${formatMoney(invoiceTotals.balanceInvoicedAmount, accountSettings)}`
                    ) : (<div />)}
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>

      <Col xs={1}>
        <span className="text-muted">
          <Glyphicon glyph="chevron-right" bsSize="large" />
        </span>
      </Col>
    </Row>
  );
};

OrderSummaryRow.propTypes = {
  orderDate: PropTypes.instanceOf(Date).isRequired,
  orderAmount: PropTypes.number.isRequired,
  userWallet: PropTypes.object.isRequired,
  invoices: PropTypes.object.isRequired,
  order_status: PropTypes.string.isRequired,
};

export default OrderSummaryRow;
