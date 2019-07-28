import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import {  Button, Row, Table, Col, Panel } from 'react-bootstrap';
import { Bert } from 'meteor/themeteorchef:bert';
import { getFormattedMoney, getDayWithoutTime } from '../../../../modules/helpers';

class ListCreditNotes extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            creditNotes: [],
        }

        this.fetchCreditNotes = this.fetchCreditNotes.bind(this);
    }

    componentDidMount() {
       this.fetchCreditNotes();
    }

    fetchCreditNotes(){
        Meteor.call('creditNotes.getCreditNotes',
            (error, creditNotes) => {
                if (error) {
                    Bert.alert(error.reason, 'danger');    
                } else {
                    this.setState({
                        creditNotes: creditNotes,
                    });
                }
            }
        );
    }

    render(){
        const creditNotes = this.state.creditNotes;
        return(
            <Panel>
                <Col xs={12}>
               {/*} <Row>
                    <Button type="button" onClick={this.fetchCreditNotes}>Show Refunds</Button>
                </Row>
                */}
                <Row>
                    {creditNotes.length > 0 && (<Table>
                        <thead>
                            <tr>
                                <th>Refund Date</th>
                                <th>Refund Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                creditNotes.map((creditNote) => {
                                      return (
                                        <tr>
                                          <td>{getDayWithoutTime(new Date(creditNote.date))}</td>
                                          <td>{getFormattedMoney(creditNote.total)}</td>
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

export default ListCreditNotes;