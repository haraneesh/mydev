import { Meteor } from 'meteor/meteor';
import { Row, Table, Col, Panel } from 'react-bootstrap';
import { Bert } from 'meteor/themeteorchef:bert';
import { getFormattedMoney, getDayWithoutTime } from '../../../../modules/helpers';

import React, { useState, useEffect } from 'react';

const ListPayments = (props) => {

  const [payments, setPayments] = useState([]);
  const [isPaymentstLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Meteor.call('payments.getPayments',
      (error, payments) => {
        setIsLoading(false);
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          setPayments(payments);
          /*this.setState({
            lastPayments: payments,
          });*/
        }
      },
    );
  }, []);

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
                  <tr>
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

  ) : (<div> Loading ... </div>);

}

export default ListPayments;
