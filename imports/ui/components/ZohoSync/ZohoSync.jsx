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
    };

    // Initialize as empty arrays to prevent undefined errors
    this._errorResult = [];
    this._successResult = [];
    this.handleSyncClick = this.handleSyncClick.bind(this);
  }

  handleSyncClick() {
    // Reset error and success results
    this._errorResult = [];
    this._successResult = [];
    
    const args = this.props.syncArgs || {};
    this.props.syncFunction.call(args, (err, result) => {
      const syncObj = { isSyncingHappening: false };
      if (err) {
        console.error('Sync error:', err);
        toast.error(err.reason || 'An error occurred during sync');
        syncObj.syncStatus = 'error';
        // Ensure _errorResult is an array
        this._errorResult = Array.isArray(err.details) ? err.details : [{ code: 'error', message: err.reason || 'Unknown error' }];
      } else {
        toast.success('Sync Up Complete!');
        syncObj.syncStatus = 'success';
        // Ensure we always have arrays
        this._errorResult = Array.isArray(result?.error) ? result.error : [];
        this._successResult = Array.isArray(result?.success) ? result.success : [];
      }
      this.setState(syncObj);
    });

    this.setState({ isSyncingHappening: true });
  }

  render() {
    const { disabled } = this.props;
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
            <Button type="submit" onClick={this.handleSyncClick} disabled={disabled}>
              {this.props.syncName}
            </Button>
          </Col>
          <Col sm={5}>
            <p>
              {this.props.syncDescription}
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

ZohoSync.defaultProps = {
  disabled: false,
};

ZohoSync.propTypes = {
  orderSequence: PropTypes.number.isRequired,
  syncFunction: PropTypes.func.isRequired,
  syncName: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  syncDescription: PropTypes.string,
  syncArgs: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};
