import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { Button, Row, Table, Col, Panel, Glyphicon } from 'react-bootstrap';
import { Bert } from 'meteor/themeteorchef:bert';
import { getFormattedMoney, getDayWithoutTime } from '../../../../modules/helpers';

import './ListCreditNotes.scss';

class ListCreditNotes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isCreditNotesLoading: true,
      creditNotes: [],
      creditNoteDetail: {},
    };

    this.fetchCreditNotes = this.fetchCreditNotes.bind(this);
    this.fetchCreditNote = this.fetchCreditNote.bind(this);
  }

  fetchCreditNotes() {
    Meteor.call('creditNotes.getCreditNotes',
      (error, creditNotes) => {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          this.setState({
            creditNotes,
            isCreditNotesLoading: false,
          });
        }
      },
    );
  }

  fetchCreditNote(creditNoteId) {
    Meteor.call('creditNotes.getCreditNote', creditNoteId,
      (error, creditNote) => {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          this.setState({
            creditNoteDetail: creditNote,
          });
        }
      },
    );
  }

  refundDetails(creditNoteDetail) {
    return (
      <section className="refund-section">
        {
          creditNoteDetail.line_items.map(item => (
            <Row className="refund-item">
              <Col xs={8}>{item.name}</Col>
              <Col xs={4}>{getFormattedMoney(item.item_total)}</Col>
            </Row>
          ))
        }
      </section>
    );
  }

  render() {
    const creditNotes = this.state.creditNotes;
    const creditNoteDetail = this.state.creditNoteDetail;
    return !this.state.isCreditNotesLoading ? (
      <Panel>

        {/* } <Row>
                    <Button type="button" onClick={this.fetchCreditNotes}>Show Refunds</Button>
                </Row>
                */}
        {creditNotes.length > 0 && (<Col xs={12}>
          <Row className="refund-heading">
            <Col xs={5}><b>Refund Date</b></Col>
            <Col xs={5}><b>Refund Amount</b></Col>
            <Col xs={2} />
          </Row>

          {
            creditNotes.map((creditNote) => {
              const isCurrentRow = creditNote.creditnote_id === creditNoteDetail.creditnote_id;
              return (
                <Row className="refund-row" key={creditNote.creditnote_id}>
                  <Col xs={5}>{getDayWithoutTime(new Date(creditNote.date))}</Col>
                  <Col xs={5}>{getFormattedMoney(creditNote.total)}</Col>
                  <Col xs={2}>
                    {(!isCurrentRow) && (<Glyphicon glyph="plus" className="refund-expand" onClick={() => { this.fetchCreditNote(creditNote.creditnote_id); }} />) }

                  </Col>
                  <Col xs={12}>
                    {(isCurrentRow) && this.refundDetails(creditNoteDetail)}
                  </Col>
                </Row>
              );
            })
          }
        </Col>
        )}
      </Panel>
    ) : (<Panel> <button className="btn btn-sm btn-primary" onClick={this.fetchCreditNotes}> Fetch Refund History </button> </Panel>);
  }
}

export default ListCreditNotes;
