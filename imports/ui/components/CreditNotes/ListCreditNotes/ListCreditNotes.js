import React from 'react';
import { Meteor } from 'meteor/meteor';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import Icon from '../../Icon/Icon';
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
          // toast.error(error.reason);
          toast.error(error.reason);
        } else {
          this.setState({
            creditNotes,
            isCreditNotesLoading: false,
          });
        }
      });
  }

  fetchCreditNote(creditNoteId) {
    Meteor.call('creditNotes.getCreditNote', creditNoteId,
      (error, creditNote) => {
        if (error) {
          // toast.error(error.reason);
          toast.error(error.reason);
        } else {
          this.setState({
            creditNoteDetail: creditNote,
          });
        }
      });
  }

  refundDetails(creditNoteDetail) {
    return (
      <section className="refund-section">
        {
          creditNoteDetail.line_items.map((item) => (
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
    const { creditNotes } = this.state;
    const { creditNoteDetail } = this.state;
    return !this.state.isCreditNotesLoading ? (
      <Card>

        {/* } <Row>
                    <Button type="button" onClick={this.fetchCreditNotes}>Show Refunds</Button>
                </Row>
                */}
        {creditNotes.length > 0 && (
        <Col xs={12}>
          <Row className="card-header ps-1">
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
                    {(!isCurrentRow) && (
                    <Button variant="link" onClick={() => { this.fetchCreditNote(creditNote.creditnote_id); }}>
                      <Icon icon="expand_more" className="fs-3" type="mt" />
                    </Button>
                    ) }

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
      </Card>
    ) : (
      <Card className="p-3 pt-3">
        <Col>
          <Button
            onClick={this.fetchCreditNotes}
          >
            Fetch Refund History

          </Button>
        </Col>
      </Card>
    );
  }
}

export default ListCreditNotes;
