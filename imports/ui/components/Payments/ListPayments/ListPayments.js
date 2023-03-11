import { Meteor } from 'meteor/meteor';
import React, { useState } from 'react';

import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
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
          toast.error(error.reason);
        } else {
          setPayments(paymentss);
        }
      });
  };

  return !isPaymentstLoading ? (
    <Card className="py-3">
      <Col xs={12} sm={10} className="offset-sm-1">
        <Row>
          {payments.length > 0 && (
            <>
              <h4 className="pb-2"> Previous Transactions </h4>
              <Table striped bordered>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Method</th>
                  </tr>
                </thead>
                <tbody>
                  {
                payments.map((payment) => (
                  <tr key={payment.invoice_numbers}>
                    <td>{getDayWithoutTime(new Date(payment.date))}</td>
                    <td>{getFormattedMoney(payment.amount)}</td>
                    <td>{payment.payment_mode}</td>
                  </tr>
                ))
              }
                </tbody>
              </Table>
            </>

          )}
        </Row>
      </Col>
    </Card>

  ) : (
    <Card className="py-3">
      <Col className="offset-sm-1">
        <Button onClick={loadPaymentHistory}> Fetch Payments History </Button>
      </Col>
    </Card>
  );
};

export default ListPayments;
