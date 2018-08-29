import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Panel, Row, Col, Button } from 'react-bootstrap';
import { Bert } from 'meteor/themeteorchef:bert';
import createDaysSummaryReport from '../../../../reports/client/DaysSummary';
import Loading from '../../../components/Loading/Loading';

// import './ReportsHome.scss';

export default class ReportsHome extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: false,
    };

    this.genDaysSummaryReport = this.genDaysSummaryReport.bind(this);
  }

  genDaysSummaryReport() {
    if (!this.state.loading) {
      Meteor.call('reports.generateDaysSummary', (error, success) => {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          const rowsDetails = Object.values(success);
          if (rowsDetails.length > 0) {
            createDaysSummaryReport(rowsDetails);
          } else {
            const message = 'There are no orders in Awaiting Fullfilment status';
            Bert.alert(message, 'default');
          }
        }
        this.setState({
          loading: false,
        });
      });
    }
    this.setState({
      loading: true,
    });
  }

  render() {
    return (
      <div className="ReportsHome">
        {(this.state.loading) ? (<Loading />) : (<div />)}
        <Row>
          <Col xs={12}>
            <div className="page-header clearfix">
              <h3 className="pull-left">Reports</h3>
            </div>
            <Panel>
              <Button bsStyle="link" onClick={this.genDaysSummaryReport}>Days Summary</Button>
            </Panel>
          </Col>
        </Row>
      </div>
    );
  }
}
