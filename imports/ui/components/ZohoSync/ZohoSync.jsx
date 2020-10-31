import React from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col, Button, Tabs, Tab,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import Loading from '../Loading/Loading';

const _displayResults = (results) => results.map((result, index) => (
  <li key={`zhSync-${index}`}>
    <span className="badge">{result.code}</span>
    {` ${result.message}`}
  </li>
));

export default class ZohoSync extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      isSyncingHappening: false,
      syncStatus: 'success',
      // successResult: [],
      // errorResult: [],
    };

    this._errorResult = [];
    this._successResult = [];
    this.handleSyncClick = this.handleSyncClick.bind(this);
  }

  handleSyncClick() {
    const args = this.props.syncArgs || {};
    this.props.syncFunction.call(args, (err, result) => {
      const syncObj = { isSyncingHappening: false };
      if (err) {
        toast.error(err.reason);
        syncObj.syncStatus = 'error';
      } else {
        toast.success('Sync Up Complete!');
        syncObj.syncStatus = 'success';
        this._errorResult = result.error;
        this._successResult = result.success;
      }
      this.setState(syncObj);
    });

    this.setState({ isSyncingHappening: true });
  }

  render() {
    return (
      <div className="ZohoSyncUp">
        {this.state.isSyncingHappening && (<Loading />)}
        <Row>
          <Col sm={1}>
            <h4>
              {this.props.orderSequence}
              .
            </h4>
          </Col>
          <Col sm={6}>
            <Button type="submit" onClick={this.handleSyncClick}>
              {this.props.syncName}
            </Button>
          </Col>
          <Col sm={5}>
            <p>
              {' '}
              {this.props.syncDescription}
              {' '}
            </p>
          </Col>
        </Row>
        {(this._errorResult.length > 0 || this._successResult.length > 0) && (
        <Row>
          <Col xs={1} />
          <Col xs={11}>
            <Tabs defaultActiveKey={1} id="syncUpTabs">
              <Tab eventKey={1} title="Success">
                <ol>
                  {_displayResults(this._successResult)}
                </ol>
              </Tab>
              <Tab eventKey={2} title="Errors">
                <ol>
                  {_displayResults(this._errorResult)}
                </ol>
              </Tab>
            </Tabs>
          </Col>
        </Row>
        )}
      </div>
    );
  }
}

ZohoSync.propTypes = {
  orderSequence: PropTypes.number.isRequired,
  syncFunction: PropTypes.func.isRequired,
  syncName: PropTypes.string.isRequired,
  syncDescription: PropTypes.string,
  syncArgs: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};
