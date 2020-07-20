import { Meteor } from 'meteor/meteor';
import React, { useState } from 'react';
import { Row, Table, Col, Panel } from 'react-bootstrap';
import { Bert } from 'meteor/themeteorchef:bert';
import { getFormattedMoney, getDayWithoutTime } from '../../../../modules/helpers';

const ListPayments = () => {
  const [payments, setPayments] = useState([]);
  const [isPaymentstLoading, setIsLoading] = useState(true);

  const loadPaymentHistory = () => {
    setIsLoading(true);
    Meteor.call('payments.getPayments',
      (error, paymentss) => {
        setIsLoading(false);
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          setPayments(paymentss);
        }
      },
    );
  };

  return !isPaymentstLoading ? (
    <Panel>
      <Col xs={12}>
        <Row>
          {payments.length > 0 && (<Table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Method</th>
              </tr>
            </thead>
            <tbody>
              {
                payments.map(payment => (
                  <tr key={payment.invoice_numbers}>
                    <td>{getDayWithoutTime(new Date(payment.date))}</td>
                    <td>{getFormattedMoney(payment.amount)}</td>
                    <td>{payment.payment_mode}</td>
                  </tr>
                ))
              }
            </tbody>
          </Table>)}
        </Row>
      </Col>
    </Panel>

  ) : (<Panel> <button className="btn btn-sm btn-default" onClick={loadPaymentHistory}> Fetch Payments History </button> </Panel>);
};

export default ListPayments;
