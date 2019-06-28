import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import {  Button, Row, Table, Col, Panel } from 'react-bootstrap';
import { Bert } from 'meteor/themeteorchef:bert';
import { getFormattedMoney, getDayWithoutTime } from '../../../../modules/helpers';

class ListPayments extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            lastPayments: [],
        }

        this.fetchLastPayments = this.fetchLastPayments.bind(this);
    }

    fetchLastPayments(){
        Meteor.call('payments.getPayments',
            (error, payments) => {
                if (error) {
                    Bert.alert(error.reason, 'danger');    
                } else {
                    this.setState({
                        lastPayments: payments,
                    });
                }
            }
        );
    }

    render(){
        const payments = this.state.lastPayments;
        return(
            <Panel>
                <Col xs={12}>
                <Row>
                    <Button type="button" onClick={this.fetchLastPayments}>Show Last Payments</Button>
                </Row>
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
                                payments.map((payment) => {
                                      return (
                                        <tr>
                                          <td>{getDayWithoutTime(new Date(payment.date))}</td>
                                          <td>{getFormattedMoney(payment.amount)}</td>
                                          <td>{payment.payment_mode}</td>
                                        </tr>
                                      );
                            })
                        }
                        </tbody>
                    </Table>)}
                </Row>
                </Col>
            </Panel>
        );
    }
}

export default ListPayments;